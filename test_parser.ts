import { parseJobText } from './src/services/jobParserService';

const tests = [
  {
    name: 'Test 1: Technicien Tanger',
    text: `Offre d'emploi : Technicien de Maintenance Industrielle chez Atlas Mécanique - CDI - Tanger
    
Nous recherchons un technicien pour notre usine.
    
Missions :
- Maintenance des machines
- Réparation des pannes
    
Profil :
- 2 ans d'expérience
- Diplôme en électromécanique
    
Avantages :
- Salaire attractif
- Prime de transport`
  },
  {
    name: 'Test 2: Commercial Marrakech',
    text: `Responsable Commercial chez MarocDistrib — CDD — Marrakech
    
Nous cherchons un responsable commercial pour développer notre portefeuille client.

Responsabilités:
- Gérer les ventes
- Contacter les clients

Profil recherché:
- 4 ans d'expérience
- Bonne élocution

Ce que nous offrons:
- Véhicule de fonction
- Commissions sur ventes`
  },
  {
    name: 'Test 3: RH Casablanca',
    text: `Chargé(e) de Recrutement chez RH Solutions — CDI — Casablanca
    
Rejoignez notre équipe RH dynamique.

Missions:
- Sourcing de candidats
- Entretiens téléphoniques

Profil:
- Débutant accepté
- Formation en ressources humaines`
  }
];

tests.forEach(t => {
  console.log('--- ' + t.name + ' ---');
  const result = parseJobText(t.text);
  console.log('Titre:', result.title);
  console.log('Entreprise:', result.company);
  console.log('Ville:', result.city);
  console.log('Contrat:', result.contractType);
  console.log('Secteur:', result.category);
  console.log('Expérience:', result.experienceLevel);
  console.log('Avantages:', result.benefitsRaw.split('\n').join(', '));
  console.log();
});
