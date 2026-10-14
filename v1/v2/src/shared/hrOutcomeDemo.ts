import {projects,type PocRecord,type BenefitCategory} from './poc';

// Read-only project-level benefit illustration, linked to the deployment cohort.
// Each project/category is recorded once; amounts are never employee benefits.
export function hrOutcomeDemo(records:PocRecord[]):PocRecord[]{
 const positions=new Map<string,number>();
 const categories:BenefitCategory[]=['cost-avoidance','cost-saving','productivity','internalisation'];
 const values=[
  [115000,200000,2600,52],[60000,65000,1200,24],
  [55000,60000,1500,30],[50000,55000,1100,22],
  [45000,50000,1000,20],[40000,45000,900,18],
  [45000,35000,800,16],[35000,20000,700,14]
 ];
 const descriptions=[
  'Illustrative approved external spend avoided against the planned baseline.',
  'Illustrative reduction in existing expenditure against the comparable baseline.',
  'Illustrative task time reduced × processed volume; released capacity, not cash saving.',
  'Illustrative reusable outputs delivered internally instead of external delivery.'
 ];
 return records.map(record=>({...record,assignments:Object.fromEntries(Object.entries(record.assignments).map(([id,a])=>{
  if(a.delivery!=='completed')return [id,a];
  const position=positions.get(id)??0;positions.set(id,position+1);
  const projectIndex=projects.findIndex(p=>p.id===id);
  if(position>=4||projectIndex<0)return [id,a];
  return [id,{...a,benefit:{category:categories[position],description:descriptions[position],
   amount:values[projectIndex][position],unit:position<2?'RM':position===2?'hours':'outputs',
   period:'Oct 2026',evidence:`POC sample · ${projects[projectIndex].name} · ${categories[position]} baseline and outcome reference`,
   owner:'POC project owner',status:'validated',validator:'POC benefit reviewer'}}];
 }))}));
}
