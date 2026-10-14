import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assessmentQuestionsByLang, dimensionLabelsByLang, type AssessmentQuestion, type AssessmentOption } from '../data/assessment';
import type { Lang } from '../i18n';

export default function QuestionScreen({
  lang,
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
}: {
  lang: Lang;
  question: AssessmentQuestion;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (option: AssessmentOption) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Reset selection when question changes
  useEffect(() => {
    setSelectedId(null);
  }, [question.id]);

  const handleSelect = (option: AssessmentOption) => {
    if (selectedId) return;
    setSelectedId(option.id);
    onAnswer(option);
  };

  const numStr = (n: number) => String(n).padStart(2, '0');
  const sectionQuestions = assessmentQuestionsByLang[lang].filter((item) => item.section === question.section);
  const sectionPosition = sectionQuestions.findIndex((item) => item.id === question.id) + 1;
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
            <div className="mb-6 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary/80">
              Section {question.section} · {sectionLabel} · {sectionPosition}/{sectionQuestions.length}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 leading-tight">
              {question.text}
            </h2>

            <div className="space-y-4">
              {question.options.map((opt, i) => {
                const isSelected = selectedId === opt.id;
                const isOtherSelected = selectedId && !isSelected;

                return (
                  <motion.button
                    key={opt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    onClick={() => handleSelect(opt)}
                    disabled={!!selectedId}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 relative overflow-hidden group
                      ${isSelected ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,212,255,0.2)]' : 'border-card-border bg-card hover:border-primary/50 hover:bg-card/80'}
                      ${isOtherSelected ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'}
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
