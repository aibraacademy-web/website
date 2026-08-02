import { JobOffer } from '../types';

export const INITIAL_JOBS: JobOffer[] = [
  {
    id: 'job-001',
    title: 'Chargé(e) de Recrutement & RH Junior',
    company: 'TalentHub Maroc',
    companyInitials: 'TH',
    city: 'Casablanca',
    contractType: 'CDI',
    category: 'RH',
    publishedAt: 'Aujourd\'hui',
    createdAtISO: new Date().toISOString(),
    description: 'Dans le cadre de notre développement à Casablanca Nearshore, nous recrutons un(e) Chargé(e) de Recrutement Junior enthousiaste pour accompagner nos équipes RH.',
    missions: [
      'Rédaction et diffusion des annonces sur les différentes plateformes',
      'Sourcing et pré-sélection téléphonique des candidats',
      'Organisation et conduite des entretiens de recrutement',
      'Suivi de l\'intégration des nouveaux collaborateurs',
      'Gestion administrative du personnel et tenue des dossiers RH'
    ],
    profile: [
      'Bac+3/Bac+5 en Ressources Humaines ou Gestion d\'Entreprise',
      'Débutant accepté ou première expérience réussie en cabinet',
      'Excellente maîtrise du français oral et écrit',
      'Bon relationnel, sens de la confidentialité et autonomie'
    ],
    contactEmail: 'recrutement@talenthub.ma',
    originalLink: 'https://talenthub.ma/offres/rh-junior',
    salaryRange: '5 000 - 7 000 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: true,
    viewsCount: 342,
    applicationsCount: 28
  },
  {
    id: 'job-002',
    title: 'Comptable Fournisseurs & Trésorerie',
    company: 'Atlas Distribution S.A.',
    companyInitials: 'AD',
    city: 'Rabat',
    contractType: 'CDI',
    category: 'Comptabilité',
    publishedAt: 'Hier',
    createdAtISO: new Date(Date.now() - 86400000).toISOString(),
    description: 'Atlas Distribution recherche pour son siège à Rabat Agdal un(e) Comptable Fournisseurs pour prendre en charge la gestion du cycle achats et le suivi de trésorerie.',
    missions: [
      'Saisie et vérification des factures fournisseurs',
      'Rapprochement bancaire et suivi des échéanciers de paiement',
      'Préparation des déclarations fiscales courantes (TVA)',
      'Participation aux travaux d\'arrêtés comptables mensuels',
      'Archivage rigoureux des pièces comptables'
    ],
    profile: [
      'Bac+2/Bac+3 en Comptabilité / Finance (EST, BTS, OFPPT TSGE)',
      '1 à 2 ans d\'expérience souhaitée en comptabilité générale',
      'Maîtrise des logiciels comptables (Sage 100, Ciel ou SAP)',
      'Rigueur, précision et esprit d\'équipe'
    ],
    contactEmail: 'rh@atlasdistribution.ma',
    originalLink: 'https://atlasdistribution.ma/carrieres/comptable',
    salaryRange: '5 500 - 7 500 DH / mois',
    experienceLevel: '1 à 3 ans',
    featured: true,
    viewsCount: 280,
    applicationsCount: 19
  },
  {
    id: 'job-003',
    title: 'Technicien Supérieur en Mécanique Automobile',
    company: 'AutoMaghreb Service',
    companyInitials: 'AM',
    city: 'Tanger',
    contractType: 'CDI',
    category: 'Mécanique',
    publishedAt: 'Il y a 2 jours',
    createdAtISO: new Date(Date.now() - 172800000).toISOString(),
    description: 'Grand groupe automobile installé dans la zone franche de Tanger Automotive City recrute un Technicien Supérieur Spécialisé en Diagnostic et Mécanique.',
    missions: [
      'Réalisation des diagnostics électroniques et mécaniques sur véhicules récents',
      'Entretien périodique et réparations lourdes (moteur, boîte de vitesses, freinage)',
      'Contrôle qualité de l\'intervention avant restitution au client',
      'Lecture et analyse de schémas techniques et manuels constructeurs'
    ],
    profile: [
      'Diploma Technicien Spécialisé (OFPPT / ISTA) en Diagnostic Automobile ou Mécanique',
      'Débutant à fort potentiel ou avec un premier stage significatif',
      'Connaissance des outils de diagnostic modernes',
      'Ponctuel, méthodique et respectueux des normes de sécurité'
    ],
    contactEmail: 'carrieres@automaghreb.ma',
    originalLink: 'https://automaghreb.ma/jobs/tech-mecanique',
    salaryRange: '4 500 - 6 500 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: false,
    viewsCount: 195,
    applicationsCount: 14
  },
  {
    id: 'job-004',
    title: 'Assistant(e) Administratif(ve) & Accueil',
    company: 'Cabinet Al Omrane Conseil',
    companyInitials: 'AO',
    city: 'Marrakech',
    contractType: 'CDD',
    category: 'Administration',
    publishedAt: 'Il y a 3 jours',
    createdAtISO: new Date(Date.now() - 259200000).toISOString(),
    description: 'Pour soutenir notre croissance à Marrakech (Gueliz), nous proposons un poste d\'Assistant(e) Administratif(ve) en CDD évolutif vers un CDI.',
    missions: [
      'Accueil physique et téléphonique des visiteurs et clients',
      'Gestion du courrier entrant/sortant et archivage des dossiers',
      'Saisie de documents, comptes-rendus et présentations',
      'Organisation des réunions et gestion du matériel de bureau'
    ],
    profile: [
      'Bac+2 en Secrétariat de Direction, Bureautique ou Gestion',
      'Aisance relationnelle et excellente présentation',
      'Très bonne maîtrise du pack Office (Word, Excel, PowerPoint)',
      'Sens de l\'organisation et réactivité'
    ],
    contactEmail: 'contact@alomraneconseil.ma',
    salaryRange: '4 000 - 5 000 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: false,
    viewsCount: 220,
    applicationsCount: 22
  },
  {
    id: 'job-005',
    title: 'Développeur Fullstack Junior (React / Node.js)',
    company: 'TechValley Agadir',
    companyInitials: 'TV',
    city: 'Agadir',
    contractType: 'CDI',
    category: 'Informatique',
    publishedAt: 'Aujourd\'hui',
    createdAtISO: new Date().toISOString(),
    description: 'TechValley Agadir cherche de jeunes talents passionnés par le développement web pour intégrer une équipe dynamique sur des projets SaaS d\'envergure.',
    missions: [
      'Développement d\'interfaces utilisateur modernes avec React.js et Tailwind CSS',
      'Création d\'API RESTful robustes avec Node.js et Express',
      'Participation aux revues de code et tests unitaires',
      'Collaboration agile avec les designers UI/UX et chefs de projets'
    ],
    profile: [
      'Bac+3/Bac+5 en Génie Informatique (EST, ENSA, FST ou école privée)',
      'Projets académiques ou personnels probants en React / Node',
      'Bases solides en Git, SQL et bases de données NoSQL',
      'Curiosité technique et envie d\'apprendre rapidement'
    ],
    contactEmail: 'jobs@techvalley.ma',
    originalLink: 'https://techvalley.ma/careers/dev-fullstack',
    salaryRange: '6 000 - 9 000 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: true,
    viewsCount: 512,
    applicationsCount: 45
  },
  {
    id: 'job-006',
    title: 'Technicien Supérieur / Ingénieur Agronome Junior',
    company: 'AgroPro Saïs',
    companyInitials: 'AP',
    city: 'Meknès',
    contractType: 'CDI',
    category: 'Agriculture',
    publishedAt: 'Il y a 4 jours',
    createdAtISO: new Date(Date.now() - 345600000).toISOString(),
    description: 'Exploitation agricole moderne basée dans la région de Meknès-Fès recherche un Technicien ou Ingénieur Agronome débutant pour la gestion des cultures maraîchères.',
    missions: [
      'Suivi technique des cultures (irrigation, fertigation, traitement phytosanitaire)',
      'Encadrement des équipes de ouvriers agricoles sur le terrain',
      'Gestion du suivi des récoltes et contrôle de la qualité',
      'Tenue des cahiers de charges de traçabilité et rapports d\'activité'
    ],
    profile: [
      'Diplôme de Technicien Spécialisé ou Ingénieur en Agronomie / Horticulture (IAV, ENAM, EST)',
      'Passionné par l\'agriculture moderne et les nouvelles technologies',
      'Capacité à travailler sur le terrain et gérer le stress',
      'Permis de conduire B souhaité'
    ],
    contactEmail: 'recrutement@agroprosais.ma',
    salaryRange: '5 500 - 8 000 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: false,
    viewsCount: 160,
    applicationsCount: 11
  },
  {
    id: 'job-007',
    title: 'Stagiaire PFE - Marketing Digital & Community Management',
    company: 'Aibra Media Digital',
    companyInitials: 'AM',
    city: 'Casablanca',
    contractType: 'Stage / PFE',
    category: 'Marketing',
    publishedAt: 'Il y a 1 jour',
    createdAtISO: new Date(Date.now() - 86400000).toISOString(),
    description: 'Opportunité de stage PFE pré-embauche pour un(e) étudiant(e) passionné(e) par la création de contenu, les réseaux sociaux et le SEO.',
    missions: [
      'Création de visuels et vidéos courts pour Instagram, LinkedIn et TikTok',
      'Animation de la communauté et réponse aux messages des abonnés',
      'Rédaction d\'articles de blog optimisés pour le référencement (SEO)',
      'Suivi des statistiques de performance et reporting mensuel'
    ],
    profile: [
      'Étudiant(e) en fin d\'études (Bac+3/Bac+5) en Marketing, Communication ou Commerce',
      'Créatif(ve), maîtrise de Canva / Photoshop / CapCut',
      'Excellente orthographe en français et maîtrise du dialecte marocain (Darija)',
      'Esprit d\'initiative et bienveillance'
    ],
    contactEmail: 'pfe@aibramedia.ma',
    salaryRange: 'Gratification stage: 2 500 DH / mois',
    experienceLevel: 'Stage PFE',
    featured: true,
    viewsCount: 430,
    applicationsCount: 52
  },
  {
    id: 'job-008',
    title: 'Gestionnaire de Paie et Administration RH',
    company: 'Maroc Services BPO',
    companyInitials: 'MS',
    city: 'Fès',
    contractType: 'CDI',
    category: 'RH',
    publishedAt: 'Il y a 5 jours',
    createdAtISO: new Date(Date.now() - 432000000).toISOString(),
    description: 'Centre de services partagés basé à Fès Shore recrute un Gestionnaire de Paie pour assurer le traitement mensuel des éléments de rémunération.',
    missions: [
      'Collecte et saisie des éléments variables de paie (heures supp, absences, congés)',
      'Calcul et contrôle des bulletins de salaire',
      'Établissement des déclarations sociales (CNSS, CIMR, Mutuelle)',
      'Gestion des contrats de travail et attestations d\'emploi'
    ],
    profile: [
      'Bac+3 en Gestion / RH / Comptabilité',
      'Minimum 1 an d\'expérience en gestion de la paie marocaine',
      'Maîtrise d\'un logiciel de paie (Sage Paie, AgirH)',
      'Aimer le travail avec les chiffres et le droit du travail marocain'
    ],
    contactEmail: 'fesshore@marocservices.ma',
    salaryRange: '5 000 - 6 500 DH / mois',
    experienceLevel: '1 à 3 ans',
    featured: false,
    viewsCount: 180,
    applicationsCount: 16
  },
  {
    id: 'job-009',
    title: 'Stagiaire Assistant(e) Comptable',
    company: 'Fiduciaire Oriental',
    companyInitials: 'FO',
    city: 'Oujda',
    contractType: 'Stage / PFE',
    category: 'Comptabilité',
    publishedAt: 'Il y a 2 jours',
    createdAtISO: new Date(Date.now() - 172800000).toISOString(),
    description: 'Cabinet de comptabilité réputé à Oujda offre un stage pratique de 4 à 6 mois pour un(e) futur(e) diplômé(e) en comptabilité.',
    missions: [
      'Classement et numérotation des pièces comptables',
      'Saisie des journaux d\'achats, ventes et banque',
      'Assistance à l\'élaboration des bilans et liasses fiscales',
      'Contact direct avec les clients du cabinet pour collecte des pièces'
    ],
    profile: [
      'Étudiant(e) ou jeune diplômé(e) EST / OFPPT / FSJES en Gestion/Comptabilité',
      'Rigueur, ponctualité et motivation pour apprendre le métier',
      'Bonne connaissance théorique du plan comptable marocain'
    ],
    contactEmail: 'stage@fiduciaireoriental.ma',
    salaryRange: 'Gratification stage: 1 500 DH / mois',
    experienceLevel: 'Stage PFE',
    featured: false,
    viewsCount: 290,
    applicationsCount: 38
  },
  {
    id: 'job-010',
    title: 'Technicien de Maintenance Électromécanique',
    company: 'Cimenterie du Nord',
    companyInitials: 'CN',
    city: 'Tétouan',
    contractType: 'CDI',
    category: 'Mécanique',
    publishedAt: 'Il y a 3 jours',
    createdAtISO: new Date(Date.now() - 259200000).toISOString(),
    description: 'Poste basé au site industriel de Tétouan pour maintenir en parfait état opérationnel les lignes de production.',
    missions: [
      'Exécution du plan de maintenance préventive et corrective',
      'Dépannage des systèmes électriques, hydrauliques et mécaniques',
      'Participation aux arrêts techniques et travaux d\'amélioration',
      'Rédaction des rapports d\'intervention sur GMAO'
    ],
    profile: [
      'Bac+2 Technicien Spécialisé en Électromécanique / ESA / Automatisme',
      '1 à 3 ans d\'expérience dans un environnement industriel',
      'Esprit d\'analyse et respect strict des règles HSE'
    ],
    contactEmail: 'recrutement@cimenteriedunord.ma',
    salaryRange: '5 500 - 7 500 DH / mois',
    experienceLevel: '1 à 3 ans',
    featured: false,
    viewsCount: 145,
    applicationsCount: 12
  },
  {
    id: 'job-011',
    title: 'Conseiller Client Bilingue (Français / Arabe)',
    company: 'Connect Call Morocco',
    companyInitials: 'CC',
    city: 'Kénitra',
    contractType: 'CDI',
    category: 'Administration',
    publishedAt: 'Aujourd\'hui',
    createdAtISO: new Date().toISOString(),
    description: 'Connect Call recrute pour son nouveau site de Kénitra des Conseillers Clients dynamiques avec formation assurée dès l\'embauche.',
    missions: [
      'Réception d\'appels et traitement des demandes d\'information clients',
      'Gestion des réclamations et apport de solutions personnalisées',
      'Mise à jour de la base de données CRM',
      'Atteinte des objectifs de qualité de service'
    ],
    profile: [
      'Niveau Bac ou diplôme universitaire toutes filières',
      'Excellente maîtrise du français oral',
      'Aisance sur l\'outil informatique et rapidité de saisie',
      'Sens du service client et bienveillance'
    ],
    contactEmail: 'jobs@connectcall.ma',
    salaryRange: '4 500 - 5 500 DH + Primes',
    experienceLevel: 'Tous niveaux',
    featured: true,
    viewsCount: 410,
    applicationsCount: 65
  },
  {
    id: 'job-012',
    title: 'Ingénieur Support Agro-Alimentaire',
    company: 'Souss Agro Export',
    companyInitials: 'SA',
    city: 'Agadir',
    contractType: 'CDI',
    category: 'Agriculture',
    publishedAt: 'Il y a 1 jour',
    createdAtISO: new Date(Date.now() - 86400000).toISOString(),
    description: 'Poste basé au port d\'Agadir pour le suivi du conditionnement et du contrôle qualité des agrumes et primeurs destinés à l\'export.',
    missions: [
      'Supervision des normes d\'hygiène et sécurité alimentaire (HACCP, GlobalGAP)',
      'Contrôle de la chaîne du froid et du conditionnement',
      'Interface avec les inspecteurs de l\'EACCE et clients internationaux',
      'Analyse des non-conformités et mise en place d\'actions correctives'
    ],
    profile: [
      'Ingénieur ou Master en Agroalimentaire / Qualité',
      'Débutant motivé ou 1 an d\'expérience en station de conditionnement',
      'Bon niveau d\'anglais technique souhaité',
      'Rigueur, réactivité et autonomie'
    ],
    contactEmail: 'rh@soussagro.ma',
    salaryRange: '6 500 - 8 500 DH / mois',
    experienceLevel: 'Débutant (0-1 an)',
    featured: false,
    viewsCount: 205,
    applicationsCount: 15
  }
  ,
  {
    id: 'job-013',
    title: 'Chargé des Moyens Généraux (H/F)',
    company: 'Entreprise (Confidentiel)',
    companyInitials: 'EC',
    city: 'Casablanca',
    contractType: 'CDI',
    category: 'Administration',
    publishedAt: 'Aujourd\'hui',
    createdAtISO: new Date().toISOString(),
    description: 'Nous recherchons un(e) Chargé(e) des Moyens Généraux pour assurer la gestion et le suivi des services généraux sur le site de Casablanca.',
    missions: [
      'Assurer la gestion et le suivi des services généraux',
      'Coordonner les interventions liées à la maintenance des infrastructures',
      'Veiller au bon fonctionnement des équipements et des locaux',
      'Suivre les prestataires et les fournisseurs',
      'Contribuer à garantir un environnement de travail sécurisé et fonctionnel',
      'Participer à l\'optimisation des services généraux et au respect des procédures'
    ],
    profile: [
      'Bac ou Bac+2 en Logistique, Maintenance, Gestion des Entreprises ou domaine équivalent',
      'Expérience de 2 ans minimum dans un poste similaire',
      'Bonnes connaissances en maintenance des bâtiments (électricité, plomberie, climatisation, peinture, etc.)',
      'Expérience dans le suivi des prestataires et la gestion des fournisseurs',
      'Bonne maîtrise des outils bureautiques (Excel, Word et Outlook)',
      'Sens de l\'organisation, autonomie, rigueur et réactivité',
      'Excellentes capacités relationnelles et de coordination'
    ],
    contactEmail: 'recrutement.ma.casa@gmail.com',
    contactSubject: 'Chargé Moyens Généraux',
    salaryRange: 'À négocier',
    experienceLevel: '1 à 3 ans',
    featured: false,
    viewsCount: 0,
    applicationsCount: 0
  }
];
