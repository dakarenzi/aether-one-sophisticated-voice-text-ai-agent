import { create } from 'zustand';
import { chatService } from '@/lib/chat';
import { toast } from "sonner";
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
  interruptAgent: () => void;
  exportSession: () => void;
  exportTranscript: () => void;
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
    if (isMicActive) {
      set({ agentState: 'listening' });
    } else {
      const { isProcessing } = get();
      if (!isProcessing) set({ agentState: 'idle' });
    }
  },
  setChatOpen: (isChatOpen) => set({ isChatOpen }),
  setVisualizerData: (visualizerData) => set({ visualizerData }),
  setModel: (currentModel) => set({ currentModel }),
  interruptAgent: () => {
    const { agentState } = get();
    if (agentState === 'speaking' || agentState === 'thinking') {
      window.speechSynthesis.cancel();
      set({ agentState: 'listening' });
    }
  },
  handleStreamingResponse: (chunk) => {
    // For future expansion of UI streaming
  },
  sendMessage: async (content) => {
    if (!content.trim()) return;
    const { messages, currentModel } = get();
    // Stop any active speech before sending new message
    window.speechSynthesis.cancel();
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
      } else {
        set({ isProcessing: false, agentState: 'idle' });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      set({ isProcessing: false, agentState: 'idle' });
    }
  },
  clearHistory: async () => {
    await chatService.clearMessages();
    set({ messages: [], agentState: 'idle' });
  },

  exportSession: () => {
    const { messages, currentModel } = get();
    const sessionId = chatService.getSessionId();
    const data = {
      sessionId,
      currentModel,
      timestamp: Date.now(),
      messages
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-${sessionId.slice(0,8)}.json`;
    if (document.body) {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
    toast.success('Session exported!');
  },

  exportTranscript: () => {
    const { messages } = get();
    const sessionId = chatService.getSessionId();
    const transcript = messages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}\n\n`).join('');
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aether-transcript-${sessionId.slice(0,8)}.txt`;
    if (document.body) {
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    URL.revokeObjectURL(url);
    toast.success('Transcript exported!');
  }
}));