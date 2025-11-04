import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import { initWhisper, initWhisperVad } from "whisper.rn/index.js";
import { AudioPcmStreamAdapter } from "whisper.rn/realtime-transcription/adapters/AudioPcmStreamAdapter.js";
import { RealtimeTranscriber } from "whisper.rn/realtime-transcription/index.js";

import { useWhisperModels } from "./use-whisper-models";

export function useWhisper() {
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [transcriber, setTranscriber] = useState<RealtimeTranscriber | null>(
    null
  );

  const { initializeWhisperModel } = useWhisperModels();

  const ensureMicrophonePermission = async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Unsupported Platform",
        "Real-time transcription is not available on the web."
      );
      return false;
    }

    const getPermissionText = (blocked: boolean) =>
      blocked
        ? Platform.OS === "android"
          ? "Please enable microphone access in Android Settings to use real-time transcription."
          : "Please enable microphone access in iOS Settings to use real-time transcription."
        : "Microphone permission is required for real-time transcription.";

    try {
      let permissionStatus = await getRecordingPermissionsAsync();

      if (permissionStatus.granted) {
        return true;
      }

      if (!permissionStatus.canAskAgain) {
        Alert.alert("Microphone Permission", getPermissionText(true));
        console.warn("Microphone permission permanently denied.");
        return false;
      }

      permissionStatus = await requestRecordingPermissionsAsync();

      if (permissionStatus.granted) {
        return true;
      }

      const blocked = !permissionStatus.canAskAgain;
      Alert.alert("Microphone Permission", getPermissionText(blocked));
      console.warn("Microphone permission not granted:", permissionStatus);
      return false;
    } catch (err) {
      console.error("Failed to verify microphone permission:", err);
      Alert.alert(
        "Microphone Permission",
        "Unable to verify microphone permission. Please try again."
      );
      return false;
    }
  };

  useEffect(() => {
    ensureMicrophonePermission()
      .then(async (hasMicPermission) => {
        if (!hasMicPermission) {
          Alert.alert(
            "Microphone Permission",
            "Microphone permission is required for real-time transcription."
          );
          return;
        }

        try {
          const filePath = await initializeWhisperModel("base");

          if (!filePath) {
            throw new Error("Failed to initialize Whisper model.");
          }

          const whisperContext = await initWhisper({
            filePath,
          });
          const vadContext = await initWhisperVad({
            filePath,
          });

          if (!whisperContext || !vadContext) {
            throw new Error("Failed to initialize Whisper or VAD context.");
          }

          const audioStream = new AudioPcmStreamAdapter();

          // Create transcriber
          const tx = new RealtimeTranscriber(
            { whisperContext, vadContext, audioStream },
            {
              vadPreset: "default",
              autoSliceOnSpeechEnd: true,
              transcribeOptions: { language: "en" },
            },
            {
              onTranscribe: (event) => {
                console.log("Transcription:", event.data?.result);
              },
              onVad: (event) => {
                console.log("VAD:", event.type, event.confidence);
              },
              onStatusChange: (isActive) => {
                console.log("Status:", isActive ? "ACTIVE" : "INACTIVE");
                setIsRealtimeActive(isActive);
              },
              onError: (error) => {
                console.error("Error:", error);
              },
            }
          );

          tx.start();
          setTranscriber(tx);
        } catch (error) {
          Alert.alert(
            "Model Initialization Error",
            "Failed to initialize the Whisper model. Please try again."
          );
          console.error("Error initializing Whisper model:", error);
        }
      })
      .catch((error) => {
        console.error(
          "Error during microphone permission or model initialization:",
          error
        );
      });

    return () => {
      if (transcriber) {
        transcriber.stop();
      }
    };
  }, []);
  return {
    transcriber,
    isRealtimeActive,
  };
}
