import React, { useState, useEffect, useRef } from 'react';
import { JobOffer, JobCategory, MoroccanCity, ContractType, Company, CompanyCategory } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { fetchAllJobs, createJobOffer, deleteJobOffer, clearAllJobOffers, toggleJobActive, updateJobStatus } from '../services/jobService';
import { fetchAllCompanies, updateCompanyVerificationStatus, createCompany, normalizeCompanyName } from '../services/companyService';
import { uploadLogo, deleteLogo } from '../services/storageService';
import { parseJobText } from '../services/jobParserService';
import { supabase } from '../lib/supabaseClient';
import { COMPANY_CATEGORIES } from '../lib/companyCategories';
import {
  PlusCircle,
  Building2,
  MapPin,
  FileText,
  CheckCircle2,
  List,
  Trash2,
  Settings,
  AlertTriangle,
  Upload,
  X,
  Eye,
  EyeOff,
  Loader2,
  Phone,
  Image as ImageIcon,
  LogOut,
  BadgeCheck,
  CheckCircle,
  XCircle,
  Building,
  Clock,
  Copy,
  BookOpen,
  Landmark,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardPageProps {
  onJobAdded: (newJob: JobOffer) => void;
  onJobDeleted: (jobId: string) => void;
  onJobUpdated: (updatedJob: JobOffer) => void;
  onAllJobsCleared: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onJobAdded,
  onJobDeleted,
  onJobUpdated,
  onAllJobsCleared
}) => {
  const [activeTab, setActiveTab] = useState<'manage' | 'add' | 'moderation' | 'companies'>('manage');
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingCompanyId, setUpdatingCompanyId] = useState<string | null>(null);

  // Logo upload state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [duplicatedLogoUrl, setDuplicatedLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // LinkedIn paste parser
  const [linkedInText, setLinkedInText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseNotice, setParseNotice] = useState<{ message: string, type: 'success' | 'warning' } | null>(null);
  const [undetectedFields, setUndetectedFields] = useState<string[]>([]);

  // Sélection institution (flow séquentiel du formulaire "Ajouter")
  const [selectedCategory, setSelectedCategory] = useState<CompanyCategory | ''>('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false);
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [newCompanyForm, setNewCompanyForm] = useState({ companyName: '', ville: '', secteur: '', description: '', website: '' });
  const [newCompanyLogoFile, setNewCompanyLogoFile] = useState<File | null>(null);
  const [newCompanyLogoPreview, setNewCompanyLogoPreview] = useState<string | null>(null);
  const newCompanyLogoInputRef = useRef<HTMLInputElement>(null);

  const loadCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const all = await fetchAllCompanies();
      setCompanies(all);
    } catch (err) {
      console.error('Erreur chargement entreprises:', err);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: '' as unknown as JobCategory,
    city: '' as unknown as MoroccanCity,
    contractType: '' as unknown as ContractType,
    experienceLevel: '' as unknown as JobOffer['experienceLevel'],
    contactEmail: '',
    contactPhone: '',
    contactSubject: '',
    salaryRange: '',
    description: '',
    originalLink: ''
  });

  const categories: JobCategory[] = ['RH', 'Comptabilité', 'Mécanique', 'Administration', 'Informatique', 'Agriculture', 'Marketing', 'Commercial', 'Logistique', 'Santé', 'Éducation', 'BTP', 'Finance', 'Hôtellerie', 'Juridique', 'Autre'];
  const cities: MoroccanCity[] = [
    'Agadir', 'Al Hoceïma', 'Aousserd', 'Assa-Zag', 'Azilal', 'Azrou', 'Béni Mellal', 'Berkane', 'Berrechid', 'Boujdour', 'Bouskoura', 'Casablanca', 'Chefchaouen', 'Chichaoua', 'Dakhla', 'Demnate', 'Driouch', 'El Jadida', 'El Kelaâ des Sraghna', 'Errachidia', 'Essaouira', 'Fès', 'Fquih Ben Salah', 'Guelmim', 'Guelta Zemmour', 'Guercif', 'Ifrane', 'Jerada', 'Kénitra', 'Khemisset', 'Khouribga', 'Ksar El Kébir', 'Laâyoune', 'Larache', 'Marrakech', 'Meknès', 'Midelt', 'Mohammedia', 'Nador', 'Ouarzazate', 'Ouazzane', 'Oued Zem', 'Oujda', 'Rabat', 'Rhamna (Benguerir)', 'Safi', 'Salé', 'Sefrou', 'Settat', 'Sidi Bennour', 'Sidi Ifni', 'Sidi Kacem', 'Sidi Slimane', 'Smara', 'Tan-Tan', 'Tanger', 'Taourirt', 'Taroudant', 'Tata', 'Taza', 'Témara', 'Tétouan', 'Tifelt', 'Tinghir', 'Tiznit', 'Youssoufia', 'Zagora', 'Zemamra', 'Autre ville'
  ];
  const contractTypes: ContractType[] = ['CDI', 'CDD', 'Stage / PFE', 'Alternance', 'Intérim'];
  const experienceLevels: JobOffer['experienceLevel'][] = ['Débutant (0-1 an)', '1 à 3 ans', '3 à 5 ans', 'Stage PFE', 'Tous niveaux'];

  // ─── Chargement des offres depuis Supabase ─────────────────────────────────

  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const all = await fetchAllJobs();
      setJobs(all);
    } catch (err) {
      console.error('Erreur chargement offres admin:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // ─── Logo upload ────────────────────────────────────────────────────────────

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Le logo ne doit pas dépasser 5 Mo.');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Logo upload (nouvelle institution) ────────────────────────────────────

  const NEW_COMPANY_LOGO_ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

  const handleNewCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!NEW_COMPANY_LOGO_ACCEPTED_TYPES.includes(file.type)) {
      alert('Format non supporté. Utilisez PNG, JPG, SVG ou WebP.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Le logo ne doit pas dépasser 2 Mo.');
      return;
    }

    setNewCompanyLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setNewCompanyLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveNewCompanyLogo = () => {
    setNewCompanyLogoFile(null);
    setNewCompanyLogoPreview(null);
    if (newCompanyLogoInputRef.current) newCompanyLogoInputRef.current.value = '';
  };

  // ─── LinkedIn parser ────────────────────────────────────────────────────────

  const handleParseText = async () => {
    const raw = linkedInText.trim();
    if (!raw) {
      setParseNotice({ message: 'Veuillez coller un texte avant d\'analyser.', type: 'warning' });
      setUndetectedFields([]);
      return;
    }

    setIsParsing(true);
    setParseNotice(null);
    try {
      const parsed = await parseJobText(raw);
      
      setFormData(prev => ({
        ...prev,
        title: parsed.title || prev.title,
        city: parsed.city || prev.city,
        category: parsed.category || prev.category,
        contractType: parsed.contractType || prev.contractType,
        experienceLevel: parsed.experienceLevel || prev.experienceLevel,
        salaryRange: parsed.salaryRange || prev.salaryRange,
        description: parsed.description || prev.description,
        contactEmail: parsed.contactEmail || prev.contactEmail,
        contactSubject: parsed.contactSubject || prev.contactSubject,
        originalLink: parsed.originalLink || prev.originalLink
      }));

      const detected = [];
      const missing = [];

      if (parsed.title) detected.push('Titre'); else missing.push('Titre');
      if (parsed.city) detected.push('Ville');
      if (parsed.category) detected.push('Secteur');
      if (parsed.contractType) detected.push('Contrat');
      if (parsed.experienceLevel) detected.push('Expérience');

      setUndetectedFields(missing);

      if (detected.length > 0) {
        setParseNotice({
          message: `${detected.length} champs détectés automatiquement.`,
          type: 'success'
        });
      } else {
        setParseNotice({
          message: 'Aucun champ reconnu automatiquement.',
          type: 'warning'
        });
      }
    } catch (err) {
      console.error('Erreur analyse texte:', err);
      setParseNotice({
        message: 'Erreur lors de l\'analyse du texte.',
        type: 'warning'
      });
    } finally {
      setIsParsing(false);
    }
  };

  // ─── Soumission du formulaire ───────────────────────────────────────────────

  const resetForm = () => {
    setFormData({
      title: '', company: '', category: '' as unknown as JobCategory, city: '' as unknown as MoroccanCity,
      contractType: '' as unknown as ContractType, experienceLevel: '' as unknown as JobOffer['experienceLevel'],
      contactEmail: '', contactPhone: '', contactSubject: '',
      salaryRange: '', description: '', originalLink: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    setDuplicatedLogoUrl(null);
    setLinkedInText('');
    setParseNotice(null);
    setUndetectedFields([]);
    setSelectedCategory('');
    setSelectedCompanyId('');
    setIsAddingNewCompany(false);
    setNewCompanyForm({ companyName: '', ville: '', secteur: '', description: '', website: '' });
    handleRemoveNewCompanyLogo();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Duplication d'offre ────────────────────────────────────────────────────

  const handleDuplicate = (job: JobOffer) => {
    // Si l'offre originale possède des champs séparés (offres existantes), les formater dans description
    let fullDesc = job.description || '';
    const hasMissionsInDesc = fullDesc.toLowerCase().includes('mission');
    if (!hasMissionsInDesc) {
      const extraParts: string[] = [];
      if (job.missions && job.missions.length > 0) {
        extraParts.push(`Missions & Responsabilités :\n${job.missions.map(m => `- ${m}`).join('\n')}`);
      }
      if (job.profile && job.profile.length > 0) {
        extraParts.push(`Profil recherché :\n${job.profile.map(p => `- ${p}`).join('\n')}`);
      }
      if (job.benefits && job.benefits.length > 0) {
        extraParts.push(`Avantages & Ce que nous offrons :\n${job.benefits.map(b => `- ${b}`).join('\n')}`);
      }
      if (extraParts.length > 0) {
        fullDesc = fullDesc ? `${fullDesc}\n\n${extraParts.join('\n\n')}` : extraParts.join('\n\n');
      }
    }

    setFormData({
      title: `${job.title} (copie)`,
      company: job.company,
      category: job.category,
      city: job.city,
      contractType: job.contractType,
      experienceLevel: job.experienceLevel,
      contactEmail: job.contactEmail,
      contactPhone: job.contactPhone || '',
      contactSubject: job.contactSubject || '',
      salaryRange: job.salaryRange || '',
      description: fullDesc,
      originalLink: job.originalLink || ''
    });

    // Préselectionner catégorie + institution si l'offre originale est liée à une entreprise connue
    const linkedCompany = job.companyId ? companies.find(c => c.id === job.companyId) : undefined;
    if (linkedCompany && linkedCompany.category) {
      setSelectedCategory(linkedCompany.category);
      setSelectedCompanyId(linkedCompany.id);
    } else {
      setSelectedCategory('');
      setSelectedCompanyId('');
    }
    setIsAddingNewCompany(false);

    // Réutiliser l'URL du logo existant (pas de re-upload)
    if (job.companyLogo) {
      setDuplicatedLogoUrl(job.companyLogo);
      setLogoPreview(job.companyLogo);
    } else {
      setDuplicatedLogoUrl(null);
      setLogoPreview(null);
    }
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setLinkedInText('');
    setParseNotice(null);
    setUndetectedFields([]);

    // Basculer vers l'onglet "Ajouter"
    setActiveTab('add');

    // Scroll vers le haut du formulaire
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedCategory && !selectedCompanyId) {
      alert("Vous avez choisi une catégorie : sélectionnez une institution, ou annulez pour publier une offre simple.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload logo si présent, sinon réutiliser l'URL dupliquée (ou le logo de l'institution)
      let logoUrl: string | undefined;
      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      } else if (duplicatedLogoUrl) {
        logoUrl = duplicatedLogoUrl;
      }

      // 2. Préparer les données
      const initials = formData.company.trim() ? formData.company.trim().split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'EC';

      // 3. Insérer dans Supabase
      const created = await createJobOffer({
        title: formData.title,
        company: formData.company,
        companyId: selectedCompanyId || undefined,
        companyInitials: initials,
        companyLogo: logoUrl,
        category: formData.category,
        city: formData.city,
        contractType: formData.contractType,
        experienceLevel: formData.experienceLevel,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        contactSubject: formData.contactSubject || undefined,
        salaryRange: formData.salaryRange || 'A négocier',
        description: formData.description,
        missions: [],
        profile: [],
        benefits: [],
        originalLink: formData.originalLink || undefined,
        featured: true,
        isActive: true,
        status: 'approved'
      });

      onJobAdded(created);
      setJobs(prev => [created, ...prev]);
      setSubmitted(true);

      setTimeout(() => {
        setSubmitted(false);
        resetForm();
        setActiveTab('manage');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur lors de la publication : ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Sélection / création d'institution (formulaire Ajouter) ────────────────

  const applySelectedCompany = (company: Company) => {
    setSelectedCompanyId(company.id);
    setIsAddingNewCompany(false);
    setCompanySearchQuery('');
    setIsCompanyDropdownOpen(false);
    setFormData(prev => ({ ...prev, company: company.companyName }));
    if (company.logoUrl) {
      setDuplicatedLogoUrl(company.logoUrl);
      setLogoPreview(company.logoUrl);
    } else {
      setDuplicatedLogoUrl(null);
      setLogoPreview(null);
    }
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectExistingCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) applySelectedCompany(company);
  };

  const handleCreateCompany = async () => {
    if (!selectedCategory || !newCompanyForm.companyName.trim()) {
      alert("Le nom de l'institution est requis.");
      return;
    }
    setIsCreatingCompany(true);
    try {
      let logoUrl: string | undefined;
      let logoUploadFailed = false;
      if (newCompanyLogoFile) {
        try {
          logoUrl = await uploadLogo(newCompanyLogoFile);
        } catch (logoErr) {
          logoUploadFailed = true;
          console.error('Erreur upload logo institution:', logoErr);
        }
      }
      const { company: created, reused } = await createCompany({
        companyName: newCompanyForm.companyName.trim(),
        category: selectedCategory,
        logoUrl,
        ville: newCompanyForm.ville || undefined,
        secteur: newCompanyForm.secteur || undefined,
        description: newCompanyForm.description.trim() || undefined,
        website: newCompanyForm.website || undefined,
      });
      setCompanies(prev => reused ? prev.map(c => (c.id === created.id ? created : c)) : [created, ...prev]);
      applySelectedCompany(created);
      setNewCompanyForm({ companyName: '', ville: '', secteur: '', description: '', website: '' });
      handleRemoveNewCompanyLogo();
      if (reused) {
        alert(`Une institution similaire existe déjà : ${created.companyName} — sélectionnée automatiquement.`);
      } else if (logoUploadFailed) {
        alert("Institution créée, mais le logo n'a pas pu être envoyé. Vous pourrez réessayer plus tard.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur lors de la création de l'institution : ${msg}`);
    } finally {
      setIsCreatingCompany(false);
    }
  };

  // ─── Actions admin ──────────────────────────────────────────────────────────

  const handleDelete = async (job: JobOffer) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'offre "${job.title}" ?`)) return;
    setDeletingId(job.id);
    try {
      // Supprimer le logo du Storage si présent
      if (job.companyLogo) {
        await deleteLogo(job.companyLogo);
      }
      await deleteJobOffer(job.id);
      setJobs(prev => prev.filter(j => j.id !== job.id));
      onJobDeleted(job.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur suppression : ${msg}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (job: JobOffer) => {
    setTogglingId(job.id);
    try {
      await toggleJobActive(job.id, !job.isActive);
      const updated = { ...job, isActive: !job.isActive };
      setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
      onJobUpdated(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur : ${msg}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handleUpdateStatus = async (job: JobOffer, status: 'approved' | 'rejected') => {
    try {
      await updateJobStatus(job.id, status);
      const updated = { ...job, status };
      setJobs(prev => prev.map(j => j.id === job.id ? updated : j));
      onJobUpdated(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Erreur de statut : ${msg}`);
    }
  };


  const handleVerifyCompany = async (companyId: string, status: 'verified' | 'rejected') => {
    let rejectionReason: string | undefined;
    if (status === 'rejected') {
      const reason = window.prompt("Motif du rejet (optionnel) :");
      if (reason === null) return;
      rejectionReason = reason;
    }

    setUpdatingCompanyId(companyId);
    try {
      await updateCompanyVerificationStatus(companyId, status, rejectionReason);
      setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, verificationStatus: status, rejectionReason } : c));
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setUpdatingCompanyId(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header Admin */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-serif text-slate-900">Tableau de bord Administrateur</h1>
              <p className="text-sm text-slate-500">Gestion des offres d'emploi · Supabase</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              title="Se déconnecter"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('manage')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'manage' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <List className="w-4 h-4" />
                Gérer
              </button>
              <button
                onClick={() => setActiveTab('moderation')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'moderation' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <AlertTriangle className="w-4 h-4" />
                Modération ({jobs.filter(j => j.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('companies')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'companies' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Building2 className="w-4 h-4" />
                Entreprises ({companies.filter(c => c.verificationStatus === 'pending' || !c.verificationStatus).length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'add' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <PlusCircle className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>
        </div>

        {/* Tab: Companies */}
        {activeTab === 'companies' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Validation des Entreprises</h2>
                <p className="text-sm text-slate-500 mt-1">Examinez les demandes d'inscription et vérifiez le numéro ICE des entreprises.</p>
              </div>
              <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                {companies.filter(c => c.verificationStatus === 'pending' || !c.verificationStatus).length} en attente
              </span>
            </div>

            {isLoadingCompanies ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span>Chargement des entreprises...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Entreprise & Contact</th>
                      <th className="p-4 font-semibold">Secteur & Ville</th>
                      <th className="p-4 font-semibold">ICE & Site Web</th>
                      <th className="p-4 font-semibold text-center">Statut</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {companies.map((comp) => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 shrink-0">
                              {comp.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{comp.companyName}</p>
                              <p className="text-xs text-slate-500">{comp.contactPerson || 'Contact non renseigné'} {comp.phone ? `· ${comp.phone}` : ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{comp.secteur || 'Non précisé'}</p>
                          <p className="text-xs text-slate-500">{comp.ville || 'Maroc'}</p>
                        </td>
                        <td className="p-4">
                          {comp.iceNumber ? (
                            <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-1 rounded border border-slate-200 font-bold">
                              ICE: {comp.iceNumber}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">ICE non fourni</span>
                          )}
                          {comp.website && (
                            <a href={comp.website} target="_blank" rel="noreferrer" className="block text-xs text-sky-600 hover:underline mt-1">
                              {comp.website.replace(/^https?:\/\//, '')}
                            </a>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {comp.verificationStatus === 'verified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                              Vérifiée
                            </span>
                          )}
                          {comp.verificationStatus === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                              <XCircle className="w-3.5 h-3.5 text-red-600" />
                              Rejetée
                            </span>
                          )}
                          {(comp.verificationStatus === 'pending' || !comp.verificationStatus) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              En attente
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {comp.verificationStatus !== 'verified' && (
                              <button
                                onClick={() => handleVerifyCompany(comp.id, 'verified')}
                                disabled={updatingCompanyId === comp.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              >
                                {updatingCompanyId === comp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                                Approuver
                              </button>
                            )}
                            {comp.verificationStatus !== 'rejected' && (
                              <button
                                onClick={() => handleVerifyCompany(comp.id, 'rejected')}
                                disabled={updatingCompanyId === comp.id}
                                className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold transition-all"
                              >
                                Rejeter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {companies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          Aucune entreprise inscrite pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Manage */}
        {activeTab === 'manage' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Chargement des offres...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Logo</th>
                      <th className="p-4 font-semibold">Poste & Entreprise</th>
                      <th className="p-4 font-semibold">Lieu & Contrat</th>
                      <th className="p-4 font-semibold text-center">Statut</th>
                      <th className="p-4 font-semibold text-center">Vues</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {jobs.map((job) => (
                      <tr key={job.id} className={`hover:bg-slate-50/50 transition-colors ${!job.isActive ? 'opacity-60' : ''}`}>
                        <td className="p-4">
                          {job.companyLogo ? (
                            <img
                              src={job.companyLogo}
                              alt={job.company}
                              className="w-10 h-10 rounded-lg object-contain border border-slate-200 bg-white p-1"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                              {job.companyInitials}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.company} · {job.publishedAt}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{job.city}</p>
                          <p className="text-xs text-slate-500">{job.contractType} · {job.category}</p>
                        </td>
                        <td className="p-4 text-center">
                          <StatusBadge status={job.status || 'approved'} />
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${job.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {job.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {job.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-xs text-slate-600">👀 {job.viewsCount || 0}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Toggle actif/inactif */}
                            <button
                              onClick={() => handleToggleActive(job)}
                              disabled={togglingId === job.id}
                              title={job.isActive ? 'Désactiver l\'offre' : 'Activer l\'offre'}
                              className={`p-2 rounded-lg transition-colors ${job.isActive ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                            >
                              {togglingId === job.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : job.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
                              }
                            </button>

                            {/* Dupliquer */}
                            <button
                              onClick={() => handleDuplicate(job)}
                              title="Dupliquer l'offre"
                              className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>

                            {/* Supprimer */}
                            <button
                              onClick={() => handleDelete(job)}
                              disabled={deletingId === job.id}
                              title="Supprimer l'offre"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              {deletingId === job.id
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <Trash2 className="w-4 h-4" />
                              }
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                          Aucune offre trouvée. Commencez par en ajouter une.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Moderation */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-900">Modération des offres</h2>
              <p className="text-sm text-slate-500 mt-1">Acceptez ou rejetez les offres publiées par les entreprises.</p>
            </div>
            {isLoadingJobs ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Chargement des offres...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                      <th className="p-4 font-semibold">Poste & Entreprise</th>
                      <th className="p-4 font-semibold">Détails</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-slate-100">
                    {jobs.filter(j => j.status === 'pending').map((job) => (
                      <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">{job.company}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-700">{job.city} · {job.contractType}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{job.description}</p>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(job, 'approved')}
                              className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(job, 'rejected')}
                              className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Rejeter
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {jobs.filter(j => j.status === 'pending').length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-500">
                          Aucune offre en attente de modération.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab: Add Job */}
        {activeTab === 'add' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 font-serif">Offre publiée avec succès !</h3>
                <p className="text-sm text-slate-600">L'offre est maintenant visible sur le site public.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Bandeau de duplication */}
                {duplicatedLogoUrl !== null || formData.title.endsWith('(copie)') ? (
                  <div className="flex items-center gap-3 p-3 bg-sky-50 border border-sky-200 rounded-2xl text-sky-800 text-sm font-medium">
                    <Copy className="w-4 h-4 shrink-0 text-sky-600" />
                    <span>Formulaire pré-rempli par duplication. Modifiez les champs souhaités puis cliquez sur <strong>Publier</strong>.</span>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="ml-auto p-1 rounded-lg hover:bg-sky-100 transition-colors"
                      title="Réinitialiser le formulaire"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : null}

                {/* Section: LinkedIn paste */}
                <div className="space-y-4 pb-6 border-b border-slate-200 bg-slate-50 p-4 rounded-3xl">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-700" />
                    Coller depuis LinkedIn / texte
                  </h2>
                  <p className="text-sm text-slate-600">Collez une offre brute pour pré-remplir le formulaire automatiquement.</p>
                  <textarea
                    rows={4}
                    value={linkedInText}
                    onChange={(e) => { setLinkedInText(e.target.value); setParseNotice(null); setUndetectedFields([]); }}
                    placeholder="Exemple : Offre d'emploi : Chargé(e) de recrutement chez ABC Consulting - CDI - Casablanca"
                    className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-sky-500"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleParseText}
                      disabled={isParsing}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 text-sm font-semibold hover:bg-slate-800 disabled:opacity-60 transition-all"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyse en cours...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Analyser le texte</span>
                        </>
                      )}
                    </button>
                    <button type="button" disabled={isParsing} onClick={() => { setLinkedInText(''); setParseNotice(null); setUndetectedFields([]); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-all">
                      <Trash2 className="w-4 h-4" />
                      Effacer
                    </button>
                  </div>
                  
                  {parseNotice && (
                    <div className={`p-4 rounded-xl border flex flex-col gap-2 ${parseNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                      <p className="font-semibold flex items-center gap-2">
                        {parseNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {parseNotice.message}
                      </p>
                      
                      {undetectedFields.length > 0 && (
                        <div className="text-sm">
                          <p className="mb-1 font-medium text-amber-700">⚠️ Non détecté — vérifiez ces champs manuellement :</p>
                          <div className="flex flex-wrap gap-2">
                            {undetectedFields.map(field => (
                              <span key={field} className="px-2 py-1 bg-white/60 border border-amber-200 rounded text-xs font-semibold">
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Section: Institution (optionnelle) */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-emerald-600" />
                      Institution
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Cette offre est-elle liée à une institution connue ? (optionnel — réservé aux institutions notables comme Marjane, une banque, l'OFPPT...)
                    </p>
                  </div>

                  {/* Catégorie */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase">Catégorie</label>
                      {selectedCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('');
                            setSelectedCompanyId('');
                            setIsAddingNewCompany(false);
                            setCompanySearchQuery('');
                            setIsCompanyDropdownOpen(false);
                            setFormData(prev => ({ ...prev, company: '' }));
                            setDuplicatedLogoUrl(null);
                            setLogoPreview(null);
                            handleRemoveNewCompanyLogo();
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                        >
                          Annuler / Offre simple
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {COMPANY_CATEGORIES.map(meta => {
                        const Icon = meta.value === 'ecole' ? BookOpen : meta.value === 'etat' ? Landmark : Building2;
                        const isSelected = selectedCategory === meta.value;
                        return (
                          <button
                            key={meta.value}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCategory('');
                              } else {
                                setSelectedCategory(meta.value);
                              }
                              setSelectedCompanyId('');
                              setIsAddingNewCompany(false);
                              setCompanySearchQuery('');
                              setIsCompanyDropdownOpen(false);
                              setFormData(prev => ({ ...prev, company: '' }));
                              setDuplicatedLogoUrl(null);
                              setLogoPreview(null);
                              handleRemoveNewCompanyLogo();
                            }}
                            className={`text-left p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              <Icon className="w-4.5 h-4.5" />
                            </div>
                            <p className={`text-sm font-bold ${isSelected ? 'text-emerald-800' : 'text-slate-800'}`}>{meta.shortLabel}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Étape 2 : institution */}
                  {selectedCategory && (
                    <div className="pl-1 border-l-2 border-emerald-200 ml-1 pl-4 space-y-3">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                        <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />
                        Institution
                      </label>

                      {!isAddingNewCompany ? (
                        (() => {
                          const categoryCompanies = companies.filter(c => c.category === selectedCategory);
                          const query = normalizeCompanyName(companySearchQuery);
                          const matches = query
                            ? categoryCompanies.filter(c => normalizeCompanyName(c.companyName).includes(query))
                            : categoryCompanies;
                          return (
                            <div className="relative">
                              <input
                                type="text"
                                value={selectedCompanyId ? formData.company : companySearchQuery}
                                onChange={(e) => {
                                  setSelectedCompanyId('');
                                  setCompanySearchQuery(e.target.value);
                                  setIsCompanyDropdownOpen(true);
                                }}
                                onFocus={() => setIsCompanyDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsCompanyDropdownOpen(false), 150)}
                                placeholder="Rechercher une institution (ex: OFPPT)..."
                                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                              {isCompanyDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                                  {matches.length > 0 ? (
                                    matches.map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onMouseDown={() => handleSelectExistingCompany(c.id)}
                                        className="w-full text-left px-3.5 py-2 text-sm text-slate-800 hover:bg-emerald-50 flex items-center gap-2"
                                      >
                                        {c.logoUrl ? (
                                          <img src={c.logoUrl} alt="" className="w-5 h-5 rounded object-contain bg-white border border-slate-200 shrink-0" />
                                        ) : (
                                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        )}
                                        {c.companyName}
                                      </button>
                                    ))
                                  ) : (
                                    <p className="px-3.5 py-2 text-xs text-slate-400">Aucune institution existante ne correspond.</p>
                                  )}
                                  <button
                                    type="button"
                                    onMouseDown={() => {
                                      setIsAddingNewCompany(true);
                                      setSelectedCompanyId('');
                                      setNewCompanyForm(prev => ({ ...prev, companyName: companySearchQuery.trim() }));
                                      setIsCompanyDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border-t border-slate-100 flex items-center gap-1.5"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    + Ajouter une nouvelle institution{companySearchQuery.trim() ? ` "${companySearchQuery.trim()}"` : ''}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nom de l'institution</label>
                              <input
                                type="text"
                                value={newCompanyForm.companyName}
                                onChange={(e) => setNewCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Ville (optionnel)</label>
                              <input
                                type="text"
                                value={newCompanyForm.ville}
                                onChange={(e) => setNewCompanyForm(prev => ({ ...prev, ville: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Secteur (optionnel)</label>
                              <input
                                type="text"
                                value={newCompanyForm.secteur}
                                onChange={(e) => setNewCompanyForm(prev => ({ ...prev, secteur: e.target.value }))}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Description (optionnel)</label>
                              <textarea
                                rows={3}
                                maxLength={300}
                                value={newCompanyForm.description}
                                onChange={(e) => setNewCompanyForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Courte présentation de l'institution (activité, mission, chiffres clés...)"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
                              />
                              <p className="text-[11px] text-slate-400 mt-1 text-right">{newCompanyForm.description.length}/300</p>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Site web (optionnel)</label>
                              <input
                                type="url"
                                value={newCompanyForm.website}
                                onChange={(e) => setNewCompanyForm(prev => ({ ...prev, website: e.target.value }))}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Logo (optionnel)</label>
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {newCompanyLogoPreview ? (
                                    <img src={newCompanyLogoPreview} alt="Aperçu logo" className="w-full h-full object-contain p-1" />
                                  ) : (
                                    <ImageIcon className="w-5 h-5 text-slate-400" />
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <input
                                    ref={newCompanyLogoInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={handleNewCompanyLogoChange}
                                    className="hidden"
                                    id="new-company-logo-upload"
                                  />
                                  <div className="flex items-center gap-2">
                                    <label
                                      htmlFor="new-company-logo-upload"
                                      className="inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      Choisir un logo
                                    </label>
                                    {newCompanyLogoFile && (
                                      <button
                                        type="button"
                                        onClick={handleRemoveNewCompanyLogo}
                                        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                                      >
                                        <X className="w-3 h-3" />
                                        Supprimer
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-400">PNG, JPG, SVG, WebP · Max 2 Mo</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCreateCompany}
                              disabled={isCreatingCompany || !newCompanyForm.companyName.trim()}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold transition-all"
                            >
                              {isCreatingCompany ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                              Créer et sélectionner
                            </button>
                            <button
                              type="button"
                              onClick={() => { setIsAddingNewCompany(false); handleRemoveNewCompanyLogo(); }}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedCompanyId && (
                        <p className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Institution sélectionnée : {formData.company}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Section: Informations du poste */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Informations du poste
                  </h2>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Logo de l'entreprise</label>
                    <div className="flex items-start gap-4">
                      {/* Preview ou placeholder */}
                      <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {logoPreview ? (
                          <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-1" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                          onChange={handleLogoChange}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className="inline-flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          Choisir un logo
                        </label>
                        {(logoFile || duplicatedLogoUrl) && (
                          <button
                            type="button"
                            onClick={() => { handleRemoveLogo(); setDuplicatedLogoUrl(null); }}
                            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                            Supprimer
                          </button>
                        )}
                        {duplicatedLogoUrl && !logoFile && (
                          <p className="text-xs text-sky-600 flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Logo copié de l'offre originale
                          </p>
                        )}
                        <p className="text-xs text-slate-400">JPG, PNG, WebP · Max 5 Mo</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Titre du poste</label>
                      <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Entreprise</label>
                      {selectedCompanyId ? (
                        <div className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 font-medium">
                          {formData.company}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          placeholder="Nom de l'entreprise"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email de candidature</label>
                      <input type="email" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Téléphone (optionnel)
                      </label>
                      <input type="tel" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} placeholder="+212 6XX XXX XXX" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Objet du mail (optionnel)</label>
                      <input type="text" value={formData.contactSubject} onChange={(e) => setFormData({ ...formData, contactSubject: e.target.value })} placeholder="ex: Candidature - Développeur React" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Section: Caractéristiques */}
                <div className="space-y-4 pb-6 border-b border-slate-200">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    Caractéristiques
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Secteur</label>
                      <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as JobCategory })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="" disabled>Sélectionner un secteur</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ville</label>
                      <select value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value as MoroccanCity })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="" disabled>Sélectionner une ville</option>
                        {cities.map(city => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contrat</label>
                      <select value={formData.contractType} onChange={(e) => setFormData({ ...formData, contractType: e.target.value as ContractType })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="" disabled>Sélectionner un contrat</option>
                        {contractTypes.map(ct => <option key={ct} value={ct}>{ct}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Expérience</label>
                      <select value={formData.experienceLevel} onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as JobOffer['experienceLevel'] })} className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-white">
                        <option value="" disabled>Sélectionner un niveau</option>
                        {experienceLevels.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Salaire (optionnel)</label>
                      <input type="text" value={formData.salaryRange} onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })} placeholder="ex: 5 000 – 7 000 MAD / mois" className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Section: Description */}
                <div className="space-y-4">
                  <h2 className="text-base font-extrabold text-slate-900 font-serif flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Description complète de l'offre
                  </h2>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Description de l'offre
                    </label>
                    <textarea
                      rows={12}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Décrivez le poste, les missions, le profil recherché et les avantages librement..."
                      className="w-full px-3.5 py-3 rounded-2xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 font-sans leading-relaxed whitespace-pre-wrap"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lien original (optionnel)</label>
                    <input type="url" value={formData.originalLink} onChange={(e) => setFormData({ ...formData, originalLink: e.target.value })} placeholder="https://www.linkedin.com/..." className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || (!!selectedCategory && !selectedCompanyId)}
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publication en cours...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        Publier immédiatement sur le site
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
