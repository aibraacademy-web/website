import { CompanyCategory } from '../types';

export interface CompanyCategoryMeta {
  value: CompanyCategory;
  label: string;
  shortLabel: string;
  description: string;
}

export const COMPANY_CATEGORIES: CompanyCategoryMeta[] = [
  {
    value: 'ecole',
    label: 'Concours & Grandes Écoles',
    shortLabel: 'Écoles',
    description: "Offres liées aux concours d'entrée et grandes écoles marocaines (ENCG, ENSA, EST, écoles d'ingénieurs...)",
  },
  {
    value: 'entreprise',
    label: 'Entreprises & Recruteurs',
    shortLabel: 'Entreprises',
    description: "Offres publiées par des entreprises privées, enseignes et employeurs partenaires.",
  },
  {
    value: 'etat',
    label: "Fonction Publique & Institutions",
    shortLabel: 'État',
    description: "Offres et concours du secteur public : Police, Gendarmerie, Collectivités territoriales (Jamaa/Commune), administrations...",
  },
];

export const getCompanyCategoryMeta = (category?: string | null): CompanyCategoryMeta | undefined =>
  COMPANY_CATEGORIES.find(c => c.value === category);
