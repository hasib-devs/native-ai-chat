import { useState, useCallback, useEffect, useRef } from "react";
import { speechToTextService } from "../services/speech/speech-to-text.service";
import { SpeechRecognitionOptions } from "../types/voice.types";

interface UseSpeechRecognitionReturn {
  transcript: string;
  partialTranscript: string;
  isListening: boolean;
  isAvailable: boolean;
  error: string | null;
  startListening: (options?: SpeechRecognitionOptions) => Promise<void>;
  stopListening: () => Promise<string>;
  cancelListening: () => Promise<void>;
  resetTranscript: () => void;
}

/**
 * Hook for Speech Recognition using @react-native-voice/voice
 *
 * @example
 * const { startListening, stopListening, transcript, isListening } = useSpeechRecognition();
 *
 * // Start listening
 * await startListening({ language: "en-US" });
 *
 * // Stop and get final transcript
 * const finalText = await stopListening();
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [partialTranscript, setPartialTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Check availability on mount
  useEffect(() => {
    const checkAvailability = async () => {
      console.log("Checking speech recognition availability in hook...");
      const available = await speechToTextService.isAvailable();
      console.log("Speech recognition available in hook:", available);
      if (isMounted.current) {
        setIsAvailable(available);
      }
    };

    // Add a delay to ensure native modules are initialized
    const timer = setTimeout(checkAvailability, 200);

    return () => {
      clearTimeout(timer);
      isMounted.current = false;
    };
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Add a small delay to ensure native modules are fully initialized
    const setupListeners = () => {
      speechToTextService.onPartialResult((text) => {
        if (isMounted.current) {
          setPartialTranscript(text);
        }
      });

      speechToTextService.onFinalResult((text) => {
        if (isMounted.current) {
          setTranscript(text);
          setPartialTranscript("");
        }
      });

      speechToTextService.onError((errorMessage) => {
        if (isMounted.current) {
          setError(errorMessage);
          setIsListening(false);
        }
      });

      speechToTextService.onStart(() => {
        if (isMounted.current) {
          setIsListening(true);
          setError(null);
        }
      });

      speechToTextService.onEnd(() => {
        if (isMounted.current) {
          setIsListening(false);
        }
      });
    };

    const timer = setTimeout(setupListeners, 100);

    return () => {
      clearTimeout(timer);
      speechToTextService.destroy();
    };
  }, []);

  const startListening = useCallback(
    async (options?: SpeechRecognitionOptions): Promise<void> => {
      try {
        setError(null);
        setTranscript("");
        setPartialTranscript("");
        await speechToTextService.startListening(options);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start listening";
        setError(errorMessage);
        setIsListening(false);
        throw err;
      }
    },
    []
  );

  const stopListening = useCallback(async (): Promise<string> => {
    try {
      const finalText = await speechToTextService.stopListening();
      setIsListening(false);
      return finalText;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop listening";
      setError(errorMessage);
      setIsListening(false);
      throw err;
    }
  }, []);

  const cancelListening = useCallback(async (): Promise<void> => {
    try {
      await speechToTextService.cancelListening();
      setIsListening(false);
      setTranscript("");
      setPartialTranscript("");
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel";
      setError(errorMessage);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setPartialTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
    partialTranscript,
    isListening,
    isAvailable,
    error,
    startListening,
    stopListening,
    cancelListening,
    resetTranscript,
  };
}

export default useSpeechRecognition;
