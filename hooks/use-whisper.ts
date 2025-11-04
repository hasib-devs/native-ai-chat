import {
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
} from "expo-audio";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import RNFS from "react-native-fs";
import { initWhisper, initWhisperVad } from "whisper.rn/index.js";
import { RealtimeTranscriber } from "whisper.rn/realtime-transcription/index.js";
import { useWhisperModels } from "./use-whisper-models";
import { AudioPcmStreamAdapter } from "@/services/AudioPcmStreamAdapter";

export function useWhisper() {
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [transcriber, setTranscriber] = useState<RealtimeTranscriber | null>(
    null
  );

  const { initializeWhisperModel, initializeWhisperVad } = useWhisperModels();

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
      console.log("Failed to verify microphone permission:", err);
      Alert.alert(
        "Microphone Permission",
        "Unable to verify microphone permission. Please try again."
      );
      return false;
    }
  };

  const initializeModels = async () => {
    const whisperFile = await initializeWhisperModel();
    const vadFile = await initializeWhisperVad();

    const whisperContext = await initWhisper({ filePath: whisperFile });
    const vadContext = await initWhisperVad({ filePath: vadFile });

    return { whisperContext, vadContext };
  };

  // Create transcriber
  const createTranscriber = ({
    whisperContext,
    vadContext,
  }: {
    whisperContext: any;
    vadContext: any;
  }) => {
    return new RealtimeTranscriber(
      {
        whisperContext,
        vadContext,
        audioStream: new AudioPcmStreamAdapter(),
        fs: RNFS,
      },
      {
        audioSliceSec: 30,
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
          setIsRealtimeActive(isActive);
          console.log("Status:", isActive ? "ACTIVE" : "INACTIVE");
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      }
    );
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

        const { whisperContext, vadContext } = await initializeModels();
        const tx = createTranscriber({ whisperContext, vadContext });

        // setTranscriber(tx);
      })
      .catch((error) => {
        console.log(
          "Error during microphone permission or model initialization:",
          error
        );
      });
    return () => {
      if (transcriber) {
        transcriber.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    transcriber,
    isRealtimeActive,
  };
}
