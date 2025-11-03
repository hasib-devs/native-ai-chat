import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

// TODO: Replace with actual Whisper.cpp integration
export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const startListening = useCallback(async () => {
    try {
      // Request permissions
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission"
        );
        return;
      }

      // Configure audio mode
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setIsListening(true);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<string> => {
    if (!recorderState.isRecording) {
      return "";
    }

    try {
      setIsListening(false);
      await audioRecorder.stop();
      // const uri = audioRecorder.uri; // Will be used later for Whisper.cpp integration

      // TODO: Send audio to Whisper.cpp for transcription
      // For now, return a placeholder text
      const placeholderResponses = [
        "Hello, how are you today?",
        "I'd like to practice my English",
        "Can you help me with pronunciation?",
        "What should we talk about?",
        "This is a great way to learn English",
      ];

      return placeholderResponses[
        Math.floor(Math.random() * placeholderResponses.length)
      ];
    } catch (error) {
      console.error("Failed to stop recording", error);
      Alert.alert("Error", "Failed to process recording");
      return "";
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
  };
};
