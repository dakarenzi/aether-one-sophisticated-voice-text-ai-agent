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
  // Map agent state to background vibes
  const bgStyles = {
    idle: "from-slate-950 via-slate-900 to-slate-950",
    listening: "from-slate-950 via-cyan-950/20 to-slate-950",
    thinking: "from-slate-950 via-indigo-950/30 to-slate-950",
    speaking: "from-slate-950 via-emerald-950/20 to-slate-950"
  };
  return (
    <div className={cn(
      "relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-slate-50 transition-colors duration-1000 bg-background",
      bgStyles[agentState]
    )}>
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: agentState === 'thinking' ? [1, 1.2, 1] : 1,
            opacity: agentState === 'idle' ? 0.05 : 0.15,
          }}
          className="absolute -top-1/4 -left-1/4 w-full h-full bg-indigo-500/20 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: agentState === 'listening' ? [1, 1.3, 1] : 1,
            opacity: agentState === 'idle' ? 0.03 : 0.1,
          }}
          className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-cyan-500/20 blur-[120px] rounded-full"
        />
      </div>
      {/* Connection Metadata */}
      <header className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-2 h-2 rounded-full animate-pulse",
            agentState === 'idle' ? "bg-slate-500" : "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          )} />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Aether-One System</span>
            <span className="text-xs font-mono text-white/80 tracking-tighter">
              {agentState === 'idle' ? 'LINK_READY' : 'STREAM_ACTIVE'} // v1.0.4
            </span>
          </div>
        </div>
      </header>
      <div className="flex items-center gap-2 fixed top-6 right-6 z-50">
        <ThemeToggle className="relative top-0 right-0" />
        <SettingsDrawer />
      </div>
      {/* Main Sensory Stage */}
      <main className="relative z-10 flex flex-col items-center gap-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.h1 
            animate={{ letterSpacing: agentState === 'thinking' ? "0.5em" : "0.3em" }}
            className="text-4xl md:text-5xl font-display font-extralight text-white/90 uppercase"
          >
            Aether
          </motion.h1>
          <p className="mt-2 text-[10px] font-mono text-white/30 uppercase tracking-[0.4em]">
            Neural Multi-Modal Interface
          </p>
        </motion.div>
        <VoiceOrb />
      </main>
      {/* Secondary Interface Layers */}
      <ControlDeck />
      <ChatOverlay />
      <Toaster richColors position="top-center" theme="dark" />
      {/* Global Watermark */}
      <div className="absolute bottom-6 left-6 pointer-events-none">
        <p className="text-[9px] font-mono text-white/10 uppercase tracking-widest">
          Secure Edge Protocol // Cloudflare DO
        </p>
      </div>
    </div>
  );
}