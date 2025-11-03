import AsyncStorage from "@react-native-async-storage/async-storage";
import { IMessage } from "react-native-gifted-chat";
import { ChatMessage } from "./aiResponses";

const CONVERSATION_KEY = "@english_chat_conversations";
const CURRENT_CONVERSATION_KEY = "@english_chat_current";

export interface ConversationSession {
  id: string;
  title: string;
  messages: IMessage[];
  history: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// Save current conversation
export const saveCurrentConversation = async (
  messages: IMessage[],
  history: ChatMessage[]
): Promise<void> => {
  try {
    const conversation = {
      messages,
      history,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(
      CURRENT_CONVERSATION_KEY,
      JSON.stringify(conversation)
    );
  } catch (error) {
    console.error("Failed to save current conversation:", error);
  }
};

// Load current conversation
export const loadCurrentConversation = async (): Promise<{
  messages: IMessage[];
  history: ChatMessage[];
} | null> => {
  try {
    const data = await AsyncStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (data) {
      const conversation = JSON.parse(data);
      return {
        messages: conversation.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
        history: conversation.history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to load current conversation:", error);
    return null;
  }
};

// Clear current conversation
export const clearCurrentConversation = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error("Failed to clear current conversation:", error);
  }
};

// Save conversation to history
export const saveConversationToHistory = async (
  messages: IMessage[],
  history: ChatMessage[]
): Promise<void> => {
  try {
    if (messages.length <= 1) return; // Don't save empty conversations

    const sessions = await loadConversationHistory();
    const title = generateConversationTitle(messages);

    const newSession: ConversationSession = {
      id: Date.now().toString(),
      title,
      messages,
      history,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedSessions = [newSession, ...sessions.slice(0, 19)]; // Keep last 20 conversations
    await AsyncStorage.setItem(
      CONVERSATION_KEY,
      JSON.stringify(updatedSessions)
    );
  } catch (error) {
    console.error("Failed to save conversation to history:", error);
  }
};

// Load conversation history
export const loadConversationHistory = async (): Promise<
  ConversationSession[]
> => {
  try {
    const data = await AsyncStorage.getItem(CONVERSATION_KEY);
    if (data) {
      const sessions = JSON.parse(data);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        })),
        history: session.history.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to load conversation history:", error);
    return [];
  }
};

// Generate conversation title from first user message
const generateConversationTitle = (messages: IMessage[]): string => {
  const userMessages = messages.filter((msg) => msg.user._id === "user");
  if (userMessages.length > 0) {
    const firstMessage = userMessages[0].text;
    // Take first 30 characters or until first sentence ends
    const title =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30).trim() + "..."
        : firstMessage.trim();
    return title || "English Practice Session";
  }
  return "English Practice Session";
};

// Clear all conversation history
export const clearAllConversations = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      CONVERSATION_KEY,
      CURRENT_CONVERSATION_KEY,
    ]);
  } catch (error) {
    console.error("Failed to clear all conversations:", error);
  }
};
