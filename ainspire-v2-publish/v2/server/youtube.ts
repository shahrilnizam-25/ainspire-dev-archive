import { dimensionLabelsByLang, type AssessmentAnswer } from '../src/data/assessment';
export type LearningVideo = { title: string; description: string; videoTitle: string; videoUrl: string; thumbnailUrl: string; channelTitle: string; relevanceStatement: string; videoSource: 'curated' | 'youtube-api'; searchQuery: string; searchUrl: string; searchStatus: 'live' | 'curated-no-key' | 'curated-fallback' };
const CURATED = {
 foundations: {id:'G2fqAlgmoPo',title:'Introduction to Generative AI',channel:'Google Cloud Tech'},
 prompting: {id:'GElCu2kUlRs',title:'Prompt Engineering Fundamentals',channel:'Microsoft Developer'},
 building: {id:'0Y5Luf5sRQA',title:'Building Text Generation Applications',channel:'Microsoft Developer'},
 overview: {id:'k7HaeJs-N-o',title:'Generative AI for Beginners — Full Series',channel:'Microsoft Developer'},
};
// Source-verified links: Google Cloud Tech and Microsoft's official course repository.
const TOPICS: Record<string,string> = {aiExposure:'AI basics',aiApplication:'AI workflows',criticalJudgement:'responsible AI',aiProblemSolving:'AI use case',growthAspiration:'AI learning'};
type ContextRule = { pattern: RegExp; query: string; matches: string[]; dimensions: string[]; minMatches?: number };
const TECHNICAL_DIMENSIONS = ['aiApplication','aiProblemSolving','criticalJudgement','aiExposure'];
const BUSINESS_DIMENSIONS = ['criticalJudgement','aiProblemSolving','aiApplication','aiExposure'];
const DOMAIN_CONTEXTS: ContextRule[] = [
 {pattern:/group it|digital|\bgitd\b/i,query:'AI-assisted coding software development code review',matches:['software','developer','engineering','programming','code','coding','spec-driven'],dimensions:TECHNICAL_DIMENSIONS},
 {pattern:/human capital|\bghcm\b/i,query:'AI in HR human resources talent acquisition workforce planning',matches:['HR','copilot','tools','human resources','talent','recruiting','recruitment','workforce planning','employee relations'],dimensions:BUSINESS_DIMENSIONS,minMatches:2},
 {pattern:/finance|\bgf\b/i,query:'AI in finance FP&A forecasting financial analysis risk',matches:['finance','financial','forecasting','FP&A','risk analysis'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/network|\bgnt\b/i,query:'network engineering operations',matches:['network','infrastructure','engineering','operations'],dimensions:TECHNICAL_DIMENSIONS},
 {pattern:/information security|\bgis\b/i,query:'cybersecurity information security',matches:['cybersecurity','security','information security','risk'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/procurement|\bgp\b/i,query:'procurement supply chain',matches:['procurement','supply chain','sourcing'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/internal audit|\bgia\b/i,query:'internal audit risk assurance',matches:['audit','risk','assurance','compliance'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/legal|intellectual property|\blsip\b/i,query:'legal compliance intellectual property',matches:['legal','compliance','intellectual property','contract'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/strategy|\bgs\b/i,query:'business strategy planning',matches:['business','strategy','planning','value'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/unifi|tm one|tm global/i,query:'telecommunications customer experience',matches:['telecommunications','customer','service','product'],dimensions:BUSINESS_DIMENSIONS},
];
const ROLE_CONTEXTS: ContextRule[] = [
 {pattern:/software engineer|software developer|programmer|architect/i,query:'AI-assisted coding spec-driven development software engineer code review',matches:['software','developer','engineering','programming','code','coding','spec-driven'],dimensions:TECHNICAL_DIMENSIONS},
 {pattern:/hr business partner|\bhrbp\b|human resources business partner|people partner/i,query:'AI tools for HR business partners daily work recruiting employee relations talent management',matches:['HR','copilot','tools','human resources','recruiting','recruitment','employee relations','workforce planning','talent acquisition','daily work'],dimensions:BUSINESS_DIMENSIONS,minMatches:2},
 {pattern:/finance ba|finance business analyst|financial business analyst|finance analyst|financial analyst/i,query:'AI in finance for business leaders FP&A forecasting financial analysis decision support',matches:['finance','financial','forecasting','FP&A','business leaders','financial analysis'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/software|developer|engineer|programmer|architect/i,query:'AI coding software engineering developer tools',matches:['software','developer','engineering','programming','code','coding','spec-driven'],dimensions:TECHNICAL_DIMENSIONS},
 {pattern:/human resources|human capital|\bhr\b|people|talent|recruit/i,query:'AI for HR recruiting employee development',matches:['HR','human resources','talent','recruitment','workforce planning','employee relations'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/finance|financial|account|treasury|audit|risk/i,query:'AI for finance forecasting risk analysis',matches:['finance','financial','accounting','forecasting','risk','audit'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/network|infrastructure|systems|service desk|operations/i,query:'IT systems operations',matches:['network','infrastructure','systems','operations'],dimensions:TECHNICAL_DIMENSIONS},
 {pattern:/security|cyber/i,query:'cybersecurity security operations',matches:['cybersecurity','security','risk'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/procurement|buyer|sourcing/i,query:'procurement supply chain',matches:['procurement','supply chain','sourcing'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/legal|contract|compliance/i,query:'legal compliance',matches:['legal','contract','compliance'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/customer|sales|marketing|product/i,query:'customer experience product',matches:['customer','sales','marketing','product'],dimensions:BUSINESS_DIMENSIONS},
 {pattern:/business analyst|strategy|planner/i,query:'business analysis strategy',matches:['business','analysis','strategy','planning'],dimensions:BUSINESS_DIMENSIONS},
];
function searchContext(role = '', department = '') {
 const domain = DOMAIN_CONTEXTS.find(rule=>rule.pattern.test(department));
 const job = ROLE_CONTEXTS.find(rule=>rule.pattern.test(role));
 const fallbackRole = role.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(word=>word.length>2&&!['senior','junior','lead','manager','officer','executive'].includes(word)).slice(0,4);
  const query = [...new Set(`${job?.query??domain?.query??fallbackRole.join(' ')}`.toLowerCase().split(/\s+/).filter(Boolean))].slice(0,14).join(' ');
 return { query, matches:[...new Set([...(domain?.matches??[]),...(job?.matches??fallbackRole)])], dimensions:job?.dimensions??domain?.dimensions??['aiProblemSolving','aiApplication','criticalJudgement','aiExposure'], minMatches:Math.max(job?.minMatches??1,domain?.minMatches??1) };
}
function card(id:string,title:string,channel:string,description:string,source:'curated'|'youtube-api',query:string,status:LearningVideo['searchStatus']):LearningVideo {return {title,description,videoTitle:title,videoUrl:`https://www.youtube.com/watch?v=${id}`,thumbnailUrl:`/api/youtube-thumbnail/${id}`,channelTitle:channel,relevanceStatement:description,videoSource:source,searchQuery:query,searchUrl:`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,searchStatus:status};}
export async function getLearningVideos(persona:string,answers:AssessmentAnswer[],lang:'EN'|'BM',context?:{role?:string;department?:string}):Promise<LearningVideo[]> {
 const bm=lang==='BM';const contextSearch=searchContext(context?.role,context?.department);const priority=new Map(contextSearch.dimensions.map((dimension,index)=>[dimension,index]));const weak=answers.filter(a=>a.dimension!=='aiContributionStyle' && a.dimension!=='growthAspiration').sort((a,b)=>a.score-b.score||(priority.get(a.dimension)??99)-(priority.get(b.dimension)??99)).slice(0,2);
 const focus=weak.map(a=>dimensionLabelsByLang[lang][a.dimension]).join(' + ');
 const role=context?.role?.trim();const department=context?.department?.trim();const roleAndDomain=[role,department].filter(Boolean).join(' · ');
 const reason=bm ? `Fokus pembelajaran: ${focus}. Dipilih untuk menyokong dimensi keupayaan dengan skor terendah anda${roleAndDomain?` bagi ${roleAndDomain}`:''}.` : `Learning focus: ${focus}. Selected to support your lowest-scoring capability dimensions${roleAndDomain?` for ${roleAndDomain}`:''}.`;
 const keys=[process.env.YOUTUBE_API_KEY,process.env.YOUTUBE_API_KEY_BACKUP].filter((k):k is string=>!!k);
 const query=`${contextSearch.query} ${TOPICS[weak[0]?.dimension]??'AI learning'}`.trim();
 for(const key of keys) {
  try {
    const params=new URLSearchParams({part:'snippet',type:'video',maxResults:'10',safeSearch:'strict',order:'relevance',videoEmbeddable:'true',videoSyndicated:'true',relevanceLanguage:'en',regionCode:'MY',q:query,key});
   const r=await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`,{signal:AbortSignal.timeout(4000)});if(!r.ok)continue;
    const data=await r.json() as {items?:Array<{id?:{videoId?:string};snippet?:{title?:string;description?:string;channelTitle?:string}}>};
    const aiRelevant=/\bAI\b|artificial intelligence|generative|machine learning|\bLLM\b|automation|ChatGPT|Claude|Gemini|Copilot/i;
    const ranked=(data.items??[]).flatMap((video,index)=>{const id=video.id?.videoId;const title=video.snippet?.title??'';return id&&/^[\w-]{11}$/.test(id)&&title&&aiRelevant.test(title)?[{index,score:contextSearch.matches.reduce((total,term)=>total+Number(title.toLowerCase().includes(term.toLowerCase())),0),result:card(id,title,video.snippet?.channelTitle??'YouTube',reason,'youtube-api',query,'live')}]:[];}).sort((a,b)=>b.score-a.score||a.index-b.index);
    const contextual=contextSearch.matches.length?ranked.filter(item=>item.score>=contextSearch.minMatches):[];
    const cards=(contextSearch.matches.length?contextual:ranked).map(item=>item.result);
    if(cards.length) return cards.slice(0,2);
  } catch { /* Use the next configured key, then curated resources. */ }
 }
 const resources=weak[0]?.dimension==='aiExposure'?[CURATED.foundations,CURATED.prompting]:persona==='builder'?[CURATED.prompting,CURATED.building]:persona==='explorer'?[CURATED.foundations,CURATED.prompting]:[CURATED.overview,CURATED.prompting];
 return resources.map(v=>card(v.id,v.title,v.channel,reason,'curated',query,keys.length?'curated-fallback':'curated-no-key'));
}
