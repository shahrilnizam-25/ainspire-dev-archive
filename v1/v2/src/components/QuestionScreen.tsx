import { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { dimensionLabelsByLang, type AssessmentQuestion, type AssessmentOption } from '../data/assessment';
import type { Lang } from '../i18n';

export default function QuestionScreen({
  lang,
  question,
  currentIndex,
  totalQuestions,
  onAnswer, selectedId, onBack,
}: {
  lang: Lang;
  question: AssessmentQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (option: AssessmentOption) => void;
  selectedId: string | null;
  onBack: () => void;
}) {
  const [pickedId, setPickedId] = useState<string | null>(null);
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heading = useRef<HTMLHeadingElement | null>(null);
  useEffect(() => {
    locked.current = false;
    setPickedId(null);
    heading.current?.focus({preventScroll: true});
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [question.id, lang]);
  const selectAnswer = (option: AssessmentOption) => {
    if (locked.current) return;
    locked.current = true;
    setPickedId(option.id);
    timer.current = setTimeout(() => onAnswer(option), 300);
  };
  const numStr = (n: number) => String(n).padStart(2, '0');
  const sectionLabel = dimensionLabelsByLang[lang][question.dimension].toUpperCase();

  return (
    <div className="w-full max-w-3xl px-6 py-8 flex flex-col items-center">
      {/* Progress */}
      <div className="w-full mb-12 space-y-4">
        <div className="flex justify-between text-sm font-medium text-muted-foreground font-mono">
          <span>{numStr(currentIndex + 1)}</span>
          <span>{numStr(totalQuestions)}</span>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary glow-cyan"
            initial={{ width: `${(currentIndex / totalQuestions) * 100}%` }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            <div className="mb-7 flex items-center gap-5 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/15 to-violet-500/10 p-5 shadow-[0_0_30px_rgba(0,212,255,0.08)]">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-2xl font-bold text-primary">{numStr(question.section)}</span>
              <div><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">{lang === 'BM' ? 'Bahagian' : 'Section'} {question.section}</p><p className="text-lg md:text-xl font-bold text-white">{sectionLabel}</p><p className="mt-1 text-sm text-muted-foreground">{lang === 'BM' ? 'Soalan' : 'Question'} {currentIndex + 1} / {totalQuestions}</p></div>
            </div>
            <h2 ref={heading} tabIndex={-1} className="focus:outline-none text-3xl md:text-4xl font-bold mb-10 leading-tight">
              {question.text}
            </h2>

            <div className="space-y-4">
              {question.options.map((opt, i) => {
                const currentSelection = pickedId ?? selectedId;
                const isSelected = currentSelection === opt.id;
                const isOtherSelected = currentSelection && !isSelected;

                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    onClick={() => selectAnswer(opt)}
                    disabled={pickedId !== null}
                    aria-pressed={isSelected}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group
                      ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.2)]' : 'border-card-border bg-card hover:border-primary/50 hover:bg-card/80'}
                      ${isOtherSelected ? 'opacity-80' : 'opacity-100 scale-100'}
                    `}
                  >
                    <div className="flex items-start gap-5">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold border transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-muted-foreground group-hover:border-primary/50 group-hover:text-primary/80'}
                      `}>
                        {opt.id}
                      </div>
                      <span className={`text-lg md:text-xl font-medium transition-colors pt-0.5 ${isSelected ? 'text-white' : 'text-foreground/80 group-hover:text-white'}`}>
                        {opt.text}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <button disabled={pickedId !== null} onClick={onBack} className="flex items-center gap-2 rounded-xl border border-card-border bg-card px-6 py-3 font-semibold hover:border-primary/50"><ArrowLeft size={18}/>{lang === 'BM' ? 'Kembali' : 'Back'}</button>

            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
