import { create } from 'zustand';
import { chatService } from '@/lib/chat';
import type { Message } from '../../worker/types';
import type { AgentState } from '@/lib/visualizer-utils';
interface AetherSessionState {
  messages: Message[];
  agentState: AgentState;
  isMicActive: boolean;
  isChatOpen: boolean;
  isProcessing: boolean;
  currentModel: string;
}
interface AetherSessionActions {
  setAgentState: (state: AgentState) => void;
  setMicActive: (active: boolean) => void;
  setChatOpen: (open: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
  setModel: (model: string) => void;
}
export const useAetherStore = create<AetherSessionState & AetherSessionActions>((set, get) => ({
  messages: [],
  agentState: 'idle',
  isMicActive: false,
  isChatOpen: false,
  isProcessing: false,
  currentModel: 'google-ai-studio/gemini-2.0-flash',
  setAgentState: (agentState) => set({ agentState }),
  setMicActive: (isMicActive) => set({ isMicActive }),
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  setModel: (currentModel) => set({ currentModel }),
  sendMessage: async (content) => {
    if (!content.trim()) return;
    const { messages, currentModel } = get();
    set({ isProcessing: true, agentState: 'thinking' });
    // Optimistic UI update for user message
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    set({ messages: [...messages, userMsg] });
    try {
      const response = await chatService.sendMessage(content, currentModel);
      if (response.success && response.data) {
        set({ 
          messages: response.data.messages, 
          agentState: 'speaking',
          isProcessing: false 
        });
        // Return to idle after a simulated speaking delay
        setTimeout(() => set({ agentState: 'idle' }), 3000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isProcessing: false, agentState: 'idle' });
    }
  },
  clearHistory: async () => {
    await chatService.clearMessages();
    set({ messages: [] });
  }
}));