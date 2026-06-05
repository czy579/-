import { create } from 'zustand';
import type { ChatMessage } from '@/types/chat';

interface ChatStore {
  // 当前对话状态
  messages: ChatMessage[];
  isTyping: boolean;
  error: string | null;

  // 操作
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setTyping: (isTyping: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isTyping: false,
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setMessages: (messages) => set({ messages }),

  setTyping: (isTyping) => set({ isTyping }),

  setError: (error) => set({ error }),

  clearChat: () =>
    set({
      messages: [],
      isTyping: false,
      error: null,
    }),
}));
