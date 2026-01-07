import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceOrb } from '@/components/voice/VoiceOrb';
import { ControlDeck } from '@/components/voice/ControlDeck';
import { ChatOverlay } from '@/components/chat/ChatOverlay';
import { SettingsDrawer } from '@/components/settings/SettingsDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { useAetherStore } from '@/hooks/use-aether-session';
import { cn } from '@/lib/utils';
export default function AetherInterface() {
  const agentState = useAetherStore(s => s.agentState);
  const isMicActive = useAetherStore(s => s.isMicActive);
  // Map agent state to background vibes
  const bgStyles = {
    idle: "from-slate-950 via-slate-900 to-slate-950",
    listening: "from-slate-950 via-cyan-950/20 to-slate-950",
    thinking: "from-slate-950 via-indigo-950/30 to-slate-950",
    speaking: "from-slate-950 via-emerald-950/20 to-slate-950"
  };
  return (
    <div className={cn(
      "relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-slate-50 transition-all duration-1000 bg-background",
      bgStyles[agentState]
    )}>
      {/* Mandatory Root Wrapper & Gutters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full h-full relative flex items-center justify-center">
        {/* Immersive Background Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: agentState === 'thinking' ? [1, 1.2, 1] : 1,
              opacity: agentState === 'idle' ? 0.05 : 0.15,
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-1/4 -left-1/4 w-full h-full bg-indigo-500/20 blur-[120px] rounded-full"
          />
          <motion.div
            animate={{
              scale: agentState === 'listening' ? [1, 1.3, 1] : 1,
              opacity: agentState === 'idle' ? 0.03 : 0.1,
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-cyan-500/20 blur-[120px] rounded-full"
          />
        </div>
        {/* Connection Metadata */}
        <header className="absolute top-8 left-8 z-50 hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-2 h-2 rounded-full",
              agentState === 'idle' ? "bg-slate-700" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"
            )} />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Aether Protocol</span>
              <span className="text-xs font-mono text-white/80 tracking-tighter">
                {isMicActive ? 'STT_STREAM_ON' : 'IDLE_WAIT'} // NODE_CF_EDGE
              </span>
            </div>
          </div>
        </header>
        <div className="flex items-center gap-2 absolute top-8 right-8 z-50">
          <ThemeToggle className="relative top-0 right-0" />
          <SettingsDrawer />
        </div>
        {/* Main Sensory Stage */}
        <main className="relative z-10 flex flex-col items-center gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <motion.h1
              animate={{ 
                letterSpacing: agentState === 'thinking' ? "0.6em" : "0.4em",
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl md:text-7xl font-display font-thin text-white uppercase"
            >
              Aether
            </motion.h1>
            <AnimatePresence mode="wait">
              {isMicActive && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-[10px] font-mono text-cyan-400 uppercase tracking-[0.5em]"
                >
                  Listening for input...
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
          <div className="py-12">
            <VoiceOrb />
          </div>
        </main>
        <ControlDeck />
        <ChatOverlay />
        <Toaster richColors position="top-right" theme="dark" />
        {/* Global Watermark */}
        <div className="absolute bottom-10 left-10 pointer-events-none hidden md:block">
          <p className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">
            Multi-Modal Synchronization Active // latency: &lt;200ms
          </p>
        </div>
      </div>
    </div>
  );
}