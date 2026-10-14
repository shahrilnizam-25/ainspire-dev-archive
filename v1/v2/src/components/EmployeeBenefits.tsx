import { Brain, Route, BriefcaseBusiness, BarChart3 } from 'lucide-react';
import { translations, type Lang } from '../i18n';

export default function EmployeeBenefits({ lang }: { lang: Lang }) {
  const t = translations[lang];
  const scopes = [
    { Icon: Brain, title: t.feature1Label, description: t.feature1Desc },
    { Icon: Route, title: t.feature2Label, description: t.feature2Desc },
    { Icon: BriefcaseBusiness, title: t.feature3Label, description: t.feature3Desc },
    { Icon: BarChart3, title: t.feature4Label, description: t.feature4Desc },
  ];
  return (
    <section aria-label={lang === 'BM' ? 'Skop AiNspire' : 'AiNspire scopes'} className="relative z-10 -mt-8 mb-6 w-full px-4 sm:px-6">
      <p className="mx-auto mb-7 max-w-3xl text-center text-sm font-medium leading-7 text-slate-200 opacity-80 sm:mb-8 md:text-base" style={{ textShadow: '0 0 12px rgba(34,211,238,0.12), 0 2px 6px rgba(0,0,0,0.65)' }}>
        {t.description}{' '}<span className="font-semibold text-cyan-200" style={{ textShadow: '0 0 10px rgba(34,211,238,0.16)' }}>{t.descriptionBold}</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scopes.map(({ Icon, title, description }) => (
          <article key={title} className="group rounded-2xl border border-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.16),inset_0_0_14px_rgba(34,211,238,0.04)] bg-gradient-to-b from-[#091322] to-[#040b16] p-5 text-left transition-all duration-200 hover:border-cyan-300/65 hover:shadow-[0_0_26px_rgba(34,211,238,0.24),inset_0_0_14px_rgba(34,211,238,0.06)] sm:p-6">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border transition-shadow duration-200 group-hover:shadow-[0_0_18px_rgba(0,212,255,0.12)]" style={{ color: '#22d3ee', background: 'rgba(34,211,238,0.06)', borderColor: 'rgba(34,211,238,0.25)' }}>
              <Icon size={24} aria-hidden="true" />
            </div>
            <h2 className="mb-3 text-lg font-bold leading-snug lg:min-h-14" style={{ color: '#22d3ee' }}>{title}</h2>
            <p className="text-sm leading-6 text-slate-200/90">{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
