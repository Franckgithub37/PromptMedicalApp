export interface MedicalCase {
  id: string;
  title: string;
  description: string;
  patientInfo: {
    age: number;
    gender: string;
    symptoms: string[];
    history: string;
  };
  difficulty: 'beginner' | 'advanced';
  category: string;
}

import { generateAllCases, toMedicalCaseCompat } from "@/lib/profileCases";

export const medicalCases: MedicalCase[] = generateAllCases().map((entry, idx) => {
  const compat = toMedicalCaseCompat(entry);
  return {
    id: String(idx + 1),
    title: compat.title,
    description: compat.description,
    patientInfo: compat.patientInfo,
    difficulty: compat.difficulty,
    category: compat.category,
  } as MedicalCase;
});