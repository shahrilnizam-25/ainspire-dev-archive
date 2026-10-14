export type OpenQuestion = {
  id: number;
  text: string;
  placeholder: string;
};

export const openQuestion: OpenQuestion = {
  id: 6,
  text: "In your own words, what does AI mean for your role at Telekom Malaysia, and where do you want to take your AI journey?",
  placeholder: "Share your thoughts openly — this is the most important part of the assessment…",
};

export type Option = {
  id: string; // 'A', 'B', 'C', 'D'
  text: string;
  personaId: 'explorer' | 'builder' | 'strategist' | 'visionary';
};

export type Question = {
  id: number;
  text: string;
  options: Option[];
};

export const questions: Question[] = [
  {
    id: 1,
    text: "How do you currently engage with AI tools in your daily work?",
    options: [
      { id: "A", text: "I occasionally try out AI tools when I hear about them", personaId: "explorer" },
      { id: "B", text: "I actively build or integrate AI into systems and workflows", personaId: "builder" },
      { id: "C", text: "I lead or plan AI-related projects and initiatives", personaId: "strategist" },
      { id: "D", text: "I shape the long-term AI direction for my organization", personaId: "visionary" }
    ]
  },
  {
    id: 2,
    text: "What best describes your AI knowledge level?",
    options: [
      { id: "A", text: "I understand AI concepts at a general level", personaId: "explorer" },
      { id: "B", text: "I can technically implement or configure AI models and systems", personaId: "builder" },
      { id: "C", text: "I understand how AI creates business value and drives strategy", personaId: "strategist" },
      { id: "D", text: "I influence AI policy, thought leadership, and industry direction", personaId: "visionary" }
    ]
  },
  {
    id: 3,
    text: "When your team faces a challenge, what is your natural role with AI?",
    options: [
      { id: "A", text: "I explore and experiment — finding AI tools that might help", personaId: "explorer" },
      { id: "B", text: "I develop the technical solution using AI", personaId: "builder" },
      { id: "C", text: "I define the strategy and ensure alignment with business goals", personaId: "strategist" },
      { id: "D", text: "I inspire others with a transformative vision of what AI can achieve", personaId: "visionary" }
    ]
  },
  {
    id: 4,
    text: "What motivates you most about AI at Telekom Malaysia?",
    options: [
      { id: "A", text: "Discovering new possibilities and staying curious about AI", personaId: "explorer" },
      { id: "B", text: "Building impactful AI-powered products and services", personaId: "builder" },
      { id: "C", text: "Driving measurable business outcomes through AI initiatives", personaId: "strategist" },
      { id: "D", text: "Leading TM's transformation into an AI-first organization", personaId: "visionary" }
    ]
  },
  {
    id: 5,
    text: "How do you typically learn about AI?",
    options: [
      { id: "A", text: "I explore tutorials, demos, and articles at my own pace", personaId: "explorer" },
      { id: "B", text: "I dive into technical courses, frameworks, and hands-on projects", personaId: "builder" },
      { id: "C", text: "I study AI's strategic and business impact through case studies", personaId: "strategist" },
      { id: "D", text: "I engage with industry leaders and shape future AI narratives", personaId: "visionary" }
    ]
  }
];
