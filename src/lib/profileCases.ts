// Utility database for 3-step profile -> specialty -> level -> case (2 per combo)
// Generates 104 cases programmatically and exposes helpers to fetch and adapt to existing MedicalCase shape.

export type ProfileKey =
  | "medecin_generaliste"
  | "medecin_specialise"
  | "chirurgien_dentiste"
  | "infirmier"
  | "soignant"
  | "paramedical"
  | "secretaire_medicale"
  | "cadre_sante";

export type LevelKey = "debutant" | "avance";

export type SpecialtyKey =
  | "cardiologie_vasculaire"
  | "oncologie_hematologie"
  | "imagerie_radiologie"
  | "urgences_reanimation"
  | "neurologie_psychiatrie"
  | "gastro_hepatologie"
  | "endocrino_diabeto"
  | "pediatrie"
  | "chirurgie"
  | "gyneco_obstetrique"
  | "pneumo_allergo"
  | "geriatrie_medecine_interne"
  | "odontologie_generale"
  | "parodontologie"
  | "orthodontie"
  | "chirurgie_orale"
  | "aide_soignant"
  | "auxiliaire_puericulture"
  | "agent_service_hospitalier"
  | "kinesitherapeute"
  | "osteopathe"
  | "sage_femme"
  | "ergotherapeute"
  | "orthophoniste";

export const PROFILE_LABELS: Record<ProfileKey, string> = {
  medecin_generaliste: "Médecin généraliste",
  medecin_specialise: "Médecin spécialisé",
  chirurgien_dentiste: "Chirurgien-dentiste",
  infirmier: "Infirmier",
  soignant: "Soignant",
  paramedical: "Paramédical",
  secretaire_medicale: "Secrétaire médicale",
  cadre_sante: "Cadre de santé",
};

export const SPECIALTY_GROUPS: Record<ProfileKey, SpecialtyKey[] | null> = {
  medecin_generaliste: null,
  infirmier: null,
  medecin_specialise: [
    "cardiologie_vasculaire",
    "oncologie_hematologie",
    "imagerie_radiologie",
    "urgences_reanimation",
    "neurologie_psychiatrie",
    "gastro_hepatologie",
    "endocrino_diabeto",
    "pediatrie",
    "chirurgie",
    "gyneco_obstetrique",
    "pneumo_allergo",
    "geriatrie_medecine_interne",
  ],
  chirurgien_dentiste: [
    "odontologie_generale",
    "parodontologie",
    "orthodontie",
    "chirurgie_orale",
  ],
  soignant: [
    "aide_soignant",
    "auxiliaire_puericulture",
    "agent_service_hospitalier",
  ],
  paramedical: [
    "kinesitherapeute",
    "osteopathe",
    "sage_femme",
    "ergotherapeute",
    "orthophoniste",
  ],
  secretaire_medicale: null,
  cadre_sante: null,
};

export const SPECIALTY_LABELS: Record<SpecialtyKey, string> = {
  cardiologie_vasculaire: "Cardiologie & Vasculaire",
  oncologie_hematologie: "Oncologie & Hématologie",
  imagerie_radiologie: "Imagerie & Radiologie",
  urgences_reanimation: "Urgences & Réanimation",
  neurologie_psychiatrie: "Neurologie & Psychiatrie",
  gastro_hepatologie: "Gastro & Hépatologie",
  endocrino_diabeto: "Endocrino & Diabéto",
  pediatrie: "Pédiatrie",
  chirurgie: "Chirurgie",
  gyneco_obstetrique: "Gynéco-Obstétrique",
  pneumo_allergo: "Pneumo & Allergo",
  geriatrie_medecine_interne: "Gériatrie & Médecine Interne",
  odontologie_generale: "Odontologie générale",
  parodontologie: "Parodontologie",
  orthodontie: "Orthodontie",
  chirurgie_orale: "Chirurgie orale",
  aide_soignant: "Aide-soignant",
  auxiliaire_puericulture: "Auxiliaire de puériculture",
  agent_service_hospitalier: "Agent de service hospitalier",
  kinesitherapeute: "Kinésithérapeute",
  osteopathe: "Ostéopathe",
  sage_femme: "Sage-femme",
  ergotherapeute: "Ergothérapeute",
  orthophoniste: "Orthophoniste",
};

// Structured Case type (rich) as requested
export interface StructuredCase {
  profil: ProfileKey;
  specialite: SpecialtyKey | null;
  niveau: LevelKey;
  cas_numero: 1 | 2;
  titre_cas: string;
  contexte_clinique_detaille: string;
  objectif_prompt: string;
  format_recommande?: "JSON" | "Markdown" | "XML" | "Bullet Points";
  donnees_cliniques: Array<{ label: string; valeur: string }>;
}

// Helper to map to existing MedicalCase shape used by UI and API
export interface MedicalCaseCompat {
  title: string;
  category: string;
  description: string;
  difficulty: "beginner" | "advanced";
  patientInfo: {
    age: number;
    gender: string;
    symptoms: string[];
    history: string;
  };
}

