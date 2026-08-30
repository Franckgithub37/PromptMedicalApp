import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const casCliniques = sqliteTable('cas_cliniques', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  profil: text('profil').notNull(),
  specialite: text('specialite'),
  niveau: text('niveau').notNull(),
  casNumero: integer('cas_numero').notNull(),
  titreCas: text('titre_cas').notNull(),
  descriptionSituation: text('description_situation').notNull(),
  symptomes: text('symptomes'),
  antecedents: text('antecedents'),
  informationsCles: text('informations_cles').notNull(),
  attenduPrompt: text('attendu_prompt').notNull(),
  formatRecommande: text('format_recommande'),
  patientAge: integer('patient_age'),
  patientSexe: text('patient_sexe'),
  patientActe: text('patient_acte'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});