import {Info} from 'lucide-react';
import {useId,useState} from 'react';

export default function MetricInfo({label,text}:{label:string;text:string}){
 const id=useId();const [open,setOpen]=useState(false);
 return <span className="relative inline-flex shrink-0 align-middle"><button type="button" aria-label={label+' · '+text} aria-expanded={open} aria-controls={id} aria-describedby={open?id:undefined} onClick={()=>setOpen(v=>!v)} onBlur={()=>setOpen(false)} onKeyDown={e=>{if(e.key==='Escape')setOpen(false);}} className="rounded p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Info size={16} aria-hidden="true"/></button><span id={id} role="tooltip" hidden={!open} className="pointer-events-none absolute right-0 bottom-full z-30 mb-2 w-56 max-w-[70vw] rounded-xl border border-primary/30 bg-card p-3 text-left text-xs font-normal leading-6 text-foreground shadow-xl">{text}</span></span>;
}