function levelToDifficulty(level: LevelKey): "beginner" | "advanced" {
  return level === "debutant" ? "beginner" : "advanced";
}

function pickGender(idx: number) {
  return idx % 2 === 0 ? "Homme" : "Femme";
}

function ageByProfile(profile: ProfileKey, idx: number) {
  const base = 25 + (idx % 40);
  switch (profile) {
    case "pediatrie" as any:
      return 6 + (idx % 10);
    default:
      return base;
  }
}

function buildTitle(profile: ProfileKey, specialty: SpecialtyKey | null, level: LevelKey, cas: 1 | 2): string {
  const profLabel = PROFILE_LABELS[profile];
  const specLabel = specialty ? ` - ${SPECIALTY_LABELS[specialty]}` : "";
  let theme = "évaluation initiale";
  if (cas === 2) theme = "recherche protocole";
  return `${profLabel}${specLabel} | ${level === "debutant" ? "Débutant" : "Avancé"} | ${theme}`;
}

function buildDescription(profile: ProfileKey, specialty: SpecialtyKey | null, level: LevelKey, cas: 1 | 2): string {
  const base =
    level === "debutant"
      ? "Contexte clair et structuré, objectifs précis pour guider la rédaction du prompt."
      : "Contexte nuancé avec facteurs confondants, données incomplètes et contraintes temporelles.";
  const focus = specialty ? SPECIALTY_LABELS[specialty] : PROFILE_LABELS[profile];
  
  let angle = "première prise en charge";
  if (cas === 2) angle = "recherche et construction de protocole";
  
  return `${focus} — ${angle}. ${base}`;
}

function buildSymptoms(profile: ProfileKey, specialty: SpecialtyKey | null, cas: 1 | 2): string[] {
  const map: Record<string, string[]> = {
    cardiologie_vasculaire: ["douleur thoracique", "dyspnée", "œdèmes des MI"],
    oncologie_hematologie: ["amaigrissement", "asthénie", "adénopathies"],
    imagerie_radiologie: ["anomalie radiologique", "douleur localisée", "doute diagnostique"],
    urgences_reanimation: ["polypnée", "hypotension", "altération de conscience"],
    neurologie_psychiatrie: ["céphalées", "troubles de l'humeur", "déficit moteur"],
    gastro_hepatologie: ["douleurs abdominales", "ictère", "nausées"],
    endocrino_diabeto: ["polyurie", "polydipsie", "fatigue"],
    pediatrie: ["fièvre", "vomissements", "éruption"],
    chirurgie: ["douleur postopératoire", "saignement", "fièvre"],
    gyneco_obstetrique: ["douleurs pelviennes", "retard de règles", "métrorragies"],
    pneumo_allergo: ["toux", "dyspnée", "sibilants"],
    geriatrie_medecine_interne: ["chute", "confusion", "déshydratation"],
    odontologie_generale: ["odontalgie", "sensibilité thermique", "halitose"],
    parodontologie: ["saignement gingival", "mobilité dentaire", "halitose"],
    orthodontie: ["malocclusion", "douleurs ATM", "chevauchement dentaire"],
    chirurgie_orale: ["douleur post-extraction", "infection locale", "trismus"],
    aide_soignant: ["rougeur cutanée", "douleurs", "fatigue"],
    auxiliaire_puericulture: ["fièvre", "diarrhée", "irritabilité"],
    agent_service_hospitalier: ["toux", "maux de dos", "fatigue"],
    kinesitherapeute: ["douleur articulaire", "raideur", "limitation amplitude"],
    osteopathe: ["douleur lombaire", "raideur cervicale", "céphalées"],
    sage_femme: ["nausées", "contractions", "saignements"],
    ergotherapeute: ["difficulté AVQ", "faible préhension", "fatigue"],
    orthophoniste: ["dysphasie", "troubles déglutition", "dysarthrie"],
  } as any;

  if (!specialty) {
    // Profiles without specialty
    const def: Record<ProfileKey, string[]> = {
      medecin_generaliste: ["fièvre", "toux", "douleurs diffuses"],
      infirmier: ["douleur", "dyspnée", "œdèmes"],
      medecin_specialise: [],
      chirurgien_dentiste: [],
      soignant: ["rougeur", "altération cutanée", "douleur"],
      paramedical: ["douleur musculo-squelettique", "fatigue", "limitation fonctionnelle"],
      secretaire_medicale: ["gestion administrative", "accueil patient", "facturation"],
      cadre_sante: ["organisation service", "gestion équipe", "qualité des soins"],
    };
    return def[profile];
  }
  const key = specialty as unknown as keyof typeof map;
  const base = map[key] || ["symptôme principal"];
  if (cas === 1) return base;
  if (cas === 2) return [...base].reverse();
  return base;
}

function buildHistory(profile: ProfileKey, specialty: SpecialtyKey | null, level: LevelKey, cas: 1 | 2): string {
  const common = "ATCD: HTA modérée, dyslipidémie. Traitements en cours: IEC, statine. Allergies: non connues.";
  if (level === "debutant") {
    return common;
  }
  // Advanced adds nuances
  const nuance = " Contexte social: isolement relatif, observance fluctuante. Contraintes: RDV différé, examens limités.";
  return common + nuance + (cas !== 1 ? " Évolution: symptômes intermittents, biomarqueurs discordants." : "");
}

