import {roles,type PocRecord} from './poc';
import {readinessDimensions} from './divisionAnalytics';
import {workforceAnalytics} from './workforceAnalytics';

export function skillGapSummary(input:PocRecord[],roleId='all'){
 const records=workforceAnalytics(input).records;
 const role=roles.find(r=>r.id===roleId);
 const requirements=role?[{dimension:role.dimension,target:role.min}]:readinessDimensions.map(dimension=>({dimension,target:75}));
 const rows=requirements.map(({dimension,target})=>{
  const missing=(r:PocRecord)=>![25,50,75,100].includes(r.dimensions[dimension]);
  const clarification=records.filter(r=>missing(r)||(r.reviewRequired&&!r.review));
  const eligible=records.filter(r=>!missing(r)&&(!r.reviewRequired||!!r.review));
  const gaps=eligible.filter(r=>r.dimensions[dimension]<target);
  return {dimension,target,gaps,clarification,assessed:eligible.length,share:eligible.length?gaps.length/eligible.length*100:0};
 }).sort((a,b)=>b.gaps.length-a.gaps.length||a.dimension.localeCompare(b.dimension));
 return {total:records.length,role,rows,priority:rows.find(r=>r.gaps.length>0),clarification:new Set(rows.flatMap(r=>r.clarification.map(p=>p.id))).size};
}
