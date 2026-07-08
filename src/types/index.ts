export type StarType = 'book' | 'experience' | 'question';

export interface StarNode {
  id: string;
  type: StarType;
  title: string;
  description?: string;
  date?: string;
  // Physics state (mutated in place by simulation)
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Visual state
  hi: number;
  hiTarget: number;
  phase: number;
  ripple: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface AISuggestion {
  type: 'book' | 'experience' | 'question';
  title: string;
  reason: string;
}

export interface AIResult {
  suggestions: AISuggestion[];
  nextQuestion: string;
}

export const NODE_COLOR: Record<StarType, string> = {
  book: '#7B68EE',
  experience: '#10D9A0',
  question: '#FFD700',
};

export const NODE_ICON: Record<StarType, string> = {
  book: '📚',
  experience: '🌱',
  question: '✨',
};

export const NODE_LABEL: Record<StarType, string> = {
  book: '本',
  experience: '経験',
  question: '問い',
};