function buildObjetif(profile: ProfileKey, specialty: SpecialtyKey | null, level: LevelKey, cas: 1 | 2): string {
  const cible = specialty ? SPECIALTY_LABELS[specialty] : PROFILE_LABELS[profile];
  const action = level === "debutant" ? "structurer un prompt guidé" : "concevoir un prompt expert";
  let phase = "évaluation initiale";
  if (cas === 2) phase = "construction protocole";
  return `Vous devez ${action} pour ${cible} en ${phase}, incluant rôle, contexte, tâche, format et contraintes.`;
}

function buildFormat(level: LevelKey): StructuredCase["format_recommande"] | undefined {
  if (level === "debutant") {
    const formats: StructuredCase["format_recommande"][] = ["JSON", "Markdown", "XML", "Bullet Points"];
    return formats[Math.floor(Math.random() * formats.length)];
  }
  return undefined;
}

export function listSpecialties(profile: ProfileKey): { key: SpecialtyKey; label: string }[] {
  const list = SPECIALTY_GROUPS[profile];
  if (!list) return [];
  return list.map((s) => ({ key: s, label: SPECIALTY_LABELS[s] }));
}

export function buildStructuredCase(
  profil: ProfileKey,
  specialite: SpecialtyKey | null,
  niveau: LevelKey,
  cas_numero: 1 | 2,
  indexSeed = 0
): StructuredCase {
  const titre_cas = buildTitle(profil, specialite, niveau, cas_numero);
  const contexte_clinique_detaille = buildDescription(profil, specialite, niveau, cas_numero);
  const objectif_prompt = buildObjetif(profil, specialite, niveau, cas_numero);
  const format_recommande = buildFormat(niveau);
  const age = ageByProfile(profil, indexSeed + cas_numero);
  const gender = pickGender(indexSeed + cas_numero);
  const symptoms = buildSymptoms(profil, specialite, cas_numero);
  const history = buildHistory(profil, specialite, niveau, cas_numero);
  const donnees_cliniques = [
    { label: "Âge", valeur: `${age}` },
    { label: "Sexe", valeur: gender },
    { label: "Symptômes", valeur: symptoms.join(", ") },
    { label: "Antécédents", valeur: history },
  ];

  return {
    profil,
    specialite,
    niveau,
    cas_numero,
    titre_cas,
    contexte_clinique_detaille,
    objectif_prompt,
    format_recommande,
    donnees_cliniques,
  };
}

export function toMedicalCaseCompat(entry: StructuredCase): MedicalCaseCompat {
  const category = entry.specialite ? SPECIALTY_LABELS[entry.specialite] : PROFILE_LABELS[entry.profil];
  const difficulty = levelToDifficulty(entry.niveau);
  const age = Number(entry.donnees_cliniques.find((d) => d.label === "Âge")?.valeur || 42);
  const gender = entry.donnees_cliniques.find((d) => d.label === "Sexe")?.valeur || "Homme";
  const symptoms = (entry.donnees_cliniques.find((d) => d.label === "Symptômes")?.valeur || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const history = entry.donnees_cliniques.find((d) => d.label === "Antécédents")?.valeur || "";

  return {
    title: entry.titre_cas,
    category,
    description: entry.contexte_clinique_detaille,
    difficulty,
    patientInfo: {
      age,
      gender,
      symptoms,
      history,
    },
  };
}

// Generate complete dataset of 104 cases for potential future use (not all must be loaded at once)
export function generateAllCases(): StructuredCase[] {
  const result: StructuredCase[] = [];

  const PROFILES: ProfileKey[] = [
    "medecin_generaliste",
    "medecin_specialise",
    "chirurgien_dentiste",
    "infirmier",
    "soignant",
    "paramedical",
    "secretaire_medicale",
    "cadre_sante",
  ];

  PROFILES.forEach((p) => {
    const specs = SPECIALTY_GROUPS[p];
    const levels: LevelKey[] = ["debutant", "avance"];

    if (!specs) {
      // No specialty
      levels.forEach((lvl) => {
        [1, 2].forEach((num) => {
          result.push(buildStructuredCase(p, null, lvl, num as 1 | 2, result.length));
        });
      });
    } else {
      specs.forEach((s) => {
        levels.forEach((lvl) => {
          [1, 2].forEach((num) => {
            result.push(buildStructuredCase(p, s, lvl, num as 1 | 2, result.length));
          });
        });
      });
    }
  });

  return result;
}

export function getCase(
  profil: ProfileKey,
  niveau: LevelKey,
  cas_numero: 1 | 2,
  specialite?: SpecialtyKey | null
) {
  const entry = buildStructuredCase(profil, specialite ?? null, niveau, cas_numero);
  const compat = toMedicalCaseCompat(entry);
  return { entry, compat };
}