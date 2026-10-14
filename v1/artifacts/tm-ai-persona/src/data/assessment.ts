export type AssessmentDimension =
  | 'cognitiveReadiness'
  | 'behavioralAdoption'
  | 'skillsCapability'
  | 'orgEnvironmentalExposure'
  | 'emotionalDisposition'
  | 'economicVulnerability';

export type AssessmentOption = {
  id: string;
  text: string;
  score: number;
};

export type AssessmentQuestion = {
  id: string;
  section: number;
  dimension: AssessmentDimension;
  text: string;
  options: AssessmentOption[];
};

export type AssessmentAnswer = {
  questionId: string;
  questionText: string;
  dimension: AssessmentDimension;
  selectedOption: string;
  selectedText: string;
  score: number;
};

export const ASSESSMENT_VERSION = '2026-01';

export const dimensionLabels: Record<AssessmentDimension, string> = {
  cognitiveReadiness: 'Cognitive Readiness',
  behavioralAdoption: 'Behavioral Adoption',
  skillsCapability: 'Skills Capability',
  orgEnvironmentalExposure: 'Organisational / Environmental Exposure',
  emotionalDisposition: 'Emotional Disposition',
  economicVulnerability: 'Economic Vulnerability',
};

export const dimensionLabelsByLang = {
  EN: dimensionLabels,
  BM: {
    cognitiveReadiness: 'Kesediaan Kognitif',
    behavioralAdoption: 'Penggunaan Tingkah Laku',
    skillsCapability: 'Keupayaan Kemahiran',
    orgEnvironmentalExposure: 'Organisasi / Persekitaran',
    emotionalDisposition: 'Kecenderungan Emosi',
    economicVulnerability: 'Kerentanan Ekonomi',
  },
} satisfies Record<'EN' | 'BM', Record<AssessmentDimension, string>>;

