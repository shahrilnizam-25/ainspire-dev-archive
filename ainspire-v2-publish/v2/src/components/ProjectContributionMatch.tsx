import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Check, X, Clock, ArrowRight, Sparkles, Target } from 'lucide-react';
import type { Lang } from '../i18n';
type Decision = 'accepted' | 'declined';
const offers = [
  { id: 'incident-pilot', en: 'AI-assisted Incident Resolution Pilot', bm: 'Rintis Penyelesaian Insiden Berbantu AI', scopeEN: 'Test AI-generated incident summaries against source records and capture improvements.', scopeBM: 'Uji ringkasan insiden AI dengan rekod sumber dan rekod penambahbaikan.', duration: '4', valueEN: 'Measure handling time and summary accuracy before and after the pilot.', valueBM: 'Ukur masa pengendalian dan ketepatan ringkasan sebelum dan selepas rintis.' },
  { id: 'adoption-sprint', en: 'AI Workforce Adoption Sprint', bm: 'Sprint Penggunaan AI Tenaga Kerja', scopeEN: 'Help a small team apply AI to one recurring workflow and collect user feedback.', scopeBM: 'Bantu pasukan kecil menggunakan AI dalam satu aliran kerja berulang dan kumpul maklum balas.', duration: '6', valueEN: 'Track weekly time saved, active use and quality checks.', valueBM: 'Jejak masa dijimatkan, penggunaan aktif dan semakan kualiti setiap minggu.' },
];
export default function ProjectContributionMatch({ lang, persona, contributionLabel }: { lang: Lang; persona: string; contributionLabel?: string }) {
  const bm = lang === 'BM';
  const key = `ainspire-demo-offers-v1:${persona}`;
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [filter, setFilter] = useState<'all' | Decision>('all');
  const [panels, setPanels] = useState<Record<string, 'role' | 'scope' | 'value'>>({});
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try { const value = JSON.parse(localStorage.getItem(key) ?? '{}'); setDecisions(Object.fromEntries(Object.entries(value).filter(([id, v]) => offers.some(o => o.id === id) && (v === 'accepted' || v === 'declined'))) as Record<string, Decision>); }
    catch { setDecisions({}); setStorageAvailable(false); }
  }, [key]);
  const respond = (id: string, decision?: Decision) => {
    const next = { ...decisions }; if (decision) next[id] = decision; else delete next[id];
    setDecisions(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { setStorageAvailable(false); }
  };
  const role = contributionLabel ?? ({ explorer: bm ? 'Pengguna rintis' : 'Pilot participant', builder: bm ? 'Pembina penyelesaian' : 'Solution builder', strategist: bm ? 'Pemilik masalah perniagaan' : 'Business problem owner', visionary: bm ? 'Peneraju penggunaan' : 'Adoption champion' }[persona] ?? (bm ? 'Penyumbang projek' : 'Project contributor'));
  const accepted = Object.values(decisions).filter(d => d === 'accepted').length;
  const declined = Object.values(decisions).filter(d => d === 'declined').length;
  const visible = offers.filter(o => filter === 'all' || decisions[o.id] === filter);
  return <section className="order-7 mb-12 w-full max-w-3xl" aria-labelledby="project-match-heading">
    <header className="mb-5 rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/10 to-violet-500/10 p-6">
      <div className="flex items-start gap-4"><span className="rounded-xl bg-primary/15 p-3 text-primary"><BriefcaseBusiness size={24}/></span><div><p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">{bm ? 'Gunakan keupayaan anda' : 'Put your capability into practice'}</p><h2 id="project-match-heading" className="text-2xl font-extrabold">{bm ? 'Padanan Sumbangan Projek' : 'Project Contribution Match'}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{bm ? 'Semak peranan → teroka skop → buat keputusan.' : 'Review your role → explore the scope → respond to an offer.'}</p></div></div>
      <div className="mt-5 grid grid-cols-3 gap-3">{[{n:offers.length,label:bm?'Tawaran demo':'Demo offers'},{n:accepted,label:bm?'Diterima':'Accepted'},{n:declined,label:bm?'Ditolak':'Declined'}].map(s=><div key={s.label} className="rounded-xl border border-white/10 bg-background/40 p-3"><p className="text-2xl font-black text-primary">{s.n}</p><p className="mt-1 text-xs text-muted-foreground">{s.label}</p></div>)}</div>
    </header>
    <div className="mb-5 flex flex-wrap gap-2" aria-label={bm?'Tapis tawaran':'Filter offers'}>{(['all','accepted','declined'] as const).map(f=><button key={f} aria-pressed={filter===f} onClick={()=>setFilter(f)} className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${filter===f?'border-primary/50 bg-primary/10 text-primary':'border-card-border text-muted-foreground hover:text-white'}`}>{f==='all'?(bm?'Semua tawaran':'All offers'):f==='accepted'?(bm?'Diterima':'Accepted'):(bm?'Ditolak':'Declined')}</button>)}</div>
    <div className="space-y-5">{visible.map((offer,index) => {
      const panel = panels[offer.id] ?? 'role';
      const decision = decisions[offer.id];
      return <article key={offer.id} className={`overflow-hidden rounded-2xl border transition-all hover:shadow-[0_0_25px_rgba(0,212,255,0.1)] ${decision==='accepted'?'border-green-400/50':'border-primary/25'} bg-card`}>
        <div className="border-b border-white/10 bg-gradient-to-r from-primary/10 to-transparent p-6">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-widest text-primary">{bm?'Inisiatif contoh':'Illustrative initiative'} · 0{index+1}</span><span className={`rounded-full border px-3 py-1 text-xs font-bold ${decision==='accepted'?'border-green-400/40 text-green-300':decision==='declined'?'border-white/20 text-muted-foreground':'border-primary/40 text-primary'}`}>{decision==='accepted'?(bm?'Diterima':'Accepted'):decision==='declined'?(bm?'Ditolak':'Declined'):(bm?'Untuk semakan anda':'For your review')}</span></div>
          <h3 className="text-xl font-bold leading-tight">{bm ? offer.bm : offer.en}</h3>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Clock size={16}/>{offer.duration} {bm?'minggu':'weeks'} <span className="mx-1">·</span> 2 {bm?'jam/minggu':'hours/week'} <span className="mx-1">·</span> {bm?'Dibimbing':'Mentor supported'}</p>
        </div>
        <div className="p-6">
          <div className="mb-5 flex flex-wrap gap-2">{(['role','scope','value'] as const).map(p=><button key={p} onClick={()=>setPanels(prev=>({...prev,[offer.id]:p}))} aria-pressed={panel===p} aria-controls={`${offer.id}-details`} className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${panel===p?'bg-primary/15 text-primary ring-1 ring-primary/40':'bg-white/5 text-muted-foreground hover:bg-white/10'}`}>{p==='role'?(bm?'Peranan & padanan':'Role & fit'):p==='scope'?(bm?'Skop & sokongan':'Scope & support'):(bm?'Ukuran nilai':'Value measures')}</button>)}</div>
          <div id={`${offer.id}-details`} className="min-h-36 rounded-xl border border-white/10 bg-background/40 p-5">
            {panel==='role'?<><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary"><Sparkles size={16}/>{bm?'Peranan dicadangkan':'Suggested contribution role'}</p><p className="text-xl font-extrabold">{role}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{bm?'Peranan contoh mencerminkan gaya sumbangan anda. Pengurus perlu mengesahkan keupayaan, sokongan dan ketersediaan.':'This example role reflects your contribution preference. A manager would validate capability, support and availability.'}</p></>:panel==='scope'?<><h4 className="mb-2 font-bold">{bm?'Sumbangan anda':'What you would contribute'}</h4><p className="text-sm leading-7 text-foreground/85">{bm?offer.scopeBM:offer.scopeEN}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{bm?'Sokongan: pembimbing rintis dan semakan mingguan. Skop akhir dipersetujui bersama pengurus.':'Support: pilot mentor and weekly review. Final scope would be agreed with your manager.'}</p></>:<><h4 className="mb-2 flex items-center gap-2 font-bold text-primary"><Target size={18}/>{bm?'Bagaimana nilai akan diukur':'How value would be measured'}</h4><p className="text-sm leading-7 text-foreground/85">{bm?offer.valueBM:offer.valueEN}</p><p className="mt-3 text-xs leading-6 text-muted-foreground">{bm?'Cadangan ukuran sahaja. Tiada nilai sebenar direkodkan.':'Proposed measures only. No realized value has been recorded.'}</p></>}
          </div>
          <div className="mt-5" aria-live="polite">{decision?<div className={`rounded-xl border p-4 ${decision==='accepted'?'border-green-400/30 bg-green-500/10':'border-white/15 bg-white/5'}`}><p className="text-sm font-bold">{decision==='accepted'?(bm?'Diterima · menunggu pengesahan pengurus (demo)':'Accepted · awaiting manager confirmation (demo)'):(bm?'Tawaran ditolak (demo)':'Offer declined (demo)')}</p><button onClick={()=>respond(offer.id)} className="mt-3 text-sm font-semibold text-primary underline">{bm?'Ubah keputusan':'Change response'}</button></div>:<div className="flex flex-wrap gap-3"><button onClick={()=>respond(offer.id,'accepted')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.15)] transition-transform hover:scale-[1.02]"><Check size={18}/>{bm?'Terima tawaran':'Accept offer'}<ArrowRight size={16}/></button><button onClick={()=>respond(offer.id,'declined')} className="flex items-center justify-center gap-2 rounded-xl border border-card-border px-5 py-3 text-sm font-semibold text-muted-foreground hover:border-white/40 hover:text-white"><X size={18}/>{bm?'Tolak':'Decline'}</button></div>}</div>
        </div>
      </article>;
    })}</div>
    {visible.length===0 && <div className="rounded-2xl border border-card-border bg-card p-8 text-center"><p className="text-muted-foreground">{bm?'Tiada tawaran dalam paparan ini.':'No offers in this view yet.'}</p><button onClick={()=>setFilter('all')} className="mt-3 font-bold text-primary">{bm?'Lihat semua tawaran':'View all offers'} →</button></div>}
    <p className="mt-5 text-xs leading-6 text-muted-foreground">{bm?'Tawaran contoh, bukan penugasan sebenar.':'Demo offers, not actual assignments.'} {storageAvailable?(bm?'Keputusan disimpan dalam pelayar ini mengikut profil.':'Responses are saved in this browser by profile.'):(bm?'Keputusan tersedia untuk sesi ini sahaja.':'Responses are available in this session only.')} {bm?'Tiada pemberitahuan dihantar.':'No notifications are sent.'}</p>
  </section>;
}
