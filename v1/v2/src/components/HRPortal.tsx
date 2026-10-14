import PoweredByFooter from './PoweredByFooter';
import SupervisorDashboard from './SupervisorDashboard';
import HRWorkforceDashboard from './HRWorkforceDashboard';
import ViewNavigation from './ViewNavigation';
import ViewAccessPanel from './ViewAccessPanel';
import {useState} from 'react';
import type {Lang} from '../i18n';
import {useViewAccess} from '../shared/demoSession';
export default function HRPortal({supervisor=false}:{supervisor?:boolean}){
 const [lang,setLang]=useState<Lang>('EN');
 const access=useViewAccess(supervisor?'supervisor':'hr');
 return <div className="min-h-screen bg-background text-foreground">
  <header className="flex flex-wrap items-center justify-between gap-3 px-4 pt-5 pb-5 sm:px-8">
   <ViewNavigation lang={lang} current={supervisor ? 'supervisor' : 'hr'}/>
   <div className="flex gap-1 rounded-full border border-white/15 p-1">{(['EN','BM'] as const).map(l=><button key={l} onClick={()=>setLang(l)} aria-pressed={lang===l} className={'rounded-full px-3 py-1 text-xs font-bold '+(lang===l?'bg-primary text-primary-foreground':'text-muted-foreground')}>{l}</button>)}</div>
  </header>
  <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 sm:px-8">
   <ViewAccessPanel lang={lang} view={supervisor?'supervisor':'hr'}/>
   {access==='open'&&(supervisor?<SupervisorDashboard lang={lang}/>:<HRWorkforceDashboard lang={lang}/>)}
  </main>
  <PoweredByFooter/>
 </div>;
}