export const departmentOptions = [
  'IT Strategy and Orchestration',
  'Network Engineering',
  'Cloud and Infrastructure',
  'IT Operations',
  'Digital and Innovation',
  'Product and Service Development',
  'Data and Analytics',
  'Cybersecurity and Security Operations',
  'Customer Experience',
  'Corporate Strategy',
  'Finance',
  'Human Resources and Learning',
  'AI Governance and Risk',
  'Other / Not Listed',
] as const;

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 'cognitive-01',
    section: 1,
    dimension: 'cognitiveReadiness',
    text: 'An AI coding assistant outputs a function that runs but looks suspicious. The right understanding:',
    options: [
      { id: 'A', text: 'Never trust any AI code', score: 2 },
      { id: 'B', text: 'It may contain subtle bugs or insecure patterns needing review', score: 4 },
      { id: 'C', text: "If it runs, it's correct", score: 1 },
      { id: 'D', text: 'AI code is always optimal', score: 1 },
    ],
  },
  {
    id: 'cognitive-02',
    section: 1,
    dimension: 'cognitiveReadiness',
    text: "A teammate says 'LLMs reason like a CPU executes logic.' Accurate view:",
    options: [
      { id: 'A', text: 'They run on formal proofs', score: 1 },
      { id: 'B', text: 'Correct', score: 1 },
      { id: 'C', text: 'They memorise all code', score: 1 },
      { id: 'D', text: 'They predict tokens probabilistically, not deterministic logic', score: 4 },
    ],
  },
  {
    id: 'cognitive-03',
    section: 1,
    dimension: 'cognitiveReadiness',
    text: "How do you understand model 'hallucination' technically?",
    options: [
      { id: 'A', text: 'Random crashes', score: 1 },
      { id: 'B', text: 'Confident generation of plausible but incorrect output', score: 4 },
      { id: 'C', text: 'Network errors', score: 1 },
      { id: 'D', text: 'Memory leaks', score: 1 },
    ],
  },
  {
    id: 'cognitive-04',
    section: 1,
    dimension: 'cognitiveReadiness',
    text: 'Evaluating an AI model/API for production, you prioritise:',
    options: [
      { id: 'A', text: 'Accuracy, latency, cost, security, and data governance', score: 4 },
      { id: 'B', text: 'Newest release', score: 1 },
      { id: 'C', text: 'Most parameters', score: 1 },
      { id: 'D', text: 'Hype', score: 1 },
    ],
  },
  {
    id: 'behavior-01',
    section: 2,
    dimension: 'behavioralAdoption',
    text: 'How often do you use AI in your development workflow?',
    options: [
      { id: 'A', text: 'Regularly for set tasks', score: 3 },
      { id: 'B', text: 'Daily and deeply integrated', score: 4 },
      { id: 'C', text: 'Rarely', score: 2 },
      { id: 'D', text: 'Never', score: 1 },
    ],
  },
  {
    id: 'behavior-02',
    section: 2,
    dimension: 'behavioralAdoption',
    text: 'When a new AI development tool or model launches, you:',
    options: [
      { id: 'A', text: 'Benchmark and integrate where it adds value', score: 4 },
      { id: 'B', text: 'Test it on a project', score: 3 },
      { id: 'C', text: 'Ignore it', score: 1 },
      { id: 'D', text: 'Wait for adoption', score: 2 },
    ],
  },
  {
    id: 'behavior-03',
    section: 2,
    dimension: 'behavioralAdoption',
    text: 'How do you use AI in building solutions?',
    options: [
      { id: 'A', text: 'Architecting AI-assisted systems end-to-end', score: 4 },
      { id: 'B', text: 'Only autocomplete', score: 2 },
      { id: 'C', text: "I don't", score: 1 },
      { id: 'D', text: 'Code, tests, docs with review', score: 3 },
    ],
  },
  {
    id: 'behavior-04',
    section: 2,
    dimension: 'behavioralAdoption',
    text: 'When AI-generated code fails review, you:',
    options: [
      { id: 'A', text: 'Stop using AI', score: 1 },
      { id: 'B', text: 'Rewrite manually', score: 2 },
      { id: 'C', text: 'Ship it anyway', score: 1 },
      { id: 'D', text: 'Refine prompts, review, and test rigorously', score: 4 },
    ],
  },
  {
    id: 'skills-01',
    section: 3,
    dimension: 'skillsCapability',
    text: 'Which prompt best produces a usable function?',
    options: [
      { id: 'A', text: 'Write a Python function', score: 2 },
      { id: 'B', text: 'Write a Python function to validate emails', score: 3 },
      { id: 'C', text: 'Write code', score: 1 },
      { id: 'D', text: 'Write a tested Python function to validate emails per RFC 5322, with edge cases and error handling', score: 4 },
    ],
  },
  {
    id: 'skills-02',
    section: 3,
    dimension: 'skillsCapability',
    text: 'Your ability to build with AI (APIs, prompts, pipelines, agents) is:',
    options: [
      { id: 'A', text: 'Competent integration', score: 3 },
      { id: 'B', text: 'Advanced - I design AI systems', score: 4 },
      { id: 'C', text: 'None', score: 1 },
      { id: 'D', text: 'Basic scripting', score: 2 },
    ],
  },
  {
    id: 'skills-03',
    section: 3,
    dimension: 'skillsCapability',
    text: 'You want AI to help debug a problem in your codebase. The most skilled approach is:',
    options: [
      { id: 'A', text: 'Provide the error, relevant code, and environment, ask for ranked hypotheses, then verify each with tests', score: 4 },
      { id: 'B', text: 'Describe the issue, share context, and ask for likely causes to test', score: 3 },
      { id: 'C', text: "Paste code and ask 'fix it'", score: 2 },
      { id: 'D', text: 'Ask what the error might mean', score: 1 },
    ],
  },
  {
    id: 'skills-04',
    section: 3,
    dimension: 'skillsCapability',
    text: 'Can you direct AI through complex, multi-stage technical tasks?',
    options: [
      { id: 'A', text: 'No', score: 1 },
      { id: 'B', text: 'Simple tasks only', score: 2 },
      { id: 'C', text: 'Yes, confidently and securely', score: 4 },
      { id: 'D', text: 'Yes, with iteration', score: 3 },
    ],
  },
  {
    id: 'environment-01',
    section: 4,
    dimension: 'orgEnvironmentalExposure',
    text: 'Does your organisation provide AI platforms, governance, and time to innovate?',
    options: [
      { id: 'A', text: 'None', score: 1 },
      { id: 'B', text: 'Strong platforms and governance', score: 4 },
      { id: 'C', text: 'Limited', score: 2 },
      { id: 'D', text: 'Some support', score: 3 },
    ],
  },
  {
    id: 'environment-02',
    section: 4,
    dimension: 'orgEnvironmentalExposure',
    text: 'How does your tech team treat AI adoption?',
    options: [
      { id: 'A', text: 'Actively pioneering', score: 4 },
      { id: 'B', text: 'Open', score: 3 },
      { id: 'C', text: 'Resistant', score: 1 },
      { id: 'D', text: 'Indifferent', score: 2 },
    ],
  },
  {
    id: 'environment-03',
    section: 4,
    dimension: 'orgEnvironmentalExposure',
    text: 'What AI tooling do you have access to?',
    options: [
      { id: 'A', text: 'Standard licensed tools', score: 3 },
      { id: 'B', text: 'None', score: 1 },
      { id: 'C', text: 'Enterprise AI stack with support', score: 4 },
      { id: 'D', text: 'Free tools only', score: 2 },
    ],
  },
  {
    id: 'emotion-01',
    section: 5,
    dimension: 'emotionalDisposition',
    text: 'Thinking about AI changing software work, you feel:',
    options: [
      { id: 'A', text: 'Curious', score: 3 },
      { id: 'B', text: 'Excited to lead', score: 4 },
      { id: 'C', text: 'Threatened', score: 1 },
      { id: 'D', text: 'Anxious', score: 2 },
    ],
  },
  {
    id: 'emotion-02',
    section: 5,
    dimension: 'emotionalDisposition',
    text: "Asked to adopt an unfamiliar AI stack, you'd be:",
    options: [
      { id: 'A', text: 'Hesitant', score: 2 },
      { id: 'B', text: 'Reluctant', score: 1 },
      { id: 'C', text: 'Eager', score: 4 },
      { id: 'D', text: 'Willing', score: 3 },
    ],
  },
  {
    id: 'emotion-03',
    section: 5,
    dimension: 'emotionalDisposition',
    text: 'When AI automates coding tasks you used to do, you feel:',
    options: [
      { id: 'A', text: 'Open to higher-level work', score: 3 },
      { id: 'B', text: 'Confident moving to architecture/strategy', score: 4 },
      { id: 'C', text: 'Uneasy', score: 2 },
      { id: 'D', text: 'Fearful', score: 1 },
    ],
  },
  {
    id: 'economic-01',
    section: 6,
    dimension: 'economicVulnerability',
    text: 'How aware are you that AI is reshaping tech roles?',
    options: [
      { id: 'A', text: 'Vaguely', score: 2 },
      { id: 'B', text: 'Very aware and adapting', score: 4 },
      { id: 'C', text: 'Not aware', score: 1 },
      { id: 'D', text: 'Aware and preparing', score: 3 },
    ],
  },
  {
    id: 'economic-02',
    section: 6,
    dimension: 'economicVulnerability',
    text: 'To stay ahead as AI advances in tech, you are:',
    options: [
      { id: 'A', text: 'Learning some skills', score: 3 },
      { id: 'B', text: 'Doing nothing', score: 1 },
      { id: 'C', text: 'Waiting', score: 2 },
      { id: 'D', text: 'Continuously mastering AI-era engineering', score: 4 },
    ],
  },
];

