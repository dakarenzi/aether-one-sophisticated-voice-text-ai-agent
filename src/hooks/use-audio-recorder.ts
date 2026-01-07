import { useState, useCallback, useRef, useEffect } from 'react';
import { audioAnalyzer } from '@/lib/audio-utils';
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(12).fill(0));
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      await audioAnalyzer.init(stream);
      setIsRecording(true);
      const update = () => {
        setFrequencyData(audioAnalyzer.getFrequencyData());
        animationRef.current = requestAnimationFrame(update);
      };
      animationRef.current = requestAnimationFrame(update);
    } catch (err) {
      console.error('Failed to start recording:', err);
      throw err;
    }
  }, []);
  const stopRecording = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    audioAnalyzer.close();
    setIsRecording(false);
    setFrequencyData(new Array(12).fill(0));
  }, []);
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    };
  }, []);
  return { isRecording, startRecording, stopRecording, frequencyData };
}