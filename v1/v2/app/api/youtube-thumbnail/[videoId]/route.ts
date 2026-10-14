export async function GET(_request:Request,{params}:{params:Promise<{videoId:string}>}) {
 const {videoId}=await params;if(!/^[\w-]{11}$/.test(videoId))return new Response('Invalid video ID',{status:400});
 try { const r=await fetch(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,{signal:AbortSignal.timeout(5000)});if(!r.ok)return new Response('Thumbnail unavailable',{status:404});return new Response(r.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=86400'}}); }catch{return new Response('Thumbnail unavailable',{status:502});}
}