const bmQuestionText: Record<string, string> = {
  'cognitive-01': 'Pembantu pengekodan AI menghasilkan fungsi yang boleh dijalankan tetapi kelihatan mencurigakan. Kefahaman yang betul ialah:',
  'cognitive-02': 'Rakan sepasukan berkata “LLM menaakul seperti CPU melaksanakan logik.” Pandangan yang tepat ialah:',
  'cognitive-03': 'Bagaimanakah anda memahami halusinasi model dari sudut teknikal?',
  'cognitive-04': 'Apabila menilai model/API AI untuk pengeluaran, anda mengutamakan:',
  'behavior-01': 'Berapa kerap anda menggunakan AI dalam aliran kerja pembangunan anda?',
  'behavior-02': 'Apabila alat pembangunan atau model AI baharu dilancarkan, anda:',
  'behavior-03': 'Bagaimanakah anda menggunakan AI untuk membina penyelesaian?',
  'behavior-04': 'Apabila kod yang dijana AI gagal dalam semakan, anda:',
  'skills-01': 'Arahan manakah yang paling baik menghasilkan fungsi yang boleh digunakan?',
  'skills-02': 'Keupayaan anda membina dengan AI (API, prompt, saluran paip, ejen) adalah:',
  'skills-03': 'Anda mahu AI membantu menyahpepijat masalah dalam pangkalan kod. Pendekatan paling mahir ialah:',
  'skills-04': 'Bolehkah anda mengarahkan AI melalui tugasan teknikal yang kompleks dan berperingkat?',
  'environment-01': 'Adakah organisasi anda menyediakan platform AI, tadbir urus dan masa untuk berinovasi?',
  'environment-02': 'Bagaimanakah pasukan teknologi anda menerima penggunaan AI?',
  'environment-03': 'Apakah alat AI yang boleh anda akses?',
  'emotion-01': 'Apabila memikirkan AI mengubah kerja perisian, anda berasa:',
  'emotion-02': 'Jika diminta menggunakan susunan AI yang tidak biasa, anda akan berasa:',
  'emotion-03': 'Apabila AI mengautomatikkan tugasan pengekodan yang dahulu anda lakukan, anda berasa:',
  'economic-01': 'Sejauh manakah anda sedar bahawa AI sedang mengubah peranan teknologi?',
  'economic-02': 'Untuk kekal ke hadapan apabila AI berkembang dalam teknologi, anda:',
};

