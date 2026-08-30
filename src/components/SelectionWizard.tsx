"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PROFILE_LABELS,
  SPECIALTY_GROUPS,
  SPECIALTY_LABELS,
  listSpecialties,
  type ProfileKey,
  type SpecialtyKey,
  type LevelKey } from
"@/lib/profileCases";
import { Stethoscope, Brain, Smile, Syringe, HandHeart, Activity, ClipboardList, Shield, ChevronRight, GraduationCap, BookOpen, ArrowLeft, Check } from "lucide-react";

export interface WizardSelection {
  profile: ProfileKey;
  specialty: SpecialtyKey | null;
  level: LevelKey; // "debutant" | "avance"
  caseNumber: 1 | 2;
}

interface SelectionWizardProps {
  defaultSelection?: Partial<WizardSelection>;
  onComplete: (sel: WizardSelection) => void;
}

const PROFILE_CARDS: Array<{key: ProfileKey; icon: React.ElementType; color: string; gradient: string}> = [
  { key: "medecin_generaliste", icon: Stethoscope, color: "#3b82f6", gradient: "from-blue-500/10 to-blue-600/5" },
  { key: "medecin_specialise", icon: Brain, color: "#8b5cf6", gradient: "from-purple-500/10 to-indigo-600/5" },
  { key: "chirurgien_dentiste", icon: Smile, color: "#06b6d4", gradient: "from-cyan-500/10 to-blue-600/5" },
  { key: "infirmier", icon: Syringe, color: "#10b981", gradient: "from-emerald-500/10 to-teal-600/5" },
  { key: "soignant", icon: HandHeart, color: "#f97316", gradient: "from-orange-500/10 to-amber-600/5" },
  { key: "paramedical", icon: Activity, color: "#d946ef", gradient: "from-fuchsia-500/10 to-pink-600/5" },
  { key: "secretaire_medicale", icon: ClipboardList, color: "#f43f5e", gradient: "from-rose-500/10 to-red-600/5" },
  { key: "cadre_sante", icon: Shield, color: "#64748b", gradient: "from-slate-500/10 to-gray-700/5" },
];


