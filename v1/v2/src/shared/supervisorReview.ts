import {approveAssignment,type PocRecord} from './poc';
export function agreedCapacity(record:PocRecord){return record.capacity?.hours??record.development?.capacityHours??0;}
export function capacityConfirmedBy(record:PocRecord){return record.capacity?.confirmedBy??record.development?.capacityConfirmedBy??'';}
export function recordSupervisorDecision(record:PocRecord,projectId:string,decision:'approved'|'rejected',name:string,reason:string,hours:number):PocRecord{
 const assignment=record.assignments[projectId];
 if(!assignment)throw Error('A project interest request is required.');
 if(decision==='approved'&&(!Number.isFinite(hours)||hours<=0||hours>40))throw Error('Approval requires agreed capacity greater than 0 and at most 40 hours/week.');
 const next=approveAssignment(assignment,decision,name,reason);
 return {...record,...(decision==='approved'?{capacity:{hours,confirmedBy:name.trim(),updated:next.decisionDate!}}:{}),assignments:{...record.assignments,[projectId]:next}};
}
