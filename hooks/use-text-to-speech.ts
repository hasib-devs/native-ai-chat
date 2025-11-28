import { useState, useCallback, useEffect } from "react";
import textToSpeechService from "../services/speech/text-to-speech.service";
import { TextToSpeechOptions } from "../types/voice.types";

interface UseTextToSpeechReturn {
  isSpeaking: boolean;
  currentText: string | null;
  queueLength: number;
  error: Error | null;
  speak: (text: string, options?: TextToSpeechOptions) => Promise<void>;
  queueSpeak: (text: string, options?: TextToSpeechOptions) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  clearQueue: () => void;
}

/**
 * Hook for Text-to-Speech functionality
 *
 * @example
 * const { speak, isSpeaking, stop } = useTextToSpeech();
 *
 * Speak some text
 * await speak("Hello, how are you?");
 *
 *  Stop speaking
 * stop();
 */
export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [queueLength, setQueueLength] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Update state when speaking status changes
  useEffect(() => {
    const interval = setInterval(() => {
      const speaking = textToSpeechService.isSpeaking();
      const text = textToSpeechService.getCurrentUtterance();
      const queue = textToSpeechService.getQueueLength();

      setIsSpeaking(speaking);
      setCurrentText(text);
      setQueueLength(queue);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const speak = useCallback(
    async (text: string, options?: TextToSpeechOptions): Promise<void> => {
      try {
        setError(null);
        await textToSpeechService.speak(text, options);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        throw error;
      }
    },
    []
  );

  const queueSpeak = useCallback(
    (text: string, options?: TextToSpeechOptions): void => {
      textToSpeechService.queueSpeak(text, options);
      setQueueLength(textToSpeechService.getQueueLength());
    },
    []
  );

  const stop = useCallback(() => {
    textToSpeechService.stop();
    setIsSpeaking(false);
    setCurrentText(null);
    setQueueLength(0);
  }, []);

  const pause = useCallback(() => {
    textToSpeechService.pause();
  }, []);

  const resume = useCallback(() => {
    textToSpeechService.resume();
  }, []);

  const clearQueue = useCallback(() => {
    textToSpeechService.clearQueue();
    setQueueLength(0);
  }, []);

  return {
    isSpeaking,
    currentText,
    queueLength,
    error,
    speak,
    queueSpeak,
    stop,
    pause,
    resume,
    clearQueue,
  };
}

export default useTextToSpeech;
