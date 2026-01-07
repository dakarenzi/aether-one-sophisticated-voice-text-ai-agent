import { useState, useCallback, useRef, useEffect } from 'react';
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const stop = useCallback(() => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  }, [synth]);
  const speak = useCallback((text: string) => {
    if (!synth || !text) return;
    // Split text into chunks for better performance and interruption
    const chunks = text.match(/[^.!?]+[.!?]+/g) || [text];
    chunks.forEach((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk.trim());
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        if (!synth.speaking) setIsSpeaking(false);
      };
      utterance.onerror = () => setIsSpeaking(false);
      synth.speak(utterance);
    });
  }, [synth]);
  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);
  return { isSpeaking, speak, stop };
}