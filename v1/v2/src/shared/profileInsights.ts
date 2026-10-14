import {dimensionLabelsByLang} from '../data/assessment';
const guidance = {
 aiExposure: ['Your responses indicate regular AI use and awareness of its limitations.', 'Build familiarity with AI tools and their limitations.', 'Jawapan anda menunjukkan penggunaan AI secara tetap dan kesedaran tentang batasannya.', 'Kenali alat AI dan batasannya.'],
 aiApplication: ['Your responses indicate practical AI application with result checking or measurable outcomes.', 'Practise using AI safely for everyday work tasks.', 'Jawapan anda menunjukkan aplikasi AI praktikal dengan semakan hasil atau hasil yang boleh diukur.', 'Berlatih menggunakan AI dengan selamat untuk tugasan harian.'],
 criticalJudgement: ['Your responses indicate verification of AI outputs and attention to risks.', 'Learn to verify AI outputs and handle information safely.', 'Jawapan anda menunjukkan pengesahan hasil AI dan perhatian kepada risiko.', 'Belajar mengesahkan hasil AI dan mengendalikan maklumat dengan selamat.'],
 aiProblemSolving: ['Your responses indicate a structured approach to defining and testing AI use cases.', 'Practise defining a work problem and testing a small AI use case.', 'Jawapan anda menunjukkan pendekatan tersusun untuk mentakrif dan menguji kes penggunaan AI.', 'Berlatih mentakrif masalah kerja dan menguji kes penggunaan AI kecil.'],
 growthAspiration: ['Your responses indicate an ambition to deliver AI value or support wider adoption.', 'Set a practical AI learning goal and identify the support you need.', 'Jawapan anda menunjukkan aspirasi untuk menghasilkan nilai AI atau menyokong penggunaan yang lebih luas.', 'Tetapkan matlamat pembelajaran AI praktikal dan kenal pasti sokongan yang diperlukan.'],
} as const;
// Only governed assessment dimensions determine placement; generated prose cannot override it.
export function profileInsights(dimensions: Record<string,number>, lang: 'EN'|'BM') {
 const strengths: {key:string;label:string;text:string}[]=[]; const growth: typeof strengths=[];
 for (const key of Object.keys(guidance) as (keyof typeof guidance)[]) {
  const score=dimensions[key];
  if (![25,50,75,100].includes(score)) continue;
  const strong=score>=75;
  const text=guidance[key][(lang==='BM'?2:0)+(strong?0:1)];
  (strong?strengths:growth).push({key,label:dimensionLabelsByLang[lang][key],text});
 }
 return {strengths,growth};
}
