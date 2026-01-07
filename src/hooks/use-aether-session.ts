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
  visualizerData: number[];
}
interface AetherSessionActions {
  setAgentState: (state: AgentState) => void;
  setMicActive: (active: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setVisualizerData: (data: number[]) => void;
  sendMessage: (content: string) => Promise<void>;
  handleStreamingResponse: (content: string) => void;
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
  visualizerData: new Array(12).fill(0),
  setAgentState: (agentState) => set({ agentState }),
  setMicActive: (isMicActive) => {
    set({ isMicActive });
    // If mic turns on while agent is speaking, we stop agent speech (Barge-in logic managed in components)
    if (isMicActive) {
      set({ agentState: 'listening' });
    } else {
      set({ agentState: 'idle' });
    }
  },
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  setVisualizerData: (visualizerData) => set({ visualizerData }),
  setModel: (currentModel) => set({ currentModel }),
  handleStreamingResponse: (chunk) => {
    // This will be called by chatService in Phase 3 mostly
  },
  sendMessage: async (content) => {
    if (!content.trim()) return;
    const { messages, currentModel } = get();
    set({ isProcessing: true, agentState: 'thinking' });
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
        // Final state will be reset by the TTS hook finishing
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isProcessing: false, agentState: 'idle' });
    }
  },
  clearHistory: async () => {
    await chatService.clearMessages();
    set({ messages: [], agentState: 'idle' });
  }
}));