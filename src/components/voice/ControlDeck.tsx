import React from 'react';
import { Mic, MicOff, MessageSquare, Settings, Keyboard, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAetherStore } from '@/hooks/use-aether-session';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
export function ControlDeck() {
  const isMicActive = useAetherStore(s => s.isMicActive);
  const isChatOpen = useAetherStore(s => s.isChatOpen);
  const setMicActive = useAetherStore(s => s.setMicActive);
  const setChatOpen = useAetherStore(s => s.setChatOpen);
  const agentState = useAetherStore(s => s.agentState);
  return (
    <TooltipProvider>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-dark px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border border-white/10 backdrop-blur-xl">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full w-12 h-12 transition-all duration-300",
                  isMicActive ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "hover:bg-white/10"
                )}
                onClick={() => setMicActive(!isMicActive)}
              >
                {isMicActive ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-muted-foreground" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isMicActive ? "Mute Microphone" : "Unmute Microphone"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={cn(
                  "rounded-full w-12 h-12 transition-all duration-300",
                  isChatOpen ? "bg-primary/20 text-primary-foreground" : "hover:bg-white/10"
                )}
                onClick={() => setChatOpen(!isChatOpen)}
              >
                <MessageSquare className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle Chat Panel</p>
            </TooltipContent>
          </Tooltip>
          <div className="h-8 w-[1px] bg-white/10 mx-2" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full w-12 h-12 hover:bg-white/10"
              >
                <Power className="w-6 h-6 text-red-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End Session</p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* Status Indicator */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
           <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground animate-pulse">
            System: {agentState}
           </span>
        </div>
      </div>
    </TooltipProvider>
  );
}