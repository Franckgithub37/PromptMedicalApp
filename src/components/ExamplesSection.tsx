"use client";

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Example {
  title: string;
  category: string;
  badPrompt: string;
  goodPrompt: string;
  explanation: string;
}

const examples: Example[] = [
{
  title: 'Diagnostic de Diabète',
  category: 'Endocrinologie',
  badPrompt: 'Donne-moi un diagnostic pour ce patient diabétique.',
  goodPrompt: 'Rôle: Tu es médecin généraliste avec 15 ans d\'expérience en diabétologie ambulatoire.\n\nTâche: Proposer un plan de diagnostic structuré incluant:\n1. Examens biologiques nécessaires avec valeurs seuils\n2. Examens complémentaires pertinents\n3. Critères de confirmation du diagnostic selon les guidelines ADA 2024\n\nContexte: Patient de 52 ans, IMC 31, présentant polyurie, polydipsie, fatigue et vision floue depuis 3 semaines, avec antécédents familiaux de diabète de type 2.\n\nFormat: Liste numérotée avec justification de chaque examen.\n\nContraintes: Respecter les recommandations HAS et ADA, et prioriser les examens réalisables en médecine de ville.',
  explanation: 'Le bon prompt inclut le contexte complet du patient, spécifie clairement la tâche, définit le format attendu et mentionne les contraintes réglementaires.'
},
{
  title: 'Douleur Thoracique',
  category: 'Cardiologie',
  badPrompt: 'Que faire pour une douleur thoracique?',
  goodPrompt: 'Rôle: Tu es cardiologue urgentiste senior, expert des syndromes coronariens aigus.\n\nTâche: Élaborer une stratégie de prise en charge urgente comprenant:\n1. Évaluation initiale et score de risque (GRACE/TIMI)\n2. Examens à réaliser en urgence\n3. Traitement immédiat\n4. Critères d\'hospitalisation\n\nContexte: Patient de 65 ans aux urgences avec douleur thoracique apparue il y a 2h, irradiant au bras gauche, associée à dyspnée et sueurs; facteurs de risque: tabagisme 40 PA, HTA, hypercholestérolémie.\n\nFormat: Plan d\'action chronologique avec timeline.\n\nContraintes: Suivre les recommandations ESC 2023 sur les SCA et signaler les critères de gravité immédiate.',
  explanation: 'Le prompt structuré permet d\'obtenir une réponse actionnelle et conforme aux dernières guidelines, avec une approche temporelle claire.'
},
{
  title: 'Réévaluation Asthme',
  category: 'Pneumologie',
  badPrompt: 'Comment améliorer le traitement de l\'asthme?',
  goodPrompt: 'Rôle: Tu es pneumologue avec expertise en éducation thérapeutique de l\'asthme.\n\nTâche: Proposer une optimisation thérapeutique selon le niveau de contrôle (ACT) comprenant:\n1. Évaluation du contrôle actuel selon GINA 2024\n2. Ajustement du traitement de fond avec paliers thérapeutiques\n3. Plan d\'action personnalisé pour la patiente\n4. Critères de réévaluation\n\nContexte: Patiente de 28 ans avec asthme diagnostiqué dans l\'enfance, sous salbutamol PRN uniquement; symptômes actuels: toux nocturne 3x/semaine, sifflements à l\'effort, 2 exacerbations avec corticoïdes oraux en 12 mois, DEP à 75% de la théorique.\n\nFormat: Tableau avec niveau actuel → traitement recommandé → objectifs.\n\nContraintes: Appliquer l\'approche par paliers GINA 2024, intégrer l\'observance et la technique d\'inhalation.',
  explanation: 'Ce prompt fournit les données cliniques essentielles, utilise les outils validés (ACT, GINA) et demande un plan structuré avec suivi.'
}];


export default function ExamplesSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  return (
    <Card className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.06)] border border-gray-100 p-4 sm:p-6 space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity">

        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" style={{ color: '#29abe2' }} />
          <h2 className="text-xl font-bold text-gray-900">Exemples de Prompts</h2>
          <Badge variant="secondary" className="!text-white">{examples.length} exemples</Badge>
        </div>
        {isOpen ?
        <ChevronUp className="w-5 h-5" style={{ color: '#29abe2' }} /> :

        <ChevronDown className="w-5 h-5" style={{ color: '#29abe2' }} />
        }
      </button>

      <AnimatePresence>
        {isOpen &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 overflow-hidden">

            {examples.map((example, idx) =>
          <Card key={idx} className="p-4 border border-gray-200 bg-white/50 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{example.title}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {example.category}
                    </Badge>
                  </div>
                  <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExample(selectedExample === idx ? null : idx)}>

                    {selectedExample === idx ? 'Masquer' : 'Voir détails'}
                  </Button>
                </div>

                <AnimatePresence>
                  {selectedExample === idx &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-4 overflow-hidden">

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="w-4 h-4" style={{ color: '#29abe2' }} />
                          <p className="font-medium text-sm text-red-900">Prompt Faible</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p className="text-sm text-gray-700 italic">{example.badPrompt}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4" style={{ color: '#29abe2' }} />
                          <p className="font-medium text-sm text-green-900">Prompt Fort</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-sm text-gray-700 whitespace-pre-line font-mono">
                            {example.goodPrompt}
                          </p>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="font-medium text-sm text-blue-900 mb-1">💡 Explication</p>
                        <p className="text-sm text-gray-700">{example.explanation}</p>
                      </div>
                    </motion.div>
              }
                </AnimatePresence>
              </Card>
          )}
          </motion.div>
        }
      </AnimatePresence>
    </Card>);

}
