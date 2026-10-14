import {approvalOf,deliveryOf,validBenefit,type Assignment,type PocRecord} from './poc';
export function contributionStatistics(record:Pick<PocRecord,'assignments'>){
 const interested=Object.values(record.assignments).filter(a=>a.response==='accepted');
 const assigned=interested.filter(a=>approvalOf(a)==='approved'&&a.confirmed&&deliveryOf(a)!=='not-assigned');
 return {interest:interested.length,pending:interested.filter(a=>approvalOf(a)==='pending').length,assigned:assigned.length,completed:assigned.filter(a=>deliveryOf(a)==='completed').length};
}
export function validatedContributionBenefit(a:Assignment){
 return a.response==='accepted'&&approvalOf(a)==='approved'&&a.confirmed&&deliveryOf(a)==='completed'&&a.benefit?.status==='validated'&&validBenefit(a.benefit)?a.benefit:undefined;
}
