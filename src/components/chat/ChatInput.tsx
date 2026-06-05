'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 p-4 border-t border-white/10 bg-black/50 backdrop-blur-sm">
      {/* 输入框 */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? '输入消息... (Enter 发送, Shift+Enter 换行)'}
          disabled={disabled}
          rows={1}
          className={cn(
            'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 pr-12',
            'text-white placeholder-gray-500 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-none transition-all duration-200',
          )}
        />
      </div>

      {/* 发送按钮 */}
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
          input.trim()
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
            : 'bg-white/10 text-gray-500 cursor-not-allowed',
        )}
        aria-label="发送"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19V5m0 0l-7 7m7-7l7 7"
          />
        </svg>
      </button>
    </div>
  );
}
