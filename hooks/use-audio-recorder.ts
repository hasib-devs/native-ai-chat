import { useCallback, useEffect, useState } from "react";
import { audioRecorderService } from "../services/speech/audio-recorder.service";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioLevel: number;
  duration: number;
  recordingUri: string | null;
  hasPermission: boolean;
  error: Error | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  playRecording: (uri: string) => Promise<void>;
  deleteRecording: (uri: string) => Promise<void>;
}

/**
 * Hook for audio recording functionality
 *
 * @example
 * const { startRecording, stopRecording, isRecording, audioLevel } = useAudioRecorder();
 *
 * Start recording
 * await startRecording();
 *
 * Stop and get URI
 * const uri = await stopRecording();
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check permissions on mount
  useEffect(() => {
    audioRecorderService.hasPermissions().then(setHasPermission);
  }, []);

  // Update duration while recording
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setDuration(audioRecorderService.getDuration());
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await audioRecorderService.requestPermissions();
      setHasPermission(granted);
      return granted;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Permission error");
      setError(error);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await audioRecorderService.startRecording(setAudioLevel);
      setIsRecording(true);
      setDuration(0);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Recording error");
      setError(error);
      setIsRecording(false);
      throw error;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const uri = await audioRecorderService.stopRecording();
      setIsRecording(false);
      setAudioLevel(0);
      setRecordingUri(uri);
      return uri;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Stop recording error");
      setError(error);
      setIsRecording(false);
      throw error;
    }
  }, []);

  const cancelRecording = useCallback(async (): Promise<void> => {
    try {
      await audioRecorderService.cancelRecording();
      setIsRecording(false);
      setAudioLevel(0);
      setDuration(0);
      setRecordingUri(null);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Cancel recording error");
      setError(error);
    }
  }, []);

  const playRecording = useCallback(async (uri: string): Promise<void> => {
    try {
      await audioRecorderService.playRecording(uri);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Playback error");
      setError(error);
    }
  }, []);

  const deleteRecording = useCallback(
    async (uri: string): Promise<void> => {
      try {
        await audioRecorderService.deleteRecording(uri);
        if (recordingUri === uri) {
          setRecordingUri(null);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Delete error");
        setError(error);
      }
    },
    [recordingUri]
  );

  return {
    isRecording,
    audioLevel,
    duration,
    recordingUri,
    hasPermission,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    requestPermissions,
    playRecording,
    deleteRecording,
  };
}

export default useAudioRecorder;
