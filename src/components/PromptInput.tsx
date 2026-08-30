"use client";

import { useRef, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Sparkles, Loader2, Mic, Square } from 'lucide-react';

interface PromptInputProps {
  level: 'beginner' | 'advanced';
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export default function PromptInput({ level, onSubmit, isLoading }: PromptInputProps) {
  const [freeText, setFreeText] = useState('');
  const [guidedForm, setGuidedForm] = useState({
    role: '',
    task: '',
    context: '',
    format: '',
    constraints: ''
  });
  const [activeField, setActiveField] = useState<keyof typeof guidedForm>('task');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [dictationError, setDictationError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const appendToActiveField = (text: string) => {
    const cleaned = text.trim();
    if (!cleaned) {
      return;
    }
    if (level === 'advanced') {
      setFreeText((prev) => {
        const current = prev.trim();
        return current ? `${current} ${cleaned}` : cleaned;
      });
    } else {
      setGuidedForm((prev) => {
        const current = prev[activeField].trim();
        return {
          ...prev,
          [activeField]: current ? `${current} ${cleaned}` : cleaned
        };
      });
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setDictationError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'dictation.webm');

      const response = await fetch('/api/stt', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Erreur lors de la transcription');
      }

      appendToActiveField(data?.text || '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription impossible';
      setDictationError(message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDictationClick = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      setDictationError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setDictationError('Accès micro refusé ou indisponible.');
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (level === 'advanced') {
      onSubmit(freeText);
    } else {
      const prompt = `Rôle: ${guidedForm.role}\n\nTâche: ${guidedForm.task}\n\nContexte: ${guidedForm.context}\n\nFormat attendu: ${guidedForm.format}\n\nContraintes: ${guidedForm.constraints}`;
      onSubmit(prompt);
    }
  };

  const isValid = level === 'advanced' ?
  freeText.trim().length > 0 :
  Object.values(guidedForm).every((v) => v.trim().length > 0);

  return (
    <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-6 space-y-4 !flex !flex-col w-full lg:!w-[599px] lg:!h-[1005px]">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {level === 'beginner' ? 'Formulaire Guidé' : 'Prompt Libre'}
        </h2>
        <Sparkles className="w-5 h-5" style={{ color: '#29abe2' }} />
      </div>

      {level === 'beginner' ?
      <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Textarea
            id="role"
            placeholder="Ex: Vous êtes médecin généraliste avec 20 ans d'expérience..."
            value={guidedForm.role}
            onChange={(e) => setGuidedForm({ ...guidedForm, role: e.target.value })}
            onFocus={() => setActiveField('role')}
            className="min-h-[60px] resize-none"
            disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task">Tâche à Réaliser</Label>
            <Textarea
            id="task"
            placeholder="Ex: Proposer un plan de diagnostic et de prise en charge..."
            value={guidedForm.task}
            onChange={(e) => setGuidedForm({ ...guidedForm, task: e.target.value })}
            onFocus={() => setActiveField('task')}
            className="min-h-[60px] resize-none"
            disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="context">Contexte Médical</Label>
            <Textarea
            id="context"
            placeholder="Ex: Patient de 52 ans avec symptômes de diabète..."
            value={guidedForm.context}
            onChange={(e) => setGuidedForm({ ...guidedForm, context: e.target.value })}
            onFocus={() => setActiveField('context')}
            className="min-h-[60px] resize-none"
            disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Format de Réponse Souhaité</Label>
            <Input
            id="format"
            placeholder="Ex: Liste structurée, plan par étapes..."
            value={guidedForm.format}
            onChange={(e) => setGuidedForm({ ...guidedForm, format: e.target.value })}
            onFocus={() => setActiveField('format')}
            disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints">Contraintes Spécifiques</Label>
            <Input
            id="constraints"
            placeholder="Ex: Respecter les guidelines européennes..."
            value={guidedForm.constraints}
            onChange={(e) => setGuidedForm({ ...guidedForm, constraints: e.target.value })}
            onFocus={() => setActiveField('constraints')}
            disabled={isLoading} />
          </div>

          <div className="space-y-2">
            <style>{`@keyframes micBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            <Button
              type="button"
              onClick={handleDictationClick}
              disabled={isLoading || isTranscribing}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full p-0 text-white shadow-lg hover:brightness-110"
              style={{
                background: 'radial-gradient(circle, #0c497b 0%, #01233f 100%)',
                ...(isRecording ? { animation: 'micBlink 1s ease-in-out infinite' } : {})
              }}
              title="Dictée vocale"
            >
              {isTranscribing ? (
                <Loader2 className="h-14 w-14 animate-spin text-white" />
              ) : isRecording ? (
                <Square className="h-14 w-14 fill-current text-white" />
              ) : (
                <Mic className="h-14 w-14 text-white" style={{ width: 48, height: 48 }} />
              )}
            </Button>
            <p className="text-center text-sm font-bold text-slate-500">Dictée vocale</p>
            {dictationError ? (
              <p className="text-center text-xs text-red-600">{dictationError}</p>
            ) : null}
          </div>
        </div> :

      <div className="space-y-2">
          <Label htmlFor="prompt">Votre Prompt</Label>
          <Textarea
          id="prompt"
          placeholder="Rédigez votre prompt complet pour ce cas médical..."
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          className="min-h-[300px] resize-none font-mono text-sm"
          disabled={isLoading} />

          <p className="text-xs text-gray-500">
            {freeText.length} caractères
          </p>

          <div className="space-y-2">
            <style>{`@keyframes micBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
            <Button
              type="button"
              onClick={handleDictationClick}
              disabled={isLoading || isTranscribing}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full p-0 text-white shadow-lg hover:brightness-110"
              style={{
                background: 'radial-gradient(circle, #0c497b 0%, #01233f 100%)',
                ...(isRecording ? { animation: 'micBlink 1s ease-in-out infinite' } : {})
              }}
              title="Dictée vocale"
            >
              {isTranscribing ? (
                <Loader2 className="h-14 w-14 animate-spin text-white" />
              ) : isRecording ? (
                <Square className="h-14 w-14 fill-current text-white" />
              ) : (
                <Mic className="h-14 w-14 text-white" style={{ width: 48, height: 48 }} />
              )}
            </Button>
            <p className="text-center text-sm font-bold text-slate-500">Dictée vocale</p>
            {dictationError ? (
              <p className="text-center text-xs text-red-600">{dictationError}</p>
            ) : null}
          </div>
        </div>
      }

      <Button
        onClick={handleSubmit}
        disabled={!isValid || isLoading}
        className="w-full"
        size="lg">

        {isLoading ?
        <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Évaluation en cours...
          </> :

        <>
            <Sparkles className="w-4 h-4 mr-2" />
            Évaluer le Prompt
          </>
        }
      </Button>
    </Card>);

}
