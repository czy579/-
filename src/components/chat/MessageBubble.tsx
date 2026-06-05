'use client';

import { cn } from '@/lib/utils/cn';
import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  characterName?: string;
}

export function MessageBubble({ message, characterName }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row',
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
          isUser
            ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'
            : 'bg-gradient-to-br from-blue-400 to-cyan-400 text-white',
        )}
      >
        {isUser ? '我' : characterName?.[0] ?? 'AI'}
      </div>

      {/* 消息内容 */}
      <div className={cn('max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-purple-500/20 text-white rounded-tr-sm'
              : 'bg-white/10 text-gray-200 rounded-tl-sm',
          )}
        >
          {message.content}
        </div>
        <div
          className={cn(
            'text-[10px] text-gray-600 mt-1',
            isUser ? 'text-right' : 'text-left',
          )}
        >
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
