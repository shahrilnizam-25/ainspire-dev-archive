export type AssessmentDimension = 'aiExposure' | 'aiApplication' | 'criticalJudgement' | 'aiProblemSolving' | 'aiContributionStyle' | 'growthAspiration';
export type AssessmentOption = { id: string; text: string; score: number };
export type AssessmentQuestion = { id: string; section: number; dimension: AssessmentDimension; text: string; options: AssessmentOption[] };
export type AssessmentAnswer = { questionId: string; questionText: string; dimension: AssessmentDimension; selectedOption: string; selectedText: string; score: number };
export const ASSESSMENT_VERSION = '2026-10-rapid-v2';
export const dimensionLabels = { aiExposure: 'AI Exposure', aiApplication: 'AI Application', criticalJudgement: 'Critical Judgement', aiProblemSolving: 'AI Problem Solving', aiContributionStyle: 'Contribution Preference', growthAspiration: 'Growth Aspiration' };
export const dimensionLabelsByLang = { EN: dimensionLabels, BM: { aiExposure: 'Pendedahan AI', aiApplication: 'Aplikasi AI', criticalJudgement: 'Pertimbangan Kritis', aiProblemSolving: 'Penyelesaian Masalah AI', aiContributionStyle: 'Keutamaan Sumbangan', growthAspiration: 'Aspirasi Pembangunan' } };
export const divisionOptions = [
 'unifi','TM One','TM Global','TM Research & Development (TM R&D)',
 'Legal Strategy & Intellectual Property (LSIP)','Business & Innovation Technology (BiTech)',
 'Group Network Technology (GNT)','Group IT & Digital (GITD)','Group Finance (GF)',
 'Group Human Capital Management (GHCM)','Group Information Security (GIS)',
 'Group Procurement (GP)','Group Strategy (GS)','Group Internal Audit (GIA)',
] as const;
// Compatibility alias for persisted assessment field names.
export const departmentOptions = divisionOptions;
const content = [
 ['aiExposure', 'How familiar are you with AI in your work?', 'Sejauh manakah anda biasa dengan AI dalam kerja anda?',
 ['I am aware of AI but have not tried it yet.', 'I have tried AI tools and am learning what they can do.', 'I use AI regularly and understand its limitations.', 'I help others explore AI and evaluate new uses.'],
 ['Saya tahu tentang AI tetapi belum mencubanya.', 'Saya telah mencuba alat AI dan sedang memahami kegunaannya.', 'Saya menggunakan AI secara tetap dan memahami batasannya.', 'Saya membantu orang lain meneroka AI dan menilai kegunaan baharu.']],
 ['aiApplication', 'How do you currently apply AI to your work?', 'Bagaimanakah anda menggunakan AI dalam kerja anda sekarang?',
 ['I have not used AI for a work task yet.', 'I use AI for simple tasks, such as drafting or summarising.', 'I use AI in repeatable workflows and check the results.', 'I implement or lead AI-enabled solutions with measurable outcomes.'],
 ['Saya belum menggunakan AI untuk tugasan kerja.', 'Saya menggunakan AI untuk tugasan mudah seperti draf atau ringkasan.', 'Saya menggunakan AI dalam aliran kerja berulang dan menyemak hasilnya.', 'Saya melaksanakan atau menerajui penyelesaian AI dengan hasil yang boleh diukur.']],
 ['criticalJudgement', 'AI gives you a convincing answer for an important work decision. What do you do?', 'AI memberikan jawapan yang meyakinkan untuk keputusan kerja penting. Apakah tindakan anda?',
 ['Use the answer because it sounds confident.', 'Read it through and correct anything that looks wrong.', 'Verify key claims against reliable sources and protect sensitive data.', 'Test assumptions, assess risks and involve the accountable decision owner.'],
 ['Gunakan jawapan itu kerana ia kedengaran yakin.', 'Baca jawapan dan betulkan perkara yang kelihatan salah.', 'Sahkan fakta utama dengan sumber yang dipercayai dan lindungi data sensitif.', 'Uji andaian, nilai risiko dan libatkan pemilik keputusan yang bertanggungjawab.']],
 ['aiProblemSolving', 'When you see a work problem that AI might help solve, where do you start?', 'Apabila AI mungkin membantu menyelesaikan masalah kerja, di manakah anda bermula?',
 ['I need help identifying a suitable first step.', 'Try an AI tool on a small example.', 'Define the problem, inputs and success measures, then test a solution.', 'Design an end-to-end approach with validation, governance and delivery ownership.'],
 ['Saya memerlukan bantuan untuk mengenal pasti langkah pertama.', 'Cuba alat AI pada contoh kecil.', 'Takrifkan masalah, input dan ukuran kejayaan, kemudian uji penyelesaian.', 'Rancang pendekatan menyeluruh dengan pengesahan, tadbir urus dan pemilik pelaksanaan.']],
 ['aiContributionStyle', 'Where would you most like to contribute to an AI initiative?', 'Di manakah anda paling ingin menyumbang kepada inisiatif AI?',
 ['Explore opportunities and gather insights.', 'Build solutions and automate tasks.', 'Define business use cases and measure value.', 'Support adoption and organisational change.'],
 ['Teroka peluang dan kumpulkan dapatan.', 'Bina penyelesaian dan automasikan tugasan.', 'Takrifkan kes penggunaan perniagaan dan ukur nilai.', 'Sokong penggunaan dan perubahan organisasi.']],
 ['growthAspiration', 'What is your next priority for growing with AI?', 'Apakah keutamaan anda untuk berkembang dengan AI?',
 ['Build confidence and understand the basics.', 'Apply AI safely to a practical work task.', 'Deliver an AI use case with measurable business value.', 'Lead or scale responsible AI adoption across teams.'],
 ['Bina keyakinan dan fahami asas AI.', 'Gunakan AI dengan selamat untuk tugasan kerja praktikal.', 'Laksanakan kes penggunaan AI dengan nilai perniagaan yang boleh diukur.', 'Terajui atau perluaskan penggunaan AI yang bertanggungjawab merentas pasukan.']],
] as const;
function makeQuestions(lang: 'EN' | 'BM'): AssessmentQuestion[] { return content.map((c, i) => ({ id: c[0], section: i + 1, dimension: c[0], text: c[lang === 'EN' ? 1 : 2], options: c[lang === 'EN' ? 3 : 4].map((text, j) => ({ id: 'ABCD'[j], text, score: c[0] === 'aiContributionStyle' ? 0 : j + 1 })) })); }
export const assessmentQuestionsByLang = { EN: makeQuestions('EN'), BM: makeQuestions('BM') };
export const assessmentQuestions = assessmentQuestionsByLang.EN;
