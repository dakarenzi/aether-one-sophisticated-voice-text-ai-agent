import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
export function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Mesh */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent blur-3xl" />
      </div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center z-10 space-y-8 max-w-2xl"
      >
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter leading-none">
            AETHER <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">ONE</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 font-light max-w-lg mx-auto leading-relaxed">
            The next generation of multimodal AI. Immersive voice, real-time reasoning, and a responsive sensory interface.
          </p>
        </div>
        <div className="flex flex-col items-center gap-4 pt-4">
          <Button 
            size="lg" 
            onClick={() => navigate('/aether')}
            className="group relative px-10 py-7 text-xl bg-white text-black hover:bg-white/90 rounded-full transition-all duration-300"
          >
            Initialize Aether
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            Protocol Version: 1.0.4-Beta
          </p>
        </div>
      </motion.div>
      <footer className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-slate-600 font-light">
          Powered by Cloudflare Agents & Durable Objects
        </p>
      </footer>
    </div>
  );
}