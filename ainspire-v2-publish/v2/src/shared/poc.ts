import type {DevelopmentProgress} from './hrInsights';
export type PersonaId = 'explorer'|'builder'|'strategist'|'visionary';
export type RoleId = 'R1'|'R2'|'R3'|'R4'|'R5'|'R6'|'R7';
export type LocalText = { EN:string; BM:string };
const t=(EN:string,BM:string):LocalText=>({EN,BM});
export const domains=['IT Operations','Data','Software Engineering','Finance','HR','Customer Experience','Other'] as const;
export const skills=['Requirements','Data preparation','Development','Integration','Testing','Adoption'] as const;
export const roles: {id:RoleId;name:LocalText;task:LocalText;skill:string;dimension:string;min:number}[]=[
{id:'R1',name:t('Business Use Case Contributor','Penyumbang Kes Penggunaan Perniagaan'),task:t('Define a use-case brief and acceptance criteria.','Sediakan ringkasan kes penggunaan dan kriteria penerimaan.'),skill:'Requirements',dimension:'aiProblemSolving',min:75},
{id:'R2',name:t('Domain & Data Contributor','Penyumbang Domain & Data'),task:t('Prepare and review domain rules, data or knowledge content.','Sediakan dan semak peraturan domain, data atau kandungan pengetahuan.'),skill:'Data preparation',dimension:'criticalJudgement',min:50},
{id:'R3',name:t('AI Solution Contributor','Penyumbang Penyelesaian AI'),task:t('Build a small AI component with defined inputs and outputs.','Bina komponen AI kecil dengan input dan output yang ditetapkan.'),skill:'Development',dimension:'aiApplication',min:75},
{id:'R4',name:t('Integration & Platform Contributor','Penyumbang Integrasi & Platform'),task:t('Connect and test an API or platform component.','Sambung dan uji API atau komponen platform.'),skill:'Integration',dimension:'aiApplication',min:75},
{id:'R5',name:t('Quality & Responsible AI Contributor','Penyumbang Kualiti & AI Bertanggungjawab'),task:t('Evaluate outputs and document quality or control issues with specialists.','Nilai output dan dokumentasikan isu kualiti atau kawalan bersama pakar.'),skill:'Testing',dimension:'criticalJudgement',min:75},
{id:'R6',name:t('Pilot & Adoption Contributor','Penyumbang Rintis & Penggunaan'),task:t('Test a work scenario and capture user feedback.','Uji senario kerja dan rekod maklum balas pengguna.'),skill:'Adoption',dimension:'criticalJudgement',min:50},
{id:'R7',name:t('Value Measurement Contributor','Penyumbang Pengukuran Nilai'),task:t('Record a baseline, measured outcome and supporting evidence.','Rekod garis dasar, hasil diukur dan bukti sokongan.'),skill:'Requirements',dimension:'aiProblemSolving',min:75},
];
export const projects: {id:string;name:string;domain:string[];roleIds:RoleId[];scope:LocalText;quality:LocalText}[]=[
{id:'dataops',name:'Agentic AI for DataOps',domain:['Data','IT Operations'],roleIds:['R3','R4','R7'],scope:t('Pipeline monitoring and incident resolution','Pemantauan saluran data dan penyelesaian insiden'),quality:t('Check resolution accuracy and escalation safety.','Semak ketepatan penyelesaian dan keselamatan eskalasi.')},
{id:'bfsi',name:'TM BFSI Intelligence API Marketplace',domain:['Finance','Data'],roleIds:['R1','R2','R4'],scope:t('Financial intelligence API requirements and data','Keperluan API risikan kewangan dan data'),quality:t('Validate data definitions and approved access.','Sahkan definisi data dan akses yang diluluskan.')},
{id:'ai-assist',name:'AI-Assist for IT Ticket Operation',domain:['IT Operations'],roleIds:['R2','R5','R6'],scope:t('Incident knowledge and service-desk pilot','Pengetahuan insiden dan rintis meja perkhidmatan'),quality:t('Check answer accuracy against source records.','Semak ketepatan jawapan dengan rekod sumber.')},
{id:'aura',name:'AURA',domain:['IT Operations'],roleIds:['R3','R5','R7'],scope:t('Remediation, patching and recovery scenarios','Senario pemulihan, tampalan dan pemulihan semula'),quality:t('Check patch compliance and recovery success.','Semak pematuhan tampalan dan kejayaan pemulihan.')},
{id:'engineering',name:'AI Engineering Platform · Self-Hosted LLM for the SDLC',domain:['Software Engineering'],roleIds:['R4','R5','R7'],scope:t('Developer tools and code evaluation','Alat pembangun dan penilaian kod'),quality:t('Check defects, rework and code security.','Semak kecacatan, kerja semula dan keselamatan kod.')},
{id:'ekyc',name:'TM eKYC · AI Identity Verification',domain:['Customer Experience','Data'],roleIds:['R2','R5','R6'],scope:t('Document verification and onboarding tests','Pengesahan dokumen dan ujian onboarding'),quality:t('Check false acceptance and false rejection.','Semak penerimaan dan penolakan yang salah.')},
{id:'saring',name:'SARING',domain:['Finance','HR'],roleIds:['R1','R2','R5'],scope:t('Document validation rules and screening evaluation','Peraturan pengesahan dokumen dan penilaian saringan'),quality:t('Check false alerts and missed cases with SMEs.','Semak amaran palsu dan kes terlepas bersama pakar domain.')},
{id:'uniqa',name:'UniQA',domain:['Customer Experience','Software Engineering'],roleIds:['R1','R4','R6'],scope:t('Customer engagement and application journey','Penglibatan pelanggan dan perjalanan aplikasi'),quality:t('Check journey completion and consent handling.','Semak penyempurnaan perjalanan dan pengendalian persetujuan.')},
];
export type Context={domain:string;skills:string[];hours:number};
export type Offer={projectId:string;roleId:RoleId;eligible:boolean;reasons:string[];gaps:string[];rank:number};
export function matchOffers(persona:string,dimensions:Record<string,number>,style:string,context:Context):Offer[]{
 const preferred:Record<string,RoleId[]>={explorer:['R2','R6'],builder:['R3','R4','R5'],strategist:['R1','R7','R5'],visionary:['R6','R1','R7']};
 return projects.map(project=>{
  const ranked=project.roleIds.map(id=>{
   const role=roles.find(r=>r.id===id)!;const capability=(dimensions[role.dimension]??0)>=role.min;
   const skill=context.skills.includes(role.skill);const domain=project.domain.includes(context.domain);
   const preference=preferred[persona]?.includes(id) || (style==='Solution builder'&&['R3','R4'].includes(id)) || (style==='Business Problem Owner'&&['R1','R7'].includes(id)) || (style==='Adoption champion'&&id==='R6') || (style==='AI adopter'&&id==='R6');
   const gaps=[...(!capability?['capability']:[]),...(!skill?['skill']:[]),...(!domain?['domain']:[]),...(context.hours<2?['availability']:[])];
   return {projectId:project.id,roleId:id,eligible:gaps.length===0,reasons:[...(capability?['capability']:[]),...(skill?['skill']:[]),...(domain?['domain']:[]),...(preference?['preference']:[])],gaps,rank:Number(capability)*4+Number(skill)*3+Number(domain)*3+Number(preference)};
  }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.rank-a.rank);
  return ranked[0];
 }).sort((a,b)=>Number(b.eligible)-Number(a.eligible)||b.rank-a.rank);
}
export type Outcome={deliverable:string;baseline:number;after:number;volume:number;evidence:string;quality:string;status:'draft'|'submitted'|'validated';validator?:string};
export type Assignment={approval?:Approval;approvalReason?:string;decisionDate?:string;projectOwner?:string;delivery?:Delivery;benefit?:Benefit;response:'accepted'|'declined';roleId:RoleId;confirmed:boolean;manager?:string;outcome?:Outcome};
export type PocRecord={capacity?:{hours:number;confirmedBy:string;updated:string};development?:DevelopmentProgress;employeeName?:string;id:string;created:string;persona:string;dimensions:Record<string,number>;style:string;reviewRequired:boolean;reflection:string;department:string;job:string;context:Context;learning:Record<string,boolean>;assignments:Record<string,Assignment>;review?:{persona:PersonaId;reason:string;reviewer:string}};
export function hoursSaved(o:Pick<Outcome,'baseline'|'after'|'volume'>){if(![o.baseline,o.after,o.volume].every(n=>Number.isFinite(n)&&n>=0))return null;return (o.baseline-o.after)*o.volume/60;}
export function canValidate(a:Assignment){const o=a.outcome;return !!(a.confirmed&&o?.status==='submitted'&&o.deliverable.trim()&&o.evidence.trim()&&o.quality.trim()&&o.volume>0&&o.baseline>0&&hoursSaved(o)!==null);}
export function learningPlan(offer:Offer|undefined,dimensions:Record<string,number>,lang:'EN'|'BM'){
 const weak=Object.entries(dimensions).filter(([k])=>k!=='growthAspiration').sort((a,b)=>a[1]-b[1])[0]?.[0];
 const focus:Record<string,LocalText>={aiExposure:t('AI foundations and safe use','Asas AI dan penggunaan selamat'),aiApplication:t('Practical AI workflows','Aliran kerja AI praktikal'),criticalJudgement:t('Output validation and responsible AI','Pengesahan output dan AI bertanggungjawab'),aiProblemSolving:t('Problem framing and success measures','Takrif masalah dan ukuran kejayaan')};
 const role=roles.find(r=>r.id===offer?.roleId);const project=projects.find(p=>p.id===offer?.projectId);
 const topic=(focus[weak]??focus.criticalJudgement)[lang];
 return [{id:'learn:'+weak,title:t('Learn','Belajar')[lang],text:topic}, {id:'practice:'+offer?.roleId,title:t('Practise','Berlatih')[lang],text:role?.task[lang]??t('Try a small task with a mentor.','Cuba tugasan kecil bersama pembimbing.')[lang]}, {id:'demonstrate:'+offer?.projectId+':'+offer?.roleId,title:t('Demonstrate','Buktikan')[lang],text:project?.quality[lang]??t('Check the outcome and record evidence.','Semak hasil dan rekod bukti.')[lang]}];
}

