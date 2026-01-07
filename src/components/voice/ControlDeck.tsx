import React, { useEffect, useCallback } from 'react';
import { Mic, MicOff, MessageSquare, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAetherStore } from '@/hooks/use-aether-session';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useSpeechRecognition, SpeechResult } from '@/hooks/use-speech-recognition';
import { toast } from 'sonner';
export function ControlDeck() {
  const isMicActive = useAetherStore(s => s.isMicActive);
  const isChatOpen = useAetherStore(s => s.isChatOpen);
  const setMicActive = useAetherStore(s => s.setMicActive);
  const setChatOpen = useAetherStore(s => s.setChatOpen);
  const setVisualizerData = useAetherStore(s => s.setVisualizerData);
  const agentState = useAetherStore(s => s.agentState);
  const messages = useAetherStore(s => s.messages);
  const clearHistory = useAetherStore(s => s.clearHistory);
  const setAgentState = useAetherStore(s => s.setAgentState);
  const sendMessage = useAetherStore(s => s.sendMessage);
  const interruptAgent = useAetherStore(s => s.interruptAgent);
  const { startRecording, stopRecording, frequencyData } = useAudioRecorder();
  const { isSpeaking, speak, stop: stopSpeech } = useSpeechSynthesis();
  const onSpeechResult = useCallback((result: SpeechResult) => {
    if (!result.isFinal) {
      // Barge-in: Interrupt if user starts speaking
      interruptAgent();
    } else {
      // Process final speech
      if (result.transcript.trim()) {
        sendMessage(result.transcript);
      }
    }
  }, [interruptAgent, sendMessage]);
  const { startListening, stopListening } = useSpeechRecognition(onSpeechResult);
  useEffect(() => {
    setVisualizerData(frequencyData);
  }, [frequencyData, setVisualizerData]);
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'assistant' && !isSpeaking && agentState === 'speaking') {
      speak(lastMsg.content);
    }
  }, [messages, isSpeaking, agentState, speak]);
  useEffect(() => {
    if (isSpeaking) {
      setAgentState('speaking');
    } else if (agentState === 'speaking') {
      setAgentState('idle');
    }
  }, [isSpeaking, agentState, setAgentState]);
  const handleMicToggle = async () => {
    try {
      if (!isMicActive) {
        if (isSpeaking) stopSpeech();
        await startRecording();
        startListening();
        setMicActive(true);
      } else {
        stopRecording();
        stopListening();
        setMicActive(false);
      }
    } catch (err) {
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        toast.error('Microphone permission denied. Click the lock/camera icon in address bar, allow microphone, then refresh page.');
      } else {
        toast.error('Microphone access failed. Check device and browser settings.');
      }
    }
  };
  const handleEndSession = () => {
    stopRecording();
    stopListening();
    stopSpeech();
    setMicActive(false);
    clearHistory();
    toast.success("Session ended.");
  };
  return (
    <TooltipProvider>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-slate-900/80 border border-white/10 backdrop-blur-2xl px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full w-12 h-12 transition-all duration-300 relative",
                  isMicActive ? "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30" : "hover:bg-white/10"
                )}
                onClick={handleMicToggle}
              >
                {isMicActive && (
                  <span className="absolute inset-0 rounded-full border-2 border-cyan-500 animate-ping opacity-25" />
                )}
                {isMicActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-muted-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMicActive ? "Stop Listening" : "Enable Voice Mode"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full w-12 h-12 transition-all duration-300",
                  isChatOpen ? "bg-indigo-500/20 text-indigo-400" : "hover:bg-white/10"
                )}
                onClick={() => setChatOpen(!isChatOpen)}
              >
                <MessageSquare className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chat Transcript</p>
            </TooltipContent>
          </Tooltip>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-12 h-12 hover:bg-red-500/20 group"
                onClick={handleEndSession}
              >
                <Power className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Exit Aether</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40">
            {isMicActive ? 'Aether is Listening' : `System: ${agentState}`}
           </span>
        </div>
      </div>
    </TooltipProvider>
  );
}