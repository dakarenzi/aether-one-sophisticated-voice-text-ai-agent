import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAetherStore } from '@/hooks/use-aether-session';
import { getStateColor, generateWaveform } from '@/lib/visualizer-utils';
export function VoiceOrb() {
  const agentState = useAetherStore(s => s.agentState);
  const waveform = useMemo(() => generateWaveform(agentState), [agentState]);
  const colorClass = useMemo(() => getStateColor(agentState), [agentState]);
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: agentState === 'listening' ? [1, 1.2, 1] : 1,
          opacity: agentState === 'idle' ? 0.3 : 0.6,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          "absolute inset-0 rounded-full blur-3xl bg-gradient-to-tr transition-colors duration-1000",
          colorClass
        )}
      />
      {/* Core Orb */}
      <motion.div
        layout
        initial={{ scale: 0.8 }}
        animate={{ 
          scale: agentState === 'thinking' ? [1, 1.05, 1] : 1,
          rotate: agentState === 'thinking' ? 360 : 0
        }}
        transition={{ 
          duration: agentState === 'thinking' ? 3 : 1, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={cn(
          "relative w-48 h-48 md:w-72 md:h-72 rounded-full shadow-2xl bg-gradient-to-br border border-white/20 backdrop-blur-sm z-10",
          colorClass
        )}
      >
        <div className="absolute inset-0 rounded-full bg-black/10 overflow-hidden">
          <AnimatePresence mode="wait">
            <div className="flex items-center justify-center h-full gap-1 px-4">
              {waveform.map((val, i) => (
                <motion.div
                  key={`${agentState}-${i}`}
                  initial={{ height: 2 }}
                  animate={{ height: val * 100 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20,
                    delay: i * 0.05 
                  }}
                  className="w-1 md:w-2 bg-white/80 rounded-full"
                />
              ))}
            </div>
          </AnimatePresence>
        </div>
      </motion.div>
      {/* Outer Pulse Rings */}
      {agentState === 'listening' && (
        <motion.div
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
        />
      )}
    </div>
  );
}