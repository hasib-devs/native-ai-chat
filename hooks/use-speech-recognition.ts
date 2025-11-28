import { useState, useCallback, useEffect } from "react";
import { useAudioRecorder, RecordingPresets } from "expo-audio";
import { speechToTextService } from "../services/speech/speech-to-text.service";
import { audioRecorderService } from "../services/speech/audio-recorder.service";
import { SpeechRecognitionOptions } from "../types/voice.types";

interface UseSpeechRecognitionReturn {
  transcript: string;
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
  const [error, setError] = useState<string | null>(null);

  // Use expo-audio's hook for recording
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const isListening = audioRecorder.isRecording;
  const [isAvailable, setIsAvailable] = useState(true); // expo-audio handles permissions

  // Sync recording state with service
  useEffect(() => {
    audioRecorderService.setRecording(
      audioRecorder.isRecording,
      audioRecorder.uri || undefined
    );
  }, [audioRecorder.isRecording, audioRecorder.uri]);
  const startListening = useCallback(
    async (options?: SpeechRecognitionOptions): Promise<void> => {
      try {
        console.log("Starting audio recording...");
        setError(null);
        setTranscript("");
        await audioRecorder.record();
        console.log("Recording started successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to start listening";
        console.error("Error starting recording:", errorMessage);
        setError(errorMessage);
        throw err;
      }
    },
    [audioRecorder]
  );

  const stopListening = useCallback(async (): Promise<string> => {
    try {
      console.log("Stopping audio recording...");
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      console.log("Recording stopped. URI:", uri);

      if (!uri) {
        throw new Error("No audio recorded");
      }

      // Transcribe audio (if API is configured)
      console.log("Transcribing audio...");
      const finalText = await speechToTextService.transcribeAudioFile(uri);
      setTranscript(finalText);
      console.log("Transcription complete:", finalText);

      return finalText;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to stop listening";
      console.error("Error stopping recording:", errorMessage);
      setError(errorMessage);
      throw err;
    }
  }, [audioRecorder]);

  const cancelListening = useCallback(async (): Promise<void> => {
    try {
      console.log("Canceling audio recording...");
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        await audioRecorderService.deleteAudioFile(uri);
      }
      setTranscript("");
      setError(null);
      console.log("Recording canceled");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel";
      console.error("Error canceling:", errorMessage);
      setError(errorMessage);
    }
  }, [audioRecorder]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    transcript,
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
