import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import {
  OfflineSTTResult,
  OfflineSTTService,
} from "../services/OfflineSTTService";

export interface OfflineFirstSTTState {
  isListening: boolean;
  isProcessing: boolean;
  isOnline: boolean;
  isOfflineCapable: boolean;
  currentModel: string;
  lastResult: OfflineSTTResult | null;
}

export interface OfflineFirstSTTConfig {
  preferOffline: boolean;
  fallbackToCloud: boolean;
  autoSelectModel: boolean;
  qualityThreshold: number;
}

export const useOfflineSpeechToText = () => {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [state, setState] = useState<OfflineFirstSTTState>({
    isListening: false,
    isProcessing: false,
    isOnline: true,
    isOfflineCapable: false,
    currentModel: "",
    lastResult: null,
  });

  const [config, setConfig] = useState<OfflineFirstSTTConfig>({
    preferOffline: true,
    fallbackToCloud: true,
    autoSelectModel: true,
    qualityThreshold: 0.8,
  });

  const offlineService = OfflineSTTService.getInstance();

  // Monitor network connectivity
  useEffect(() => {
    // Simulate network monitoring - replace with actual NetInfo when available
    const simulateNetworkCheck = () => {
      setState((prev) => ({
        ...prev,
        isOnline: true, // Assume online for demo
      }));
    };

    simulateNetworkCheck();
    const interval = setInterval(simulateNetworkCheck, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  // Check offline capabilities
  useEffect(() => {
    const checkOfflineCapability = async () => {
      try {
        const downloadedModels = await offlineService.getDownloadedModels();
        const sttConfig = offlineService.getConfig();
        const hasModel = await offlineService.isModelAvailable(sttConfig.model);

        setState((prev) => ({
          ...prev,
          isOfflineCapable: downloadedModels.length > 0 && hasModel,
          currentModel: hasModel
            ? sttConfig.model
            : downloadedModels[0]?.name || "",
        }));
      } catch (error) {
        console.error("Failed to check offline capability:", error);
        setState((prev) => ({ ...prev, isOfflineCapable: false }));
      }
    };

    checkOfflineCapability();
  }, [offlineService]);

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

      setState((prev) => ({ ...prev, isListening: true }));

      // Prepare and start recording
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (error) {
      console.error("Failed to start recording", error);
      Alert.alert("Error", "Failed to start recording");
      setState((prev) => ({ ...prev, isListening: false }));
    }
  }, [audioRecorder]);

  const stopListening =
    useCallback(async (): Promise<OfflineSTTResult | null> => {
      if (!recorderState.isRecording) {
        return null;
      }

      try {
        setState((prev) => ({
          ...prev,
          isListening: false,
          isProcessing: true,
        }));

        await audioRecorder.stop();
        const uri = audioRecorder.uri;

        if (!uri) {
          throw new Error("No audio file generated");
        }

        let result: OfflineSTTResult | null = null;

        // Strategy 1: Try offline first if preferred and capable
        if (config.preferOffline && state.isOfflineCapable) {
          try {
            result = await offlineService.transcribeAudio(uri);
            console.log("✅ Offline transcription successful:", result.model);
          } catch (error) {
            console.warn(
              "Offline transcription failed, trying fallback:",
              error
            );

            if (!config.fallbackToCloud || !state.isOnline) {
              throw error;
            }
          }
        }

        // Strategy 2: Fallback to cloud or if offline not preferred
        if (!result && state.isOnline && config.fallbackToCloud) {
          result = await cloudTranscription(uri);
          console.log("☁️ Cloud transcription successful");
        }

        // Strategy 3: Force offline if no internet
        if (!result && !state.isOnline && state.isOfflineCapable) {
          result = await offlineService.transcribeAudio(uri);
          console.log("🔄 Forced offline transcription due to no internet");
        }

        if (!result) {
          throw new Error("All transcription methods failed");
        }

        // Quality check
        if (result.confidence < config.qualityThreshold) {
          console.warn(`Low confidence transcription: ${result.confidence}`);
        }

        setState((prev) => ({
          ...prev,
          lastResult: result,
          isProcessing: false,
        }));
        return result;
      } catch (error) {
        console.error("Failed to process recording", error);
        setState((prev) => ({ ...prev, isProcessing: false }));

        Alert.alert(
          "Transcription Failed",
          state.isOnline
            ? "Failed to process audio. Please try again."
            : "No internet connection and no offline models available."
        );
        return null;
      }
    }, [
      recorderState.isRecording,
      audioRecorder,
      config.preferOffline,
      config.fallbackToCloud,
      config.qualityThreshold,
      state.isOfflineCapable,
      state.isOnline,
      offlineService,
    ]);

  // Cloud transcription fallback (simulate for now)
  const cloudTranscription = async (
    audioUri: string
  ): Promise<OfflineSTTResult> => {
    // Simulate cloud API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const cloudResponses = [
      "Hello, I'm practicing my English speaking skills.",
      "What's the weather like today?",
      "Could you help me with my pronunciation?",
      "I enjoy learning new languages every day.",
      "Thank you for your patience and support.",
    ];

    const transcription =
      cloudResponses[Math.floor(Math.random() * cloudResponses.length)];

    return {
      transcription,
      confidence: 0.92,
      language: "en",
      processingTime: 1500,
      isOffline: false,
      model: "Cloud API",
    };
  };

  const updateConfig = useCallback(
    (newConfig: Partial<OfflineFirstSTTConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    },
    []
  );

  const getRecommendedStrategy = useCallback((): string => {
    if (!state.isOnline && !state.isOfflineCapable) {
      return "No transcription available - download offline models or connect to internet";
    }

    if (!state.isOnline && state.isOfflineCapable) {
      return `Offline only - using ${state.currentModel}`;
    }

    if (state.isOnline && !state.isOfflineCapable) {
      return "Cloud only - consider downloading offline models for better privacy";
    }

    if (config.preferOffline) {
      return `Offline first with cloud fallback - using ${state.currentModel}`;
    }

    return "Cloud first with offline fallback";
  }, [state, config]);

  const getProcessingSpeed = useCallback(
    async (
      audioDurationMs: number
    ): Promise<{
      offline: number;
      cloud: number;
      recommended: "offline" | "cloud";
    }> => {
      const offlineTime = state.isOfflineCapable
        ? await offlineService.estimateTranscriptionTime(audioDurationMs)
        : Infinity;

      const cloudTime = state.isOnline ? audioDurationMs * 0.3 : Infinity; // Estimate

      return {
        offline: offlineTime,
        cloud: cloudTime,
        recommended: offlineTime < cloudTime ? "offline" : "cloud",
      };
    },
    [state.isOfflineCapable, state.isOnline, offlineService]
  );

  const forceOfflineMode = useCallback(async () => {
    if (!state.isOfflineCapable) {
      Alert.alert(
        "Offline Mode Unavailable",
        "No offline models are downloaded. Please download a model first."
      );
      return false;
    }

    updateConfig({ preferOffline: true, fallbackToCloud: false });
    return true;
  }, [state.isOfflineCapable, updateConfig]);

  const forceCloudMode = useCallback(() => {
    if (!state.isOnline) {
      Alert.alert(
        "Cloud Mode Unavailable",
        "No internet connection available."
      );
      return false;
    }

    updateConfig({ preferOffline: false, fallbackToCloud: false });
    return true;
  }, [state.isOnline, updateConfig]);

  return {
    // State
    ...state,
    config,

    // Actions
    startListening,
    stopListening,
    updateConfig,

    // Utilities
    getRecommendedStrategy,
    getProcessingSpeed,
    forceOfflineMode,
    forceCloudMode,

    // Service access
    offlineService,
  };
};
