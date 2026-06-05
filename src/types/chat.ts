import type { Message } from './database';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;
}

export interface IntimacyInfo {
  level: number;
  score: number;
  nextLevelScore: number;
  title: string;
}

export const INTIMACY_TITLES: Record<number, string> = {
  0: '陌生人',
  1: '初识',
  2: '熟悉',
  3: '朋友',
  4: '好友',
  5: '知己',
  6: '亲密',
  7: '挚友',
  8: '恋人',
  9: '灵魂伴侣',
  10: '永恒',
};

export const INTIMACY_LEVEL_SCORES: Record<number, number> = {
  0: 0,
  1: 100,
  2: 300,
  3: 600,
  4: 1000,
  5: 1500,
  6: 2200,
  7: 3000,
  8: 4000,
  9: 5200,
  10: 7000,
};

export function getIntimacyInfo(score: number): IntimacyInfo {
  const levels = Object.entries(INTIMACY_LEVEL_SCORES)
    .map(([level, minScore]) => ({ level: Number(level), minScore }))
    .sort((a, b) => b.level - a.level);

  const currentLevel = levels.find((l) => score >= l.minScore)?.level ?? 0;
  const currentMinScore = INTIMACY_LEVEL_SCORES[currentLevel];
  const nextMinScore = INTIMACY_LEVEL_SCORES[currentLevel + 1] ?? currentMinScore + 1000;

  return {
    level: currentLevel,
    score,
    nextLevelScore: nextMinScore,
    title: INTIMACY_TITLES[currentLevel],
  };
}
