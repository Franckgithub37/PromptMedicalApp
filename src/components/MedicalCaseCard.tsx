"use client";

import { MedicalCase } from '@/lib/medicalCases';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Calendar, Activity, ClipboardList } from 'lucide-react';

interface MedicalCaseCardProps {
  medicalCase: MedicalCase;
  expected?: string;
  keyInfo?: string;
  profileKey?: string;
}

export default function MedicalCaseCard({ medicalCase, expected, keyInfo, profileKey }: MedicalCaseCardProps) {
  // Profil cadre de santé : la situation est un mail de collaborateur, pas un patient
  const isCadre = profileKey === 'cadre_sante';
  // Attendu du prompt - Positionné tout en haut
  const safeSplit = (text: string): string[] => {
    // Replace decimal dots/commas with a placeholder to protect them from splitting
    const protected_ = text.replace(/(\d)[.,](\d)/g, '$1\u0000$2');
    // Split on bullet points, newlines, dashes, semicolons, commas, and standalone dots
    const parts = protected_.split(/[•\u2022\n\r]|(?<!\d)[\.,;](?!\d)|[\-]/);
    // Restore decimal separators
    return parts.map((s) => s.replace(/\u0000/g, '.').trim()).filter(Boolean);
  };

  const historyItems = safeSplit(String(medicalCase.patientInfo?.history || ''))
    .slice(0, 12);

  const keyInfoItems = safeSplit(
    String(keyInfo || '').replace(/^[\s{\[\(]+|[\s}\]\)]+$/g, '')
  )
    .map((s) => s.replace(/[{}\[\]"]+/g, '').trim())
    .filter(Boolean)
    .filter((s) => !/^\d+(?:[.,]\d+)?$/.test(s)) // remove isolated numbers
    .filter((s) => !/(?<![\p{L}\p{N}])(âge|ans|sexe|homme|femme|masculin|féminin|m|f)(?![\p{L}\p{N}])/iu.test(s)) // limites de mots compatibles accents (ex : « février » n'est plus filtré)
    .slice(0, 6);

  const addMissingAbbreviations = (item: string): string => {
    const rules: Array<{ regex: RegExp; short: string }> = [
      { regex: /pression artérielle/gi, short: 'PA' },
      { regex: /fréquence cardiaque/gi, short: 'FC' },
      { regex: /fréquence respiratoire/gi, short: 'FR' },
      { regex: /saturation(?: en)? oxyg[eè]ne/gi, short: 'SpO2' },
      { regex: /temp[ée]rature/gi, short: 'T°' },
      { regex: /num[ée]ration formule sanguine|h[ée]mogramme/gi, short: 'NFS' },
      { regex: /protéine c[- ]?r[ée]active/gi, short: 'CRP' },
      { regex: /vitesse de s[ée]dimentation/gi, short: 'VS' },
      { regex: /[ée]lectrocardiogramme/gi, short: 'ECG' },
      { regex: /tomodensitom[ée]trie|scanner/gi, short: 'TDM' },
      { regex: /imagerie par r[ée]sonance magn[ée]tique/gi, short: 'IRM' },
      { regex: /d[ée]bit de filtration glom[ée]rulaire/gi, short: 'DFG' }
    ];

    let normalized = item;
    for (const rule of rules) {
      const hasLong = rule.regex.test(normalized);
      const hasShort = new RegExp(`\\b${rule.short}\\b`, 'i').test(normalized);
      if (hasLong && !hasShort) {
        normalized = normalized.replace(rule.regex, (match) => `${match} (${rule.short})`);
      }
      rule.regex.lastIndex = 0;
    }
    return normalized;
  };

  const normalizedKeyInfoItems = keyInfoItems.map(addMissingAbbreviations);

  return (
    <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-6 space-y-4 !text-black">
      {/* Attendu du prompt - Positionné tout en haut */}
      <div className="p-4 rounded-xl !px-[22px] !py-[17px] !text-white bg-gradient-to-br from-[#0c497b] to-[#01233f] border border-[#29abe2]/20">
        <h3 className="font-bold mb-1 !whitespace-pre-line !text-lg !text-[#ff9933] !text-center">Attendu du prompt</h3>
        <p className="text-xs mb-2 !text-white/70">Précisez la production attendue (sortie, structure, ton, contraintes).</p>
        {typeof expected === 'string' && expected.trim().length > 0 ? (
          <p className="text-white font-semibold text-sm leading-relaxed">{expected}</p>
        ) : (
          <p className="text-white/80 italic text-sm">Manquant à créer</p>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{medicalCase.title}</h2>
          <Badge variant="outline" className="text-sm">
            {medicalCase.category}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 !whitespace-pre-line">{isCadre ? 'Mail du collaborateur' : 'Description de la situation'}</h3>
          <p className={`text-gray-700 leading-relaxed${isCadre ? ' whitespace-pre-line' : ''}`}>{medicalCase.description}</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-3 !whitespace-pre-line">{isCadre ? 'Le collaborateur' : 'Antécédents'}</h3>
          <div className="flex flex-wrap gap-2">
            {historyItems.map((item, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs whitespace-nowrap !text-white">
                {item}
              </Badge>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 !whitespace-pre-line">
            <ClipboardList className="w-4 h-4" style={{ color: '#29abe2' }} />Informations clés
          </h3>
          {keyInfoItems.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc pl-5">
              {normalizedKeyInfoItems.map((info, idx) => (
                <li key={idx} className="text-gray-900 text-sm font-medium">{info}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm italic">Manquant à créer</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{profileKey === 'cadre_sante' ? 'Contexte' : 'Informations patient'}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: '#29abe2' }} />
              <span className="text-sm text-gray-700">
                {profileKey === 'cadre_sante'
                  ? (medicalCase as any).patientInfo?.actType || 'Contexte service'
                  : <>{medicalCase.patientInfo.age} ans • {medicalCase.patientInfo.gender}
                    {typeof (medicalCase as any).patientInfo?.weightKg === 'number' &&
                      <> • Poids {(medicalCase as any).patientInfo.weightKg} kilos</>
                    }</>
                }
              </span>
            </div>
            {profileKey !== 'cadre_sante' && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#29abe2' }} />
              <span className="text-sm text-gray-700">{(medicalCase as any).patientInfo?.actType || 'Consultation'}</span>
            </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{profileKey === 'secretaire_medicale' || profileKey === 'cadre_sante' ? 'Informations générales' : 'Symptômes'}</h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(medicalCase.patientInfo?.symptoms) ? medicalCase.patientInfo.symptoms : []).map((symptom, idx) => (
              <Badge key={idx} variant="secondary" className="text-sm !text-white">
                <Activity className="w-3 h-3 mr-1" style={{ color: '#29abe2' }} />
                {symptom}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
