import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BriefcaseBusiness, IdCard } from 'lucide-react';
import { departmentOptions } from '../data/assessment';
import { translations, type Lang } from '../i18n';

export default function DepartmentScreen({
  lang,
  onSubmit, initialDepartment = '', initialRole = '', initialName = '', directory,
}: {
  lang: Lang;
  initialName?: string;
  initialDepartment?: string;
  initialRole?: string;
  // Details from the signed-in Staff ID; used only when the division is one of the known options.
  directory?: { staffId: string; name: string; department: string; role: string };
  onSubmit: (department: string, role: string, name: string) => void;
}) {
  const fromDirectory = directory && (departmentOptions as readonly string[]).includes(directory.department) && directory.role.trim() ? directory : undefined;
  const [name, setName] = useState(fromDirectory?.name ?? initialName);
  const [department, setDepartment] = useState((departmentOptions as readonly string[]).includes(fromDirectory?.department ?? initialDepartment)?(fromDirectory?.department ?? initialDepartment):'');
  const [role, setRole] = useState(fromDirectory?.role ?? initialRole);
  const locked = !!fromDirectory;
  const canContinue = department.length > 0 && role.trim().length > 0;
  const t = translations[lang];
  const lockedStyle = locked ? ' cursor-not-allowed opacity-80' : '';

  return (
    <div className="w-full max-w-2xl px-6 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3 text-primary">
          <BriefcaseBusiness className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">{t.departmentBadge}</span>
        </div>
        <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl">{t.departmentTitle}</h1>
        <p className="mb-6 max-w-xl text-muted-foreground">
          {t.departmentSubtitle}
        </p>
        {locked && <p role="status" className="mb-8 flex max-w-xl items-start gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"><IdCard className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{lang==='BM'?`Maklumat ini diambil daripada ID Staf anda (${fromDirectory.staffId}). Tukar ID Staf di bahagian kiri atas jika ia tidak betul.`:`These details come from your Staff ID (${fromDirectory.staffId}). Switch Staff ID in the top-left if they are not yours.`}</p>}
        {!locked && <div className="mb-4" />}

        <div className="space-y-6">
          <label className="block"><span className="mb-2 block text-sm font-semibold">{lang==='BM'?'Nama Pekerja':'Employee Name'}</span><input value={name} maxLength={100} readOnly={locked} onChange={e=>setName(e.target.value)} className={'w-full rounded-xl border-2 border-card-border bg-card px-5 py-3 text-foreground'+lockedStyle} /></label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t.departmentLabel}</span>
            <select
              value={department}
              disabled={locked}
              onChange={(event) => setDepartment(event.target.value)}
              className={'w-full rounded-xl border-2 border-card-border bg-card px-5 py-4 text-base text-foreground focus:border-primary/60 focus:outline-none'+lockedStyle}
            >
              <option value="">{t.departmentPlaceholder}</option>
              {departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">{t.roleLabel}</span>
            <input
              value={role}
              readOnly={locked}
              onChange={(event) => setRole(event.target.value)}
              placeholder={t.rolePlaceholder}
              className={'w-full rounded-xl border-2 border-card-border bg-card px-5 py-4 text-base text-foreground placeholder:text-muted-foreground/40 focus:border-primary/60 focus:outline-none'+lockedStyle}
            />
          </label>

          <motion.button
            type="button"
            disabled={!canContinue}
            onClick={() => canContinue && onSubmit(department, role.trim(), name.trim())}
            whileHover={canContinue ? { scale: 1.02 } : {}}
            whileTap={canContinue ? { scale: 0.98 } : {}}
            className={`flex items-center gap-3 rounded-full px-8 py-3 font-semibold transition-all ${canContinue ? 'bg-primary text-background shadow-[0_0_20px_rgba(0,212,255,0.35)]' : 'cursor-not-allowed bg-muted text-muted-foreground opacity-50'}`}
          >
            {t.continueBtn}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}