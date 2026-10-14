import {projects,roles,recommendedOffers,type PocRecord,type RoleId,type LocalText} from './poc';
const text=(EN:string,BM:string):LocalText=>({EN,BM});
export const contributionRoles={
 explorer:{definition:text('Gather evidence and practical insights to help teams understand an AI opportunity.','Kumpulkan bukti dan dapatan praktikal untuk membantu pasukan memahami peluang AI.'),name:text('Research & Insight Contributor','Penyumbang Penyelidikan & Dapatan'),reason:text('Your AI Explorer profile suggests a contribution through exploring opportunities, gathering insights and supported experimentation.','Profil AI Explorer anda mencadangkan sumbangan melalui penerokaan peluang, pengumpulan dapatan dan percubaan dengan sokongan.'),task:text('Explore use cases, gather domain information, try supported AI tasks and capture findings or feedback.','Teroka kes penggunaan, kumpul maklumat domain, cuba tugasan AI dengan sokongan dan rekod dapatan atau maklum balas.'),roleIds:['R2','R6'] as RoleId[]},
 builder:{definition:text('Turn defined requirements into working AI components and repeatable automation.','Tukarkan keperluan yang ditetapkan kepada komponen AI berfungsi dan automasi berulang.'),name:text('Development & Automation Contributor','Penyumbang Pembangunan & Automasi'),reason:text('Your AI Builder profile suggests a contribution through turning defined needs into practical AI components and automation.','Profil AI Builder anda mencadangkan sumbangan melalui pembangunan komponen AI praktikal dan automasi berdasarkan keperluan yang ditetapkan.'),task:text('Build a small prototype, integrate components, automate a defined task and test its behaviour.','Bina prototaip kecil, integrasikan komponen, automasikan tugasan yang ditetapkan dan uji kelakuannya.'),roleIds:['R3','R4','R5'] as RoleId[]},
 strategist:{definition:text('Connect a business problem with an actionable AI use case and clear measures of value.','Hubungkan masalah perniagaan dengan kes penggunaan AI yang boleh dilaksanakan dan ukuran nilai yang jelas.'),name:text('Use Case & Value Contributor','Penyumbang Kes Penggunaan & Nilai'),reason:text('Your AI Strategist profile suggests a contribution through connecting business needs with AI opportunities and measurable outcomes.','Profil AI Strategist anda mencadangkan sumbangan melalui hubungan antara keperluan perniagaan, peluang AI dan hasil yang boleh diukur.'),task:text('Define the business problem, scope the use case, establish success measures and evaluate expected benefits and risks.','Takrifkan masalah perniagaan, skop kes penggunaan, tetapkan ukuran kejayaan dan nilai manfaat serta risiko yang dijangka.'),roleIds:['R1','R7'] as RoleId[]},
 visionary:{definition:text('Help people and teams adopt useful AI practices and identify opportunities for broader reuse.','Bantu warga kerja dan pasukan mengamalkan AI yang berguna serta mengenal pasti peluang penggunaan semula yang lebih luas.'),name:text('Adoption & Transformation Contributor','Penyumbang Penggunaan & Transformasi'),reason:text('Your AI Visionary profile suggests a contribution through engaging people and supporting responsible adoption and broader reuse.','Profil AI Visionary anda mencadangkan sumbangan melalui penglibatan warga kerja, sokongan penggunaan bertanggungjawab dan penggunaan semula yang lebih luas.'),task:text('Communicate opportunities, engage stakeholders, support pilot adoption and identify opportunities for broader reuse.','Sampaikan peluang, libatkan pemegang kepentingan, sokong penggunaan rintis dan kenal pasti peluang penggunaan semula yang lebih luas.'),roleIds:['R6'] as RoleId[]},
};
export function primaryContributionRole(persona:string){return contributionRoles[persona as keyof typeof contributionRoles]??contributionRoles.explorer;}
// Keep the project catalogue and stored assignment IDs intact. These are employee-facing role families.
export function employeeProjectOffers(record:PocRecord){
 const primary=primaryContributionRole(record.review?.persona??record.persona);
 const legacy=recommendedOffers(record);
 return projects.map(project=>{
  const supported=project.roleIds.filter(id=>primary.roleIds.includes(id));
  if(!supported.length)return {...legacy.find(o=>o.projectId===project.id)!,primaryMatch:false};
  const options=supported.map(roleId=>{
   const role=roles.find(r=>r.id===roleId)!;
   const capability=(record.dimensions[role.dimension]??0)>=role.min;
   const domain=project.domain.includes(record.context.domain);
   return {projectId:project.id,roleId,eligible:false,primaryMatch:true,rank:Number(capability)*3+Number(domain)*2,reasons:['preference',...(capability?['capability']:[]),...(domain?['domain']:[])],gaps:[...(!capability?['capability']:[]),'supervisor-validation']};
  }).sort((a,b)=>b.rank-a.rank);
  return options[0];
 }).sort((a,b)=>Number(b.primaryMatch)-Number(a.primaryMatch)||b.rank-a.rank);
}
