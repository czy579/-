import { createClient } from '@/lib/supabase/client';
import type { Memory, MemoryCategory } from '@/types/database';

/**
 * 记忆管理器
 * 负责AI角色的长期记忆存储、检索和摘要
 */
export class MemoryManager {
  private userId: string;
  private characterId: string;

  constructor(userId: string, characterId: string) {
    this.userId = userId;
    this.characterId = characterId;
  }

  /**
   * 存储新记忆
   */
  async addMemory(params: {
    content: string;
    summary: string;
    importance: number;
    category: MemoryCategory;
  }): Promise<Memory> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('memories')
      .insert({
        character_id: this.characterId,
        user_id: this.userId,
        content: params.content,
        summary: params.summary,
        importance: params.importance,
        category: params.category,
      })
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Memory;
  }

  /**
   * 获取最近的记忆（用于上下文）
   */
  async getRecentMemories(limit: number = 10): Promise<Memory[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('character_id', this.characterId)
      .eq('user_id', this.userId)
      .eq('is_archived', false)
      .order('importance', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data ?? []) as unknown as Memory[];
  }

  /**
   * 获取重要记忆（高重要性）
   */
  async getImportantMemories(minImportance: number = 7): Promise<Memory[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('character_id', this.characterId)
      .eq('user_id', this.userId)
      .eq('is_archived', false)
      .gte('importance', minImportance)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Memory[];
  }

  /**
   * 按分类获取记忆
   */
  async getMemoriesByCategory(category: MemoryCategory): Promise<Memory[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('character_id', this.characterId)
      .eq('user_id', this.userId)
      .eq('category', category)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Memory[];
  }

  /**
   * 从对话内容中提取潜在记忆
   */
  extractMemoriesFromMessage(
    content: string,
    role: 'user' | 'assistant',
  ): Array<{
    content: string;
    summary: string;
    importance: number;
    category: MemoryCategory;
  }> {
    const memories: Array<{
      content: string;
      summary: string;
      importance: number;
      category: MemoryCategory;
    }> = [];

    if (role === 'user') {
      const factPatterns = [
        /(?:我叫|我是|我的名字叫)\s*(\S+)/,
        /(?:我住在|我在|我来自)\s*(\S+)/,
        /(?:我喜欢|我爱|我最喜欢的)\s*(.+?)[。，！？]/,
      ];

      for (const pattern of factPatterns) {
        const match = content.match(pattern);
        if (match) {
          memories.push({
            content: `用户提到：${match[0]}`,
            summary: match[0],
            importance: 7,
            category: 'fact' as MemoryCategory,
          });
        }
      }

      const emotionKeywords = [
        '开心', '难过', '伤心', '生气', '焦虑', '紧张',
        '兴奋', '疲惫', '感动', '害怕', '孤独', '幸福',
      ];
      for (const keyword of emotionKeywords) {
        if (content.includes(keyword)) {
          memories.push({
            content: `用户表达了${keyword}的情绪：${content.slice(0, 50)}`,
            summary: `用户感到${keyword}`,
            importance: 6,
            category: 'emotion' as MemoryCategory,
          });
          break;
        }
      }

      const preferencePatterns = [
        /(?:最喜欢|特别爱|超爱)\s*(.+?)[。，！？]/,
        /(?:讨厌|不喜欢|受不了)\s*(.+?)[。，！？]/,
      ];
      for (const pattern of preferencePatterns) {
        const match = content.match(pattern);
        if (match) {
          memories.push({
            content: `用户表达偏好：${match[0]}`,
            summary: match[0],
            importance: 8,
            category: 'preference' as MemoryCategory,
          });
        }
      }
    }

    return memories;
  }

  /**
   * 删除记忆
   */
  async deleteMemory(memoryId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('memories')
      .update({ is_archived: true })
      .eq('id', memoryId)
      .eq('user_id', this.userId);

    if (error) throw error;
  }
}
