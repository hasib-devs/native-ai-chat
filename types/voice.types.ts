/**
 * Voice and Speech Types
 */

export type VoiceState = "idle" | "listening" | "speaking" | "processing";

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface TextToSpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  voice?: string;
  volume?: number;
}

export interface AudioLevel {
  level: number; // 0-1
  timestamp: number;
}

export interface VoiceSettings {
  autoPlayResponses: boolean;
  speechRate: number;
  speechPitch: number;
  language: string;
  voiceId?: string;
}

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioLevel: number;
}

export interface SpeechError {
  code: string;
  message: string;
  timestamp: number;
}

export type SpeechPermissionStatus = "granted" | "denied" | "undetermined";
