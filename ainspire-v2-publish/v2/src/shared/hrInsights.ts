import {agreedCapacity,capacityConfirmedBy} from './supervisorReview';
import type {PocRecord} from './poc';
import {workforceAnalytics} from './workforceAnalytics';
export type DevelopmentProgress={status:'recommended'|'started'|'completed';topic:string;evidence:string;updated:string;recordedBy:string;basis:'self-reported'|'verified';capacityHours?:number;capacityConfirmedBy?:string};
export function saveDevelopment(record:PocRecord,progress:DevelopmentProgress):PocRecord{
 if(!progress.topic.trim()||!progress.recordedBy.trim())throw Error('A learning topic and recorder are required.');
 if(progress.status==='completed'&&!progress.evidence.trim())throw Error('Completion requires a reflection or evidence reference.');
 if(progress.capacityHours!==undefined&&(!Number.isFinite(progress.capacityHours)||progress.capacityHours<0||progress.capacityHours>40||!progress.capacityConfirmedBy?.trim()))throw Error('Capacity requires 0–40 hours/week and a named supervisor confirmation.');
 return {...record,development:{...progress,topic:progress.topic.trim(),recordedBy:progress.recordedBy.trim(),evidence:progress.evidence.trim()}};
}
export function developmentSummary(records:PocRecord[]){
 const unique=workforceAnalytics(records).records;
 return {total:unique.length,recorded:unique.filter(r=>r.development).length,started:unique.filter(r=>r.development?.status==='started').length,completed:unique.filter(r=>r.development?.status==='completed').length,verified:unique.filter(r=>r.development?.status==='completed'&&r.development.basis==='verified').length,available:unique.filter(r=>capacityConfirmedBy(r)&&agreedCapacity(r)>0).length};
}
