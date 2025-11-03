// import RNFS from 'react-native-fs';
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface OfflineSTTResult {
  transcription: string;
  confidence: number;
  language: string;
  processingTime: number;
  isOffline: boolean;
  model: string;
}

export interface WhisperModel {
  name: string;
  size: string;
  language: string;
  downloadUrl: string;
  fileName: string;
  isDownloaded: boolean;
  version: string;
}

export interface STTConfig {
  model: string;
  language: string;
  enableTimestamps: boolean;
  enableWordLevelTimestamps: boolean;
  temperature: number;
  maxTokens: number;
}

const MODELS_STORAGE_KEY = "@offline_stt_models";
const CONFIG_STORAGE_KEY = "@offline_stt_config";
// const DEFAULT_MODELS_DIR = `${RNFS.DocumentDirectoryPath}/whisper_models`;

export class OfflineSTTService {
  private static instance: OfflineSTTService;
  private config: STTConfig;
  private availableModels: WhisperModel[];

  private constructor() {
    this.config = {
      model: "whisper-base",
      language: "en",
      enableTimestamps: false,
      enableWordLevelTimestamps: false,
      temperature: 0.0,
      maxTokens: 448,
    };
    this.availableModels = this.getDefaultModels();
    this.initialize();
  }

  public static getInstance(): OfflineSTTService {
    if (!OfflineSTTService.instance) {
      OfflineSTTService.instance = new OfflineSTTService();
    }
    return OfflineSTTService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      // Load saved configuration
      await this.loadConfig();

      // Update model download status
      await this.updateModelStatus();
    } catch (error) {
      console.error("Failed to initialize OfflineSTTService:", error);
    }
  }

  private getDefaultModels(): WhisperModel[] {
    return [
      {
        name: "Whisper Tiny",
        size: "37 MB",
        language: "multilingual",
        downloadUrl:
          "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.bin",
        fileName: "ggml-tiny.bin",
        isDownloaded: true, // Simulate as downloaded for demo
        version: "1.0.0",
      },
      {
        name: "Whisper Base",
        size: "142 MB",
        language: "multilingual",
        downloadUrl:
          "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin",
        fileName: "ggml-base.bin",
        isDownloaded: false,
        version: "1.0.0",
      },
      {
        name: "Whisper Small",
        size: "466 MB",
        language: "multilingual",
        downloadUrl:
          "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin",
        fileName: "ggml-small.bin",
        isDownloaded: false,
        version: "1.0.0",
      },
      {
        name: "Whisper Base English",
        size: "142 MB",
        language: "english",
        downloadUrl:
          "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin",
        fileName: "ggml-base.en.bin",
        isDownloaded: true, // Simulate as downloaded for demo
        version: "1.0.0",
      },
    ];
  }

  async transcribeAudio(audioPath: string): Promise<OfflineSTTResult> {
    const startTime = Date.now();

    try {
      // Check if we have a downloaded model
      const model = this.availableModels.find(
        (m) => m.fileName === `${this.config.model}.bin` && m.isDownloaded
      );

      if (!model) {
        throw new Error(`Model ${this.config.model} not available offline`);
      }

      // TODO: Replace with actual Whisper.cpp integration
      // For now, simulate offline processing
      const result = await this.simulateWhisperProcessing(audioPath, model);

      const processingTime = Date.now() - startTime;

      return {
        ...result,
        processingTime,
        isOffline: true,
        model: model.name,
      };
    } catch (error) {
      console.error("Offline transcription failed:", error);
      throw error;
    }
  }

  // Simulate Whisper processing until real integration is available
  private async simulateWhisperProcessing(
    audioPath: string,
    model: WhisperModel
  ): Promise<Omit<OfflineSTTResult, "processingTime" | "isOffline" | "model">> {
    // Simulate processing delay based on model size
    const processingDelay = model.name.includes("Tiny")
      ? 500
      : model.name.includes("Base")
      ? 1000
      : 2000;

    await new Promise((resolve) => setTimeout(resolve, processingDelay));

    // Simulate realistic transcription results
    const sampleTranscriptions = [
      {
        transcription: "Hello, how are you doing today?",
        confidence: 0.95,
        language: "en",
      },
      {
        transcription: "I would like to practice my English pronunciation.",
        confidence: 0.88,
        language: "en",
      },
      {
        transcription: "What should we talk about next?",
        confidence: 0.92,
        language: "en",
      },
      {
        transcription: "Thank you for helping me improve my speaking skills.",
        confidence: 0.9,
        language: "en",
      },
      {
        transcription: "Could you please repeat that more slowly?",
        confidence: 0.87,
        language: "en",
      },
    ];

    const randomResult =
      sampleTranscriptions[
        Math.floor(Math.random() * sampleTranscriptions.length)
      ];

    // Adjust confidence based on model quality
    let adjustedConfidence = randomResult.confidence;
    if (model.name.includes("Tiny")) {
      adjustedConfidence = Math.max(adjustedConfidence - 0.1, 0.7);
    } else if (model.name.includes("Small")) {
      adjustedConfidence = Math.min(adjustedConfidence + 0.05, 0.98);
    }

    return {
      transcription: randomResult.transcription,
      confidence: adjustedConfidence,
      language: randomResult.language,
    };
  }

  async downloadModel(
    modelName: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const model = this.availableModels.find((m) => m.name === modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    try {
      // Simulate download progress
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          onProgress(i);
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // Mark as downloaded
      model.isDownloaded = true;
      await this.saveModelsStatus();
    } catch (error) {
      console.error(`Failed to download model ${modelName}:`, error);
      throw error;
    }
  }

  async deleteModel(modelName: string): Promise<void> {
    const model = this.availableModels.find((m) => m.name === modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    try {
      model.isDownloaded = false;
      await this.saveModelsStatus();
    } catch (error) {
      console.error(`Failed to delete model ${modelName}:`, error);
      throw error;
    }
  }

  async getAvailableModels(): Promise<WhisperModel[]> {
    await this.updateModelStatus();
    return [...this.availableModels];
  }

  async getDownloadedModels(): Promise<WhisperModel[]> {
    await this.updateModelStatus();
    return this.availableModels.filter((m) => m.isDownloaded);
  }

  async updateConfig(newConfig: Partial<STTConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await AsyncStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
  }

  getConfig(): STTConfig {
    return { ...this.config };
  }

  async getStorageInfo(): Promise<{
    totalSize: number;
    availableSpace: number;
    modelsSize: number;
  }> {
    try {
      // Simulate storage info
      let modelsSize = 0;
      for (const model of this.availableModels) {
        if (model.isDownloaded) {
          // Estimate size based on model description
          const sizeMatch = model.size.match(/(\d+)\s*MB/);
          if (sizeMatch) {
            modelsSize += parseInt(sizeMatch[1]) * 1024 * 1024;
          }
        }
      }

      return {
        totalSize: 64 * 1024 * 1024 * 1024, // 64GB
        availableSpace: 32 * 1024 * 1024 * 1024, // 32GB
        modelsSize,
      };
    } catch (error) {
      console.error("Failed to get storage info:", error);
      return {
        totalSize: 0,
        availableSpace: 0,
        modelsSize: 0,
      };
    }
  }

  private async updateModelStatus(): Promise<void> {
    // For demo purposes, keep current status
    await this.saveModelsStatus();
  }

  private async loadConfig(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Failed to load STT config:", error);
    }
  }

  private async saveModelsStatus(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        MODELS_STORAGE_KEY,
        JSON.stringify(this.availableModels)
      );
    } catch (error) {
      console.error("Failed to save models status:", error);
    }
  }

  async isModelAvailable(modelName?: string): Promise<boolean> {
    const targetModel = modelName || this.config.model;
    const model = this.availableModels.find(
      (m) => m.fileName.includes(targetModel) && m.isDownloaded
    );
    return !!model;
  }

  async estimateTranscriptionTime(
    audioDurationMs: number,
    modelName?: string
  ): Promise<number> {
    const targetModel = modelName || this.config.model;

    // Estimation based on model size and audio duration
    const speedFactors = {
      tiny: 0.1, // Very fast
      base: 0.2, // Fast
      small: 0.4, // Medium
      medium: 0.8, // Slower
      large: 1.2, // Slowest
    };

    const modelKey =
      Object.keys(speedFactors).find((key) =>
        targetModel.toLowerCase().includes(key)
      ) || "base";

    return (
      audioDurationMs * speedFactors[modelKey as keyof typeof speedFactors]
    );
  }
}
