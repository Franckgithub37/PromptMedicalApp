"use client";

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle2, AlertCircle, TrendingUp, Target, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Score {
  clarity: number;
  specificity: number;
  context: number;
  structure: number;
  constraints?: number;
  overall: number;
  rtcfc?: {
    role: number;
    task: number;
    context: number;
    format: number;
    constraints: number;
  };
}

interface ScoreDisplayProps {
  score: Score;
  feedback: string;
  suggestions: string[];
  details?: {
    role?: string;
    task?: string;
    context?: string;
    format?: string;
    constraints?: string;
  };
  positives?: string[];
  improvements?: string[];
  improvedVersion?: string;
  result?: string;
}

export default function ScoreDisplay({ score, feedback, details, positives, result }: ScoreDisplayProps) {
  const rtcfc = score.rtcfc;

  const CircularProgress = ({ value, max, label }: { value: number; max: number; label: string }) => {
    const percentage = (value / max) * 100;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    const getColor = (pct: number) => {
      if (pct >= 80) return '#10b981';
      if (pct >= 60) return '#f59e0b';
      return '#ef4444';
    };

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="relative w-20 h-20">
          <svg className="transform -rotate-90 w-20 h-20">
            <circle cx="40" cy="40" r={radius} stroke="#e5e7eb" strokeWidth="7" fill="none" />
            <motion.circle
              cx="40" cy="40" r={radius}
              stroke={getColor(percentage)}
              strokeWidth="7" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              strokeLinecap="round"
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color: getColor(percentage) }}>
              {value}/{max}
            </span>
          </div>
        </div>
        <p className="text-xs font-semibold text-gray-700 text-center">{label}</p>
      </div>
    );
  };

  const overallGrade = score.overall >= 75 ? 'Validé' : score.overall >= 60 ? 'Presque' : 'À retravailler';
  const gradeColor = score.overall >= 75 ? 'bg-green-100 text-green-800' : score.overall >= 60 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Single container with orange border */}
      <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN: Ce qui fonctionne bien + Feedback */}
          <div className="flex-1 space-y-5">
            {/* Ce qui fonctionne bien */}
            {positives && positives.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Ce qui fonctionne bien</h3>
                </div>
                <ul className="space-y-2">
                  {positives.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-green-500" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5" style={{ color: '#29abe2' }} />
                  <h3 className="font-semibold text-gray-900">Feedback</h3>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm">{feedback}</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: RTCFC scores + Détail par champ */}
          <div className="flex-1 space-y-5">
            {/* Header + badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: '#29abe2' }} />
                <h2 className="text-lg font-bold text-gray-900">Évaluation RTCFC</h2>
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <Badge className={score.overall >= 75 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {result}
                  </Badge>
                )}
                <Badge className={gradeColor}>{overallGrade}</Badge>
              </div>
            </div>

            {/* 5 RTCFC circles */}
            {rtcfc ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-2">
                <CircularProgress value={rtcfc.role} max={20} label="Rôle" />
                <CircularProgress value={rtcfc.task} max={20} label="Tâche" />
                <CircularProgress value={rtcfc.context} max={20} label="Contexte" />
                <CircularProgress value={rtcfc.format} max={20} label="Format" />
                <CircularProgress value={rtcfc.constraints} max={20} label="Contraintes" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <CircularProgress value={score.clarity} max={100} label="Clarté" />
                <CircularProgress value={score.specificity} max={100} label="Spécificité" />
                <CircularProgress value={score.context} max={100} label="Contexte" />
                <CircularProgress value={score.structure} max={100} label="Structure" />
              </div>
            )}

            {/* Overall score bar */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#29abe2' }} />
                <h3 className="font-semibold text-gray-900">Score Global</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  {score.overall}/100
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${score.overall}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Seuil de validation : 75/100</p>
                </div>
              </div>
            </div>

            {/* Détail par champ */}
            {details && (
              <div className="pt-3 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5" style={{ color: '#29abe2' }} />
                  <h3 className="font-semibold text-gray-900">Détail par champ</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  {details.role && <p><span className="font-semibold text-gray-800">Rôle :</span> <span className="text-gray-700">{details.role}</span></p>}
                  {details.task && <p><span className="font-semibold text-gray-800">Tâche :</span> <span className="text-gray-700">{details.task}</span></p>}
                  {details.context && <p><span className="font-semibold text-gray-800">Contexte :</span> <span className="text-gray-700">{details.context}</span></p>}
                  {details.format && <p><span className="font-semibold text-gray-800">Format :</span> <span className="text-gray-700">{details.format}</span></p>}
                  {details.constraints && <p><span className="font-semibold text-gray-800">Contraintes :</span> <span className="text-gray-700">{details.constraints}</span></p>}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </motion.div>
  );
}
