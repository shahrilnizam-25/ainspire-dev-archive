import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import QuestionScreen from './components/QuestionScreen';
import DepartmentScreen from './components/DepartmentScreen';
import PledgeScreen from './components/PledgeScreen';
import AIThinkingScreen from './components/AIThinkingScreen';
import ResultsScreen from './components/ResultsScreen';
import HRDashboard from './components/HRDashboard';
import ReportScreen from './components/ReportScreen';
import StatisticsScreen from './components/StatisticsScreen';
import ContactScreen from './components/ContactScreen';
import { type Lang } from './i18n';
import {
  ASSESSMENT_VERSION,
  assessmentQuestionsByLang,
  type AssessmentAnswer,
  type AssessmentOption,
} from './data/assessment';

type Screen = 'landing' | 'department' | 'assessment' | 'pledge' | 'ai-loading' | 'results' | 'hr-view' | 'statistics' | 'contact' | 'report';

export type MCQAnswer = {
  questionId: string;
  questionText: string;
  selectedOption: string;
  selectedText: string;
  dimension: string;
  score: number;
};

export type AIResult = {
  persona: string;
  confidence: number;
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
  const [aiError, setAiError] = useState<string | null>(null);
  const [isReClassifying, setIsReClassifying] = useState(false);
  // Stored answers so we can re-call the API when language changes
  const [lastAnswers, setLastAnswers] = useState<StoredAnswer | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [clientSessionId, setClientSessionId] = useState(() => crypto.randomUUID());

  // Track which lang is currently in-flight to avoid duplicate requests
  const fetchingForLang = useRef<Lang | null>(null);

  // Derived: result for the currently selected language
  const aiResult = aiResultCache[lang] ?? null;

  // Active language-specific data
  const questions = assessmentQuestionsByLang[lang];

  // Shared classify helper
  const runClassify = useCallback(async (answers: StoredAnswer, targetLang: Lang, referenceResult?: AIResult): Promise<AIResult> => {
    const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessmentVersion: ASSESSMENT_VERSION,
        department,
        role: userRole,
        answers,
        lang: targetLang,
        referenceResult,
        clientSessionId,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<AIResult>;
  }, [department, userRole]);

  const trackEvent = useCallback((eventName: string, eventCategory: string, properties?: Record<string, unknown>) => {
    void fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName,
        eventCategory,
        sessionId: clientSessionId,
        languageCode: lang,
        screenName: screen,
        route: window.location.pathname,
        properties,
      }),
    }).catch(() => undefined);
  }, [clientSessionId, lang, screen]);

  useEffect(() => {
    trackEvent('screen_viewed', 'navigation', { screen });
  }, [screen, trackEvent]);

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

    runClassify(lastAnswers, lang, lang === 'BM' ? aiResultCache.EN : undefined)
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
  }, [aiResultCache, lang, screen, lastAnswers, runClassify]);

  const handleStart = () => {
    trackEvent('assessment_started', 'assessment');
    setScreen('department');
    setCurrentQuestionIdx(0);
    setMcqAnswers([]);
    setAiResultCache({});
    setClassifiedPersonaId(null);
    setLastAnswers(null);
    setAiError(null);
    setIsReClassifying(false);
    setDepartment('');
    setUserRole('');
    setClientSessionId(crypto.randomUUID());
  };

  const handleDepartmentSubmit = (selectedDepartment: string, role: string) => {
    setDepartment(selectedDepartment);
    setUserRole(role);
    setCurrentQuestionIdx(0);
    setMcqAnswers([]);
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
    setMcqAnswers((prev) => [...prev, answer]);

    if (currentQuestionIdx < questions.length - 1) {
      setTimeout(() => setCurrentQuestionIdx((prev) => prev + 1), 600);
    } else {
      setTimeout(() => setScreen('pledge'), 600);
    }
  };

  const handleSubmit = async () => {
    trackEvent('assessment_submitted', 'assessment', { answerCount: mcqAnswers.length });
    setScreen('ai-loading');
    const answers: StoredAnswer = mcqAnswers;

    // Persist answers so language switches can re-use them
    setLastAnswers(answers);

    try {
      const nextCache: Partial<Record<Lang, AIResult>> = {};
      const englishResult = await runClassify(answers, 'EN');
      nextCache.EN = englishResult;
      try {
        nextCache.BM = await runClassify(answers, 'BM', englishResult);
      } catch (bmError) {
        console.error('Bahasa Melayu classification error:', bmError);
      }

      const selectedResult = nextCache[lang] ?? nextCache.EN ?? nextCache.BM;
      if (!selectedResult) throw new Error('AI classification failed for both languages');

      setAiResultCache(nextCache);
      setClassifiedPersonaId(selectedResult.persona);
      setScreen('results');
    } catch (err) {
      console.error('Classification error:', err);
      setAiError(String(err));
      setScreen('results');
    }
  };

  // Rule-based fallback persona for compatibility with the existing report UI.
  const getFallbackPersona = (): string => {
    const counts: Record<string, number> = {
      explorer: 0,
      builder: 0,
      strategist: 0,
      visionary: 0,
    };
    mcqAnswers.forEach((a) => {
      const persona = a.score >= 4 ? 'builder' : a.score === 3 ? 'strategist' : 'explorer';
      counts[persona]++;
    });
    return (
      Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'explorer'
    );
  };

  // Persona ID is fixed from the first successful classification; never changes on lang switch
  const resultPersonaId = classifiedPersonaId ?? getFallbackPersona();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground relative flex flex-col font-sans overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid opacity-30" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background opacity-50" />

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

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center min-h-[100dvh] w-full py-8">
        <AnimatePresence mode="wait">
          {screen === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <LandingScreen
                lang={lang}
                onStart={handleStart}
                onStats={() => setScreen('statistics')}
                onContact={() => setScreen('contact')}
              />
            </motion.div>
          )}

          {screen === 'department' && (
            <motion.div key="department" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full flex justify-center">
              <DepartmentScreen lang={lang} onSubmit={handleDepartmentSubmit} />
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
              <QuestionScreen
                lang={lang}
                question={questions[currentQuestionIdx]}
                currentIndex={currentQuestionIdx}
                totalQuestions={questions.length + 1}
                onAnswer={handleAnswer}
              />
            </motion.div>
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
              <PledgeScreen
                lang={lang}
                currentIndex={questions.length}
                totalQuestions={questions.length + 1}
                onSubmit={handleSubmit}
              />
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
              <AIThinkingScreen lang={lang} />
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
              <ResultsScreen
                lang={lang}
                resultPersonaId={resultPersonaId}
                aiResult={aiResult}
                aiError={aiError}
                isReClassifying={isReClassifying}
                onRetake={handleStart}
                onHRView={() => setScreen('hr-view')}
                onReport={() => setScreen('report')}
              />
            </motion.div>
          )}

          {screen === 'hr-view' && (
            <motion.div
              key="hr-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <HRDashboard
                lang={lang}
                currentUserPersona={resultPersonaId}
                aiResult={aiResult}
                onBack={() => setScreen('results')}
              />
            </motion.div>
          )}

          {screen === 'statistics' && (
            <motion.div
              key="statistics"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <StatisticsScreen lang={lang} onBack={() => setScreen('landing')} />
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
              <ContactScreen lang={lang} onBack={() => setScreen('landing')} />
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
              <ReportScreen
                lang={lang}
                resultPersonaId={resultPersonaId}
                aiResult={aiResult}
                userRole={userRole}
                isReClassifying={isReClassifying}
                onBack={() => setScreen('results')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
