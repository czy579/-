'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { IntimacyBar } from './IntimacyBar';
import { createClient } from '@/lib/supabase/client';
import { MemoryManager } from '@/lib/memory/vector-store';
import { getIntimacyInfo } from '@/types/chat';
import type { ChatMessage } from '@/types/chat';
import type { Character } from '@/types/database';

interface ChatWindowProps {
  character: Character;
  conversationId: string;
  initialIntimacyScore: number;
}

export function ChatWindow({
  character,
  conversationId,
  initialIntimacyScore,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [intimacyScore, setIntimacyScore] = useState(initialIntimacyScore);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // 加载历史消息（通过服务端 API）
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/messages?conversationId=${conversationId}`);
        if (!res.ok) throw new Error('加载消息失败');
        const data = await res.json();
        setMessages(
          (data as Array<{ id: string; role: string; content: string; created_at: string }>).map(
            (msg) => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              timestamp: new Date(msg.created_at),
            }),
          ),
        );
      } catch (err) {
        console.error('加载消息失败:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [conversationId]);

  // 自动滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const saveMessage = async (
    role: string,
    content: string,
  ): Promise<string | null> => {
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          role,
          content,
        }),
      });
      if (!res.ok) throw new Error('保存消息失败');
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error('保存消息失败:', err);
      return null;
    }
  };

  const handleSend = async (content: string) => {
    // 添加用户消息到本地状态
    const tempUserMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserMsgId,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 保存用户消息
    await saveMessage('user', content);

    // 提取记忆
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const memoryManager = new MemoryManager(user.id, character.id);
      const extractedMemories = memoryManager.extractMemoriesFromMessage(content, 'user');
      for (const memory of extractedMemories) {
        await memoryManager.addMemory(memory).catch(() => {});
      }
    }

    // 显示"正在输入..."
    setIsTyping(true);

    try {
      // 获取最近的记忆
      let recentMemories: string[] = [];
      if (user) {
        const memoryManager = new MemoryManager(user.id, character.id);
        const memories = await memoryManager.getRecentMemories(5).catch(() => []);
        recentMemories = memories.map((m) => m.summary);
      }

      // 构建消息历史
      const lastMessages = messages.slice(-10).concat(userMessage);
      const apiMessages = lastMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // 调用 AI 生成回复
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          personality: character.personality,
          intimacyLevel: getIntimacyInfo(intimacyScore).level,
          characterName: character.name,
          characterTraits: character.traits,
          characterInterests: character.interests,
          recentMemories,
          backgroundStory: character.background_story,
        }),
      });

      if (!response.ok) throw new Error('AI 回复失败');

      const data = await response.json();
      const aiContent = data.content;

      // 添加 AI 回复
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // 保存 AI 回复
      await saveMessage('assistant', aiContent);

      // 增加亲密度
      const newScore = Math.min(intimacyScore + 1, 7000);
      setIntimacyScore(newScore);
      try {
        await supabase
          .from('conversations')
          .update({ intimacy_level: newScore })
          .eq('id', conversationId);
      } catch {
        // 亲密度更新失败不影响用户体验
      }
    } catch (error) {
      console.error('AI response error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: '抱歉，我暂时无法回复，请稍后再试。',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const intimacyInfo = getIntimacyInfo(intimacyScore);

  return (
    <div className="flex flex-col h-full">
      {/* 聊天头部 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-medium">
            {character.name[0]}
          </div>
          <div>
            <h2 className="text-white font-medium">{character.name}</h2>
            <p className="text-xs text-gray-500">{character.description}</p>
          </div>
        </div>
        <IntimacyBar score={intimacyInfo.score} />
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="text-4xl">💬</div>
            <p className="text-gray-400 text-sm">
              {character.greeting_message || `你好呀！我是${character.name}，来和我聊天吧～`}
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              characterName={character.name}
            />
          ))
        )}

        {/* 输入提示 */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-sm font-medium">
              {character.name[0]}
            </div>
            <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        placeholder={`对 ${character.name} 说点什么...`}
      />
    </div>
  );
}
