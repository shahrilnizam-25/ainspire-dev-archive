import { Compass, Cpu, Target, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Persona = {
  id: 'explorer' | 'builder' | 'strategist' | 'visionary';
  name: string;
  tagline: string;
  description: string;
  color: string;
  icon: LucideIcon;
};

export const personas: Record<string, Persona> = {
  explorer: {
    id: 'explorer',
    name: 'The AI Explorer',
    tagline: 'Curious. Adventurous. Always discovering.',
    description: "You approach AI with an open mind and a sense of wonder. You're the first to try new tools and share discoveries with your team. Your curiosity drives innovation — keep exploring, the next breakthrough might be yours.",
    color: '#00D4FF', // Cyan
    icon: Compass,
  },
  builder: {
    id: 'builder',
    name: 'The AI Builder',
    tagline: 'Technical. Hands-on. Building tomorrow.',
    description: "You don't just use AI — you create with it. Whether writing code, designing models, or integrating AI into systems, you turn ideas into reality. TM's AI future runs on builders like you.",
    color: '#4361EE', // Electric Blue
    icon: Cpu,
  },
  strategist: {
    id: 'strategist',
    name: 'The AI Strategist',
    tagline: 'Analytical. Decisive. Driving outcomes.',
    description: "You see AI as a powerful lever for business transformation. You connect technology to strategy, align teams, and ensure AI investments deliver real results. You're the bridge between vision and execution.",
    color: '#7B2FBE', // Purple
    icon: Target,
  },
  visionary: {
    id: 'visionary',
    name: 'The AI Visionary',
    tagline: 'Bold. Transformative. Shaping the future.',
    description: "You see what others don't yet see. You champion AI not just as a tool but as a force that will redefine Telekom Malaysia's role in the digital economy. Leaders like you make transformation possible.",
    color: '#FFB700', // Gold/Amber
    icon: Sparkles,
  }
};
