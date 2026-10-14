type Recommendation = {title:string;description:string;videoUrl?:string;videoTitle?:string;thumbnailUrl?:string;channelTitle?:string;videoSource?:string};
// Video IDs verified against Microsoft's official beginner curriculum and Google Cloud's channel.
const videos = {
 foundations:{id:'lFXQkBvEe0o',title:'Introduction to Generative AI and Large Language Models',channel:'Microsoft Developer'},
 prompting:{id:'GElCu2kUlRs',title:'Prompt Engineering Fundamentals',channel:'Microsoft Developer'},
 responsible:{id:'w_3L1Bf2P_g',title:'Introduction to Responsible AI',channel:'Google Cloud'},
 practice:{id:'BAjzkaCdRok',title:'Creating Advanced Prompts',channel:'Microsoft Developer'},
 evaluation:{id:'KIRUeDKscfI',title:'Exploring and Comparing Different LLMs',channel:'Microsoft Developer'},
 building:{id:'0Y5Luf5sRQA',title:'Building Text Generation Applications',channel:'Microsoft Developer'},
 agents:{id:'yAXVW-lUINc',title:'AI Agents',channel:'Microsoft Developer'},
};
type Topic=keyof typeof videos;
function topics(title:string):Topic[]{
 const text=title.toLowerCase();
 if(/safe|responsib|governance|risk|selamat|bertanggungjawab|tadbir|risiko/.test(text))return ['responsible','evaluation'];
 if(/peer|rakan|review|feedback/.test(text))return ['practice','evaluation'];
 if(/test|evaluat|compar|penilaian|pengujian/.test(text))return ['evaluation','responsible'];
 if(/integrat|protot|build|bina/.test(text))return ['building','agents'];
 if(/prompt/.test(text))return ['prompting','practice'];
 if(/practical|task|workflow|tugasan|latihan|praktikal/.test(text))return ['prompting','practice'];
 if(/foundation|introduction|asas|pengenalan/.test(text))return ['foundations','prompting'];
 if(/problem|use.case|discovery|masalah|kes penggunaan/.test(text))return ['foundations','evaluation'];
 return [];
}
export function withLearningResources<T extends Recommendation>(recommendations:T[],persona:string){
 const used=new Set<string>();
 return recommendations.map(rec=>{
  let videoUrl=rec.videoUrl;let videoTitle=rec.videoTitle??rec.title;let thumbnailUrl=rec.thumbnailUrl;let channelTitle=rec.channelTitle;let videoSource=rec.videoSource;
  let videoLinkKind:'video'|'search'='video';
  if(!videoUrl||used.has(videoUrl)){
   const topic=topics(rec.title).find(key=>!used.has('https://www.youtube.com/watch?v='+videos[key].id));
   if(topic){const v=videos[topic];videoUrl='https://www.youtube.com/watch?v='+v.id;videoTitle=v.title;thumbnailUrl='/api/youtube-thumbnail/'+v.id;channelTitle=v.channel;videoSource='curated';}
   else {const query=rec.title+' '+persona+' AI learning tutorial';videoUrl='https://www.youtube.com/results?search_query='+encodeURIComponent(query);if(used.has(videoUrl))videoUrl+='&sp=EgIQAQ%253D%253D';videoTitle=rec.title;thumbnailUrl=undefined;channelTitle='YouTube';videoSource='topic-search';videoLinkKind='search';}
  }
  used.add(videoUrl);
  return {...rec,videoUrl,videoTitle,thumbnailUrl,channelTitle,videoSource,videoLinkKind};
 });
}
