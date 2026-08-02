import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  MessageSquare
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Question générale',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormState({
        name: '',
        email: '',
        phone: '',
        subject: 'Question générale',
        message: ''
      });
    }, 4000);
  };

  const faqs = [
    {
      q: 'Comment postuler à une offre sur Aibra Academy ?',
      a: 'C\'est très simple : sur chaque fiche d\'offre, cliquez sur le bouton "Postuler par Email". Une fenêtre s\'ouvre avec le mail du recruteur et un objet pré-rempli. Vous pouvez ouvrir directement votre messagerie pour y joindre votre CV au format PDF.'
    },
    {
      q: 'Aibra Academy est-il vraiment gratuit pour les candidats ?',
      a: 'Oui, l\'accès à l\'ensemble des annonces et le contact direct avec les recruteurs sont 100% gratuits et sans aucun frais d\'inscription.'
    },
    {
      q: 'Je suis une entreprise, comment publier une offre ?',
      a: 'Cliquez sur le bouton "Publier une offre" dans le menu supérieur. Remplissez le formulaire en renseignant le titre, la ville, la description et votre adresse email professionnelle de réception. L\'annonce sera publiée immédiatement.'
    },
    {
      q: 'Proposez-vous des offres de stage PFE ?',
      a: 'Absolument ! Aibra Academy accorde une place centrale aux stages de fin d\'études (PFE) et pré-embauche pour les étudiants des universités et écoles marocaines.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assistance & Contact</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">
            Contactez l'équipe Aibra Academy
          </h1>

          <p className="text-sm text-slate-600">
            Une question, une suggestion ou besoin d'assistance pour vos recrutements au Maroc ? Notre équipe est à votre écoute.
          </p>
        </div>

        {/* Form + Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Info Card Left */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950 text-white p-6 rounded-3xl shadow-lg border border-slate-800 space-y-6">
              
              <h2 className="text-xl font-bold font-serif text-white">
                Coordonnées Maroc
              </h2>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Adresses :</p>
                    <p className="text-slate-400">Casablanca Nearshore & Agdal Rabat, Maroc</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Email direct :</p>
                    <a href="mailto:contact@aibra-academy.ma" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                      contact@aibra-academy.ma
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Téléphone :</p>
                    <p className="text-slate-300"><a href="tel:0637539047" className="hover:underline">0637539047</a></p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-700/10 text-sky-300 flex items-center justify-center shrink-0">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">El Hassan Boumedyane</p>
                    <p className="text-slate-300 text-xs">HR Manager</p>
                    <a href="https://www.linkedin.com/in/hassanhr" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-sky-300 text-sm">Voir le profil LinkedIn</a>
                  </div>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
                <p className="font-semibold text-emerald-400 mb-1">Horaires d'ouverture :</p>
                <p>Du Lundi au Vendredi : 09h00 - 18h00</p>
              </div>

            </div>
          </div>

          {/* Form Right */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>Envoyez-nous un message</span>
              </h2>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-bold text-base font-serif">Message envoyé avec succès !</h3>
                  <p className="text-xs text-emerald-800">
                    Merci d'avoir contacté Aibra Academy. Notre équipe vous répondra sous 24 à 48 heures.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Nom & Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Salma Benani"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Adresse Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="Ex: salma@gmail.com"
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Téléphone marocain (+212)
                      </label>
                      <input
                        type="tel"
                        placeholder="Ex: 0661234567"
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Sujet *
                      </label>
                      <select
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="Question générale">Question générale</option>
                        <option value="Aide candidature">Aide pour postuler</option>
                        <option value="Publication d'offre">Publication d'offre entreprise</option>
                        <option value="Partenariat">Partenariat universitaire / école</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Votre Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Expliquez-nous comment nous pouvons vous aider..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3.5 px-6 rounded-xl text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer le message</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold font-serif text-slate-900 flex items-center justify-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
              <span>Foire aux questions (FAQ)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Réponses rapides aux interrogations les plus fréquentes.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 font-bold text-sm text-slate-900 flex items-center justify-between gap-3 font-serif"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
