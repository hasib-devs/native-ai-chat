/**
 * Speech-to-Text Service using audio recording + API transcription
 * Handles transcription of audio files via API
 *
 * Note: Recording is handled by expo-audio hook in use-speech-recognition.ts
 * This service only handles the transcription part.
 */
class SpeechToTextService {
  // API Configuration - Replace with your STT API
  private apiEndpoint = ""; // e.g., "https://api.openai.com/v1/audio/transcriptions"
  private apiKey = ""; // Set your API key

  /**
   * Set API configuration
   */
  setApiConfig(endpoint: string, apiKey: string): void {
    this.apiEndpoint = endpoint;
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio file using API
   * This is the main method used by the expo-audio hook
   */
  async transcribeAudioFile(uri: string): Promise<string> {
    try {
      console.log("Transcribing audio file:", uri);

      // If API is configured, use it
      if (this.apiEndpoint && this.apiKey) {
        return await this.transcribeWithApi(uri);
      }

      // For demo purposes, return a placeholder
      console.warn("No STT API configured. Using demo transcript.");
      return "Demo transcript - Configure your STT API to get real transcription";
    } catch (error) {
      console.error("Error transcribing audio:", error);
      throw error;
    }
  }

  /**
   * Transcribe audio file using configured API
   * Replace this with your preferred STT API implementation
   */
  private async transcribeWithApi(uri: string): Promise<string> {
    try {
      // Example implementation for OpenAI Whisper API
      // You'll need to adapt this for your chosen API

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: "audio/m4a",
        name: "audio.m4a",
      } as any);
      formData.append("model", "whisper-1");

      const response = await fetch(this.apiEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("Error transcribing with API:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();
export default speechToTextService;
