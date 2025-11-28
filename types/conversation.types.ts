/**
 * Conversation and Message Types
 */

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  audioUrl?: string;
  isPlaying?: boolean;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  duration?: number;
  transcriptionConfidence?: number;
  language?: string;
  correctedText?: string;
  suggestions?: string[];
}

export interface Conversation {
  id: string;
  messages: Message[];
  startedAt: number;
  endedAt?: number;
  topic?: string;
  userLevel?: EnglishLevel;
}

export type EnglishLevel = "beginner" | "intermediate" | "advanced";

export interface ConversationContext {
  userId: string;
  userLevel: EnglishLevel;
  learningGoals: string[];
  currentTopic?: string;
  conversationHistory: Message[];
}

export interface ConversationState {
  currentConversation: Conversation | null;
  voiceState: "idle" | "listening" | "speaking" | "processing";
  error: string | null;
  isLoading: boolean;
}

export interface ConversationStats {
  totalMessages: number;
  totalDuration: number;
  userSpeakingTime: number;
  aiSpeakingTime: number;
  averageResponseTime: number;
}
