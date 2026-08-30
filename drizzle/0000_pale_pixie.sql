CREATE TABLE `cas_cliniques` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`profil` text NOT NULL,
	`specialite` text,
	`niveau` text NOT NULL,
	`cas_numero` integer NOT NULL,
	`titre_cas` text NOT NULL,
	`description_situation` text NOT NULL,
	`antecedents` text,
	`informations_cles` text NOT NULL,
	`attendu_prompt` text NOT NULL,
	`format_recommande` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