export function SelectionWizard({ defaultSelection, onComplete }: SelectionWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<ProfileKey | null>(defaultSelection?.profile ?? null);
  const [specialty, setSpecialty] = useState<SpecialtyKey | null>(defaultSelection?.specialty ?? null);
  const [level, setLevel] = useState<LevelKey>(defaultSelection?.level ?? "debutant");
  const [caseNumber, setCaseNumber] = useState<1 | 2>((defaultSelection?.caseNumber as 1 | 2) ?? 1);

  const needsSpecialty = useMemo(() => profile ? SPECIALTY_GROUPS[profile] !== null : false, [profile]);

  const handlePickProfile = (k: ProfileKey) => {
    setProfile(k);
    setSpecialty(null);
    if (SPECIALTY_GROUPS[k] === null) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const canFinish = useMemo(() => {
    if (!profile) return false;
    if (needsSpecialty && !specialty) return false;
    return true;
  }, [profile, needsSpecialty, specialty]);

  const handleFinish = () => {
    if (!canFinish || !profile) return;
    onComplete({ profile, specialty: specialty ?? null, level, caseNumber });
  };

  // Step indicator
  const steps = [
    { num: 1, label: "Profil" },
    { num: 2, label: "Spécialité" },
    { num: 3, label: "Configuration" },
  ];

  return (
    <div className="space-y-5 w-full max-w-[1253px]">
      {/* Step 1 — Profile selection */}
      {step === 1 && (
        <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 sm:gap-2 ${s.num === step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    s.num < step ? 'bg-[#29abe2] text-white' :
                    s.num === step ? 'bg-[#29abe2] text-white shadow-md shadow-[#29abe2]/30' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {s.num < step ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${s.num === step ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="w-6 sm:w-12 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Choisissez votre profil</h3>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Sélectionnez le profil qui correspond à votre pratique professionnelle</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROFILE_CARDS.map(({ key, icon: Icon, color, gradient }) => (
              <button
                key={key}
                onClick={() => handlePickProfile(key)}
                className={`group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 border-2 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br ${gradient} ${
                  profile === key ? 'border-[#29abe2] shadow-md shadow-[#29abe2]/10' : 'border-transparent hover:border-gray-200'
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.07] -translate-y-6 translate-x-6" style={{ backgroundColor: color }} />
                <div className="relative flex flex-col gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}25` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{PROFILE_LABELS[key]}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 group-hover:text-[#29abe2] transition-colors">
                      <span>Sélectionner</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Step 2 — Specialty */}
      {step === 2 && profile && (
        <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 sm:gap-3">
                <div className={`flex items-center gap-1.5 sm:gap-2 ${s.num <= step ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all ${
                    s.num < step ? 'bg-[#29abe2] text-white' :
                    s.num === step ? 'bg-[#29abe2] text-white shadow-md shadow-[#29abe2]/30' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {s.num < step ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.num}
                  </div>
                  <span className={`text-xs sm:text-sm font-medium hidden sm:inline ${s.num <= step ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && <div className="w-6 sm:w-12 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Spécialité</h3>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Choisissez la spécialité pour <span className="font-medium text-gray-700">{PROFILE_LABELS[profile]}</span></p>
          </div>

          <Select value={specialty ?? undefined} onValueChange={(v) => setSpecialty(v as SpecialtyKey)}>
            <SelectTrigger className="bg-gray-50 border-gray-200 w-full sm:w-[420px] h-12 rounded-xl text-base">
              <SelectValue placeholder="Sélectionnez une spécialité" />
            </SelectTrigger>
            <SelectContent>
              {listSpecialties(profile).map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-3 pt-6">
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
              className="gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
            <Button
              disabled={!specialty}
              onClick={() => setStep(3)}
              className="bg-[#29abe2] hover:bg-[#1d8fc0] text-white rounded-xl px-6 gap-2"
            >
              Continuer <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Level + Exercise (compact, left-aligned) */}
      {step === 3 && (
        <div className="flex flex-col md:flex-row gap-5 items-start">
          {/* Left card — configuration */}
          <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-6 w-full md:w-1/2">
            {/* Step indicator */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              {steps.map((s, i) => (
                <div key={s.num} className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1.5 sm:gap-2 opacity-100">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      s.num < step ? 'bg-[#29abe2] text-white' :
                      s.num === step ? 'bg-[#29abe2] text-white shadow-md shadow-[#29abe2]/30' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {s.num < step ? <Check className="w-3.5 h-3.5" /> : s.num}
                    </div>
                    <span className={`text-xs font-medium hidden sm:inline ${s.num === step ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                  </div>
                  {i < steps.length - 1 && <div className="w-8 h-px bg-gray-200" />}
                </div>
              ))}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Configuration</h3>
            <p className="text-sm text-gray-500 mb-5">Choisissez le niveau et l&apos;exercice</p>

            {/* Level */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <GraduationCap className="w-4 h-4 text-[#29abe2]" />
                <p className="text-sm font-semibold text-gray-800">Niveau</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLevel("debutant")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border-2 ${
                    level === "debutant"
                      ? "border-[#29abe2] bg-[#29abe2]/5 text-[#29abe2] shadow-sm"
                      : "border-gray-150 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Débutant</span>
                    <Badge variant="secondary" className="text-[10px] !text-white">Guidé</Badge>
                  </div>
                </button>
                <button
                  onClick={() => setLevel("avance")}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border-2 ${
                    level === "avance"
                      ? "border-[#29abe2] bg-[#29abe2]/5 text-[#29abe2] shadow-sm"
                      : "border-gray-150 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Avancé</span>
                    <Badge variant="default" className="text-[10px] !text-white">Libre</Badge>
                  </div>
                </button>
              </div>
            </div>

            {/* Exercise */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-[#29abe2]" />
                <p className="text-sm font-semibold text-gray-800">Exercice</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCaseNumber(1)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border-2 ${
                    caseNumber === 1
                      ? "border-[#29abe2] bg-[#29abe2]/5 text-[#29abe2] shadow-sm"
                      : "border-gray-150 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Exercice 1
                </button>
                <button
                  onClick={() => setCaseNumber(2)}
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-all border-2 ${
                    caseNumber === 2
                      ? "border-[#29abe2] bg-[#29abe2]/5 text-[#29abe2] shadow-sm"
                      : "border-gray-150 bg-gray-50 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  Exercice 2
                </button>
              </div>
            </div>
          </Card>

          {/* Right side — summary + actions */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Summary card */}
            <Card className="bg-gradient-to-br from-[#0c497b] to-[#01233f] rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.12)] border-0 p-6 text-white">
              <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Récapitulatif</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Profil</span>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">{profile ? PROFILE_LABELS[profile] : '—'}</Badge>
                </div>
                {needsSpecialty && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Spécialité</span>
                    <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">{specialty ? SPECIALTY_LABELS[specialty] : '—'}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Niveau</span>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">{level === "debutant" ? "Débutant" : "Avancé"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Exercice</span>
                  <Badge className="bg-white/15 text-white border-white/20 hover:bg-white/20">Exercice {caseNumber}</Badge>
                </div>
              </div>
            </Card>

            {/* Action buttons stacked vertically */}
            <Button
              disabled={!canFinish}
              onClick={handleFinish}
              className="w-full h-12 bg-[#29abe2] hover:bg-[#1d8fc0] text-white rounded-xl text-base font-semibold gap-2 shadow-lg shadow-[#29abe2]/25 transition-all hover:shadow-xl hover:shadow-[#29abe2]/30"
            >
              Commencer l&apos;exercice <ChevronRight className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep(needsSpecialty ? 2 : 1)}
              className="w-full text-gray-500 hover:text-gray-700 gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Modifier la sélection
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SelectionWizard;
