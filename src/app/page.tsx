"use client";

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/Header';
import MedicalCaseCard from '@/components/MedicalCaseCard';
import PromptInput from '@/components/PromptInput';
import ScoreDisplay from '@/components/ScoreDisplay';
import ExamplesSection from '@/components/ExamplesSection';
import { medicalCases } from '@/lib/medicalCases';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import jsPDF from 'jspdf';
import SelectionWizard, { type WizardSelection } from '@/components/SelectionWizard';
import { getCase, PROFILE_LABELS, SPECIALTY_LABELS, type LevelKey } from '@/lib/profileCases';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Confetti from '@/components/Confetti';

interface EvaluationResult {
  scores: {
    clarity: number;
    specificity: number;
    context: number;
    structure: number;
    overall: number;
  };
  feedback: string;
  suggestions: string[];
}

export default function Home() {
  const [level, setLevel] = useState<'beginner' | 'advanced'>('beginner');
  const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [submittedPrompt, setSubmittedPrompt] = useState<string>('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [showWizard, setShowWizard] = useState(true);
  const [selection, setSelection] = useState<WizardSelection | null>(null);

  // DB synced case state
  type DbCase = {
    id: number;
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
    patientAge?: number | null;
    patientSexe?: string | null;
    patientActe?: string | null;
  } | null;
  const [dbCase, setDbCase] = useState<DbCase>(null);
  const [dbLoading, setDbLoading] = useState(false);

  const toUiLevel = (lvl: LevelKey): 'beginner' | 'advanced' => lvl === 'debutant' ? 'beginner' : 'advanced';
  const toWizardLevel = (lvl: 'beginner' | 'advanced'): LevelKey => lvl === 'beginner' ? 'debutant' : 'avance';

  const baseCase = medicalCases[currentCaseIndex];
  const selected = selection ?
  getCase(selection.profile, selection.level, selection.caseNumber, selection.specialty ?? null) :
  null;
  const selectedCompat = selected?.compat || null;

  // Prefer database values when available
  const expectedAttendu = dbCase?.attenduPrompt || selected?.entry.attendu_prompt || selected?.entry.objectif_prompt || null;
  const keyInfos = dbCase?.informationsCles || selected?.entry.informations_cles || null;

  // Build current case from DB when present, fallback to selectedCompat/baseCase
  const currentCase = (() => {
    if (dbCase) {
      const symptomsArr = (dbCase.symptomes || '').
      split(/[•\n\r,;\-\u2022]/).
      map((s) => s.trim()).
      filter(Boolean);
      const base = (selectedCompat || baseCase);
      const mapSex = (s: string | null | undefined, fallback: string) => {
        const v = (s || '').toUpperCase();
        if (v === 'M') return 'Homme';
        if (v === 'F') return 'Femme';
        return fallback;
      };
      return {
        ...base,
        title: dbCase.titreCas,
        category: dbCase.specialite || dbCase.profil,
        description: dbCase.descriptionSituation,
        patientInfo: {
          ...base.patientInfo,
          age: typeof dbCase.patientAge === 'number' ? dbCase.patientAge : base.patientInfo.age,
          gender: mapSex(dbCase.patientSexe, base.patientInfo.gender),
          history: dbCase.antecedents || base.patientInfo.history,
          symptoms: symptomsArr.length ? symptomsArr : base.patientInfo.symptoms,
          // expose inferred/recorded act type for UI
          actType: dbCase.patientActe || (base as any).patientInfo?.actType,
        }
      };
    }
    return selectedCompat || baseCase;
  })();

  // Fetch DB case when a selection is completed
  useEffect(() => {
    const fetchDbCase = async () => {
      if (!selection) {
        setDbCase(null);
        return;
      }
      setDbLoading(true);
      try {
        const token = localStorage.getItem('bearer_token') || '';
        const params = new URLSearchParams({
          profil: PROFILE_LABELS[selection.profile],
          // use raw LevelKey values to match DB ('debutant' | 'avance')
          niveau: selection.level,
          cas_numero: String(selection.caseNumber)
        });
        if (selection.specialty) params.set('specialite', SPECIALTY_LABELS[selection.specialty]);
        params.set('limit', '1');
        const res = await fetch(`/api/cas-cliniques?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Failed to fetch case');
        const data = await res.json();
        setDbCase(Array.isArray(data) ? data[0] || null : data || null);
      } catch (e) {
        console.error('Fetch DB case error:', e);
        setDbCase(null);
      } finally {
        setDbLoading(false);
      }
    };
    fetchDbCase();
  }, [selection]);

  const handleSubmitPrompt = async (prompt: string) => {
    setIsLoading(true);
    setSubmittedPrompt(prompt);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          medicalCase: currentCase,
          exerciseSheet: dbCase ? {
            profil: dbCase.profil,
            specialite: dbCase.specialite,
            titreCas: dbCase.titreCas,
            descriptionSituation: dbCase.descriptionSituation,
            antecedents: dbCase.antecedents,
            informationsCles: dbCase.informationsCles,
            attenduPrompt: dbCase.attenduPrompt,
            patientAge: dbCase.patientAge,
            patientSexe: dbCase.patientSexe,
            patientActe: dbCase.patientActe,
          } : null
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'évaluation');
      }

      const data = await response.json();
      setEvaluation(data);
      setTimeout(() => {
        setShowResultModal(true);
        if (data.scores.overall >= 75) {
          setShowConfetti(true);
        }
      }, 5000);
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'évaluation. Vérifiez votre clé API OpenAI.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!evaluation) {
      alert('Veuillez d\'abord évaluer un prompt');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport d\'Évaluation - Prompting Médical', margin, y);
    y += 15;

    // Medical Case
    doc.setFontSize(14);
    doc.text('Cas Médical', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Titre: ${currentCase.title}`, margin, y);
    y += 6;
    doc.text(`Catégorie: ${currentCase.category}`, margin, y);
    y += 6;
    doc.text(`Niveau: ${level === 'beginner' ? 'Débutant' : 'Avancé'}`, margin, y);
    y += 10;

    // Prompt
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Prompt Soumis', margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const promptLines = doc.splitTextToSize(submittedPrompt, pageWidth - 2 * margin);
    doc.text(promptLines, margin, y);
    y += promptLines.length * 5 + 10;

    // Scores
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores d\'Évaluation', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Clarté: ${evaluation.scores.clarity}/100`, margin, y);
    y += 6;
    doc.text(`Spécificité: ${evaluation.scores.specificity}/100`, margin, y);
    y += 6;
    doc.text(`Contexte: ${evaluation.scores.context}/100`, margin, y);
    y += 6;
    doc.text(`Structure: ${evaluation.scores.structure}/100`, margin, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`Score Global: ${evaluation.scores.overall}/100`, margin, y);
    y += 10;

    // Feedback
    doc.setFontSize(14);
    doc.text('Feedback', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const feedbackLines = doc.splitTextToSize(evaluation.feedback, pageWidth - 2 * margin);
    doc.text(feedbackLines, margin, y);
    y += feedbackLines.length * 5 + 10;

    // Suggestions
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Suggestions d\'Amélioration', margin, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    evaluation.suggestions.forEach((suggestion, idx) => {
      const suggestionLines = doc.splitTextToSize(`${idx + 1}. ${suggestion}`, pageWidth - 2 * margin - 5);
      doc.text(suggestionLines, margin, y);
      y += suggestionLines.length * 5 + 4;
    });

    doc.save('evaluation-prompting-medical.pdf');
  };

  const handleNextCase = () => {
    setCurrentCaseIndex((prev) => (prev + 1) % medicalCases.length);
    setEvaluation(null);
    setSubmittedPrompt('');
  };

  const handlePrevCase = () => {
    setCurrentCaseIndex((prev) => (prev - 1 + medicalCases.length) % medicalCases.length);
    setEvaluation(null);
    setSubmittedPrompt('');
  };

  const selectionBadges = selection &&
  <>
      <Badge variant="secondary" className="!text-white font-bold">{PROFILE_LABELS[selection.profile]}</Badge>
      {selection.specialty &&
    <Badge variant="outline" className="!text-white font-bold">{SPECIALTY_LABELS[selection.specialty]}</Badge>
    }
      <Badge className="!text-white font-bold">{selection.level === 'debutant' ? 'Débutant' : 'Avancé'}</Badge>
      <Badge variant="secondary" className="!text-white font-bold">{`Exercice ${selection.caseNumber}`}</Badge>
      <Button size="sm" variant="outline" onClick={() => setShowWizard(true)} className="gap-1">
        <Pencil className="w-3.5 h-3.5" /> Modifier
      </Button>
    </>;

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header
          level={level}
          onLevelChange={(lv) => {
            setLevel(lv);
            if (selection) {
              const newSel = { ...selection, level: toWizardLevel(lv) };
              setSelection(newSel);
            }
          }}
          onExportPDF={handleExportPDF}
          selectionBadges={selectionBadges}
          showNextButton={evaluation ? evaluation.scores.overall >= 75 : false} />


        {showWizard &&
        <SelectionWizard
          defaultSelection={selection || { level: toWizardLevel(level) }}
          onComplete={(sel) => {
            setSelection(sel);
            setLevel(toUiLevel(sel.level));
            setEvaluation(null);
            setSubmittedPrompt('');
            setShowWizard(false);
          }} />

        }

        {!showWizard &&
        <>
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Medical Case */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                {selection ?
              <h2 className="text-lg font-semibold text-white">{`Exercice ${selection.caseNumber} — ${currentCase.title}`}</h2> :

              <h2 className="text-lg font-semibold text-white">
                    Exercice {currentCaseIndex + 1} / {medicalCases.length}
                  </h2>
              }
                {!selection &&
              <div className="flex gap-2">
                    <Button
                  onClick={handlePrevCase}
                  variant="outline"
                  size="sm"
                  className="bg-transparent">

                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                  onClick={handleNextCase}
                  variant="outline"
                  size="sm"
                  className="bg-transparent">

                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
              }
              </div>
              <MedicalCaseCard medicalCase={currentCase} expected={expectedAttendu || undefined} keyInfo={keyInfos || undefined} profileKey={selection?.profile} key={selection ? `${selection.profile}-${selection.specialty ?? 'none'}-${selection.level}-${selection.caseNumber}-${dbCase?.id ?? 'no-db'}` : `base-${currentCaseIndex}`} />
              {!evaluation && <ExamplesSection />}
            </div>

            {/* Right Column - Prompt Input */}
            <div className="space-y-6 lg:!w-[49%] lg:!h-[579px]">
              <PromptInput
              level={level}
              onSubmit={handleSubmitPrompt}
              isLoading={isLoading} />
            </div>
          </div>

          {/* Evaluation right below the two columns, replacing ExamplesSection */}
          {evaluation &&
            <div className="w-full">
              <ScoreDisplay
                score={evaluation.scores}
                feedback={evaluation.feedback}
                suggestions={evaluation.suggestions}
                details={evaluation.details}
                positives={evaluation.positives}
                improvements={evaluation.improvements}
                improvedVersion={evaluation.improvedVersion}
                result={evaluation.result} />
            </div>
          }
        </>
        }
      </div>

      <AlertDialog open={showResultModal} onOpenChange={setShowResultModal}>
        <AlertDialogContent className="bg-white border border-gray-100 rounded-2xl text-gray-900 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {evaluation && evaluation.scores.overall >= 75 ? "Félicitation" : "Exercice à compléter"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700 text-lg">
              {evaluation && evaluation.scores.overall >= 75 ? (
                <>
                  Tu as bien réalisé l'exercice. 
                  <br />
                  Tu peux maintenant cliquer sur suivant (dans le bandeau haut) pour passer au prochain module.
                </>
              ) : (
                <>
                  Le prompt réalisé manque de détails. 
                  <br />
                  Je te propose de lire les recommandations, et de recommencer. Pour cela, sélectionne l'exercice numéro 2. Pour réussir cet exercice, tu dois dépasser un score global de 75%. A toi de jouer !
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              className="bg-[#29abe2] hover:bg-[#2089b5] text-white"
              onClick={() => {
                setShowResultModal(false);
                setShowConfetti(false);
              }}
            >
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {showConfetti && <Confetti />}
    </div>);

}