"use client";
import '../app/globals.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScreenDestination from './components/ScreenDestination';
import PoweredByFooter from './components/PoweredByFooter';
import ViewNavigation from './components/ViewNavigation';
import LandingScreen from './components/LandingScreen';
import QuestionScreen from './components/QuestionScreen';
import DepartmentScreen from './components/DepartmentScreen';
import AdaptiveReflectionScreen from './components/AdaptiveReflectionScreen';
import { saveAssessmentAnswer } from './shared/assessmentNavigation';
import { adaptiveDecision, calculateReadinessScores, type ReflectionEvidence } from './shared/assessmentLogic';
import PledgeScreen from './components/PledgeScreen';
import AIThinkingScreen from './components/AIThinkingScreen';
import ResultsScreen from './components/ResultsScreen';
import ReportScreen from './components/ReportScreen';
import ContactScreen from './components/ContactScreen';
import StatisticsScreen from './components/StatisticsScreen';
import { useDemoSession } from './shared/demoSession';
import { createNotificationEventId, sendEmployeeNotification } from './shared/notifications';
import { primaryContributionRole } from './shared/contributionRoles';
import { type Lang } from './i18n';
import {
  ASSESSMENT_VERSION,
  assessmentQuestionsByLang,
  type AssessmentAnswer,
  type AssessmentOption,
} from './data/assessment';

type Screen = 'landing' | 'department' | 'assessment' | 'adaptive-reflection' | 'pledge' | 'ai-loading' | 'results' | 'contact' | 'statistics' | 'report';

export type MCQAnswer = {
  questionId: string;
  questionText: string;
  selectedOption: string;
  selectedText: string;
  dimension: string;
  score: number;
};

export type AIResult = {
  employeeName?: string;
  persona: string;
  engine?: string;
  modelProviderTrace?: {gigx: 'not-configured'|'standby'|'responded'|'failed'; apiGate: 'not-configured'|'standby'|'responded'|'failed'};
  reflectionEvidence?: {category: string; text: string} | null;
  contributionLabel?: string;
  learningVideoSource?: string;
  learningVideoStatus?: string | null;
  adaptiveReflection?: {required: boolean; category: string | null; provided: boolean; reviewRequired: boolean};
  confidence: number | null;
  confidenceLabel?: string;
  confidenceReason?: string;
  department?: string;
  role?: string;
  contributionStyle?: string;
  reasoning: string;
  narrative: string;
  recommendations: Array<{
    title: string;
    description: string;
    videoTitle?: string;
    relevanceStatement?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    channelTitle?: string;
    duration?: string;
    videoSource?: string;
    searchUrl?: string;
    searchQuery?: string;
    searchStatus?: string;
  }>;
  overallReadiness?: number;
  dimensionScores?: Record<string, number>;
  personaScores?: Record<string, number>;
  strengths?: string[];
  developmentGaps?: string[];
  projectFit?: string[];
  resourceAssignmentSignals?: string[];
};

// Payload shape sent to /api/classify
type StoredAnswer = AssessmentAnswer[];

