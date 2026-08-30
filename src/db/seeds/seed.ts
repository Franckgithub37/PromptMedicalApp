import { db } from '@/db';
import { casCliniques } from '@/db/schema';
import data from './cas_cliniques_export.json';

type ExportRow = {
  profil: string;
  specialite: string | null;
  niveau: string;
  casNumero: number;
  titreCas: string;
  descriptionSituation: string;
  symptomes: string | null;
  antecedents: string | null;
  informationsCles: string;
  attenduPrompt: string;
  formatRecommande: string | null;
  patientAge: number | null;
  patientSexe: string | null;
  patientActe: string | null;
  createdAt: string;
  updatedAt: string;
};

async function main() {
  const rows = data as ExportRow[];
  console.log(`Seeding ${rows.length} cas cliniques...`);

  for (const row of rows) {
    await db.insert(casCliniques).values({
      profil: row.profil,
      specialite: row.specialite,
      niveau: row.niveau,
      casNumero: row.casNumero,
      titreCas: row.titreCas,
      descriptionSituation: row.descriptionSituation,
      symptomes: row.symptomes,
      antecedents: row.antecedents,
      informationsCles: row.informationsCles,
      attenduPrompt: row.attenduPrompt,
      formatRecommande: row.formatRecommande,
      patientAge: row.patientAge,
      patientSexe: row.patientSexe,
      patientActe: row.patientActe,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  console.log('Seed terminé.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed échoué:', err);
    process.exit(1);
  });
