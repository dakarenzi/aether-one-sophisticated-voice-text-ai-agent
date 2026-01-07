import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, Bot, MessageSquare, Tooltip as TooltipIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAetherStore } from '@/hooks/use-aether-session';
import { cn } from '@/lib/utils';
import { formatTime, renderToolCall } from '@/lib/chat';
export function ChatOverlay() {
  const isChatOpen = useAetherStore(s => s.isChatOpen);
  const setChatOpen = useAetherStore(s => s.setChatOpen);
  const messages = useAetherStore(s => s.messages);
  const sendMessage = useAetherStore(s => s.sendMessage);
  const isProcessing = useAetherStore(s => s.isProcessing);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);
  const handleSend = () => {
    if (!input.trim() || isProcessing) return;
    sendMessage(input);
    setInput('');
  };
  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 h-full w-full sm:w-[450px] glass-dark z-40 border-l border-white/10 flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Conversation
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-8">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-3 max-w-[90%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                    {msg.role === 'assistant' && <Bot className="w-3 h-3" />}
                    <span>{msg.role === 'user' ? 'Direct Input' : 'Aether Core'}</span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.role === 'user' && <User className="w-3 h-3" />}
                  </div>
                  <div
                    className={cn(
                      "px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-lg",
                      msg.role === 'user'
                        ? "bg-indigo-600 text-white rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                    )}
                  >
                    {msg.content}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                        {msg.toolCalls.map((tc, idx) => (
                          <Badge 
                            key={idx} 
                            variant="secondary" 
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0 px-2"
                          >
                            {renderToolCall(tc)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center gap-3 text-muted-foreground italic text-xs animate-pulse">
                  <div className="flex gap-1">
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce"></span>
                  </div>
                  Aether is reasoning...
                </div>
              )}
              <div ref={scrollRef} className="h-4" />
            </div>
          </ScrollArea>
          <div className="p-6 border-t border-white/10 bg-black/40">
            <div className="flex gap-3">
              <Input
                placeholder="Type your command..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-white/5 border-white/10 focus-visible:ring-indigo-500 h-12"
              />
              <Button 
                size="icon" 
                onClick={handleSend} 
                className="h-12 w-12 bg-indigo-600 hover:bg-indigo-500" 
                disabled={isProcessing || !input.trim()}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}