const LANGS: Lang[] = ['EN', 'BM'];

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing');
  const [lang, setLang] = useState<Lang>('EN');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<AssessmentAnswer[]>([]);

  // Per-language result cache: once fetched for a language it never re-fetches
  const [aiResultCache, setAiResultCache] = useState<Partial<Record<Lang, AIResult>>>({});
  // The canonical persona ID (set once from first successful result, unchanged by lang switch)
  const [classifiedPersonaId, setClassifiedPersonaId] = useState<string | null>(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isReClassifying, setIsReClassifying] = useState(false);
  // Stored answers so we can re-call the API when language changes
  const [lastAnswers, setLastAnswers] = useState<StoredAnswer | null>(null);
  const [reflection, setReflection] = useState<ReflectionEvidence | null>(null);
  const [employeeName, setEmployeeName] = useState('');
  const [userRole, setUserRole] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const demoProfile = useDemoSession().profile;
  const assessmentNotificationId = useRef<string | null>(null);

  // Track which lang is currently in-flight to avoid duplicate requests
  const fetchingForLang = useRef<Lang | null>(null);

  // Derived: result for the currently selected language
  const [resultEntry,setResultEntry]=useState<number|null>(null);
  const aiResult = aiResultCache[lang] ?? null;

  // Restore the last POC assessment so Employee → HR → Employee remains a complete journey.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ainspire-last-assessment-v1') ?? 'null');
      if (saved?.version !== ASSESSMENT_VERSION || !Array.isArray(saved.answers) || saved.answers.length !== 6 || !['explorer','builder','strategist','visionary'].includes(saved.persona)) return;
      if (!saved.cache?.EN && !saved.cache?.BM) return;
      setAiResultCache(saved.cache); setClassifiedPersonaId(saved.persona); setLastAnswers(saved.answers);
      setReflection(saved.reflection ?? null); setDepartment(saved.department ?? ''); setUserRole(saved.role ?? ''); setEmployeeName(saved.employeeName ?? '');
      setLang(saved.lang === 'BM' ? 'BM' : 'EN');
    } catch { /* A fresh assessment remains available if browser storage is blocked. */ }
  }, []);
  useEffect(() => {
    if ((screen !== 'results' && screen !== 'report') || !aiResult || !lastAnswers) return;
    try {localStorage.setItem('ainspire-last-assessment-v1', JSON.stringify({version:ASSESSMENT_VERSION,cache:aiResultCache,persona:classifiedPersonaId,answers:lastAnswers,reflection,department,role:userRole,employeeName,lang}));} catch { /* POC can continue in the current session. */ }
  }, [screen, aiResult, aiResultCache, classifiedPersonaId, lastAnswers, reflection, department, userRole, employeeName, lang]);

  // Active language-specific data
  const questions = assessmentQuestionsByLang[lang];

  // Shared classify helper
  const runClassify = useCallback(async (answers: StoredAnswer, targetLang: Lang, referenceResult?: AIResult): Promise<AIResult> => {
    const res = await fetch(`${''}/api/classify`, {
      signal: AbortSignal.timeout(40000),
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentVersion: ASSESSMENT_VERSION,
        department,
        role: userRole,
        answers,
        lang: targetLang,
        referenceResult,
        reflection,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return {...await res.json(), employeeName} as AIResult;
  }, [department, userRole, reflection, employeeName]);

  // Re-classify whenever language changes on results/report screens
  useEffect(() => {
    if (screen !== 'results' && screen !== 'report') return;
    if (!lastAnswers) return;

    // Cache hit — stop any pending spinner immediately and do nothing else
    if (aiResultCache[lang]) {
      setIsReClassifying(false);
      return;
    }

    // Another effect cycle is already fetching this language — wait for it
    if (fetchingForLang.current === lang) return;

    let cancelled = false;
    const controller = new AbortController();
    // 45-second hard timeout so the spinner never hangs indefinitely
    const timeoutId = setTimeout(() => controller.abort(), 45_000);

    fetchingForLang.current = lang;
    setIsReClassifying(true);

    runClassify(lastAnswers, lang)
      .then((data) => {
        if (!cancelled) {
          setAiResultCache((prev) => ({ ...prev, [lang]: data }));
        }
      })
      .catch((err) => {
        if (!cancelled) console.error('Re-classification error:', err);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        fetchingForLang.current = null;
        if (!cancelled) setIsReClassifying(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
      // If we cancel mid-flight (e.g. user switches lang again), clear the spinner
      // so the next effect run can reset it cleanly via the cache-hit branch above.
      setIsReClassifying(false);
    };
  // aiResultCache intentionally omitted — we check it at call time, not as a dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, screen, lastAnswers, runClassify]);

  const handleStart = () => {
    assessmentNotificationId.current = createNotificationEventId();
    setNotificationStatus(null);
    setResultEntry(null);
    setReflection(null);
    setScreen('department');
    setCurrentQuestionIdx(0);
    setMcqAnswers([]);
    setAiResultCache({});
    setClassifiedPersonaId(null);
    setLastAnswers(null);
    setAiError(null);
    setIsReClassifying(false);
    setEmployeeName('');
    setDepartment('');
    setUserRole('');
  };

  const handleDepartmentSubmit = (selectedDepartment: string, role: string, name = '') => {
    setEmployeeName(name);
    setDepartment(selectedDepartment);
    setUserRole(role);
    setCurrentQuestionIdx(0);
    setScreen('assessment');
  };

  const handleAnswer = (option: AssessmentOption) => {
    const question = questions[currentQuestionIdx];
    const answer: AssessmentAnswer = {
      questionId: question.id,
      questionText: question.text,
      dimension: question.dimension,
      selectedOption: option.id,
      selectedText: option.text,
      score: option.score,
    };
    const nextAnswers = saveAssessmentAnswer(questions, mcqAnswers, answer);
    setMcqAnswers(nextAnswers);
    setReflection(null);
    if (currentQuestionIdx < questions.length - 1) setCurrentQuestionIdx(i => i + 1);
    else if (nextAnswers.length === questions.length) setScreen(adaptiveDecision(nextAnswers).required ? 'adaptive-reflection' : 'pledge');
  };

  const finishAnalysis = useCallback(() => {
    setScreen(current => current === 'ai-loading' ? 'results' : current);
  }, []);

  const handleSubmit = async () => {
    setAnalysisReady(false);
    setAiError(null);
    setScreen('ai-loading');
    const answers: StoredAnswer = mcqAnswers;

    // Persist answers so language switches can re-use them
    setLastAnswers(answers);

    try {
      const nextCache: Partial<Record<Lang, AIResult>> = {};
      const bilingual = await Promise.allSettled([runClassify(answers, 'EN'), runClassify(answers, 'BM')]);
      bilingual.forEach((result, index) => {
        if (result.status === 'fulfilled') nextCache[index === 0 ? 'EN' : 'BM'] = result.value;
      });

      const selectedResult = nextCache[lang] ?? nextCache.EN ?? nextCache.BM;
      if (!selectedResult) throw new Error('AI classification failed for both languages');

      setAiResultCache(nextCache);
      setClassifiedPersonaId(selectedResult.persona);
      const eventId = assessmentNotificationId.current;
      assessmentNotificationId.current = null;
      if (eventId) {
        setNotificationStatus(lang === 'BM' ? 'Menghantar keputusan melalui e-mel…' : 'Sending your results by email…');
        void sendEmployeeNotification({
          eventId,
          eventType: 'assessment.results_ready',
          lang,
          employeeName,
          persona: selectedResult.persona,
          contributionRole: primaryContributionRole(selectedResult.persona).name[lang],
          overallReadiness: selectedResult.overallReadiness,
          dimensionScores: selectedResult.dimensionScores,
          narrative: selectedResult.narrative,
          strengths: selectedResult.strengths,
          developmentGaps: selectedResult.developmentGaps,
          learningResources: selectedResult.recommendations.slice(0, 5).map(resource => ({
            title: resource.videoTitle ?? resource.title,
            url: resource.videoUrl ?? resource.searchUrl,
          })),
        }).then(({ ok }) => setNotificationStatus(ok
          ? (lang === 'BM' ? 'Keputusan telah dihantar kepada penerima yang ditetapkan.' : 'Results email was accepted for delivery to the configured recipients.')
          : (lang === 'BM' ? 'E-mel tidak dapat dihantar. Keputusan anda masih tersedia di portal.' : 'Email could not be sent. Your results remain available in the portal.')));
      }
    } catch (err) {
      console.error('Classification error:', err);
      setAiError(String(err));
    } finally {
      setAnalysisReady(true);
    }
  };

  // Rule-based fallback persona for compatibility with the existing report UI.
  const getFallbackPersona = (): string => {
    return mcqAnswers.length === 6 ? calculateReadinessScores(mcqAnswers).persona : 'explorer';
  };

  // Persona ID is fixed from the first successful classification; never changes on lang switch
  const resultPersonaId = classifiedPersonaId ?? getFallbackPersona();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground relative flex flex-col font-sans overflow-x-hidden">
      {screen === 'landing' ? (
        <div aria-hidden="true" className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030712]">
          <img src="/hero-3d-v6.webp" alt="" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(3,7,18,0.78) 0%, rgba(3,7,18,0.52) 24%, rgba(3,7,18,0.12) 50%, rgba(3,7,18,0.35) 72%, rgba(3,7,18,0.78) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(3,7,18,0.28), transparent 22%, transparent 78%, rgba(3,7,18,0.28))' }} />
        </div>
      ) : (
        <>
          <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-30" />
          <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
          <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background opacity-50" />
        </>
      )}

      <div className="relative z-40 px-4 pt-16 pb-3 sm:pt-4"><ViewNavigation lang={lang} current="employee" /></div>
      {/* ── Global Language Switcher ── */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-1 p-1 rounded-full border border-white/10 bg-black/50 backdrop-blur-md shadow-lg">
        {LANGS.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`relative px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-all duration-200 ${
              lang === l
                ? 'text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {lang === l && (
              <motion.div
                layoutId="global-lang-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{l}</span>
          </button>
        ))}
      </div>

      <main className={"flex-1 relative z-10 flex flex-col items-center w-full py-8 "+(screen==='results'?'justify-start':'justify-center min-h-[100dvh]')}>
        {screen === 'results' && notificationStatus && <p role="status" className="mb-4 max-w-3xl px-4 text-center text-sm text-primary">{notificationStatus}</p>}
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center"
            >
              <ScreenDestination><LandingScreen
                lang={lang}
                onStart={handleStart}
                onContact={() => setScreen('contact')}
                onStatistics={() => setScreen('statistics')}
              /></ScreenDestination>
              {aiResult && <button className="mb-8 rounded-full border border-primary/50 bg-background/80 px-6 py-3 text-sm font-bold text-primary" onClick={() => {setResultEntry(null);setScreen('results');}}>{lang === 'BM' ? 'Sambung perjalanan POC saya' : 'Resume my POC journey'} →</button>}
            </motion.div>
          )}

          {screen === 'department' && (
            <motion.div key="department" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex justify-center">
              <ScreenDestination><DepartmentScreen key={demoProfile?.staff_id ?? 'guest'} lang={lang} initialDepartment={department} initialRole={userRole} initialName={employeeName} directory={demoProfile ? {staffId: demoProfile.staff_id, name: demoProfile.display_name, department: demoProfile.division_name_en, role: demoProfile.business_role} : undefined} onSubmit={handleDepartmentSubmit} /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination key={questions[currentQuestionIdx].id}><QuestionScreen
                key={questions[currentQuestionIdx].id}
                lang={lang}
                question={questions[currentQuestionIdx]}
                currentIndex={currentQuestionIdx}
                totalQuestions={questions.length}
                onAnswer={handleAnswer}
                selectedId={mcqAnswers.find(a => a.questionId === questions[currentQuestionIdx].id)?.selectedOption ?? null}
                onBack={() => currentQuestionIdx > 0 ? setCurrentQuestionIdx(i => i - 1) : setScreen('department')}
              /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'adaptive-reflection' && (
            <ScreenDestination key="adaptive-reflection"><AdaptiveReflectionScreen lang={lang} decision={adaptiveDecision(mcqAnswers)} onContinue={(evidence) => { setReflection(evidence); setScreen('pledge'); }} /></ScreenDestination>
          )}

          {screen === 'pledge' && (
            <motion.div
              key="pledge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination><PledgeScreen
                lang={lang}
                currentIndex={questions.length}
                totalQuestions={questions.length}
                reflectionRequired={adaptiveDecision(mcqAnswers).required}
                reflectionProvided={!!reflection}
                onSubmit={handleSubmit}
              /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'ai-loading' && (
            <motion.div
              key="ai-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination><AIThinkingScreen lang={lang} resultReady={analysisReady} engine={aiResult?.engine} modelProviderTrace={aiResult?.modelProviderTrace} learningVideoSource={aiResult?.learningVideoSource} learningVideoStatus={aiResult?.learningVideoStatus} hasError={!!aiError} onComplete={finishAnalysis} /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination preserveScroll={resultEntry !== null}><ResultsScreen
                initialStep={resultEntry}
                lang={lang}
                resultPersonaId={resultPersonaId}
                aiResult={aiResult}
                aiError={aiError}
                isReClassifying={isReClassifying}
                onRetake={handleStart}
                onReport={() => {setResultEntry(0);setScreen('report');}}
                onMain={() => setScreen('landing')}
              /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination><StatisticsScreen lang={lang} result={aiResult} onProfile={() => {if (!aiResult) {handleStart();return;} setResultEntry(0);setScreen('results');}} onLearning={() => {if (!aiResult) {handleStart();return;} setResultEntry(1);setScreen('results');}} onBack={() => setScreen('landing')} /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination><ContactScreen lang={lang} onBack={() => setScreen('landing')} /></ScreenDestination>
            </motion.div>
          )}

          {screen === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <ScreenDestination><ReportScreen
                lang={lang}
                resultPersonaId={resultPersonaId}
                aiResult={aiResult}
                userRole={userRole}
                isReClassifying={isReClassifying}
                onBack={() => {setResultEntry(0);setScreen('results');}}
              /></ScreenDestination>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {screen!=='landing'&&<PoweredByFooter/>}
    </div>
  );
}
