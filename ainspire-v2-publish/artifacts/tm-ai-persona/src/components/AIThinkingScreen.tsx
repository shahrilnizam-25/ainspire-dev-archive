import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Brain, Lightbulb, Sparkles, CheckCircle, Terminal } from 'lucide-react';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

const STEP_DURATION = 1900; // ms per step
const LOG_INTERVAL_MS = 1400; // ms between verbose log lines
const PROGRESS_TAU_MS = 7000; // time constant for the asymptotic progress curve
const PROGRESS_CAP_PERCENT = 96; // never show 100% until the real result arrives

export default function AIThinkingScreen({ lang }: { lang: Lang }) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const logIndexRef = useRef(0);
  const t = translations[lang];

  const STEPS = [
    { id: 'observe',  icon: Eye,       label: t.thinkStep1Label, detail: t.thinkStep1Detail, color: '#00d4ff' },
    { id: 'reason',   icon: Brain,     label: t.thinkStep2Label, detail: t.thinkStep2Detail, color: '#a855f7' },
    { id: 'decide',   icon: Lightbulb, label: t.thinkStep3Label, detail: t.thinkStep3Detail, color: '#f59e0b' },
    { id: 'produce',  icon: Sparkles,  label: t.thinkStep4Label, detail: t.thinkStep4Detail, color: '#10b981' },
  ];

  const LOG_MESSAGES = [
    t.thinkLogParsing,
    t.thinkLogScoring,
    t.thinkLogMcpContext,
    t.thinkLogProjectMatch,
    t.thinkLogLearningPath,
    t.thinkLogModelCall,
    t.thinkLogNarrative,
    t.thinkLogFinalizing,
  ];

  // Elapsed-time clock driving the progress bar
  useEffect(() => {
    const startedAt = Date.now();
    const tick = setInterval(() => setElapsedMs(Date.now() - startedAt), 100);
    return () => clearInterval(tick);
  }, []);

  // Verbose activity log — appends a new line on an interval, looping on a
  // "still working" filler once every scripted message has been shown
  useEffect(() => {
    logIndexRef.current = 0;
    setLogLines([LOG_MESSAGES[0]]);
    const interval = setInterval(() => {
      logIndexRef.current += 1;
      const nextMessage = logIndexRef.current < LOG_MESSAGES.length
        ? LOG_MESSAGES[logIndexRef.current]
        : t.thinkLogStillWorking;
      setLogLines((prev) => [...prev.slice(-5), nextMessage]);
    }, LOG_INTERVAL_MS);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const progressPercent = Math.min(
    PROGRESS_CAP_PERCENT,
    Math.round(PROGRESS_CAP_PERCENT * (1 - Math.exp(-elapsedMs / PROGRESS_TAU_MS))),
  );
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveStep(i);
          if (i > 0) {
            setCompletedSteps((prev) => {
              const next = new Set(prev);
              next.add(i - 1);
              return next;
            });
          }
        }, i * STEP_DURATION),
      );
    });

    // Mark last step complete after its duration
    timers.push(
      setTimeout(() => {
        setCompletedSteps((prev) => {
          const next = new Set(prev);
          next.add(STEPS.length - 1);
          return next;
        });
      }, STEPS.length * STEP_DURATION),
    );

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  return (
    <div className="w-full max-w-2xl px-6 py-16 flex flex-col items-center text-center">
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
        className="text-muted-foreground mb-14 text-lg max-w-md"
      >
        {t.thinkingSubtitle}
      </motion.p>

      {/* Step pipeline */}
      <div className="w-full grid grid-cols-4 gap-3 mb-14">
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

      {/* Verbose agent activity log */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-md mb-10 rounded-xl border border-card-border/40 bg-card/30 backdrop-blur-sm px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          <Terminal className="w-3.5 h-3.5" />
          {t.thinkingLogLabel}
        </div>
        <div className="space-y-1 font-mono text-xs">
          <AnimatePresence initial={false}>
            {logLines.map((line, index) => (
              <motion.div
                key={`${index}-${line}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: index === logLines.length - 1 ? 1 : 0.45, y: 0 }}
                className="truncate text-muted-foreground"
              >
                <span className="text-primary mr-1.5">›</span>{line}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bouncing dots */}
      <motion.div
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
      </motion.div>
    </div>
  );
}
