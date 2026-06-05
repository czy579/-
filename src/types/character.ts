import type { PersonalityType } from './database';
export type { PersonalityType };

export interface CharacterFormData {
  name: string;
  gender: 'male' | 'female';
  personality: PersonalityType;
  description: string;
  greeting_message: string;
  background_story: string;
  traits: string[];
  interests: string[];
  avatar_url?: string;
  is_public: boolean;
}

export interface PersonalityOption {
  value: PersonalityType;
  label: string;
  description: string;
  emoji: string;
  color: string;
}

export const PERSONALITY_OPTIONS: PersonalityOption[] = [
  {
    value: 'gentle',
    label: '温柔型',
    description: '温柔体贴，善解人意，总是用温暖的话语关怀你',
    emoji: '🌸',
    color: 'text-pink-400',
  },
  {
    value: 'cheerful',
    label: '开朗型',
    description: '活泼开朗，充满正能量，总能带给你快乐',
    emoji: '☀️',
    color: 'text-yellow-400',
  },
  {
    value: 'cold',
    label: '高冷型',
    description: '外表冷漠，话不多但句句在点，需要慢慢打开心扉',
    emoji: '❄️',
    color: 'text-blue-300',
  },
  {
    value: 'tsundere',
    label: '傲娇型',
    description: '口是心非，嘴上不饶人但心里其实很在乎你',
    emoji: '😤',
    color: 'text-red-400',
  },
  {
    value: 'mature',
    label: '成熟型',
    description: '稳重可靠，阅历丰富，给你成熟的人生建议',
    emoji: '📚',
    color: 'text-purple-400',
  },
  {
    value: 'playful',
    label: '调皮型',
    description: '古灵精怪，爱开玩笑，和你一起欢乐不断',
    emoji: '😜',
    color: 'text-orange-400',
  },
  {
    value: 'caring',
    label: '关怀型',
    description: '细心周到，像家人一样无微不至地照顾你',
    emoji: '💕',
    color: 'text-rose-400',
  },
  {
    value: 'mysterious',
    label: '神秘型',
    description: '深不可测，充满神秘感，总有说不完的故事',
    emoji: '🌙',
    color: 'text-indigo-400',
  },
];
