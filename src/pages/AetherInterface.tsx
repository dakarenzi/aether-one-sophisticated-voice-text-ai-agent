import React from 'react';
import { motion } from 'framer-motion';
import { VoiceOrb } from '@/components/voice/VoiceOrb';
import { ControlDeck } from '@/components/voice/ControlDeck';
import { ChatOverlay } from '@/components/chat/ChatOverlay';
import { SettingsDrawer } from '@/components/settings/SettingsDrawer';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
export default function AetherInterface() {
  return (
    <div className="relative h-screen w-full bg-[#020617] overflow-hidden flex flex-col items-center justify-center text-slate-50">
      {/* Background Animated Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/20 to-slate-950" />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"
        />
        <motion.div 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
          className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full"
        />
      </div>
      {/* Top Navigation / Status */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-sm font-mono tracking-tighter text-white/70">AETHER-ONE // ONLINE</span>
        </div>
      </div>
      <ThemeToggle className="fixed top-6 right-6" />
      <SettingsDrawer />
      {/* Center Stage: The Orb */}
      <main className="relative z-10 flex flex-col items-center gap-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl md:text-4xl font-display font-light tracking-widest text-white/90">AETHER</h1>
          <p className="text-xs md:text-sm font-mono text-white/40 uppercase tracking-[0.3em]">Quantum Conversational Interface</p>
        </motion.div>
        <VoiceOrb />
      </main>
      {/* Collateral UI Components */}
      <ControlDeck />
      <ChatOverlay />
      <Toaster richColors position="bottom-right" theme="dark" />
    </div>
  );
}