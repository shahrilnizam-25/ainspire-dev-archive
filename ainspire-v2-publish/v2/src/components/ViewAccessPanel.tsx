import { ShieldAlert } from 'lucide-react';
import type { Lang } from '../i18n';
import { useDemoSession } from '../shared/demoSession';
import { accessFor, type DemoView } from '../shared/demoAccess';

const card = 'w-full rounded-2xl border border-cyan-300/25 bg-slate-950/90 p-5 text-left sm:p-6';

/** Shows a short message when this Staff ID cannot open an HR or supervisor view. */
export default function ViewAccessPanel({ lang, view }: { lang: Lang; view: Exclude<DemoView, 'employee'> }) {
  const tr = (en: string, bm: string) => lang === 'BM' ? bm : en;
  const session = useDemoSession();
  const access = accessFor(session, view);
  if (access === 'checking') return null;

  if (access === 'signin') {
    return <section aria-label={tr('Sign in required', 'Log masuk diperlukan')} className={card}>
      <p role="status" className="text-sm text-slate-200">{tr('Enter your Staff ID in the top-left to open this view.', 'Masukkan ID Staf anda di bahagian kiri atas untuk membuka paparan ini.')}</p>
    </section>;
  }
  if (access === 'denied') {
    const message = view === 'hr'
      ? tr('Your Staff ID does not have the HR view.', 'ID Staf anda tidak mempunyai paparan HR.')
      : tr('Your Staff ID has no direct reports, so there is no supervisor view.', 'ID Staf anda tiada laporan terus, jadi tiada paparan penyelia.');
    return <section aria-label={tr('Access not available', 'Akses tidak tersedia')} className={card}>
      <p role="alert" className="flex items-start gap-2 text-sm text-amber-200"><ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />{message}</p>
    </section>;
  }
  return null;
}