const bmOptionText: Record<string, Record<string, string>> = {
  'cognitive-01': { A: 'Jangan percaya sebarang kod AI', B: 'Ia mungkin mengandungi pepijat halus atau corak tidak selamat yang memerlukan semakan', C: 'Jika ia boleh dijalankan, ia betul', D: 'Kod AI sentiasa optimum' },
  'cognitive-02': { A: 'Ia beroperasi berdasarkan bukti formal', B: 'Betul', C: 'Ia menghafal semua kod', D: 'Ia meramal token secara kebarangkalian, bukan logik deterministik' },
  'cognitive-03': { A: 'Kerosakan rawak', B: 'Penghasilan output yang munasabah tetapi salah dengan yakin', C: 'Ralat rangkaian', D: 'Kebocoran memori' },
  'cognitive-04': { A: 'Ketepatan, kependaman, kos, keselamatan dan tadbir urus data', B: 'Keluaran paling baharu', C: 'Parameter paling banyak', D: 'Gembar-gembur' },
  'behavior-01': { A: 'Secara berkala untuk tugasan tertentu', B: 'Setiap hari dan terintegrasi secara mendalam', C: 'Jarang', D: 'Tidak pernah' },
  'behavior-02': { A: 'Menanda aras dan mengintegrasikannya apabila memberi nilai', B: 'Mengujinya pada satu projek', C: 'Mengabaikannya', D: 'Menunggu sehingga diterima umum' },
  'behavior-03': { A: 'Mereka bentuk sistem berbantukan AI dari hujung ke hujung', B: 'Autocomplete sahaja', C: 'Saya tidak menggunakannya', D: 'Kod, ujian dan dokumentasi dengan semakan' },
  'behavior-04': { A: 'Berhenti menggunakan AI', B: 'Menulis semula secara manual', C: 'Menghantarnya juga', D: 'Memperhalus prompt, menyemak dan menguji dengan teliti' },
  'skills-01': { A: 'Tulis fungsi Python', B: 'Tulis fungsi Python untuk mengesahkan e-mel', C: 'Tulis kod', D: 'Tulis fungsi Python yang diuji untuk mengesahkan e-mel mengikut RFC 5322, termasuk kes tepi dan pengendalian ralat' },
  'skills-02': { A: 'Integrasi yang kompeten', B: 'Lanjutan - saya mereka bentuk sistem AI', C: 'Tiada', D: 'Penskripan asas' },
  'skills-03': { A: 'Berikan ralat, kod berkaitan dan persekitaran, minta hipotesis berperingkat, kemudian sahkan setiap satu dengan ujian', B: 'Terangkan isu, kongsi konteks dan minta punca yang boleh diuji', C: 'Tampal kod dan minta “baikinya”', D: 'Tanya apakah maksud ralat itu' },
  'skills-04': { A: 'Tidak', B: 'Tugasan mudah sahaja', C: 'Ya, dengan yakin dan selamat', D: 'Ya, dengan iterasi' },
  'environment-01': { A: 'Tiada', B: 'Platform dan tadbir urus yang kukuh', C: 'Terhad', D: 'Sedikit sokongan' },
  'environment-02': { A: 'Menerajui secara aktif', B: 'Terbuka', C: 'Menentang', D: 'Tidak ambil peduli' },
  'environment-03': { A: 'Alat berlesen standard', B: 'Tiada', C: 'Susunan AI perusahaan dengan sokongan', D: 'Alat percuma sahaja' },
  'emotion-01': { A: 'Ingin tahu', B: 'Teruja untuk memimpin', C: 'Terancam', D: 'Cemas' },
  'emotion-02': { A: 'Ragu-ragu', B: 'Keberatan', C: 'Tidak sabar', D: 'Sedia menerima' },
  'emotion-03': { A: 'Terbuka kepada kerja tahap lebih tinggi', B: 'Yakin untuk beralih kepada seni bina/strategi', C: 'Tidak selesa', D: 'Takut' },
  'economic-01': { A: 'Secara samar-samar', B: 'Sangat sedar dan sedang menyesuaikan diri', C: 'Tidak sedar', D: 'Sedar dan sedang bersedia' },
  'economic-02': { A: 'Mempelajari beberapa kemahiran', B: 'Tidak melakukan apa-apa', C: 'Menunggu', D: 'Menguasai kejuruteraan era AI secara berterusan' },
};

export const assessmentQuestionsByLang = {
  EN: assessmentQuestions,
  BM: assessmentQuestions.map((question) => ({
    ...question,
    text: bmQuestionText[question.id],
    options: question.options.map((option) => ({
      ...option,
      text: bmOptionText[question.id][option.id],
    })),
  })),
} satisfies Record<'EN' | 'BM', AssessmentQuestion[]>;

export const dimensionOrder: AssessmentDimension[] = [
  'cognitiveReadiness',
  'behavioralAdoption',
  'skillsCapability',
  'orgEnvironmentalExposure',
  'emotionalDisposition',
  'economicVulnerability',
];