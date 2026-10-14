import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, ChevronRight, Bot, BarChart2, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { personas } from '../data/personas';
import type { AIResult } from '../App';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

export default function ResultsScreen({
  lang,
  resultPersonaId,
  aiResult,
  aiError,
  isReClassifying,
  onRetake,
  onHRView,
  onReport,
}: {
  lang: Lang;
  resultPersonaId: string;
  aiResult: AIResult | null;
  aiError: string | null;
  isReClassifying: boolean;
  onRetake: () => void;
  onHRView: () => void;
  onReport: () => void;
}) {
  const result = personas[resultPersonaId];
  if (!result) return null;

  const t = translations[lang];
  const Icon = result.icon;
  const profileFit = aiResult?.personaScores?.[resultPersonaId] ?? null;

  // Localised persona text (falls back to English from personas.ts if key missing)
  const personaNameMap: Record<string, string> = {
    explorer:   t.personaExplorer,
    builder:    t.personaBuilder,
    strategist: t.personaStrategist,
    visionary:  t.personaVisionary,
  };
  const personaTaglineMap: Record<string, string> = {
    explorer:   t.personaTaglineExplorer,
    builder:    t.personaTaglineBuilder,
    strategist: t.personaTaglineStrategist,
    visionary:  t.personaTaglineVisionary,
  };
  const personaDescMap: Record<string, string> = {
    explorer:   t.personaDescExplorer,
    builder:    t.personaDescBuilder,
    strategist: t.personaDescStrategist,
    visionary:  t.personaDescVisionary,
  };
  const localName    = personaNameMap[resultPersonaId]    ?? result.name;
  const localTagline = personaTaglineMap[resultPersonaId] ?? result.tagline;
  const localDesc    = personaDescMap[resultPersonaId]    ?? result.description;
  const profileFitLevel = profileFit === null ? 0 : Math.round(profileFit / 10);
  const videoRecommendations = aiResult?.recommendations.filter((recommendation) => recommendation.videoUrl && recommendation.thumbnailUrl) ?? [];
  const textRecommendations = aiResult?.recommendations.filter((recommendation) => !recommendation.videoUrl || !recommendation.thumbnailUrl) ?? [];

  return (
    <div className="w-full max-w-5xl px-6 py-12 flex flex-col items-center">

      {/* Re-classifying indicator */}
      <AnimatePresence>
        {isReClassifying && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-4"
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            {t.reClassifyingLabel ?? 'Updating content…'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Classification badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`order-3 mb-8 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest flex items-center gap-2
          ${aiResult
            ? 'border-primary/40 bg-primary/10 text-primary'
            : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400'
          }`}
      >
        {aiResult ? (
          <>
            <Bot className="w-3.5 h-3.5" />
            <span>{t.resultsAiClassified}</span>
            <span className="text-foreground/50">·</span>
            <span className="text-[10px] text-foreground/60">{t.resultsProfileFit}</span>
            <span
              className="flex items-center gap-1"
              role="img"
              aria-label={`${profileFit ?? 0}% ${t.resultsProfileFit}`}
            >
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`h-2.5 w-1.5 rounded-sm transition-all ${index < profileFitLevel ? 'bg-primary shadow-[0_0_8px_rgba(0,212,255,0.75)]' : 'bg-primary/15'}`}
                />
              ))}
            </span>
            <span className="font-mono text-[10px] text-primary/80">{profileFit ?? 0}%</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-3.5 h-3.5" />
            {t.resultsRuleBased} {aiError ? t.resultsAiUnavail : ''}
          </>
        )}
      </motion.div>

      {/* Persona hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="order-4 flex flex-col items-center text-center mb-10 w-full max-w-3xl"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground uppercase tracking-[0.2em] text-sm font-bold mb-8"
        >
          {t.resultsYourPersona}
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, delay: 0.3 }}
          className="w-40 h-40 rounded-3xl flex items-center justify-center mb-10 relative"
          style={{
            backgroundColor: `${result.color}15`,
            boxShadow: `0 0 60px ${result.color}30`,
            border: `1px solid ${result.color}40`,
          }}
        >
          <Icon className="w-20 h-20" style={{ color: result.color }} />
          <div
            className="absolute inset-0 rounded-3xl blur-2xl mix-blend-screen opacity-60"
            style={{ backgroundColor: result.color }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-6xl md:text-8xl font-black mb-6 drop-shadow-2xl"
          style={{ color: result.color, textShadow: `0 0 30px ${result.color}50` }}
        >
          {localName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl md:text-3xl font-medium italic text-white/90 mb-8"
        >
          "{localTagline}"
        </motion.p>

        {/* AI narrative or static description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground leading-relaxed"
        >
          {aiResult?.narrative ?? localDesc}
        </motion.p>
      </motion.div>

      {/* AI Reasoning panel */}
      {aiResult && (
        <>
        {typeof aiResult.overallReadiness === 'number' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="order-5 mb-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <div className="rounded-2xl border border-primary/25 bg-primary/10 p-5 sm:col-span-1">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">AI readiness</div>
              <div className="mt-2 text-4xl font-black text-foreground">{aiResult.overallReadiness}%</div>
            </div>
            {Object.entries(aiResult.dimensionScores ?? {}).slice(0, 2).map(([dimension, score]) => (
              <div key={dimension} className="rounded-2xl border border-card-border bg-card p-5">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{dimension.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}</div>
                <div className="mt-2 text-3xl font-black text-foreground">{score}%</div>
              </div>
            ))}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="order-5 w-full max-w-3xl mb-10 p-6 rounded-2xl border border-primary/20 bg-primary/5"
        >
          <div className="flex items-center gap-2 mb-3 text-primary text-xs font-bold uppercase tracking-widest">
            <Bot className="w-4 h-4" />
            {t.resultsAiReasoning}
          </div>
          <p className="text-muted-foreground leading-relaxed">{aiResult.reasoning}</p>
        </motion.div>
        </>
      )}

      {/* Personalised learning path */}
      {aiResult && aiResult.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="order-6 w-full max-w-3xl mb-12"
        >
          <h3 className="text-lg font-bold mb-4 text-foreground">{t.resultsLearningPath}</h3>
          {videoRecommendations.length > 0 && (
            <div className="mb-8">
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{t.learningVideosTitle}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {videoRecommendations.map((rec, i) => (
                  <article key={`video-${i}`} className="overflow-hidden rounded-xl border border-primary/20 bg-card">
                    <a href={rec.videoUrl} target="_blank" rel="noreferrer" className="group block" aria-label={t.learningVideoLabel}>
                      <div className="relative aspect-video overflow-hidden bg-primary/5">
                        <div className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-semibold text-muted-foreground/60">
                          {t.learningVideoPreviewUnavailable}
                        </div>
                        <img
                          src={rec.thumbnailUrl}
                          alt={rec.videoTitle ?? rec.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                        />
                        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-[10px] font-bold text-white">{rec.duration ?? 'VIDEO'}</span>
                      </div>
                    </a>
                    <div className="p-4">
                      <div className="mb-1 font-semibold text-foreground">{rec.videoTitle ?? rec.title}</div>
                      <div className="mb-2 text-xs text-muted-foreground">{rec.channelTitle ?? 'YouTube'}</div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{rec.relevanceStatement ?? rec.description}</p>
                      <a href={rec.videoUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-primary hover:text-primary/80">{t.learningVideoLabel} →</a>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
          {textRecommendations.length > 0 && (
            <div>
              <div className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">{t.learningStepsTitle}</div>
              <div className="space-y-3">
            {textRecommendations.map((rec, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.1 }}
                className="flex items-start gap-4 p-5 rounded-xl bg-card border border-card-border"
              >
                <div
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-background"
                  style={{ backgroundColor: result.color }}
                >
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-foreground mb-1">{rec.title}</div>
                  <div className="text-muted-foreground text-sm">{rec.description}</div>
                </div>
              </motion.div>
            ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* All personas reference grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="order-2 w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-5 px-2"
      >
        {Object.values(personas).map((p) => {
          const PIcon = p.icon;
          const isResult = p.id === resultPersonaId;
          return (
            <div
              key={p.id}
              className={`p-2.5 md:p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center relative overflow-hidden
                ${isResult
                  ? 'bg-card border-card-border shadow-2xl scale-100 md:scale-[1.05] z-10'
                  : 'bg-card/20 border-transparent opacity-50 hover:opacity-80'
                }`}
              style={isResult ? { borderColor: p.color, boxShadow: `0 0 30px ${p.color}15` } : {}}
            >
              {isResult && (
                <div
                  className="absolute inset-0 opacity-10 blur-xl"
                  style={{ backgroundColor: p.color }}
                />
              )}
              <PIcon className="w-7 h-7 mb-2" style={{ color: p.color }} />
              <div className="font-bold text-xs md:text-sm mb-1 text-foreground">{personaNameMap[p.id] ?? p.name}</div>
              {isResult && (
                <div
                  className="mt-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-background border"
                  style={{ borderColor: p.color, color: p.color }}
                >
                  {t.resultsYouBadge}
                </div>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="order-1 w-fit max-w-full flex flex-wrap justify-center gap-1 items-center rounded-2xl border border-white/10 bg-card/70 p-1 backdrop-blur-md mb-6"
      >
        <button
          onClick={onRetake}
          className="group flex h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/30 hover:bg-white/5 hover:text-foreground md:text-sm"
        >
          <RefreshCw className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500" />
          {t.resultsRetake}
        </button>
        <button
          onClick={onReport}
          className="group flex h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-semibold transition-all hover:bg-white/5 md:text-sm"
          style={{
            borderColor: `${result.color}50`,
            color: result.color,
            background: `${result.color}0d`,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${result.color}1a`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${result.color}0d`; }}
        >
          <FileText className="w-4 h-4" />
          {t.resultsDownloadReport}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
        <button
          onClick={onHRView}
          className="group flex h-9 items-center gap-2 rounded-xl border border-transparent px-3 text-xs font-semibold text-orange-400 transition-all hover:bg-orange-500/10 hover:text-orange-300 md:text-sm"
        >
          <BarChart2 className="w-4 h-4" />
          {t.resultsHRView}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
