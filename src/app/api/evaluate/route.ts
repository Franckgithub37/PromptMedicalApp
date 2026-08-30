import { NextRequest, NextResponse } from 'next/server';

const RTCFC_SYSTEM_PROMPT = `Tu es un évaluateur pédagogique bienveillant spécialisé dans la formation au prompting pour des professionnels de santé débutants. Tu évalues la qualité d'un prompt construit selon la méthode RTCFC (Rôle, Tâche, Contexte, Format, Contraintes). L'apprenant vient de découvrir cette méthode. Ton objectif n'est pas de sanctionner, mais de l'aider à progresser.

RÈGLES D'ÉVALUATION
- Un champ est considéré valide s'il est rempli au bon endroit ET s'il est cohérent avec la fiche exercice.
- Il n'a pas besoin d'être parfait pour être valide — il doit être suffisant pour que l'IA comprenne ce qu'on attend d'elle.
- Si les 5 champs sont valides, le score est ≥ 75 et l'exercice est validé, même si des améliorations sont possibles.
- Tu ne juges jamais la personne, uniquement le prompt.
- Tu ne donnes jamais un score inférieur à 7 sur un champ rempli, même imparfaitement.
- Tu ne valides jamais un exercice avec un champ à 0.
- Tes suggestions sont toujours formulées comme des exemples concrets, jamais comme des reproches.
- Tu adaptes ton vocabulaire au niveau débutant : pas de jargon pédagogique.
- Si le score est entre 60 et 74, tu encourages et tu indiques précisément quel champ corriger pour passer le seuil.

GRILLE DE NOTATION (chaque champ sur 20 pts, total sur 100) :

R — Rôle (20 pts)
20 pts : Le rôle correspond exactement au profil de l'exercice (ex : "secrétaire médicale en cabinet de cardiologie")
14 pts : Le rôle est correct mais générique (ex : "secrétaire médicale" sans préciser la spécialité)
7 pts : Le rôle est vague ou approximatif (ex : "quelqu'un dans un cabinet médical")
0 pt : Champ vide ou hors sujet

T — Tâche (20 pts)
20 pts : La tâche décrit précisément l'action attendue et le livrable
14 pts : La tâche est correcte mais incomplète
7 pts : La tâche est trop vague pour orienter l'IA
0 pt : Champ vide ou hors sujet

C — Contexte (20 pts)
20 pts : Le contexte reprend les éléments clés de la situation (profil patient, enjeu médical ou administratif, raison de la demande)
14 pts : Le contexte est présent mais il manque un élément important
7 pts : Le contexte est minimal ou générique
0 pt : Champ vide

F — Format (20 pts)
20 pts : Le format précise la structure attendue ET la longueur ou le support
14 pts : Le format indique le type de document mais sans précision de structure ou de longueur
7 pts : Le format est vague (ex : "une réponse claire")
0 pt : Champ vide

C — Contraintes (20 pts)
20 pts : Au moins 2 contraintes opérationnelles sont précisées et cohérentes avec le contexte
14 pts : Une seule contrainte pertinente est fournie
7 pts : Les contraintes sont présentes mais trop génériques (ex : "être poli")
0 pt : Champ vide

Tu réponds TOUJOURS en JSON valide, sans markdown, sans backticks.`;

export async function POST(request: NextRequest) {
  try {
    const { prompt, medicalCase, exerciseSheet } = await request.json();

    if (!prompt || !medicalCase) {
      return NextResponse.json(
        { error: 'Prompt et cas médical requis' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API OpenAI non configurée' },
        { status: 500 }
      );
    }

    // Build the exercise reference sheet
    const sheet = exerciseSheet || {};
    const ficheExercice = `FICHE EXERCICE (grille de vérité) :
Profil attendu : ${sheet.profil || medicalCase.category || 'Non précisé'}
Titre : ${sheet.titreCas || medicalCase.title || 'Non précisé'}
Description de la situation : ${sheet.descriptionSituation || medicalCase.description || 'Non précisé'}
Antécédents : ${sheet.antecedents || medicalCase.patientInfo?.history || 'Non précisé'}
Informations clés : ${sheet.informationsCles || 'Non précisé'}
Attendu du prompt : ${sheet.attenduPrompt || 'Non précisé'}
Patient : ${sheet.patientAge ? sheet.patientAge + ' ans' : ''} ${sheet.patientSexe || ''} ${sheet.patientActe ? '— ' + sheet.patientActe : ''}`.trim();

    const evaluationPrompt = `${ficheExercice}

PROMPT SOUMIS PAR L'APPRENANT :
${prompt}

Évalue ce prompt selon la méthode RTCFC. Réponds UNIQUEMENT au format JSON suivant :
{
  "scores": {
    "role": <nombre 0-20>,
    "task": <nombre 0-20>,
    "context": <nombre 0-20>,
    "format": <nombre 0-20>,
    "constraints": <nombre 0-20>,
    "overall": <nombre 0-100 (somme des 5 champs)>
  },
  "result": "<✅ Exercice validé ou ❌ À retravailler>",
  "details": {
    "role": "<1 phrase de feedback>",
    "task": "<1 phrase de feedback>",
    "context": "<1 phrase de feedback>",
    "format": "<1 phrase de feedback>",
    "constraints": "<1 phrase de feedback>"
  },
  "positives": ["<point positif 1>", "<point positif 2>"],
  "improvements": ["<suggestion concrète 1>", "<suggestion concrète 2>"],
  "improvedVersion": "<réécriture des champs les plus faibles, 2-3 lignes max>",
  "feedback": "<résumé global bienveillant en 2-3 phrases>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: RTCFC_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: evaluationPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de l\'évaluation' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Pas de réponse de l\'IA' },
        { status: 500 }
      );
    }

    // Clean the content to extract JSON
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/```\n?/g, '');
    }

    const evaluation = JSON.parse(cleanContent);

    // Normalize: map RTCFC scores to the legacy format for backward compat
    // while also providing the new RTCFC detail
    const normalized = {
      scores: {
        // Legacy fields mapped from RTCFC (each converted to 0-100 scale for display)
        clarity: Math.round((evaluation.scores.role / 20) * 100),
        specificity: Math.round((evaluation.scores.task / 20) * 100),
        context: Math.round((evaluation.scores.context / 20) * 100),
        structure: Math.round((evaluation.scores.format / 20) * 100),
        constraints: Math.round((evaluation.scores.constraints / 20) * 100),
        overall: evaluation.scores.overall,
        // Raw RTCFC scores on /20
        rtcfc: {
          role: evaluation.scores.role,
          task: evaluation.scores.task,
          context: evaluation.scores.context,
          format: evaluation.scores.format,
          constraints: evaluation.scores.constraints,
        }
      },
      result: evaluation.result,
      details: evaluation.details,
      positives: evaluation.positives,
      improvements: evaluation.improvements,
      improvedVersion: evaluation.improvedVersion,
      feedback: evaluation.feedback || '',
      suggestions: evaluation.suggestions || evaluation.improvements || [],
    };

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error in evaluate API:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
