import {useId} from 'react';
import {Area,AreaChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import type {Lang} from '../i18n';

export default function AssessmentTrendChart({months,lang,mode='cumulative'}:{months:{month:string;count:number;cumulative:number}[];lang:Lang;mode?:'monthly'|'cumulative'}){
 const gradient=useId();const monthly=mode==='monthly';const total=months.reduce((sum,m)=>sum+m.count,0);const latest=months.at(-1);
 const label=(month:string)=>new Date(month+'-01T00:00:00Z').toLocaleDateString(lang==='BM'?'ms-MY':'en-MY',{month:'short',timeZone:'UTC'});
 const title=monthly?(lang==='BM'?'Penilaian selesai bulanan':'Monthly completed assessments'):(lang==='BM'?'Penilaian kumulatif':'Cumulative assessments');
 return <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/10 to-background/50 p-3">
  <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-2"><div><p className="text-xs text-muted-foreground">{lang==='BM'?'Jumlah tempoh dipaparkan':'Total for displayed period'}</p><p className="mt-1 text-3xl font-black text-primary">{total.toLocaleString()}</p></div>{latest&&<p className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">+{latest.count.toLocaleString()} · {label(latest.month)} {latest.month.slice(0,4)}</p>}</div>
  <div className="h-64 min-w-0 w-full" role="img" aria-label={title+'; '+(lang==='BM'?'nilai tepat dalam jadual.':'exact figures in the table.')}>
   <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{width:320,height:256}}><AreaChart data={months} margin={{top:12,right:12,bottom:10,left:0}} accessibilityLayer>
    <defs><linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02}/></linearGradient></defs>
    <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.2)"/>
    <XAxis dataKey="month" tickFormatter={label} tick={{fill:'#94a3b8',fontSize:12}} minTickGap={12} axisLine={false} tickLine={false}/>
    <YAxis allowDecimals={false} width={46} tick={{fill:'#94a3b8',fontSize:12}} axisLine={false} tickLine={false}/>
    <Tooltip labelFormatter={value=>label(String(value))+' '+String(value).slice(0,4)} formatter={value=>[Number(value).toLocaleString(),title]} contentStyle={{background:'#0b1424',border:'1px solid #243954',borderRadius:12,color:'#f3f6fc'}}/>
    <Area type="linear" dataKey={monthly?'count':'cumulative'} stroke="hsl(var(--primary))" strokeWidth={3} fill={`url(#${gradient})`} dot={{r:3,fill:'hsl(var(--primary))'}} activeDot={{r:5}} isAnimationActive={false}/>
   </AreaChart></ResponsiveContainer>
  </div>
 </div>;
}
