import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

/**
 * Audio Recorder Service
 * Handles audio recording using Expo AV
 */
class AudioRecorderService {
  private recording: Audio.Recording | null = null;
  private recordingUri: string | null = null;
  private isRecordingNow = false;
  private recordingDuration = 0;
  private audioLevelCallback?: (level: number) => void;

  /**
   * Request audio recording permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting audio permissions:", error);
      return false;
    }
  }

  /**
   * Check if permissions are granted
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Audio.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking audio permissions:", error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(onAudioLevel?: (level: number) => void): Promise<void> {
    try {
      // Check permissions
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error("Audio recording permission denied");
        }
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording) {
            this.recordingDuration = status.durationMillis;
            // Calculate audio level (0-1)
            const level = status.metering ? (status.metering + 160) / 160 : 0;
            if (this.audioLevelCallback) {
              this.audioLevelCallback(Math.max(0, Math.min(1, level)));
            }
          }
        },
        100 // Update interval in ms
      );

      this.recording = recording;
      this.isRecordingNow = true;
      this.audioLevelCallback = onAudioLevel;
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  /**
   * Stop recording and return the audio URI
   */
  async stopRecording(): Promise<string | null> {
    try {
      if (!this.recording) {
        throw new Error("No active recording");
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();

      this.recordingUri = uri;
      this.recording = null;
      this.isRecordingNow = false;
      this.audioLevelCallback = undefined;

      return uri;
    } catch (error) {
      console.error("Error stopping recording:", error);
      this.recording = null;
      this.isRecordingNow = false;
      throw error;
    }
  }

  /**
   * Cancel current recording
   */
  async cancelRecording(): Promise<void> {
    try {
      if (this.recording) {
        await this.recording.stopAndUnloadAsync();
        this.recording = null;
      }
      this.isRecordingNow = false;
      this.recordingUri = null;
      this.audioLevelCallback = undefined;
    } catch (error) {
      console.error("Error canceling recording:", error);
    }
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.isRecordingNow;
  }

  /**
   * Get recording duration in milliseconds
   */
  getDuration(): number {
    return this.recordingDuration;
  }

  /**
   * Get last recording URI
   */
  getLastRecordingUri(): string | null {
    return this.recordingUri;
  }

  /**
   * Delete recording file
   */
  async deleteRecording(uri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
      }
    } catch (error) {
      console.error("Error deleting recording:", error);
    }
  }

  /**
   * Play recorded audio
   */
  async playRecording(uri: string): Promise<Audio.Sound | null> {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      return sound;
    } catch (error) {
      console.error("Error playing recording:", error);
      return null;
    }
  }
}

// Export singleton instance
export const audioRecorderService = new AudioRecorderService();
