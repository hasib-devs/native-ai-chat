import * as Speech from "expo-speech";
import { TextToSpeechOptions } from "../../types/voice.types";

/**
 * Text-to-Speech Service
 * Handles converting text to speech using Expo Speech API
 */
class TextToSpeechService {
  private isSpeakingNow = false;
  private currentUtterance: string | null = null;
  private queue: Array<{ text: string; options?: TextToSpeechOptions }> = [];

  /**
   * Speak the given text
   */
  async speak(
    text: string,
    options?: TextToSpeechOptions
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text || text.trim().length === 0) {
        reject(new Error("Text cannot be empty"));
        return;
      }

      this.isSpeakingNow = true;
      this.currentUtterance = text;

      Speech.speak(text, {
        language: options?.language || "en-US",
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 1.0,
        volume: options?.volume || 1.0,
        voice: options?.voiceId,
        onDone: () => {
          this.isSpeakingNow = false;
          this.currentUtterance = null;
          this.processQueue();
          resolve();
        },
        onStopped: () => {
          this.isSpeakingNow = false;
          this.currentUtterance = null;
          resolve();
        },
        onError: (error) => {
          this.isSpeakingNow = false;
          this.currentUtterance = null;
          reject(error);
        },
      });
    });
  }

  /**
   * Add text to speaking queue
   */
  queueSpeak(text: string, options?: TextToSpeechOptions): void {
    this.queue.push({ text, options });
    if (!this.isSpeakingNow) {
      this.processQueue();
    }
  }

  /**
   * Process the speaking queue
   */
  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const next = this.queue.shift();
    if (next) {
      try {
        await this.speak(next.text, next.options);
      } catch (error) {
        console.error("Error speaking queued text:", error);
        this.processQueue(); // Continue with next item
      }
    }
  }

  /**
   * Stop current speech
   */
  stop(): void {
    Speech.stop();
    this.isSpeakingNow = false;
    this.currentUtterance = null;
    this.queue = [];
  }

  /**
   * Pause current speech
   */
  pause(): void {
    Speech.pause();
  }

  /**
   * Resume paused speech
   */
  resume(): void {
    Speech.resume();
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.isSpeakingNow;
  }

  /**
   * Get current utterance
   */
  getCurrentUtterance(): string | null {
    return this.currentUtterance;
  }

  /**
   * Get available voices
   */
  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error("Error fetching voices:", error);
      return [];
    }
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length;
  }

  /**
   * Clear the queue
   */
  clearQueue(): void {
    this.queue = [];
  }
}

// Export singleton instance
export const textToSpeechService = new TextToSpeechService();
export default textToSpeechService;
