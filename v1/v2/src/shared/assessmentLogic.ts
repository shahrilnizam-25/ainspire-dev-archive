import { assessmentQuestionsByLang, type AssessmentAnswer } from '../data/assessment';
export type ReflectionCategory = 'Capability' | 'Contribution' | 'Growth';
export type AdaptiveDecision = { required: boolean; category: ReflectionCategory | null; reason: string; prompt: { EN: string; BM: string } | null };
export type ReflectionEvidence = { category: ReflectionCategory; text: string };
export const REFLECTION_PROMPTS = {
 Capability: { EN: 'Describe one recent task where you used AI. What did you do yourself, and how did you check whether the result was reliable?', BM: 'Huraikan satu tugasan terkini yang menggunakan AI. Apakah yang anda lakukan sendiri, dan bagaimanakah anda menyemak kebolehpercayaan hasilnya?' },
 Contribution: { EN: 'In an AI project, what would you personally take responsibility for? Give one example of the outcome you would help deliver.', BM: 'Dalam projek AI, apakah tanggungjawab yang akan anda pegang sendiri? Berikan satu contoh hasil yang akan anda bantu capai.' },
 Growth: { EN: 'What is one AI outcome you want to achieve in the next three months, and what support or learning would help you get there?', BM: 'Apakah satu hasil AI yang ingin anda capai dalam tiga bulan akan datang, dan apakah sokongan atau pembelajaran yang diperlukan?' },
} as const;
export function adaptiveDecision(answers: AssessmentAnswer[]): AdaptiveDecision {
 const v = Object.fromEntries(answers.map(a => [a.dimension, a.score]));
 const style = answers.find(a => a.dimension === 'aiContributionStyle')?.selectedOption;
 let category: ReflectionCategory | null = null; let reason = 'Structured evidence is sufficiently consistent.';
 if ((style === 'B' && v.aiApplication <= 2 && v.aiProblemSolving <= 2) || (v.aiApplication >= 3 && v.criticalJudgement === 1) || Math.abs(v.aiApplication - v.aiProblemSolving) >= 3 || (v.aiExposure === 1 && v.aiApplication >= 3)) { category = 'Capability'; reason = 'Practical application and capability evidence need reconciliation.'; }
 else if (((style === 'C' || style === 'D') && v.aiExposure <= 2 && v.aiApplication <= 2 && v.aiProblemSolving >= 3 && v.criticalJudgement >= 3) || (style === 'D' && v.aiProblemSolving === 1 && v.growthAspiration <= 2)) { category = 'Contribution'; reason = 'Preferred contribution and demonstrated experience need clarification.'; }
 else if (v.growthAspiration === 4 && v.aiApplication === 1 && v.aiProblemSolving <= 2) { category = 'Growth'; reason = 'The growth ambition needs a practical bridge from current experience.'; }
 return { required: category !== null, category, reason, prompt: category ? REFLECTION_PROMPTS[category] : null };
}
export const CONTRIBUTION_LABELS = { EN: { A: 'AI adopter', B: 'Solution builder', C: 'Business Problem Owner', D: 'Adoption champion' }, BM: { A: 'Pengguna AI', B: 'Pembina penyelesaian', C: 'Pemilik Masalah Perniagaan', D: 'Peneraju penggunaan' } };
export function calculateReadinessScores(answers: AssessmentAnswer[]) {
 const scored = answers.filter(a => a.dimension !== 'aiContributionStyle');
 const dimensionScores = Object.fromEntries(scored.map(a => [a.dimension, a.score * 25]));
 const overallReadiness = Math.round(scored.reduce((s, a) => s + a.score, 0) / (scored.length * 4) * 100);
 const v = Object.fromEntries(scored.map(a => [a.dimension, a.score]));
 const contributionStyle = answers.find(a => a.dimension === 'aiContributionStyle')?.selectedOption ?? 'A';
 const practicalCapability = (v.aiApplication + v.aiProblemSolving) / 2;
 let persona: 'explorer' | 'builder' | 'strategist' | 'visionary' = 'explorer';
 if (contributionStyle === 'B' && practicalCapability >= 2.5) persona = 'builder';
 else if (contributionStyle === 'C' && v.aiProblemSolving >= 3 && v.criticalJudgement >= 3) persona = 'strategist';
 else if (contributionStyle === 'D' && v.aiProblemSolving >= 3 && v.criticalJudgement >= 3 && v.aiApplication >= 3) persona = 'visionary';
 else if (practicalCapability >= 3 && v.criticalJudgement >= 3) persona = contributionStyle === 'C' || contributionStyle === 'D' ? 'strategist' : 'builder';
 return { overallReadiness, dimensionScores, persona, contributionStyle, practicalCapability, personaScores: {} };
}
// Reconstruct all evidence from the governed question bank; never trust client scores or text.
export function validateAnswers(input: unknown, lang: 'EN' | 'BM'): AssessmentAnswer[] {
 if (!Array.isArray(input) || input.length !== 6) throw new Error('Exactly 6 structured answers are required.');
 const bank = assessmentQuestionsByLang[lang]; const used = new Set<string>();
 const answers = input.map(raw => {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid assessment answer.');
  const q = bank.find(q => q.id === raw.questionId);
  if (!q || used.has(q.id)) throw new Error('Each structured question must be answered exactly once.');
  const opt = q.options.find(o => o.id === raw.selectedOption);
  if (!opt) throw new Error('Invalid answer option.');
  used.add(q.id); return { questionId: q.id, questionText: q.text, dimension: q.dimension, selectedOption: opt.id, selectedText: opt.text, score: opt.score };
 });
 return bank.map(q => answers.find(a => a.questionId === q.id)!);
}
