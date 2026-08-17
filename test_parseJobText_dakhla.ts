import { parseJobText } from './src/services/jobParserService';

const text = `Technicien de Laboratoire
Une entreprise recrute 2 Techniciens de Laboratoire pour un poste basé à Dakhla.
Description
Poste de Technicien de Laboratoire au sein d'un laboratoire basé à Dakhla.`;

console.log("parseJobText result:", parseJobText(text));
