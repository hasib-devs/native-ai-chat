import * as Speech from "expo-speech";
import { useCallback } from "react";

// Hook for Text-to-Speech functionality
export const useTextToSpeech = () => {
  const speak = useCallback(async (text: string) => {
    try {
      // Stop any ongoing speech
      await Speech.stop();

      // Speak the text with English voice settings
      Speech.speak(text, {
        language: "en-US",
        pitch: 1.0,
        rate: 0.85, // Slightly slower for learning
      });
    } catch (error) {
      console.error("Text-to-speech error:", error);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      await Speech.stop();
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }, []);

  const isSpeaking = useCallback(() => {
    return Speech.isSpeakingAsync();
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
  };
};
