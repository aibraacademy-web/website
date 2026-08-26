import { supabase } from '../lib/supabaseClient';
import { JobOffer } from '../types';

export interface SubmitApplicationParams {
  method: 'direct' | 'mailto';
  job: JobOffer;
  candidateName?: string;
  candidateMessage?: string;
  cvFile?: File;
}

export interface SubmitApplicationResult {
  success: boolean;
  error?: string;
}

export const submitApplication = async ({
  method,
  job,
  candidateName,
  candidateMessage,
  cvFile,
}: SubmitApplicationParams): Promise<SubmitApplicationResult> => {
  const formData = new FormData();
  formData.append('method', method);
  formData.append('job_id', job.id);
  formData.append('recruiter_email', job.contactEmail);
  formData.append('job_title', job.title);
  if (candidateName) formData.append('candidate_name', candidateName);
  if (candidateMessage) formData.append('candidate_message', candidateMessage);
  if (method === 'direct' && cvFile) formData.append('cv', cvFile);

  try {
    const { data, error } = await supabase.functions.invoke('submit-application', {
      body: formData,
    });

    if (error) {
      return { success: false, error: error.message || "L'envoi a échoué." };
    }
    if (data && data.success === false) {
      return { success: false, error: data.error || "L'envoi a échoué." };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "L'envoi a échoué." };
  }
};

export interface ApplicationCounts {
  direct: number;
  mailto: number;
  total: number;
}

export const getApplicationCounts = async (): Promise<Record<string, ApplicationCounts>> => {
  const { data, error } = await supabase.from('applications').select('job_id, method');

  if (error || !data) {
    console.error('[applicationService] Erreur chargement des candidatures:', error?.message);
    return {};
  }

  const counts: Record<string, ApplicationCounts> = {};
  for (const row of data as { job_id: string; method: string }[]) {
    if (!row.job_id) continue;
    if (!counts[row.job_id]) counts[row.job_id] = { direct: 0, mailto: 0, total: 0 };
    if (row.method === 'direct') counts[row.job_id].direct += 1;
    else counts[row.job_id].mailto += 1;
    counts[row.job_id].total += 1;
  }
  return counts;
};
