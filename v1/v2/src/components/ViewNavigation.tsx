"use client";
import { useState, type FormEvent } from 'react';
import type { Lang } from '../i18n';
import { ChevronDown, ClipboardCheck, LogOut, UserRound, UsersRound } from 'lucide-react';
import { signIn, signOut, useDemoSession, useSampleIds, type SampleId, type SampleKind } from '../shared/demoSession';
import { visibleViews, type DemoView } from '../shared/demoAccess';

const views = [
  { id: 'employee', href: '/', en: 'Employee View', bm: 'Paparan Pekerja', icon: UserRound },
  { id: 'hr', href: '/hr', en: 'HR View', bm: 'Paparan HR', icon: UsersRound },
  { id: 'supervisor', href: '/supervisor', en: 'Supervisor View', bm: 'Paparan Penyelia', icon: ClipboardCheck },
] as const;

const roleLabels: Record<Exclude<SampleKind, 'example'>, { en: string; bm: string }> = {
  employee: { en: 'Employee', bm: 'Pekerja' },
  supervisor: { en: 'Employee + Supervisor', bm: 'Pekerja + Penyelia' },
  hr: { en: 'Employee + HR', bm: 'Pekerja + HR' },
  hr_supervisor: { en: 'Employee + Supervisor + HR', bm: 'Pekerja + Penyelia + HR' },
};
const personaNames: Record<string, { en: string; bm: string }> = {
  explorer: { en: 'Explorer', bm: 'Penjelajah' }, builder: { en: 'Builder', bm: 'Pembina' },
  strategist: { en: 'Strategist', bm: 'Ahli Strategi' }, visionary: { en: 'Visionary', bm: 'Visioner' },
};
// Division names that end in an abbreviation, e.g. "Group IT & Digital (GITD)", read better as just GITD.
const shortDivision = (name: string) => name.match(/\(([^)]+)\)\s*$/)?.[1] ?? name;

function exampleDetail(sample: SampleId, lang: Lang) {
  const tr = (en: string, bm: string) => lang === 'BM' ? bm : en;
  const status = sample.assessment_status === 'pending'
    ? tr('Assessment pending', 'Penilaian belum selesai')
    : `${sample.persona ? personaNames[sample.persona]?.[lang === 'BM' ? 'bm' : 'en'] : ''} · ${sample.is_ready ? tr('Ready', 'Bersedia') : tr('Developing', 'Sedang membangun')}`;
  const extras = [sample.direct_reports > 0 ? `${tr('manages', 'mengurus')} ${sample.direct_reports}` : '', sample.is_hr ? 'HR' : ''].filter(Boolean);
  return [shortDivision(sample.division_name_en), status, ...extras].join(' · ');
}

function StaffIdEntry({ lang }: { lang: Lang }) {
  const tr = (en: string, bm: string) => lang === 'BM' ? bm : en;
  const samples = useSampleIds();
  const [staffId, setStaffId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const attempt = async (id: string) => {
    setBusy(true); setError(null);
    setError(await signIn(id));
    setBusy(false);
  };
  const submit = (event: FormEvent) => { event.preventDefault(); void attempt(staffId.trim()); };
  return <div className="relative flex flex-wrap items-center gap-1 border-l border-white/10 pl-2">
    <form onSubmit={submit} className="flex items-center gap-1">
      <label htmlFor="nav-staff-id" className="sr-only">{tr('Staff ID', 'ID Staf')}</label>
      <input id="nav-staff-id" value={staffId} onChange={event => setStaffId(event.target.value.toUpperCase())} maxLength={8} autoComplete="off" spellCheck={false} placeholder={tr('Staff ID', 'ID Staf')} aria-invalid={error ? true : undefined} className="w-24 rounded-md border border-white/15 bg-background/60 px-2 py-1.5 font-mono text-xs tracking-wider text-white outline-none placeholder:font-sans placeholder:tracking-normal focus-visible:ring-2 focus-visible:ring-primary sm:w-28" />
      <button type="submit" disabled={busy || !/^TM[0-9]{6}$/.test(staffId)} className="rounded-md bg-primary/15 px-2.5 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/40 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{busy ? '…' : tr('Go', 'Pergi')}</button>
    </form>
    {samples.length > 0 && <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">{tr('Samples', 'Sampel')}<ChevronDown size={12} aria-hidden="true" /></summary>
      <div className="fixed inset-x-4 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-white/15 bg-background p-2 shadow-xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-full sm:w-80">
        <p className="px-2 pb-1 text-[11px] text-muted-foreground">{tr('Sample directory · no password', 'Direktori sampel · tiada kata laluan')}</p>
        <p className="px-2 pb-1 pt-1 text-[10px] font-bold uppercase tracking-wider text-primary">{tr('Roles', 'Peranan')}</p>
        {samples.filter(sample => sample.group === 'role').map(sample => <button key={sample.staff_id} type="button" onClick={() => void attempt(sample.staff_id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><span className="font-semibold">{sample.kind === 'example' ? sample.business_role : (lang === 'BM' ? roleLabels[sample.kind].bm : roleLabels[sample.kind].en)}</span><span className="font-mono text-slate-400">{sample.staff_id}</span></button>)}
        <p className="mt-1 border-t border-white/10 px-2 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-primary">{tr('More examples', 'Contoh lain')}</p>
        {samples.filter(sample => sample.group === 'example').map(sample => <button key={sample.staff_id} type="button" onClick={() => void attempt(sample.staff_id)} className="flex w-full items-start justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><span className="min-w-0"><span className="block truncate font-semibold">{sample.business_role}</span><span className="block text-[11px] leading-4 text-slate-400">{exampleDetail(sample, lang)}</span></span><span className="shrink-0 font-mono text-slate-400">{sample.staff_id}</span></button>)}
      </div>
    </details>}
    {error && <p role="alert" className="basis-full pb-1 text-[11px] font-semibold text-amber-200">{error}</p>}
  </div>;
}

export default function ViewNavigation({ lang, current }: { lang: Lang; current: DemoView }) {
  const session = useDemoSession();
  const allowed = visibleViews(session);
  // Signed out: offer the Employee tab and keep the current page's tab so the visitor knows where they are.
  // Signed in: show exactly the views this Staff ID holds.
  const shown = views.filter(item => item.id === 'employee' || !allowed || allowed.includes(item.id) || (!session.profile && item.id === current));
  return <nav aria-label={lang === 'BM' ? 'Pilih paparan' : 'Choose your view'} className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-xl border border-white/15 bg-card/90 p-1 shadow-lg backdrop-blur-md">
    {session.profile && <span className="flex items-center gap-2 border-r border-white/10 px-3 py-1 text-xs text-slate-300"><span className="font-semibold text-primary">{session.profile.display_name}</span><span className="font-mono text-slate-400">{session.profile.staff_id}</span></span>}
    {shown.map(item => {
      const Icon = item.icon;
      return <a key={item.id} href={item.href} aria-current={current === item.id ? 'page' : undefined} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${current === item.id ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}><Icon size={16} aria-hidden="true" />{lang === 'BM' ? item.bm : item.en}</a>;
    })}
    {session.status === 'anonymous' && <StaffIdEntry lang={lang} />}
    {session.profile && <button type="button" onClick={() => void signOut()} className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><LogOut size={14} aria-hidden="true" />{lang === 'BM' ? 'Tukar' : 'Switch'}</button>}
  </nav>;
}
