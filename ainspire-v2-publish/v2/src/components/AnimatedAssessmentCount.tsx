import {useEffect,useState} from 'react';
export default function AnimatedAssessmentCount({value}:{value:number}){
 const [display,setDisplay]=useState(value);
 useEffect(()=>{
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){setDisplay(value);return;}
  let frame=0;let started:number|undefined;
  setDisplay(0);
  const tick=(time:number)=>{started??=time;const progress=Math.min(1,(time-started)/1800);setDisplay(Math.round(value*(1-Math.pow(1-progress,3))));if(progress<1)frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[value]);
 return <span aria-label={value.toLocaleString()}><span aria-hidden="true">{display.toLocaleString()}</span></span>;
}
