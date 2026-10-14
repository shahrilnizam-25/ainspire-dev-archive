import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Users, CheckCircle, Bot, AlertTriangle, Shield,
  Download, TrendingUp, Bell, Filter, Target, Star, Zap,
  ChevronRight, Loader2, FileText, AlertCircle, Award,
} from 'lucide-react';
import { personas } from '../data/personas';
import type { AIResult } from '../App';
import type { Lang, T } from '../i18n';
import { translations } from '../i18n';

// ── Team Data ────────────────────────────────────────────────────────
const DEMO_TEAM = [
  { name: 'Ahmad Faiz',    role: 'Network Engineer',         grade: 'H', persona: 'builder',    score: 84,   trend: '+12', status: 'complete' },
  { name: 'Nurul Ain',     role: 'Digital Strategy',         grade: 'G', persona: 'visionary',  score: 91,   trend: '+8',  status: 'complete' },
  { name: 'Kevin Lim',     role: 'IT Operations',            grade: 'F', persona: 'explorer',   score: 67,   trend: '+5',  status: 'complete' },
  { name: 'Priya Nair',    role: 'Cloud Infrastructure',     grade: 'G', persona: 'builder',    score: 82,   trend: '+9',  status: 'complete' },
  { name: 'Hafizuddin M.', role: 'Product Innovation',       grade: 'H', persona: 'visionary',  score: 88,   trend: '+6',  status: 'complete' },
  { name: 'Siti Zulaikha', role: 'Customer Experience',      grade: 'F', persona: 'explorer',   score: 71,   trend: '+4',  status: 'complete' },
  { name: 'Marcus Tan',    role: 'Data Analytics',           grade: 'G', persona: 'builder',    score: 79,   trend: '+11', status: 'complete' },
  { name: 'Roshini D.',    role: 'AI Governance',            grade: 'H', persona: 'strategist', score: 85,   trend: '+15', status: 'complete' },
  { name: 'Amirul Haq',    role: 'Security Operations',      grade: 'F', persona: 'explorer',   score: null, trend: null,  status: 'pending'  },
  { name: 'Elaine Wong',   role: 'Corporate Strategy',       grade: 'I', persona: 'visionary',  score: null, trend: null,  status: 'pending'  },
  { name: 'Farouk Azmi',   role: 'Finance Business Partner', grade: 'G', persona: 'strategist', score: 76,   trend: '+7',  status: 'complete' },
  { name: 'Jasmine Loh',   role: 'HR Learning & Dev',        grade: 'H', persona: 'strategist', score: 80,   trend: '+10', status: 'complete' },
] as const;

type Member = {
  name: string; role: string; grade: string; persona: string;
  score: number | null; trend: string | null; status: 'complete' | 'pending';
};

// AI_INSIGHTS are now sourced from i18n via t.hrInsight* keys — see OverviewTab

// ── Helpers ──────────────────────────────────────────────────────────
type FilterPersona = 'all' | 'explorer' | 'builder' | 'strategist' | 'visionary';
type Tab = 'overview' | 'skillsgap' | 'succession' | 'actionplan';

/** Return translated persona display name */
function pName(id: string, t: T): string {
  const map: Record<string, string> = {
    explorer:   t.personaExplorer,
    builder:    t.personaBuilder,
    strategist: t.personaStrategist,
    visionary:  t.personaVisionary,
  };
  return map[id] ?? personas[id]?.name ?? id;
}

