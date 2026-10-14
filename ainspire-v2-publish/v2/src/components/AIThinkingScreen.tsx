import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Brain, CheckCircle, CircleDot, Eye, Lightbulb, Server, Sparkles, Terminal } from 'lucide-react';
import type { Lang } from '../i18n';
import { translations } from '../i18n';
import { ANALYSIS_PHASE_MS, analysisProgress } from '../shared/analysisTiming';

type ProviderState = 'not-configured' | 'standby' | 'responded' | 'failed';
type RouteOutcome = ProviderState | 'checking' | 'configured' | 'available' | 'used' | 'fallback' | 'processing';
type ProviderTrace = { gigx: ProviderState; apiGate: ProviderState };
type RouteHealth = { modelProvider?: string; youtubeSearchConfigured?: boolean };
const LOG_INTERVAL_MS = 1800;

function OutcomeBadge({ state, label }: { state: RouteOutcome; label: string }) {
  const color = state === 'responded'
    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
    : state === 'failed' || state === 'fallback'
      ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
      : state === 'configured'
        ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
        : state === 'used'
          ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
          : state === 'available'
            ? 'border-cyan-400/20 bg-cyan-400/5 text-cyan-100'
        : 'border-white/10 bg-white/5 text-muted-foreground';
  return <span className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold leading-none ${color}`}><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />{label}</span>;
}

function RouteConnector({ paused }: { paused: boolean }) {
  return <div aria-hidden="true" className="relative flex h-5 items-center justify-center md:h-auto md:w-8">
    <div className="absolute hidden h-px w-full bg-primary/25 md:block" />
    <motion.span className="absolute hidden h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_#00d4ff] md:block" animate={paused ? { opacity: 0.3 } : { x: [-7, 7], opacity: [0.35, 1, 0.35] }} transition={{ duration: 1.2, repeat: paused ? 0 : Infinity, ease: 'easeInOut' }} />
    <ArrowRight className="relative h-4 w-4 rotate-90 text-primary/70 md:rotate-0" />
  </div>;
}

export default function AIThinkingScreen({ lang, resultReady, engine, modelProviderTrace, learningVideoSource, learningVideoStatus, hasError, onComplete }: {
  lang: Lang;
  resultReady: boolean;
  engine?: string | null;
  modelProviderTrace?: ProviderTrace | null;
  learningVideoSource?: string | null;
  learningVideoStatus?: string | null;
  hasError?: boolean;
  onComplete: () => void;
}) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [routeHealth, setRouteHealth] = useState<RouteHealth | null>(null);
  const elapsedTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const t = translations[lang];

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/health', { signal: controller.signal })
      .then(response => response.ok ? response.json() as Promise<RouteHealth> : null)
      .then(data => { if (data) setRouteHealth(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const STEPS = [
    { id: 'observe',  icon: Eye,       label: t.thinkStep1Label, detail: t.thinkStep1Detail, color: '#00d4ff' },
    { id: 'reason',   icon: Brain,     label: t.thinkStep2Label, detail: t.thinkStep2Detail, color: '#a855f7' },
    { id: 'decide',   icon: Lightbulb, label: t.thinkStep3Label, detail: t.thinkStep3Detail, color: '#f59e0b' },
    { id: 'produce',  icon: Sparkles,  label: t.thinkStep4Label, detail: t.thinkStep4Detail, color: '#10b981' },
  ];

  // Elapsed-time clock driving the progress bar
  useEffect(() => {
    const startedAt = Date.now();
    const tick = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);
    elapsedTimer.current = tick;
    return () => {
      clearInterval(tick);
      elapsedTimer.current = null;
    };
  }, []);

  // Keep the final phase pending until the result (or fallback) is prepared.
  const {activeStep, sequenceComplete, progressPercent, completedSteps: completed} = analysisProgress(elapsedMs, resultReady);
  useEffect(() => {
    if (!sequenceComplete || !elapsedTimer.current) return;
    clearInterval(elapsedTimer.current);
    elapsedTimer.current = null;
  }, [sequenceComplete]);
  const completedSteps = new Set(completed);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const ACTIVITY_MESSAGES = [
    t.analysisActivityRequests,
    t.analysisActivityValidation,
    t.analysisActivityModel,
    t.analysisActivityLearning,
    t.analysisActivityProfile,
  ];

  const modelProvider = routeHealth?.modelProvider;
  const providerConfigured = (provider: 'gigx' | 'apiGate') => provider === 'gigx'
    ? modelProvider === 'gigx' || modelProvider === 'gigx-with-apigate-fallback'
    : modelProvider === 'apigate' || modelProvider === 'gigx-with-apigate-fallback';
  const providerOutcome = (provider: 'gigx' | 'apiGate'): RouteOutcome => {
    const actual = modelProviderTrace?.[provider];
    if (resultReady) return actual ?? 'checking';
    if (!routeHealth) return 'checking';
    return providerConfigured(provider) ? 'configured' : 'not-configured';
  };
  const assessmentOutcome: RouteOutcome = resultReady
    ? hasError ? 'failed' : 'responded'
    : routeHealth ? 'processing' : 'checking';
  const profileOutcome: RouteOutcome = resultReady
    ? hasError ? 'fallback' : 'responded'
    : 'processing';
  const videoOutcome: RouteOutcome = resultReady
    ? learningVideoSource === 'youtube-api'
      ? 'responded'
      : learningVideoStatus === 'curated-fallback'
        ? 'fallback'
        : learningVideoSource === 'curated'
          ? 'responded'
          : hasError ? 'failed' : 'checking'
    : !routeHealth
      ? 'checking'
      : routeHealth.youtubeSearchConfigured ? 'configured' : 'not-configured';
  const outcomeLabel = (state: RouteOutcome) => ({
    checking: t.analysisRouteChecking,
    configured: t.analysisRouteConfigured,
    'not-configured': t.analysisRouteNotConfigured,
    standby: t.analysisRouteStandby,
    responded: t.analysisRouteResponded,
    available: t.analysisRouteAvailable,
    used: t.analysisRouteUsed,
    failed: t.analysisRouteUnavailable,
    fallback: t.analysisRouteFallbackUsed,
    processing: t.analysisRouteProcessing,
  })[state];
  const learningOutcomeMessage = learningVideoStatus === 'live'
    ? t.analysisActivityLearningLive
    : learningVideoStatus === 'curated-no-key'
      ? t.analysisActivityLearningCurated
      : t.analysisActivityLearningFallback;
  const completedActivityMessages = hasError
    ? [t.analysisActivityFailed]
    : [
        `${t.analysisActivityProviderResults}: ${t.analysisRouteGigx} ${outcomeLabel(providerOutcome('gigx'))}; ${t.analysisRouteGateway} ${outcomeLabel(providerOutcome('apiGate'))}.`,
        learningOutcomeMessage,
      ];
  const shownActivityCount = resultReady
    ? ACTIVITY_MESSAGES.length
    : Math.min(ACTIVITY_MESSAGES.length, Math.floor(elapsedMs / LOG_INTERVAL_MS) + 1);
  const activityMessages = resultReady
    ? [...ACTIVITY_MESSAGES, ...completedActivityMessages]
    : ACTIVITY_MESSAGES.slice(0, shownActivityCount);
  if (!resultReady && elapsedMs >= 4 * ANALYSIS_PHASE_MS) activityMessages.push(t.analysisActivityWaiting);

  return (
    <div className="w-full max-w-5xl px-4 py-8 flex flex-col items-center text-center sm:px-6">
      {/* Header badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest"
      >
        {t.thinkingBadge}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl font-bold mb-4"
      >
        {t.thinkingTitle}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-8 text-base leading-7 max-w-xl"
      >
        {t.thinkingSubtitle}
      </motion.p>

      {/* Step pipeline */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = activeStep === i && !completedSteps.has(i);
          const isDone = completedSteps.has(i);

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isDone || isActive ? 1 : 0.35, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.5 }}
              className={`relative flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-500 overflow-hidden
                ${
                  isActive
                    ? 'scale-105 bg-card'
                    : isDone
                      ? 'bg-card/50 border-card-border'
                      : 'bg-card/10 border-card-border/20'
                }`}
              style={
                isActive
                  ? { borderColor: step.color, boxShadow: `0 0 24px ${step.color}30` }
                  : isDone
                    ? { borderColor: `${step.color}50` }
                    : {}
              }
            >
              {/* Pulsing bg when active */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  animate={{ opacity: [0.06, 0.15, 0.06] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ backgroundColor: step.color }}
                />
              )}

              {/* Done check */}
              {isDone && (
                <CheckCircle
                  className="absolute top-2 right-2 w-3.5 h-3.5"
                  style={{ color: step.color }}
                />
              )}

              <Icon
                className="w-7 h-7 mb-2 relative z-10"
                style={{ color: isActive || isDone ? step.color : 'currentColor' }}
              />

              <div
                className="text-xs font-bold uppercase tracking-widest mb-2 relative z-10"
                style={{ color: isActive ? step.color : undefined }}
              >
                {step.label}
              </div>

              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.p
                    key="detail"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-muted-foreground text-center leading-relaxed relative z-10"
                  >
                    {step.detail}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Verbose progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-md mb-8"
      >
        <div className="flex items-center justify-between mb-2 text-xs font-semibold text-muted-foreground">
          <span>{t.thinkingProgressLabel}</span>
          <span className="tabular-nums">{progressPercent}% · {elapsedSeconds}s</span>
        </div>
        <div className="h-2 w-full rounded-full bg-card-border/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-primary"
            style={{ backgroundSize: '200% 100%' }}
            animate={{ width: `${progressPercent}%`, backgroundPosition: ['0% 0%', '100% 0%'] }}
            transition={{
              width: { duration: 0.3, ease: 'easeOut' },
              backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
            }}
          />
        </div>
      </motion.div>

      {/* Live service route; configuration and response outcomes are kept distinct. */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        aria-label={t.analysisRouteTitle}
        aria-live="polite"
        className="mb-8 w-full max-w-5xl rounded-xl border border-card-border/50 bg-card/30 p-4 text-left backdrop-blur-sm sm:p-5"
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            <CircleDot className="h-4 w-4 text-primary" />
            {t.analysisRouteTitle}
          </div>
          <OutcomeBadge state={resultReady ? hasError ? 'fallback' : 'responded' : 'processing'} label={resultReady ? hasError ? t.analysisRouteFallbackUsed : t.analysisRouteReady : t.analysisRouteProcessing} />
        </div>
        <p className="mb-4 max-w-3xl text-xs leading-5 text-muted-foreground">{t.analysisRouteDescription}</p>
        <div className="grid grid-cols-1 items-stretch gap-2 lg:grid-cols-[minmax(0,1fr)_32px_minmax(0,1.35fr)_32px_minmax(0,1.35fr)_32px_minmax(0,1fr)]">
          <article className="min-w-0 rounded-lg border border-white/10 bg-background/40 p-3">
            <div className="mb-3 flex items-start gap-2">
              <Server className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
              <div className="min-w-0">
                <h3 className="text-xs font-bold leading-5">{t.analysisRouteAssessment}</h3>
                <p className="text-[11px] leading-4 text-muted-foreground">{t.analysisRouteScoring}</p>
              </div>
            </div>
            <p className="mb-3 text-[11px] leading-5 text-muted-foreground">{t.analysisRouteAssessmentDetail}</p>
            <OutcomeBadge state={assessmentOutcome} label={outcomeLabel(assessmentOutcome)} />
          </article>

          <RouteConnector paused={resultReady} />

          <article className="min-w-0 rounded-lg border border-white/10 bg-background/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4 shrink-0 text-violet-300" />
              <h3 className="text-xs font-bold leading-5">{t.analysisRouteModels}</h3>
            </div>
            <p className="mb-3 text-[11px] leading-5 text-muted-foreground">{t.analysisRouteModelsDetail}</p>
            <div className="space-y-2">
              {([
                ['gigx', t.analysisRouteGigx, t.analysisRoutePrimary],
                ['apiGate', t.analysisRouteGateway, t.analysisRouteFallback],
              ] as const).map(([provider, name, role]) => {
                const state = providerOutcome(provider);
                return <div key={provider} className="min-w-0 rounded-md border border-white/5 bg-white/[0.03] px-2 py-2">
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">{name}</p>
                      <p className="text-[10px] text-muted-foreground">{role}</p>
                    </div>
                    <OutcomeBadge state={state} label={outcomeLabel(state)} />
                  </div>
                  <p className="mt-1.5 text-[10px] leading-4 text-muted-foreground">{provider === 'gigx' ? t.analysisRouteGigxDetail : t.analysisRouteGatewayDetail}</p>
                </div>;
              })}
            </div>
          </article>

          <RouteConnector paused={resultReady} />

          <article className="min-w-0 rounded-lg border border-white/10 bg-background/40 p-3">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 shrink-0 text-amber-300" />
              <h3 className="text-xs font-bold leading-5">{t.analysisRouteLearning}</h3>
            </div>
            <p className="mb-3 text-[11px] leading-5 text-muted-foreground">{t.analysisRouteLearningDetail}</p>
            <div className="space-y-2">
              {([
                [t.analysisRouteYoutube, videoOutcome],
                [t.analysisRouteCurated, resultReady && learningVideoSource === 'curated' ? 'used' as const : 'available' as const],
              ] as const).map(([name, state]) => (
                <div key={name} className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-white/5 bg-white/[0.03] px-2 py-1.5">
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">{name}</p>
                    {name === t.analysisRouteCurated && <p className="text-[10px] leading-4 text-muted-foreground">{t.analysisRouteCuratedDetail}</p>}
                  </div>
                  <OutcomeBadge state={state} label={outcomeLabel(state)} />
                </div>
              ))}
            </div>
          </article>

          <RouteConnector paused={resultReady} />

          <article className="min-w-0 rounded-lg border border-white/10 bg-background/40 p-3">
            <div className="mb-3 flex items-start gap-2">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              <h3 className="text-xs font-bold leading-5">{t.analysisRouteProfile}</h3>
            </div>
            <p className="mb-3 text-[11px] leading-5 text-muted-foreground">{t.analysisRouteProfileDetail}</p>
            <OutcomeBadge state={profileOutcome} label={outcomeLabel(profileOutcome)} />
          </article>
        </div>
        <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-5 text-muted-foreground">{t.analysisRouteNote}</p>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        aria-label={t.analysisActivityTitle}
        className="mb-8 w-full max-w-5xl rounded-xl border border-card-border/40 bg-card/20 p-4 text-left sm:p-5"
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          {t.analysisActivityTitle}
        </div>
        <p className="mb-4 text-[11px] leading-5 text-muted-foreground">{t.analysisActivityNote}</p>
        <div className="max-h-64 space-y-2 overflow-y-auto font-mono text-xs" aria-live="off">
          <AnimatePresence initial={false}>
            {activityMessages.map((message, index) => {
              const isLatest = index === activityMessages.length - 1;
              return <motion.div
                key={`${index}-${message}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: isLatest || resultReady ? 1 : 0.62, y: 0 }}
                className="flex items-start gap-2.5 rounded-md px-2 py-1.5 text-muted-foreground"
              >
                {resultReady
                  ? <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  : <span aria-hidden="true" className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${isLatest ? 'bg-primary shadow-[0_0_8px_#00d4ff]' : 'bg-muted-foreground/50'}`} />}
                <span className="min-w-0 break-words leading-5">{message}</span>
              </motion.div>;
            })}
          </AnimatePresence>
        </div>
      </motion.section>

      {sequenceComplete && <motion.button
        type="button"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onComplete}
        className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-background shadow-[0_0_24px_rgba(0,212,255,0.25)] transition-shadow hover:shadow-[0_0_32px_rgba(0,212,255,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      >
        {t.thinkingShowResults}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </motion.button>}

      {/* Bouncing dots */}
      {!sequenceComplete && <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.22 }}
          />
        ))}
      </motion.div>}
    </div>
  );
}
