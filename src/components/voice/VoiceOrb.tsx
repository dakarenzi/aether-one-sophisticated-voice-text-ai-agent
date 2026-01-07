import React, { useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAetherStore } from '@/hooks/use-aether-session';
import { getStateColor, generateWaveform } from '@/lib/visualizer-utils';
export function VoiceOrb() {
  const agentState = useAetherStore(s => s.agentState);
  const visualizerData = useAetherStore(s => s.visualizerData);
  // Mix real frequency data with procedural data if real data is empty
  const activeWaveform = useMemo(() => {
    const sum = visualizerData.reduce((a, b) => a + b, 0);
    return sum > 0 ? visualizerData : generateWaveform(agentState);
  }, [agentState, visualizerData]);
  const colorClass = useMemo(() => getStateColor(agentState), [agentState]);
  const averageAmplitude = useMemo(() => activeWaveform.reduce((a, b) => a + b, 0) / 12, [activeWaveform]);
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Dynamic Glow Halo */}
      <motion.div
        animate={{
          scale: 1 + averageAmplitude * 0.5,
          opacity: 0.2 + averageAmplitude * 0.4,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className={cn(
          "absolute inset-0 rounded-full blur-[100px] bg-gradient-to-tr transition-colors duration-700",
          colorClass
        )}
      />
      {/* Outer Pulse Rings (Only when listening) */}
      <AnimatePresence>
        {agentState === 'listening' && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.5, opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
          />
        )}
      </AnimatePresence>
      {/* Core Orb Container */}
      <motion.div
        layout
        animate={{
          scale: agentState === 'thinking' ? [1, 1.05, 1] : 1,
          rotate: agentState === 'thinking' ? [0, 360] : 0
        }}
        transition={{
          duration: agentState === 'thinking' ? 4 : 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className={cn(
          "relative w-48 h-48 md:w-72 md:h-72 rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-gradient-to-br border border-white/20 backdrop-blur-md z-10 overflow-hidden",
          colorClass
        )}
      >
        <div className="absolute inset-0 rounded-full bg-black/20 flex items-center justify-center gap-1.5 px-6">
          {activeWaveform.map((val, i) => (
            <motion.div
              key={i}
              initial={{ height: 4 }}
              animate={{ height: Math.max(4, val * 120) }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
                mass: 0.5
              }}
              className="w-1.5 md:w-2.5 bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          ))}
        </div>
        {/* Internal Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
      </motion.div>
    </div>
  );
}