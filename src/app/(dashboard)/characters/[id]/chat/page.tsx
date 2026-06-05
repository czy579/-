'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ChatWindow } from '@/components/chat/ChatWindow';
import type { Character, Conversation } from '@/types/database';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [intimacyScore, setIntimacyScore] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const characterId = params.id as string;

  useEffect(() => {
    const initChat = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }

        // 通过服务端 API 获取角色信息
        const charRes = await fetch(`/api/characters?userId=${user.id}&id=${characterId}`);
        if (!charRes.ok) {
          const errData = await charRes.json().catch(() => ({}));
          setError(errData.error || '角色不存在');
          return;
        }
        const charData = await charRes.json();
        setCharacter(charData as Character);

        // 查找或创建对话（通过服务端 API）
        const convRes = await fetch(`/api/conversations?userId=${user.id}&characterId=${characterId}`);
        if (!convRes.ok) {
          const errData = await convRes.json().catch(() => ({}));
          throw new Error(errData.error || '获取对话失败');
        }
        const existingConv = await convRes.json();

        if (existingConv && existingConv.id) {
          const conv = existingConv as unknown as Conversation;
          setConversationId(conv.id);
          setIntimacyScore(conv.intimacy_level);
        } else {
          // 创建新对话
          const createRes = await fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              character_id: characterId,
            }),
          });
          if (!createRes.ok) {
            const errData = await createRes.json().catch(() => ({}));
            throw new Error(errData.error || '创建对话失败');
          }
          const newConv = await createRes.json();
          const conv = newConv as unknown as Conversation;
          setConversationId(conv.id);
          setIntimacyScore(0);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Chat init error:', msg);
        setError(msg || '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    initChat();
  }, [characterId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">准备聊天室...</p>
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">😔</div>
          <h2 className="text-xl font-semibold text-white mb-2">出错了</h2>
          <p className="text-gray-400 mb-4">{error || '角色不存在'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  if (!conversationId) return null;

  return (
    <div className="h-[calc(100vh-4rem)] chat-gradient">
      <ChatWindow
        character={character}
        conversationId={conversationId}
        initialIntimacyScore={intimacyScore}
      />
    </div>
  );
}