function exportCSV(rows: readonly Member[], extra: { name: string; persona: string; score: number | null }) {
  const all: Member[] = [...rows, { name: extra.name, role: 'Current Assessment', grade: '—', persona: extra.persona, score: extra.score, trend: null, status: 'complete' }];
  const csv = ['Name,Role,Grade,Persona,Score,Trend,Status', ...all.map(r => `${r.name},${r.role},${r.grade},${r.persona},${r.score ?? ''},${r.trend ?? ''},${r.status}`)].join('\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })), download: 'ainspire-team-report.csv' });
  a.click();
}

// ── Sub-components ───────────────────────────────────────────────────

function TabButton({ id, label, icon: Icon, active, onClick }: { id: Tab; label: string; icon: any; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
      style={active
        ? { background: 'rgba(0,212,200,0.12)', border: '1px solid rgba(0,212,200,0.4)', color: '#00d4c8' }
        : { background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────
function OverviewTab({ t, allMembers, completed, pending, avgScore, dominant, dominantP, counts, aiResult, approved, setApproved, reminderSent, setReminderSent, filterPersona, setFilterPersona }:
  { t: T; allMembers: Member[]; completed: Member[]; pending: Member[]; avgScore: number; dominant: string; dominantP: any; counts: Record<string,number>; aiResult: AIResult | null; approved: boolean; setApproved: (v:boolean)=>void; reminderSent: boolean; setReminderSent: (v:boolean)=>void; filterPersona: FilterPersona; setFilterPersona: (v:FilterPersona)=>void }) {

  const personaColor = (p: string) => personas[p]?.color ?? '#888';
  const filtered = filterPersona === 'all' ? allMembers : allMembers.filter(m => m.persona === filterPersona);

  const kpiMembersOf = (count: number, total: number) =>
    `${count} ` + (t.hrKpiOfMembers as string).replace('{total}', String(total));

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: t.hrKpi1Label, value: `${Math.round((completed.length / allMembers.length) * 100)}%`, sub: kpiMembersOf(completed.length, allMembers.length), color: '#00d4c8' },
          { label: t.hrKpi2Label, value: avgScore, sub: t.hrKpiAcrossCompleted, color: '#8b5cf6' },
          { label: t.hrKpi3Label, value: pName(dominant, t), sub: kpiMembersOf(counts[dominant] ?? 0, completed.length), color: dominantP?.color ?? '#888' },
          { label: t.hrKpi4Label, value: pending.length, sub: t.hrKpiPendingSub, color: '#f59e0b' },
        ].map(k => (
          <div key={String(k.label)} className="p-5 rounded-2xl bg-card border border-card-border">
            <div className="text-xs text-muted-foreground mb-3 font-medium">{k.label}</div>
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Persona distribution — clickable filter */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-base font-bold">{t.hrPersonaDist}</h2>
          <span className="text-xs text-muted-foreground">{t.hrClickFilter}</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Object.values(personas).map((p, idx) => {
            const count = counts[p.id] ?? 0;
            const pct = completed.length ? Math.round((count / completed.length) * 100) : 0;
            const PIcon = p.icon;
            const isDominant = p.id === dominant;
            const isActive = filterPersona === p.id;
            return (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.07 }}
                className="p-4 rounded-2xl bg-card border-2 flex flex-col items-center text-center cursor-pointer transition-all"
                style={{ borderColor: isActive ? p.color : isDominant ? `${p.color}50` : `${p.color}15`, opacity: filterPersona !== 'all' && !isActive ? 0.5 : 1, boxShadow: isActive ? `0 0 20px ${p.color}20` : undefined }}
                onClick={() => setFilterPersona(isActive ? 'all' : p.id as FilterPersona)}>
                <PIcon className="w-6 h-6 mb-2" style={{ color: p.color }} />
                <div className="text-xs font-bold text-foreground mb-0.5">{pName(p.id, t)}</div>
                <div className="text-2xl font-black" style={{ color: p.color }}>{count}</div>
                <div className="text-xs text-muted-foreground mb-2">{pct}%</div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5, duration: 0.8 }} style={{ backgroundColor: p.color }} />
                </div>
                {isDominant && <div className="mt-2 text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border" style={{ borderColor: p.color, color: p.color }}>{t.hrDominantBadge}</div>}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Individual team table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-bold">{t.hrIndividualResults}</h2>
            {filterPersona !== 'all' && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border ml-1"
                style={{ borderColor: personaColor(filterPersona), color: personaColor(filterPersona), background: `${personaColor(filterPersona)}10` }}>
                {pName(filterPersona, t)} {t.hrPersonaOnly}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            {(['all', 'explorer', 'builder', 'strategist', 'visionary'] as FilterPersona[]).map(f => (
              <button key={f} onClick={() => setFilterPersona(f)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-all border"
                style={filterPersona === f
                  ? { background: f === 'all' ? 'rgba(255,255,255,0.15)' : `${personaColor(f)}20`, borderColor: f === 'all' ? 'rgba(255,255,255,0.4)' : personaColor(f), color: f === 'all' ? '#fff' : personaColor(f) }
                  : { background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }}>
                {f === 'all' ? t.hrFilterAll : pName(f, t)}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-card-border overflow-hidden bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-black/20">
                {[t.hrColEmployee, t.hrColRole, t.hrColGrade, t.hrColPersona, t.hrColScore, t.hrColTrend, t.hrColStatus].map(h => (
                  <th key={String(h)} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((m, i) => {
                  const pColor = personaColor(m.persona);
                  const isYou = m.name === 'You (current)';
                  return (
                    <motion.tr key={m.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.03 }}
                      className="border-t border-card-border/50 hover:bg-white/2 transition-colors"
                      style={isYou ? { background: 'rgba(0,212,200,0.04)' } : undefined}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{ background: m.status === 'complete' ? `${pColor}18` : 'rgba(255,255,255,0.06)', color: m.status === 'complete' ? pColor : 'rgba(255,255,255,0.3)' }}>
                            {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="font-semibold text-foreground">{m.name}{isYou && <span className="ml-1.5 text-xs font-bold text-primary/80">{t.hrYouLabel}</span>}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{m.role}</td>
                      <td className="px-4 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded bg-white/8 text-muted-foreground">{m.grade !== '—' ? `${t.hrGradePrefix} ${m.grade}` : '—'}</span></td>
                      <td className="px-4 py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ borderColor: `${pColor}40`, color: pColor, background: `${pColor}12` }}>{pName(m.persona, t)}</span></td>
                      <td className="px-4 py-3">{m.score !== null ? <span className="text-base font-black" style={{ color: m.score >= 85 ? '#22c55e' : m.score >= 70 ? '#00d4c8' : '#f59e0b' }}>{m.score}</span> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="px-4 py-3">{m.trend ? <span className="text-xs font-bold text-green-400">{m.trend} pts</span> : <span className="text-muted-foreground/40 text-sm">—</span>}</td>
                      <td className="px-4 py-3">{m.status === 'complete' ? <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">✓ {t.hrStatusComplete}</span> : <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/12 text-amber-400">⏳ {t.hrStatusPending}</span>}</td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
          <div className="px-4 py-3 border-t border-card-border/50 flex items-center justify-between bg-black/10">
            <span className="text-xs text-muted-foreground">{kpiMembersOf(filtered.length, allMembers.length)}</span>
            {pending.length > 0 && (
              <button onClick={() => setReminderSent(true)} disabled={reminderSent}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                style={reminderSent ? { borderColor: '#22c55e40', color: '#22c55e', background: '#22c55e12' } : { borderColor: 'rgba(245,158,11,0.4)', color: '#f59e0b', background: 'rgba(245,158,11,0.08)' }}>
                <Bell className="w-3.5 h-3.5" />
                {reminderSent ? `✓ ${t.hrReminderSent}` : `${t.hrSendReminder} (${pending.length})`}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Insight */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3 text-primary text-xs font-bold uppercase tracking-widest">
          <Bot className="w-4 h-4" />{t.hrAiInsight}
        </div>
        <p className="text-foreground leading-relaxed mb-4">
          <strong style={{ color: dominantP?.color }}>{pName(dominant, t)}s ({counts[dominant] ?? 0}/{completed.length} · {Math.round(((counts[dominant] ?? 0) / completed.length) * 100)}%)</strong>{' '}
          {t.hrDominantSuffix}{' '}
          {({ explorer: t.hrInsightExplorer, builder: t.hrInsightBuilder, strategist: t.hrInsightStrategist, visionary: t.hrInsightVisionary } as Record<string,string>)[dominant] ?? ''}
        </p>
        {aiResult?.recommendations && aiResult.recommendations.length > 0 && (
          <div className="border-t border-primary/10 pt-4">
            <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-bold">{t.hrLatestAssmt}</div>
            <ul className="space-y-2">
              {aiResult.recommendations.map((r, i) => (
                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5 font-bold">→</span>
                  <span><strong>{r.title}:</strong> {r.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Data Governance */}
      <div className="p-4 rounded-xl border border-card-border bg-card/30 flex items-start gap-3">
        <Shield className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground">
          <strong className="text-foreground">{t.hrDataGovLabel}</strong> {t.hrDataGovText}
        </div>
      </div>

      {/* Approval */}
      <div className="flex flex-col items-center gap-4">
        {!approved ? (
          <button onClick={() => setApproved(true)} className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg bg-orange-500 hover:bg-orange-400 text-white transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <CheckCircle className="w-5 h-5" />{t.hrApproveRoute}
          </button>
        ) : (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg border-2 border-green-500/60 text-green-400 bg-green-500/10">
            <CheckCircle className="w-5 h-5" />{t.hrActivated}
          </motion.div>
        )}
        <p className="text-xs text-muted-foreground text-center max-w-sm">{t.hrApprovalNote}</p>
      </div>
    </div>
  );
}

// ── Skills Gap Tab ────────────────────────────────────────────────────
function SkillsGapTab({ t, counts, completed }: { t: T; counts: Record<string, number>; completed: Member[] }) {
  const total = completed.length;
  const personaList = ['explorer', 'builder', 'strategist', 'visionary'];
  const [targets, setTargets] = useState<Record<string, number>>({ explorer: 20, builder: 40, strategist: 25, visionary: 15 });

  const totalTarget = Object.values(targets).reduce((s, v) => s + v, 0);
  const isValid = totalTarget === 100;

  const gaps = personaList.map(p => {
    const current = total ? Math.round(((counts[p] ?? 0) / total) * 100) : 0;
    const target = targets[p];
    const gap = target - current;
    const headcountGap = Math.round((Math.abs(gap) / 100) * total);
    return { persona: p, current, target, gap, headcountGap };
  });

  const overallReadiness = Math.round((((counts.builder ?? 0) + (counts.strategist ?? 0) + (counts.visionary ?? 0)) / total) * 100);
  const targetReadiness = targets.builder + targets.strategist + targets.visionary;
  const upliftN = Math.max(0, Math.round(((targetReadiness - overallReadiness) / 100) * total));
  const upliftSub = (t.hrSgKpi3SubN as string).replace('{n}', String(upliftN));

  const gapHeaders = t.hrGapHeaders as readonly string[];

  return (
    <div className="space-y-8">
      {/* Header KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t.hrSgKpi1, value: `${overallReadiness}%`, sub: t.hrSgKpi1Sub, color: '#00d4c8' },
          { label: t.hrSgKpi2, value: `${targetReadiness}%`, sub: t.hrSgKpi2Sub, color: '#8b5cf6' },
          { label: t.hrSgKpi3, value: `+${Math.max(0, targetReadiness - overallReadiness)}%`, sub: upliftSub, color: '#f59e0b' },
        ].map(k => (
          <div key={String(k.label)} className="p-5 rounded-2xl bg-card border border-card-border">
            <div className="text-xs text-muted-foreground mb-3">{k.label}</div>
            <div className="text-3xl font-black mb-1" style={{ color: k.color }}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Target sliders */}
        <div className="p-6 rounded-2xl bg-card border border-card-border">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold">{t.hrSetTargetTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t.hrSetTargetDesc}</p>
            </div>
            <div className={`text-xs font-bold px-3 py-1 rounded-full border ${isValid ? 'border-green-500/40 text-green-400 bg-green-500/10' : 'border-amber-500/40 text-amber-400 bg-amber-500/10'}`}>
              {totalTarget}% {isValid ? t.hrValid : t.hrInvalid}
            </div>
          </div>
          <div className="space-y-6">
            {personaList.map(p => {
              const persona = personas[p];
              const PIcon = persona.icon;
              return (
                <div key={p}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PIcon className="w-4 h-4" style={{ color: persona.color }} />
                      <span className="text-sm font-semibold" style={{ color: persona.color }}>{pName(p, t)}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: persona.color }}>{targets[p]}%</span>
                  </div>
                  <input type="range" min={0} max={100} value={targets[p]}
                    onChange={e => setTargets(prev => ({ ...prev, [p]: Number(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: persona.color }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Gap visual */}
        <div className="p-6 rounded-2xl bg-card border border-card-border">
          <h3 className="text-base font-bold mb-1">{t.hrGapTitle}</h3>
          <p className="text-xs text-muted-foreground mb-6">Bar pairs show where your team is vs where it needs to be</p>
          <div className="space-y-6">
            {gaps.map(g => {
              const persona = personas[g.persona];
              const PIcon = persona.icon;
              const isShortfall = g.gap > 0;
              const isExcess = g.gap < 0;
              return (
                <div key={g.persona}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <PIcon className="w-4 h-4" style={{ color: persona.color }} />
                      <span className="text-sm font-semibold text-foreground">{pName(g.persona, t)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isShortfall && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/12 text-red-400 border border-red-500/25">+{g.headcountGap} {t.hrEmployees}</span>}
                      {isExcess && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-400 border border-amber-500/25">{g.headcountGap} {t.hrEmployees}</span>}
                      {g.gap === 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-500/12 text-green-400 border border-green-500/25">✓ {t.hrOnTarget}</span>}
                    </div>
                  </div>
                  <div className="mb-1.5">
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{gapHeaders[1]}</span><span className="font-bold" style={{ color: persona.color }}>{g.current}%</span></div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: persona.color }} initial={{ width: 0 }} animate={{ width: `${g.current}%` }} transition={{ duration: 0.7 }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{gapHeaders[2]}</span><span className="font-bold text-muted-foreground">{g.target}%</span></div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full opacity-40" style={{ background: persona.color, border: `1px dashed ${persona.color}` }} initial={{ width: 0 }} animate={{ width: `${g.target}%` }} transition={{ duration: 0.7, delay: 0.1 }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gap summary table */}
      <div className="p-6 rounded-2xl bg-card border border-card-border">
        <h3 className="text-base font-bold mb-4">{t.hrGapTitle}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border">
              {(t.hrGapHeaders as readonly string[]).map(h => (
                <th key={h} className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gaps.map(g => {
              const persona = personas[g.persona];
              const PIcon = persona.icon;
              const actions: Record<string, string> = {
                explorer:   'AI Sandbox Programme, tool exposure workshops',
                builder:    'LLM Engineering bootcamp, hands-on build sprints',
                strategist: 'AI ROI Frameworks, steering committee participation',
                visionary:  'Executive AI mentoring, TM AI Council nomination',
              };
              return (
                <tr key={g.persona} className="border-t border-card-border/40">
                  <td className="py-3">
                    <div className="flex items-center gap-2"><PIcon className="w-4 h-4" style={{ color: persona.color }} /><span className="font-semibold" style={{ color: persona.color }}>{pName(g.persona, t)}</span></div>
                  </td>
                  <td className="py-3 font-bold" style={{ color: persona.color }}>{g.current}%</td>
                  <td className="py-3 text-muted-foreground">{g.target}%</td>
                  <td className="py-3">
                    <span className={`font-black text-base ${g.gap > 0 ? 'text-red-400' : g.gap < 0 ? 'text-amber-400' : 'text-green-400'}`}>
                      {g.gap > 0 ? `+${g.gap}%` : g.gap < 0 ? `${g.gap}%` : '✓'}
                    </span>
                  </td>
                  <td className="py-3 text-sm">
                    {g.gap !== 0
                      ? <span className="text-muted-foreground">{g.headcountGap} {t.hrEmployees}</span>
                      : <span className="text-green-400 text-xs">{t.hrOnTarget}</span>}
                  </td>
                  <td className="py-3 text-xs text-muted-foreground max-w-xs">{actions[g.persona]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Succession Tab ────────────────────────────────────────────────────
function SuccessionTab({ t, allMembers }: { t: T; allMembers: Member[] }) {
  const candidates = allMembers.filter(m => m.score !== null && (m.score as number) >= 80 && (m.persona === 'visionary' || m.persona === 'strategist'));
  const pipelineStages = t.hrPipelineStages as readonly string[];

  const [pipeline, setPipeline] = useState<Record<string, string>>(() =>
    Object.fromEntries(candidates.map((c, i) => [c.name, i < 2 ? pipelineStages[1] : i === 2 ? pipelineStages[2] : pipelineStages[0]]))
  );

  const AI_ROLES: Record<string, string> = {
    visionary:  'AI Council Member / GCTO AI Champion',
    strategist: 'AI Programme Lead / AI Transformation Manager',
  };

  const stageColors: Record<string, string> = {
    [pipelineStages[0]]: '#94a3b8',
    [pipelineStages[1]]: '#f59e0b',
    [pipelineStages[2]]: '#00d4c8',
    [pipelineStages[3]]: '#22c55e',
  };

  const succHeaders = t.hrSuccHeaders as readonly string[];

  return (
    <div className="space-y-8">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-card border border-card-border">
          <div className="text-xs text-muted-foreground mb-3">{t.hrSuccKpi1}</div>
          <div className="text-3xl font-black text-primary mb-1">{candidates.length}</div>
          <div className="text-xs text-muted-foreground">{t.hrSuccKpi1Sub}</div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-card-border">
          <div className="text-xs text-muted-foreground mb-3">{t.hrSuccKpi2}</div>
          <div className="text-3xl font-black text-green-400 mb-1">{Object.values(pipeline).filter(s => s === pipelineStages[2] || s === pipelineStages[3]).length}</div>
          <div className="text-xs text-muted-foreground">{t.hrSuccKpi2Sub}</div>
        </div>
        <div className="p-5 rounded-2xl bg-card border border-card-border">
          <div className="text-xs text-muted-foreground mb-3">{t.hrSuccKpi3}</div>
          <div className="text-3xl font-black text-purple-400 mb-1">{Math.round(candidates.reduce((s, c) => s + ((c.score as number) ?? 0), 0) / candidates.length)}</div>
          <div className="text-xs text-muted-foreground">{t.hrSuccKpi3Sub}</div>
        </div>
      </div>

      {/* Pipeline board */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-base font-bold">{t.hrPipelineTitle}</h3>
          <span className="text-xs text-muted-foreground">{t.hrPipelineDrag}</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {pipelineStages.map((stage, stageIdx) => {
            const stageCandidates = candidates.filter(c => pipeline[c.name] === stage);
            return (
              <div key={stage} className="rounded-2xl border border-card-border bg-card/50 overflow-hidden">
                <div className="px-4 py-3 border-b border-card-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: stageColors[stage] }} />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stage}</span>
                  </div>
                  <span className="text-xs font-black" style={{ color: stageColors[stage] }}>{stageCandidates.length}</span>
                </div>
                <div className="p-3 space-y-3 min-h-32">
                  {stageCandidates.map(c => {
                    const pColor = personas[c.persona]?.color ?? '#888';
                    const PIcon = personas[c.persona]?.icon;
                    return (
                      <div key={c.name} className="p-3 rounded-xl border border-card-border bg-card">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-xs font-bold text-foreground">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.role}</div>
                          </div>
                          {PIcon && <PIcon className="w-4 h-4 flex-shrink-0" style={{ color: pColor }} />}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border" style={{ borderColor: `${pColor}40`, color: pColor, background: `${pColor}12` }}>{pName(c.persona, t)}</span>
                          <span className="text-sm font-black" style={{ color: (c.score as number) >= 88 ? '#22c55e' : '#00d4c8' }}>{c.score}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mb-3 leading-snug">{AI_ROLES[c.persona]}</div>
                        <div className="flex gap-1.5">
                          {stageIdx > 0 && (
                            <button onClick={() => setPipeline(p => ({ ...p, [c.name]: pipelineStages[stageIdx - 1] }))}
                              className="flex-1 py-1 rounded-lg text-xs font-semibold border border-card-border text-muted-foreground hover:text-foreground transition-colors">← {t.backToMain.split(' ')[0]}</button>
                          )}
                          {stageIdx < pipelineStages.length - 1 && (
                            <button onClick={() => setPipeline(p => ({ ...p, [c.name]: pipelineStages[stageIdx + 1] }))}
                              className="flex-1 py-1 rounded-lg text-xs font-semibold transition-all"
                              style={{ background: `${stageColors[pipelineStages[stageIdx + 1]]}15`, border: `1px solid ${stageColors[pipelineStages[stageIdx + 1]]}30`, color: stageColors[pipelineStages[stageIdx + 1]] }}>
                              → {pipelineStages[stageIdx + 1]}
                            </button>
                          )}
                          {stageIdx === pipelineStages.length - 1 && (
                            <div className="flex-1 py-1 text-center text-xs font-bold text-green-400">🎓 {pipelineStages[3]}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {stageCandidates.length === 0 && (
                    <div className="text-xs text-muted-foreground/40 text-center py-4">—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Candidate table */}
      <div className="p-6 rounded-2xl bg-card border border-card-border">
        <h3 className="text-base font-bold mb-4">{t.hrCandidateProfiles}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border">
              {succHeaders.map(h => (
                <th key={h} className="pb-3 text-left text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidates.map(c => {
              const pColor = personas[c.persona]?.color ?? '#888';
              const currentStage = pipeline[c.name] ?? pipelineStages[0];
              return (
                <tr key={c.name} className="border-t border-card-border/40">
                  <td className="py-3 font-semibold text-foreground">{c.name}</td>
                  <td className="py-3"><span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ borderColor: `${pColor}40`, color: pColor, background: `${pColor}12` }}>{pName(c.persona, t)}</span></td>
                  <td className="py-3 text-base font-black" style={{ color: (c.score as number) >= 88 ? '#22c55e' : '#00d4c8' }}>{c.score}</td>
                  <td className="py-3 text-muted-foreground">{t.hrGradePrefix} {c.grade}</td>
                  <td className="py-3 text-xs text-muted-foreground">{AI_ROLES[c.persona]}</td>
                  <td className="py-3">
                    <select value={currentStage}
                      onChange={e => setPipeline(p => ({ ...p, [c.name]: e.target.value }))}
                      className="text-xs font-semibold px-2 py-1 rounded-lg border bg-card outline-none cursor-pointer"
                      style={{ borderColor: `${stageColors[currentStage]}40`, color: stageColors[currentStage] }}>
                      {pipelineStages.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Action Plan Tab ───────────────────────────────────────────────────
function ActionPlanTab({ t, counts, completed, dominant }: { t: T; counts: Record<string, number>; completed: Member[]; dominant: string }) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [targets] = useState({ explorer: 20, builder: 40, strategist: 25, visionary: 15 });

  const total = completed.length;
  const distribution = Object.fromEntries(
    ['explorer','builder','strategist','visionary'].map(p => [p, total ? Math.round(((counts[p] ?? 0) / total) * 100) : 0])
  );
  const skillsGap = ['explorer','builder','strategist','visionary'].map(p => ({
    persona: p, current: distribution[p], target: targets[p as keyof typeof targets], gap: targets[p as keyof typeof targets] - distribution[p],
  }));

  const effortColor: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };
  const phaseColors = ['#00d4c8', '#8b5cf6', '#f59e0b'];

  const generatePlan = async () => {
    setLoading(true); setError(null); setPlan(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? ''}/api/action-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ distribution, teamSize: total, divisionName: 'IT Strategy & Orchestration', skillsGap, dominantPersona: dominant }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPlan(await res.json());
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (!w || !plan) return;
    w.document.write(`<html><head><title>90-Day Action Plan</title><style>body{font-family:system-ui,sans-serif;padding:40px;color:#1e293b;max-width:800px;margin:0 auto}h1{color:#0a0e1a;font-size:28px;margin-bottom:8px}h2{color:#0066cc;font-size:18px;margin-top:32px}h3{font-size:14px;color:#475569;margin:16px 0 8px}ul{padding-left:20px;line-height:1.8}p{line-height:1.7;color:#475569}.tag{display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;margin-left:8px}.low{background:#dcfce7;color:#16a34a}.medium{background:#fef9c3;color:#ca8a04}.high{background:#fee2e2;color:#dc2626}</style></head><body>`);
    w.document.write(`<h1>${plan.planTitle}</h1><p>${plan.executiveSummary}</p>`);
    plan.phases?.forEach((ph: any) => {
      w.document.write(`<h2>${t.hrPhaseLabel} ${ph.phase}: ${ph.title} — ${ph.days}</h2><p><em>${ph.objective}</em></p><ul>`);
      ph.actions?.forEach((a: any) => w.document.write(`<li><strong>${a.action}</strong> <span class="tag ${a.effort?.toLowerCase()}">${a.effort}</span> — Owner: ${a.owner}</li>`));
      w.document.write(`</ul><p><strong>Success Metric:</strong> ${ph.successMetric}</p>`);
    });
    w.document.write(`<h2>${t.hrExpectedOutcome}</h2><p>${plan.expectedOutcome}</p><h2>${t.hrKeyRisks}</h2><ul>${plan.keyRisks?.map((r: string) => `<li>${r}</li>`).join('')}</ul></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div className="space-y-8">
      {/* Intro + generate */}
      <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary text-xs font-bold uppercase tracking-widest">
              <Bot className="w-4 h-4" />{t.hrActionLabel}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{t.hrActionTitle}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{t.hrActionDesc}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['explorer','builder','strategist','visionary'].map(p => (
                <span key={p} className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{ borderColor: `${personas[p]?.color}40`, color: personas[p]?.color, background: `${personas[p]?.color}12` }}>
                  {distribution[p]}% {pName(p, t)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <button onClick={generatePlan} disabled={loading}
              className="flex items-center gap-3 px-7 py-3.5 rounded-2xl font-bold text-base transition-all"
              style={{ background: loading ? 'rgba(0,212,200,0.08)' : 'linear-gradient(135deg, rgba(0,212,200,0.2), rgba(0,212,200,0.1))', border: '1px solid rgba(0,212,200,0.4)', color: '#00d4c8', opacity: loading ? 0.7 : 1 }}>
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{t.hrGenerating}</> : <><Zap className="w-5 h-5" />{t.hrGeneratePlan}</>}
            </button>
            {plan && (
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-card-border text-muted-foreground hover:text-foreground hover:border-card-border/80 transition-all">
                <FileText className="w-4 h-4" />{t.hrPrintPlan}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div><div className="font-semibold text-red-300 text-sm mb-1">Generation Failed</div><div className="text-muted-foreground text-xs">{error}</div></div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-card border border-card-border animate-pulse">
              <div className="h-4 bg-white/8 rounded w-1/3 mb-4" />
              <div className="space-y-2">
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-5/6" />
                <div className="h-3 bg-white/5 rounded w-4/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Plan output */}
      {plan && !loading && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="p-6 rounded-2xl bg-card border border-card-border">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-xl font-black text-foreground">{plan.planTitle}</h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30 flex-shrink-0 ml-4">90-Day Plan</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">{plan.executiveSummary}</p>
          </div>

          {plan.phases?.map((phase: any, i: number) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}
              className="p-6 rounded-2xl bg-card border border-card-border overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ background: phaseColors[i] }} />
              <div className="pl-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: phaseColors[i] }}>{t.hrPhaseLabel} {phase.phase} · {phase.days}</div>
                    <h3 className="text-lg font-bold text-foreground">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{phase.objective}</p>
                  </div>
                </div>
                <div className="space-y-3 mb-5">
                  {phase.actions?.map((action: any, j: number) => (
                    <div key={j} className="flex items-start gap-3 p-3.5 rounded-xl border border-card-border/60 bg-white/2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
                        style={{ background: `${phaseColors[i]}20`, color: phaseColors[i], border: `1px solid ${phaseColors[i]}30` }}>{j + 1}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground mb-1">{action.action}</div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs text-muted-foreground">Owner: <strong className="text-foreground/70">{action.owner}</strong></span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full border"
                            style={{ color: effortColor[action.effort] ?? '#94a3b8', borderColor: `${effortColor[action.effort] ?? '#94a3b8'}30`, background: `${effortColor[action.effort] ?? '#94a3b8'}10` }}>
                            {action.effort}
                          </span>
                          {action.personas?.map((p: string) => (
                            <span key={p} className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${personas[p]?.color}12`, color: personas[p]?.color }}>{pName(p, t)}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/6">
                  <Target className="w-4 h-4 flex-shrink-0" style={{ color: phaseColors[i] }} />
                  <div className="text-xs"><span className="font-bold text-foreground">Success Metric: </span><span className="text-muted-foreground">{phase.successMetric}</span></div>
                </div>
              </div>
            </motion.div>
          ))}

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-card-border">
              <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-green-400" /><h3 className="text-sm font-bold text-foreground">{t.hrExpectedOutcome}</h3></div>
              <p className="text-sm text-muted-foreground leading-relaxed">{plan.expectedOutcome}</p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-card-border">
              <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-400" /><h3 className="text-sm font-bold text-foreground">{t.hrKeyRisks}</h3></div>
              <ul className="space-y-2">
                {plan.keyRisks?.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground"><ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {!plan && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">{t.hrReadyTitle}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{t.hrReadyDesc}</p>
        </div>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export default function HRDashboard({ lang = 'EN', currentUserPersona, aiResult, onBack }: {
  lang?: Lang; currentUserPersona: string; aiResult: AIResult | null; onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [approved, setApproved] = useState(false);
  const [filterPersona, setFilterPersona] = useState<FilterPersona>('all');
  const [reminderSent, setReminderSent] = useState(false);

  const t = translations[lang];

  const currentScore = aiResult?.overallReadiness ?? (aiResult ? Math.round(aiResult.confidence * 100) : null);
  const allMembers: Member[] = [
    ...DEMO_TEAM,
    { name: 'You (current)', role: 'Current Assessment', grade: '—', persona: currentUserPersona, score: currentScore, trend: null, status: 'complete' },
  ];
  const completed = allMembers.filter(m => m.status === 'complete');
  const pending = allMembers.filter(m => m.status === 'pending');
  const scores = completed.filter(m => m.score !== null).map(m => m.score as number);
  const avgScore = scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
  const counts = allMembers.reduce<Record<string, number>>((acc, m) => {
    if (m.status === 'complete') acc[m.persona] = (acc[m.persona] ?? 0) + 1;
    return acc;
  }, {});
  const dominant = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'explorer') as string;
  const dominantP = personas[dominant];

  const TABS: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview',   label: t.hrTab1, icon: Users },
    { id: 'skillsgap',  label: t.hrTab2, icon: Target },
    { id: 'succession', label: t.hrTab3, icon: Star },
    { id: 'actionplan', label: t.hrTab4, icon: Zap },
  ];

  return (
    <div className="w-full max-w-6xl px-6 py-10 flex flex-col">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 rounded-full border border-card-border hover:border-primary/50 hover:bg-primary/10 transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-orange-400 mb-1">{t.hrTitle}</div>
            <h1 className="text-3xl font-black">{t.hrSubtitle}</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => exportCSV(DEMO_TEAM, { name: 'You (current)', persona: currentUserPersona, score: currentScore })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-card-border hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-semibold text-muted-foreground hover:text-foreground">
            <Download className="w-4 h-4" />{t.hrExportCSV}
          </button>
        </div>
      </motion.div>

      {/* Governance notice */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="mb-6 p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/5 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-yellow-300 text-sm mb-1">{t.hrGovernance}</div>
          <div className="text-muted-foreground text-sm">{t.hrGovernanceDesc}</div>
        </div>
      </motion.div>

      {/* Tab nav */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-8 flex-wrap">
        {TABS.map(tab => <TabButton key={tab.id} {...tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />)}
      </motion.div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {activeTab === 'overview' && (
            <OverviewTab t={t} allMembers={allMembers} completed={completed} pending={pending} avgScore={avgScore} dominant={dominant} dominantP={dominantP} counts={counts} aiResult={aiResult} approved={approved} setApproved={setApproved} reminderSent={reminderSent} setReminderSent={setReminderSent} filterPersona={filterPersona} setFilterPersona={setFilterPersona} />
          )}
          {activeTab === 'skillsgap' && <SkillsGapTab t={t} counts={counts} completed={completed} />}
          {activeTab === 'succession' && <SuccessionTab t={t} allMembers={allMembers} />}
          {activeTab === 'actionplan' && <ActionPlanTab t={t} counts={counts} completed={completed} dominant={dominant} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
