import { Audio } from "expo-av";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

// TODO: Replace with actual Whisper.cpp integration
export const useSpeechToText = () => {
  const [isListening, setIsListening] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startListening = useCallback(async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please grant microphone permission"
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      setIsListening(true);
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<string> => {
    if (!recording) {
      return "";
    }

    try {
      setIsListening(false);
      await recording.stopAndUnloadAsync();
      // const uri = recording.getURI(); // Will be used later for Whisper.cpp integration
      setRecording(null);

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
  }, [recording]);

  return {
    isListening,
    startListening,
    stopListening,
  };
};
