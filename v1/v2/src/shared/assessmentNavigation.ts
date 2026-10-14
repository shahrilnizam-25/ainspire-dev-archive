import type { AssessmentAnswer, AssessmentQuestion } from '../data/assessment';
/** Replace a revised answer, preserving other answers and canonical question order. */
export function saveAssessmentAnswer(questions: AssessmentQuestion[], answers: AssessmentAnswer[], revised: AssessmentAnswer): AssessmentAnswer[] {
  return questions.map(q => q.id === revised.questionId ? revised : answers.find(a => a.questionId === q.id)).filter((a): a is AssessmentAnswer => !!a);
}