export type Approval='pending'|'approved'|'rejected';
export type Delivery='not-assigned'|'assigned'|'in-progress'|'completed';
export type BenefitCategory='cost-avoidance'|'cost-saving'|'productivity'|'internalisation';
export type Benefit={category:BenefitCategory;description:string;amount:number;unit:'RM'|'hours'|'outputs';period:string;evidence:string;owner:string;status:'proposed'|'submitted'|'validated';validator?:string};
export const benefitNames:Record<BenefitCategory,LocalText>={'cost-avoidance':t('Cost avoidance','Pengelakan kos'),'cost-saving':t('Cost saving','Penjimatan kos'),productivity:t('Productivity gain','Peningkatan produktiviti'),internalisation:t('Internalisation gain','Peningkatan keupayaan dalaman')};
export function approvalOf(a:Assignment):Approval{return a.approval??(a.confirmed?'approved':'pending');}
export function deliveryOf(a:Assignment):Delivery{return a.delivery??(a.confirmed?'assigned':'not-assigned');}
export function approveAssignment(a:Assignment,decision:'approved'|'rejected',supervisor:string,reason:string):Assignment{
 if(a.response!=='accepted'||approvalOf(a)!=='pending'||!supervisor.trim()||!reason.trim())throw Error('Acceptance and a named supervisor decision with a reason are required.');
 return {...a,approval:decision,manager:supervisor.trim(),approvalReason:reason.trim(),decisionDate:new Date().toISOString(),confirmed:false,delivery:'not-assigned'};
}
export function progressAssignment(a:Assignment,next:Delivery):Assignment{
 const order:Delivery[]=['not-assigned','assigned','in-progress','completed'];
 if(a.response!=='accepted'||approvalOf(a)!=='approved'||order.indexOf(next)!==order.indexOf(deliveryOf(a))+1)throw Error('Supervisor approval and sequential assignment progression are required.');
 return {...a,confirmed:true,delivery:next};
}
export function confirmProjectAssignment(a:Assignment,projectOwner:string,capacityHours:number):Assignment{
 if(!projectOwner.trim()||!Number.isFinite(capacityHours)||capacityHours<=0||capacityHours>40)throw Error('A named project owner and confirmed available capacity are required.');
 return {...progressAssignment(a,'assigned'),projectOwner:projectOwner.trim()};
}
export function validBenefit(b:Benefit){return Number.isFinite(b.amount)&&b.amount>0&&!!b.description.trim()&&!!b.period.trim()&&!!b.evidence.trim()&&!!b.owner.trim()&&(['cost-avoidance','cost-saving'].includes(b.category)?b.unit==='RM':b.unit!=='RM');}
export function validateBenefit(a:Assignment,validator:string):Assignment{
 if(deliveryOf(a)!=='completed'||approvalOf(a)!=='approved'||!a.benefit||a.benefit.status!=='submitted'||!validBenefit(a.benefit)||!validator.trim())throw Error('Completed assignment, submitted benefit evidence and validator are required.');
 return {...a,benefit:{...a.benefit,status:'validated',validator:validator.trim()}};
}
export function recommendedOffers(record:PocRecord):Offer[]{
 const persona=record.review?.persona??record.persona;
 const preferences:Record<string,RoleId[]>={explorer:['R6','R2'],builder:['R3','R4','R5'],strategist:['R1','R7','R5'],visionary:['R6','R1','R7']};
 const styleRoles:Record<string,RoleId[]>={A:['R6','R2'],B:['R3','R4'],C:['R1','R7'],D:['R6','R1']};
 return projects.map(p=>{
  const ranked=p.roleIds.map(roleId=>{const role=roles.find(r=>r.id===roleId)!;const capability=(record.dimensions[role.dimension]??0)>=role.min;
   const pref=preferences[persona]?.indexOf(roleId)??-1;const style=styleRoles[record.style]?.includes(roleId)??false;
   const domain=p.domain.includes(record.context.domain);const rank=(pref<0?0:4-pref)+Number(style)*2+Number(capability)*3+Number(domain);
   return {projectId:p.id,roleId,rank,eligible:false,reasons:[...(pref>=0||style?['preference']:[]),...(capability?['capability']:[]),...(domain?['domain']:[])],gaps:[...(!capability?['capability']:[]),'supervisor-validation']};
  }).sort((a,b)=>b.rank-a.rank);return ranked[0];
 }).sort((a,b)=>b.rank-a.rank);
}
export function personalisedPlan(record:PocRecord,offer:Offer|undefined,lang:'EN'|'BM'){
 // Reflection informs development focus; it does not prove competence or change scores.
 const reflection=record.reflection.toLowerCase();
 const governance=/governance|risk|privacy|verify|validation|tadbir|risiko|privasi|sahkan/.test(reflection);
 const plan=learningPlan(offer,governance?{...record.dimensions,criticalJudgement:0}:record.dimensions,lang);
 if(record.reviewRequired&&!record.review)plan[1]={...plan[1],text:t('Complete a mentor-supported task and discuss your reflection.','Lengkapkan tugasan dengan pembimbing dan bincangkan refleksi anda.')[lang]};
 return plan;
}
