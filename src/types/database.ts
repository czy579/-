// Supabase 数据库类型定义

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id'>>;
      };
      characters: {
        Row: Character;
        Insert: Omit<Character, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Character, 'id'>>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Conversation, 'id'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'created_at'>;
        Update: Partial<Omit<Message, 'id'>>;
      };
      memories: {
        Row: Memory;
        Insert: Omit<Memory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Memory, 'id'>>;
      };
      intimacy_levels: {
        Row: IntimacyLevel;
        Insert: Omit<IntimacyLevel, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IntimacyLevel, 'id'>>;
      };
    };
  };
}

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  gender: 'male' | 'female';
  avatar_url: string | null;
  personality: PersonalityType;
  description: string;
  greeting_message: string;
  background_story: string | null;
  traits: string[];
  interests: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export type PersonalityType =
  | 'gentle'      // 温柔型
  | 'cheerful'    // 开朗型
  | 'cold'        // 高冷型
  | 'tsundere'    // 傲娇型
  | 'mature'      // 成熟型
  | 'playful'     // 调皮型
  | 'caring'      // 关怀型
  | 'mysterious'; // 神秘型

export interface Conversation {
  id: string;
  user_id: string;
  character_id: string;
  is_active: boolean;
  intimacy_level: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Json | null;
  created_at: string;
}

export interface Memory {
  id: string;
  character_id: string;
  user_id: string;
  content: string;
  summary: string;
  importance: number; // 1-10, 越高越重要
  category: MemoryCategory;
  embedding: number[] | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export type MemoryCategory =
  | 'fact'        // 事实信息
  | 'preference'  // 偏好
  | 'experience'  // 共同经历
  | 'emotion'     // 情感
  | 'promise';    // 承诺

export interface IntimacyLevel {
  id: string;
  conversation_id: string;
  level: number;
  score: number;
  title: string;
  created_at: string;
  updated_at: string;
}
