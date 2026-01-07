import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
export interface SpeechResult {
  transcript: string;
  isFinal: boolean;
}
export function useSpeechRecognition(onResult?: (result: SpeechResult) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          onResult?.({ transcript: event.results[i][0].transcript, isFinal: true });
        } else {
          interimTranscript += event.results[i][0].transcript;
          onResult?.({ transcript: event.results[i][0].transcript, isFinal: false });
        }
      }
      setTranscript(finalTranscript || interimTranscript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        toast.error("Microphone access blocked. Please check browser permissions.");
      } else if (event.error === 'network') {
        toast.error("Network error during speech recognition.");
      }
      setIsListening(false);
    };
    recognitionRef.current = recognition;
  }, [onResult]);
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  }, [isListening]);
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);
  return { isListening, transcript, startListening, stopListening };
}