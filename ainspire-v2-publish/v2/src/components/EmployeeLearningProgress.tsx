import {useState} from 'react';
import type {Lang} from '../i18n';
import type {PocRecord} from '../shared/poc';
import {saveDevelopment,type DevelopmentProgress} from '../shared/hrInsights';
import {writeRecord} from '../shared/pocStore';
import {createNotificationEventId,sendEmployeeNotification} from '../shared/notifications';
export default function EmployeeLearningProgress({record,lang}:{record:PocRecord;lang:Lang}){
 const tr=(en:string,bm:string)=>lang==='BM'?bm:en;const [topic,setTopic]=useState(record.development?.topic??'');const [status,setStatus]=useState<DevelopmentProgress['status']>(record.development?.status??'started');const [evidence,setEvidence]=useState(record.development?.evidence??'');const [notice,setNotice]=useState('');const input='mt-2 w-full rounded-xl border border-primary/25 bg-background p-3 text-sm';
 const handleSubmit=(event:React.FormEvent<HTMLFormElement>)=>{
  event.preventDefault();
  try{
   const normalizedTopic=topic.trim();
   const changed=record.development?.topic!==normalizedTopic||record.development?.status!==status;
   const next=saveDevelopment(record,{...record.development,status,topic:normalizedTopic,evidence,updated:new Date().toISOString(),recordedBy:record.employeeName||record.id,basis:'self-reported'});
   writeRecord(next);
   setNotice(tr('Progress saved.','Kemajuan disimpan.'));
   if(changed)void sendEmployeeNotification({eventId:createNotificationEventId(),eventType:'learning.milestone',lang,employeeName:record.employeeName,topic:normalizedTopic,status:status==='completed'?'completed':'started'}).then(({ok})=>setNotice(ok?tr('Progress saved and email accepted for delivery.','Kemajuan disimpan dan e-mel diterima untuk penghantaran.'):tr('Progress saved, but its email could not be sent.','Kemajuan disimpan, tetapi e-mel tidak dapat dihantar.')));
  }catch(error){setNotice(error instanceof Error?error.message:'Unable to save.');}
 };
 return <details className="mt-6 rounded-2xl border border-primary/25 bg-card p-5"><summary className="cursor-pointer text-lg font-bold text-primary">{tr('My Learning Progress','Kemajuan Pembelajaran Saya')}</summary><p className="mt-3 text-sm text-muted-foreground">{tr('Record your learning and reflection. Completion is self-reported until reviewed; opening a video does not mark it complete.','Rekod pembelajaran dan refleksi. Penyiapan dilaporkan sendiri sehingga disemak; membuka video tidak menandakan selesai.')}</p><form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}><label className="text-sm">{tr('Learning topic / course','Topik / kursus pembelajaran')}<input className={input} required maxLength={200} value={topic} onChange={e=>setTopic(e.target.value)}/></label><label className="text-sm">{tr('Status','Status')}<select className={input} value={status} onChange={e=>setStatus(e.target.value as DevelopmentProgress['status'])}><option value="started">{tr('Started','Dimulakan')}</option><option value="completed">{tr('Completed','Selesai')}</option></select></label><label className="text-sm sm:col-span-2">{tr('Reflection / evidence reference','Refleksi / rujukan bukti')}<textarea className={input} required={status==='completed'} maxLength={1000} value={evidence} onChange={e=>setEvidence(e.target.value)}/></label><button className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-bold text-primary" type="submit">{tr('Save My Progress','Simpan Kemajuan Saya')}</button>{notice&&<p className="text-sm" role="status">{notice}</p>}</form></details>;
}
