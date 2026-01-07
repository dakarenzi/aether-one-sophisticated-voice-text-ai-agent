import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAetherStore } from '@/hooks/use-aether-session';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/chat';
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
          className="fixed right-0 top-0 h-full w-full sm:w-[400px] glass-dark z-40 border-l border-white/10 flex flex-col"
        >
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Transcript
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-2 max-w-[85%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 text-2xs text-muted-foreground">
                    {msg.role === 'assistant' && <Bot className="w-3 h-3" />}
                    <span>{msg.role === 'user' ? 'You' : 'Aether'}</span>
                    <span>•</span>
                    <span>{formatTime(msg.timestamp)}</span>
                    {msg.role === 'user' && <User className="w-3 h-3" />}
                  </div>
                  <div
                    className={cn(
                      "px-4 py-2 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user'
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="bg-white/5 border-white/10 focus-visible:ring-primary"
              />
              <Button size="icon" onClick={handleSend} disabled={isProcessing || !input.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { MessageSquare } from 'lucide-react';