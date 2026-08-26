// Supabase Edge Function : submit-application
//
// Gère les deux méthodes de candidature du modal MailtoModal :
//  - method="mailto"  → simple tracking (l'envoi réel se fait via le client
//                        mail local du candidat, côté navigateur)
//  - method="direct"  → upload du CV + envoi de l'email via Resend
//
// Déploiement (nécessite le CLI Supabase lié à votre projet) :
//   supabase functions deploy submit-application
//   supabase secrets set RESEND_API_KEY=<votre-clé-resend>
//
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont injectés automatiquement
// par le runtime des Edge Functions, aucun secret à créer pour ceux-ci.

import { createClient } from 'npm:@supabase/supabase-js@2.112.0';
import { Resend } from 'npm:resend@3.2.0';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const CVS_BUCKET = 'candidatures-cv';
const MAX_CV_BYTES = 5 * 1024 * 1024; // 5 Mo
const MAX_DIRECT_PER_DAY = 3;

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Méthode non autorisée' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const form = await req.formData();
    const method = String(form.get('method') || '');
    const jobId = String(form.get('job_id') || '');
    const recruiterEmail = String(form.get('recruiter_email') || '');
    const jobTitle = String(form.get('job_title') || '');
    const candidateName = (form.get('candidate_name') as string) || null;
    const candidateMessage = (form.get('candidate_message') as string) || null;

    if (!jobId || !recruiterEmail || (method !== 'direct' && method !== 'mailto')) {
      return jsonResponse({ success: false, error: 'Requête invalide.' }, 400);
    }

    const ipAddress = getClientIp(req);

    // ── Méthode mailto : simple tracking, pas de rate-limit ──
    if (method === 'mailto') {
      const { error } = await supabase.from('applications').insert({
        job_id: jobId,
        recruiter_email: recruiterEmail,
        candidate_name: candidateName,
        candidate_message: candidateMessage,
        cv_storage_path: null,
        method: 'mailto',
        status: 'opened_mailto',
        ip_address: ipAddress,
      });

      if (error) {
        // Le tracking ne doit jamais bloquer l'ouverture du client mail côté frontend.
        console.error('[submit-application] tracking mailto échoué:', error.message);
      }

      return jsonResponse({ success: true });
    }

    // ── Méthode direct : upload CV + envoi Resend ──
    const cvFile = form.get('cv');
    if (!(cvFile instanceof File)) {
      return jsonResponse({ success: false, error: 'CV manquant.' }, 400);
    }
    if (cvFile.type !== 'application/pdf') {
      return jsonResponse({ success: false, error: 'Le CV doit être un fichier PDF.' }, 400);
    }
    if (cvFile.size > MAX_CV_BYTES) {
      return jsonResponse({ success: false, error: 'Le CV dépasse la taille maximale de 5 Mo.' }, 400);
    }

    // Anti-spam : max 3 candidatures directes / 24h pour la même offre depuis la même IP
    if (ipAddress) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', jobId)
        .eq('method', 'direct')
        .eq('ip_address', ipAddress)
        .gte('created_at', since);

      if ((count || 0) >= MAX_DIRECT_PER_DAY) {
        return jsonResponse({
          success: false,
          error: "Vous avez atteint la limite de candidatures directes pour cette offre aujourd'hui. Merci d'utiliser \"Utiliser mon logiciel de messagerie\" à la place.",
        }, 429);
      }
    }

    const cvBytes = new Uint8Array(await cvFile.arrayBuffer());
    const safeName = cvFile.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const storagePath = `${jobId}_${Date.now()}_${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from(CVS_BUCKET)
      .upload(storagePath, cvBytes, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      console.error('[submit-application] upload CV échoué:', uploadError.message);
      return jsonResponse({
        success: false,
        error: "Impossible d'envoyer votre candidature pour le moment. Merci d'utiliser \"Utiliser mon logiciel de messagerie\" à la place.",
      }, 502);
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('[submit-application] RESEND_API_KEY non configurée.');
      return jsonResponse({
        success: false,
        error: "L'envoi direct n'est pas encore configuré. Merci d'utiliser \"Utiliser mon logiciel de messagerie\" à la place.",
      }, 502);
    }

    const resend = new Resend(resendApiKey);
    const displayName = candidateName || 'Candidat';
    const messageBody = candidateMessage || "Vous trouverez mon CV en pièce jointe pour ce poste.";

    const { error: sendError } = await resend.emails.send({
      from: 'Aibra Academy <candidatures@aibraacademy.com>',
      to: recruiterEmail,
      subject: `Candidature - ${jobTitle}`,
      text: `Bonjour,\n\n${displayName} vous soumet sa candidature pour le poste de ${jobTitle}.\n\n${messageBody}\n\nVous trouverez son CV en pièce jointe.\n\nCordialement,\nAibra Academy`,
      attachments: [
        {
          filename: safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`,
          content: btoa(String.fromCharCode(...cvBytes)),
        },
      ],
    });

    if (sendError) {
      console.error('[submit-application] envoi Resend échoué:', sendError.message);
      // Le domaine peut ne pas encore être vérifié (DKIM/SPF) : on ne trace pas
      // la candidature comme envoyée, on invite à utiliser le fallback mailto.
      return jsonResponse({
        success: false,
        error: "L'envoi direct a échoué (le domaine d'envoi est peut-être encore en cours de vérification). Merci d'utiliser \"Utiliser mon logiciel de messagerie\" à la place.",
      }, 502);
    }

    const { error: insertError } = await supabase.from('applications').insert({
      job_id: jobId,
      recruiter_email: recruiterEmail,
      candidate_name: candidateName,
      candidate_message: candidateMessage,
      cv_storage_path: storagePath,
      method: 'direct',
      status: 'sent',
      ip_address: ipAddress,
    });

    if (insertError) {
      // L'email est bien parti : on log l'erreur de tracking mais on ne fait
      // pas échouer la requête côté candidat.
      console.error('[submit-application] tracking direct échoué:', insertError.message);
    }

    return jsonResponse({ success: true });
  } catch (err) {
    console.error('[submit-application] erreur inattendue:', err);
    return jsonResponse({ success: false, error: 'Une erreur inattendue est survenue.' }, 500);
  }
});
