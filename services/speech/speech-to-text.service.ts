import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from "@react-native-voice/voice";
import { Platform, PermissionsAndroid } from "react-native";
import { SpeechRecognitionOptions } from "../../types/voice.types";

/**
 * Speech-to-Text Service using @react-native-voice/voice
 * Handles real-time speech recognition
 */
class SpeechToTextService {
  private isListeningNow = false;
  private partialResults: string[] = [];
  private finalResult = "";
  private onPartialResultCallback?: (text: string) => void;
  private onFinalResultCallback?: (text: string) => void;
  private onErrorCallback?: (error: string) => void;
  private onStartCallback?: () => void;
  private onEndCallback?: () => void;
  private hasPermissions = false;

  constructor() {
    this.initializeEvents();
    this.checkAndRequestPermissions();
  }

  /**
   * Initialize voice recognition events
   */
  private initializeEvents(): void {
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
  }

  /**
   * Handle speech start event
   */
  private onSpeechStart(event: SpeechStartEvent): void {
    console.log("Speech recognition started", event);
    this.isListeningNow = true;
    if (this.onStartCallback) {
      this.onStartCallback();
    }
  }

  /**
   * Handle speech end event
   */
  private onSpeechEnd(event: SpeechEndEvent): void {
    console.log("Speech recognition ended", event);
    this.isListeningNow = false;
    if (this.onEndCallback) {
      this.onEndCallback();
    }
  }

  /**
   * Handle final speech results
   */
  private onSpeechResults(event: SpeechResultsEvent): void {
    const results = event.value || [];
    console.log("Speech results:", results);

    if (results.length > 0) {
      this.finalResult = results[0];
      if (this.onFinalResultCallback) {
        this.onFinalResultCallback(this.finalResult);
      }
    }
  }

  /**
   * Handle partial speech results (real-time transcription)
   */
  private onSpeechPartialResults(event: SpeechResultsEvent): void {
    const results = event.value || [];
    console.log("Partial results:", results);

    if (results.length > 0) {
      this.partialResults = results;
      if (this.onPartialResultCallback) {
        this.onPartialResultCallback(results[0]);
      }
    }
  }

  /**
   * Handle speech recognition errors
   */
  private onSpeechError(event: SpeechErrorEvent): void {
    console.error("Speech recognition error:", event.error);
    this.isListeningNow = false;

    if (this.onErrorCallback) {
      this.onErrorCallback(event.error?.message || "Unknown error");
    }
  }

  /**
   * Check and request permissions for Android
   */
  private async checkAndRequestPermissions(): Promise<void> {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: "Microphone Permission",
            message:
              "This app needs access to your microphone for voice conversations.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        this.hasPermissions = granted === PermissionsAndroid.RESULTS.GRANTED;
        console.log("Microphone permission:", granted);
      } catch (err) {
        console.error("Error requesting permissions:", err);
        this.hasPermissions = false;
      }
    } else {
      // iOS permissions are handled through Info.plist
      this.hasPermissions = true;
    }
  }

  /**
   * Check if speech recognition is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      console.log("Checking speech recognition availability...");

      // Check permissions first
      if (Platform.OS === "android" && !this.hasPermissions) {
        await this.checkAndRequestPermissions();
      }

      // @react-native-voice/voice doesn't have a reliable isAvailable() method
      // The best way to check is to see if we can access the module
      // For Android, we just check permissions. For iOS, we assume it's available
      if (Platform.OS === "android") {
        const isAvailable = this.hasPermissions;
        console.log("Speech recognition available (Android):", isAvailable);
        return isAvailable;
      } else {
        // iOS - speech recognition is available if the app has proper permissions in Info.plist
        console.log("Speech recognition available (iOS): true");
        return true;
      }
    } catch (error) {
      console.error("Error checking voice availability:", error);
      return false;
    }
  }

  /**
   * Start listening for speech
   */
  async startListening(options?: SpeechRecognitionOptions): Promise<void> {
    try {
      console.log("Starting speech recognition...");

      // Check permissions for Android
      if (Platform.OS === "android" && !this.hasPermissions) {
        await this.checkAndRequestPermissions();
        if (!this.hasPermissions) {
          throw new Error("Microphone permission not granted");
        }
      }

      // Stop any existing session
      if (this.isListeningNow) {
        console.log("Stopping existing session before starting new one...");
        await this.stopListening();
      }

      // Reset results
      this.partialResults = [];
      this.finalResult = "";

      console.log(
        "Starting Voice.start() with language:",
        options?.language || "en-US"
      );

      // Start recognition - if it's not available, this will throw an error
      await Voice.start(options?.language || "en-US", {
        EXTRA_PARTIAL_RESULTS: options?.interimResults ?? true,
        EXTRA_MAX_RESULTS: options?.maxAlternatives ?? 5,
        EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS: 2000,
        EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS: 1500,
      });

      console.log("Voice.start() completed successfully");
      this.isListeningNow = true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      this.isListeningNow = false;
      throw error;
    }
  }

  /**
   * Stop listening and return final result
   */
  async stopListening(): Promise<string> {
    try {
      await Voice.stop();
      this.isListeningNow = false;
      return this.finalResult;
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      this.isListeningNow = false;
      throw error;
    }
  }

  /**
   * Cancel listening without returning result
   */
  async cancelListening(): Promise<void> {
    try {
      await Voice.cancel();
      this.isListeningNow = false;
      this.partialResults = [];
      this.finalResult = "";
    } catch (error) {
      console.error("Error canceling speech recognition:", error);
      this.isListeningNow = false;
    }
  }

  /**
   * Destroy the speech recognition instance
   */
  async destroy(): Promise<void> {
    try {
      await Voice.destroy();
      this.isListeningNow = false;
      this.partialResults = [];
      this.finalResult = "";
      this.onPartialResultCallback = undefined;
      this.onFinalResultCallback = undefined;
      this.onErrorCallback = undefined;
      this.onStartCallback = undefined;
      this.onEndCallback = undefined;
    } catch (error) {
      console.error("Error destroying speech recognition:", error);
    }
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.isListeningNow;
  }

  /**
   * Get partial results
   */
  getPartialResults(): string[] {
    return this.partialResults;
  }

  /**
   * Get final result
   */
  getFinalResult(): string {
    return this.finalResult;
  }

  /**
   * Set callback for partial results
   */
  onPartialResult(callback: (text: string) => void): void {
    this.onPartialResultCallback = callback;
  }

  /**
   * Set callback for final result
   */
  onFinalResult(callback: (text: string) => void): void {
    this.onFinalResultCallback = callback;
  }

  /**
   * Set callback for errors
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Set callback for start event
   */
  onStart(callback: () => void): void {
    this.onStartCallback = callback;
  }

  /**
   * Set callback for end event
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * Get supported languages (if available)
   */
  async getSupportedLanguages(): Promise<string[]> {
    try {
      // This method may not be available in all versions
      // @ts-ignore - Method availability varies by platform
      const languages = await Voice.getSupportedLanguages?.();
      return languages || [];
    } catch (error) {
      console.error("Error getting supported languages:", error);
      return [];
    }
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();
export default speechToTextService;
