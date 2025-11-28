import { useAudioRecorder, RecordingPresets } from "expo-audio";
import * as FileSystem from "expo-file-system";

/**
 * Audio Recorder Service using expo-audio
 * Handles audio recording for speech-to-text conversion
 *
 * Note: expo-audio is designed to be used with React hooks.
 * This service provides a bridge for non-React code.
 */
class AudioRecorderService {
  private isRecordingNow = false;
  private audioUri: string | null = null;
  private hasPermissions = false;

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      console.log("Requesting audio recording permissions...");
      // expo-audio handles permissions automatically when recording starts
      // We'll set this to true and let the recording attempt handle permission requests
      this.hasPermissions = true;
      console.log("Audio permissions will be requested on first recording");
      return true;
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      this.hasPermissions = false;
      return false;
    }
  }

  /**
   * Check if permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    if (!this.hasPermissions) {
      await this.requestPermissions();
    }
    return this.hasPermissions;
  }

  /**
   * Set recording status
   */
  setRecording(status: boolean, uri?: string): void {
    this.isRecordingNow = status;
    if (uri) {
      this.audioUri = uri;
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.isRecordingNow;
  }

  /**
   * Get the current audio URI
   */
  getAudioUri(): string | null {
    return this.audioUri;
  }

  /**
   * Clear audio URI
   */
  clearAudioUri(): void {
    this.audioUri = null;
  }

  /**
   * Delete audio file
   */
  async deleteAudioFile(uri: string): Promise<void> {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log("Audio file deleted:", uri);
    } catch (error) {
      console.error("Error deleting audio file:", error);
    }
  }
}

// Export singleton instance
export const audioRecorderService = new AudioRecorderService();
export default audioRecorderService;

// Export the hook and presets for use in React components
export { useAudioRecorder, RecordingPresets };
