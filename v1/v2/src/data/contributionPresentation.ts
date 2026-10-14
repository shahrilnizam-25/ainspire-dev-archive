import {SearchCheck,Braces,ClipboardList,Megaphone} from 'lucide-react';
export const contributionIcons={explorer:SearchCheck,builder:Braces,strategist:ClipboardList,visionary:Megaphone};
export function contributionIcon(persona:string){return contributionIcons[persona as keyof typeof contributionIcons]??SearchCheck;}
export const profileHeroLabel='text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground';
export const profileHeroTitle='mt-6 text-3xl font-black leading-tight sm:text-5xl';
