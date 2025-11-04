import { Directory, File, Paths } from "expo-file-system";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Import whisper.rn modules - these will work in development builds
import {
  initWhisper,
  initWhisperVad,
  type WhisperContext,
  type WhisperVadContext,
} from "whisper.rn/index.js";
import {
  RealtimeStatsEvent,
  RealtimeTranscribeEvent,
  RealtimeTranscriber,
  RealtimeVadEvent,
} from "whisper.rn/realtime-transcription/index.js";
import { AudioPcmStreamAdapter } from "whisper.rn/realtime-transcription/adapters/AudioPcmStreamAdapter.js";

// Simple flag - if imports succeeded, whisper is available
const whisperModuleAvailable = true;

type WhisperModel =
  | "tiny"
  | "tiny.en"
  | "base"
  | "base.en"
  | "small"
  | "small.en";

export default function RealtimeTranscriberRoot() {
  const [whisperContext, setWhisperContext] = useState<WhisperContext | null>(
    null
  );
  const [vadContext, setVadContext] = useState<WhisperVadContext | null>(null);
  const [realtimeTranscriber, setRealtimeTranscriber] =
    useState<RealtimeTranscriber | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [vadEvents, setVadEvents] = useState<any[]>([]);
  const [realtimeStats, setRealtimeStats] = useState<any>(null);
  const [transcribeResult, setTranscribeResult] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  const log = useCallback((...messages: any[]) => {
    console.log(...messages);
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${messages.join(" ")}`,
    ]);
  }, []);

  const getModelDirectory = () => {
    let documentDirectory: Directory;
    try {
      documentDirectory = Paths.document;
    } catch (error) {
      console.warn("Failed to get document directory:", error);
      throw new Error("Document directory is not available.");
    }

    if (!documentDirectory?.uri) {
      throw new Error("Document directory is not available.");
    }

    const directory = new Directory(documentDirectory, "whisper-models");
    try {
      directory.create({ idempotent: true, intermediates: true });
    } catch (error) {
      console.warn("Failed to ensure Whisper model directory exists:", error);
      throw error;
    }
    return directory;
  };

  const downloadModel = async (model: WhisperModel): Promise<string> => {
    const directory = getModelDirectory();
    const modelHost =
      "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";
    const modelFileName = `ggml-${model}.bin`;
    const modelUrl = `${modelHost}/${modelFileName}`;

    const file = new File(directory, modelFileName);
    const isModelExists = file.info().exists;

    if (isModelExists) {
      return file.uri;
    }

    try {
      const downloadResult = await File.downloadFileAsync(modelUrl, directory, {
        idempotent: true,
      });

      return downloadResult.uri;
    } catch (error) {
      if (file.info().exists) {
        file.delete();
      }
      console.log("Failed Model");
      throw error;
    }
  };

  const downloadedVadModel = async (): Promise<string> => {
    const directory = getModelDirectory();
    const vadModelFileName = `vad-ggml-model-f32.bin`;
    const vadModelUrl = `https://huggingface.co/ggml-org/whisper-vad/resolve/main/ggml-silero-v5.1.2.bin`;

    const file = new File(directory, vadModelFileName);
    const isVadModelExists = file.info().exists;

    if (isVadModelExists) {
      return file.uri;
    }

    try {
      const downloadResult = await File.downloadFileAsync(
        vadModelUrl,
        directory,
        {
          idempotent: true,
        }
      );

      return downloadResult.uri;
    } catch (error) {
      if (file.info().exists) {
        file.delete();
      }
      console.log("failed vad");
      throw error;
    }
  };

  // Define initializeContexts as a function declaration for hoisting
  async function initializeContexts() {
    try {
      if (!whisperModuleAvailable) {
        log("Whisper module not available, skipping initialization");
        return;
      }

      let modelFilePath = "";
      let vadModelFilePath = "";
      try {
        setIsDownloading(true);
        modelFilePath = await downloadModel("base");
        vadModelFilePath = await downloadedVadModel();
      } catch (error) {
        log("Error downloading models:", error);
        Alert.alert("Error", `Failed to download models: ${error}`);
        return;
      } finally {
        setIsDownloading(false);
      }

      if (!modelFilePath || !vadModelFilePath) {
        log("Model file paths are invalid.");
        throw new Error("Model file paths are invalid.");
      }

      setIsLoading(true);

      try {
        const whisperCtx = await initWhisper({
          filePath: modelFilePath,
        });
        setWhisperContext(whisperCtx);

        log("Initializing VAD context...");
        const vadCtx = await initWhisperVad({
          filePath: vadModelFilePath,
          useGpu: true,
          nThreads: 4,
        });
        setVadContext(vadCtx);

        log("Both contexts initialized successfully!");
      } catch (initError) {
        log("Error during whisper initialization:", initError);
        Alert.alert(
          "Initialization Error",
          "Whisper.rn requires a development build. Please use 'npx expo run:android' or 'npx expo run:ios' instead of Expo Go."
        );
        throw initError;
      }
    } catch (error) {
      log("Error initializing contexts:", error);
      Alert.alert("Error", `Failed to initialize: ${error}`);
    } finally {
      setIsLoading(false);
      setIsDownloading(false);
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      setModulesLoaded(true);

      // Add runtime check for module availability
      try {
        if (typeof initWhisper === "function" && whisperModuleAvailable) {
          console.log("📱 Whisper.rn detected - initializing contexts...");
          await initializeContexts();
        } else {
          console.log("⚠️ Whisper.rn not available - running in fallback mode");
        }
      } catch (error) {
        console.warn("Failed to initialize whisper modules:", error);
      }
    };

    initializeApp();

    return () => {
      // Cleanup on unmount
      console.log("Cleaning up...");
      whisperContext?.release?.();
      vadContext?.release?.();
      realtimeTranscriber?.release?.();
    };
  }, []);

  // Show loading while modules are being loaded
  if (!modulesLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading Whisper modules...</Text>
        </View>
      </View>
    );
  }

  // Early return if whisper module is not available (Expo Go)
  if (!whisperModuleAvailable || typeof initWhisper !== "function") {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Whisper.rn Not Available</Text>
          <Text style={styles.errorText}>
            The whisper.rn module requires a development build or EAS build to
            function properly. It cannot run in Expo Go.
          </Text>
          <Text style={styles.errorText}>
            To test real speech recognition:{"\n"}
            1. Create a development build: `npx expo run:android` or `npx expo
            run:ios`{"\n"}
            2. Or build with EAS: `eas build --profile development`
          </Text>
          <Text style={styles.simulationText}>
            For now, you can test the UI with simulated speech recognition.
          </Text>
        </View>
      </View>
    );
  }

  const handleError = (error: string) => {
    log("Realtime Error:", error);
  };

  const handleStatusChange = (isActive: boolean) => {
    setIsTranscribing(isActive);
    log(`Realtime status: ${isActive ? "ACTIVE" : "INACTIVE"}`);
  };

  const startRealtimeTranscription = async () => {
    if (!whisperContext || !vadContext) {
      log("Contexts not initialized yet.");
      return;
    }

    try {
      log("Creating live audio adapter...");
      const audioStreamInstance = new AudioPcmStreamAdapter();

      // Create RealtimeTranscriber if not exists
      const transcriber = new RealtimeTranscriber(
        // Dependencies
        {
          whisperContext: whisperContext,
          vadContext: vadContext,
          audioStream: audioStreamInstance,
          fs: {
            writeFile: function (
              filePath: string,
              data: string,
              encoding: string
            ): Promise<void> {
              const file = new File(getModelDirectory().uri, filePath);
              file.create({
                intermediates: true,
                overwrite: true,
              });
              file.write(data, {
                encoding: encoding as any,
              });

              return Promise.resolve();
            },
            appendFile: function (
              filePath: string,
              data: string,
              encoding: string
            ): Promise<void> {
              const file = new File(getModelDirectory().uri, filePath);
              file.create({
                intermediates: true,
                overwrite: true,
              });
              file.write(data, {
                encoding: encoding as any,
              });

              return Promise.resolve();
            },
            readFile: function (
              filePath: string,
              encoding: string
            ): Promise<string> {
              const file = new File(getModelDirectory().uri, filePath);
              return Promise.resolve(file.base64());
            },
            exists: function (filePath: string): Promise<boolean> {
              const file = new File(getModelDirectory().uri, filePath);
              return Promise.resolve(file.exists);
            },
            unlink: function (filePath: string): Promise<void> {
              const file = new File(getModelDirectory().uri, filePath);
              return Promise.resolve(file.delete());
            },
          },
        },
        // Options
        {
          logger: (message: any) => log(message),
          audioSliceSec: 300,
          audioMinSec: 0.5,
          maxSlicesInMemory: 1,
          vadPreset: "default",
          vadOptions: {
            threshold: 0.5,
            minSpeechDurationMs: 250,
            minSilenceDurationMs: 100,
            maxSpeechDurationS: 30,
            speechPadMs: 30,
            samplesOverlap: 0.1,
          },
          autoSliceOnSpeechEnd: true,
          autoSliceThreshold: 0.5,
          transcribeOptions: {
            language: "en",
            maxLen: 1,
          },
          audioOutputPath: getModelDirectory().uri,
        },
        // Callbacks
        {
          onTranscribe: handleTranscribeEvent,
          onVad: handleVadEvent,
          onError: handleError,
          onStatusChange: handleStatusChange,
          onStatsUpdate: handleStatsUpdate,
        }
      );

      // realtimeTranscriber.current = transcriber;
      setRealtimeTranscriber(transcriber);

      log("Starting realtime transcription...");
      await transcriber.start();
      log(`Realtime transcription started: "Live Audio"`);
    } catch (error) {
      log("Error starting realtime transcription:", error);
      Alert.alert("Error", `Failed to start: ${error}`);
    }
  };

  const stopRealtimeTranscription = async () => {
    if (!realtimeTranscriber) {
      console.log("Realtime not available");
      return;
    }

    try {
      await realtimeTranscriber.stop();
      setRealtimeStats(null);
      log("Realtime transcription stopped");
    } catch (error) {
      log("Error stopping realtime transcription:", error);
    }
  };

  const handleTranscribeEvent = (event: RealtimeTranscribeEvent) => {
    const { data, sliceIndex } = event;

    if (data?.result) {
      // Update the latest transcription result
      setTranscribeResult(data.result);

      // Get all transcription results from the transcriber
      const allResults = realtimeTranscriber?.getTranscriptionResults() || [];
      console.log({ allResults });

      log(
        `Transcribed slice ${sliceIndex}: "${data.result.substring(
          0,
          50
        )}..." (Total results: ${allResults.length})`
      );
    }
  };

  const handleStatsUpdate = (statsEvent: RealtimeStatsEvent) => {
    setRealtimeStats(statsEvent.data);

    // Log significant changes
    if (statsEvent.type === "status_change") {
      log(
        `Status changed: ${
          statsEvent.data.isActive ? "ACTIVE" : "INACTIVE"
        }, transcribing: ${statsEvent.data.isTranscribing}`
      );
    } else if (statsEvent.type === "memory_change") {
      const memMB = statsEvent.data.sliceStats?.memoryUsage?.estimatedMB || 0;
      log(`Memory usage: ${memMB.toFixed(1)}MB`);
    }
  };

  const handleVadEvent = (vadEvent: RealtimeVadEvent) => {
    setVadEvents((prev) => [...prev.slice(-19), vadEvent]); // Keep last 20 events

    if (vadEvent.type !== "silence") {
      log(
        `VAD: ${vadEvent.type} (confidence: ${vadEvent.confidence.toFixed(2)})`
      );
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollview}
    >
      <View style={styles.container}>
        {/* Loading indicator */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading models...</Text>
          </View>
        ) : null}
        <View style={styles.logContainer}>
          <Text style={styles.configTitle}>Debug Logs</Text>
          {logs.slice(-10).map((msg, index) => (
            <Text key={index} style={styles.logText}>
              {msg}
            </Text>
          ))}
        </View>

        {/* Downloading models */}
        {isDownloading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Downloading models...</Text>
          </View>
        )}

        {/* Status Display */}
        {realtimeStats && (
          <View
            style={[
              styles.statusContainer,
              isTranscribing ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text style={styles.statusText}>
              Status: {isTranscribing ? "TRANSCRIBING" : "STOPPED"} | VAD:{" "}
              {realtimeStats.vadEnabled ? "ON" : "OFF"} | Memory:{" "}
              {realtimeStats.sliceStats?.memoryUsage?.estimatedMB || 0}MB
            </Text>
            <Text style={styles.statusText}>
              Slices: {realtimeStats.sliceStats?.currentSliceIndex || 0}{" "}
              current, {realtimeStats.sliceStats?.transcribeSliceIndex || 0}{" "}
              transcribing | Audio Source:{" "}
            </Text>
            <Text style={styles.statusText}>
              Auto-Slice:{" "}
              {realtimeStats.autoSliceConfig?.enabled ? "ENABLED" : "DISABLED"}
              {realtimeStats.autoSliceConfig?.enabled &&
                ` (≥${(realtimeStats.autoSliceConfig.threshold * 100).toFixed(
                  0
                )}% = ${(
                  realtimeStats.autoSliceConfig.targetDuration *
                  realtimeStats.autoSliceConfig.threshold
                ).toFixed(1)}s)`}
            </Text>
          </View>
        )}

        {/* VAD Events Display */}
        {vadEvents.length > 0 && (
          <View style={styles.logContainer}>
            <Text style={styles.configTitle}>Recent VAD Events</Text>
            {vadEvents.slice(-5).map((event, index) => (
              <Text key={index} style={styles.logText}>
                {event.type}: {event.confidence.toFixed(2)} confidence (slice{" "}
                {event.sliceIndex})
              </Text>
            ))}
          </View>
        )}

        {/* Transcription Result */}
        {transcribeResult && (
          <View style={styles.logContainer}>
            <Text style={styles.configTitle}>Latest Transcription</Text>
            <Text style={styles.logText}>{transcribeResult}</Text>
          </View>
        )}

        {isLoading || isDownloading ? null : (
          <Button
            title={isTranscribing ? "Stop Realtime" : "Start Realtime"}
            onPress={
              isTranscribing
                ? stopRealtimeTranscription
                : startRealtimeTranscription
            }
            disabled={!whisperContext || !vadContext || isDownloading}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollview: { flexGrow: 1, justifyContent: "center" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
  },
  errorContainer: {
    backgroundColor: "#fff3cd",
    padding: 20,
    borderRadius: 12,
    marginVertical: 16,
    width: "95%",
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: "#856404",
    marginBottom: 8,
    lineHeight: 20,
  },
  simulationText: {
    fontSize: 14,
    color: "#155724",
    fontWeight: "600",
    marginTop: 12,
    padding: 8,
    backgroundColor: "#d4edda",
    borderRadius: 6,
  },
  loadingContainer: {
    backgroundColor: "#e3f2fd",
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
    width: "95%",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#1976d2",
    fontWeight: "600",
  },
  logContainer: {
    backgroundColor: "green",
    color: "white",
    padding: 8,
    width: "95%",
    borderRadius: 8,
    marginVertical: 8,
  },
  logText: { fontSize: 12, color: "white" },
  configTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  statusContainer: {
    backgroundColor: "#e8f5e8",
    padding: 8,
    width: "95%",
    borderRadius: 8,
    marginVertical: 4,
  },
  statusActive: { backgroundColor: "#e8f5e8" },
  statusInactive: { backgroundColor: "#f5e8e8" },
  statusText: { fontSize: 12, color: "#333" },
});
