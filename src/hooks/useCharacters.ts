'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Character } from '@/types/database';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCharacters([]);
        return;
      }

      // 通过服务端 API 获取角色列表（绕过 409 问题）
      const res = await fetch(`/api/characters?userId=${user.id}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }
      const data = await res.json();
      setCharacters(data as Character[]);
    } catch (err) {
      console.error('useCharacters error:', err);
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, []);

  const deleteCharacter = async (characterId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', characterId);

    if (!error) {
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    }
    return { error };
  };

  return { characters, isLoading, error, refresh: loadCharacters, deleteCharacter };
}
