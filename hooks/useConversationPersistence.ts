import { ChatMessage } from "@/utils/aiResponses";
import {
  clearCurrentConversation,
  loadCurrentConversation,
  saveConversationToHistory,
  saveCurrentConversation,
} from "@/utils/conversationStorage";
import { useCallback, useEffect } from "react";
import { IMessage } from "react-native-gifted-chat";

interface UseConversationPersistenceProps {
  messages: IMessage[];
  conversationHistory: ChatMessage[];
  setMessages: (messages: IMessage[]) => void;
  setConversationHistory: (history: ChatMessage[]) => void;
}

export const useConversationPersistence = ({
  messages,
  conversationHistory,
  setMessages,
  setConversationHistory,
}: UseConversationPersistenceProps) => {
  // Load conversation on app start
  const loadConversation = useCallback(async () => {
    try {
      const savedConversation = await loadCurrentConversation();
      if (savedConversation && savedConversation.messages.length > 1) {
        setMessages(savedConversation.messages);
        setConversationHistory(savedConversation.history);
        return true; // Conversation was loaded
      }
      return false; // No conversation to load
    } catch (error) {
      console.error("Failed to load conversation:", error);
      return false;
    }
  }, [setMessages, setConversationHistory]);

  // Save conversation automatically
  const saveConversation = useCallback(async () => {
    try {
      if (messages.length > 0) {
        await saveCurrentConversation(messages, conversationHistory);
      }
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  }, [messages, conversationHistory]);

  // Start new conversation
  const startNewConversation = useCallback(async () => {
    try {
      // Save current conversation to history if it has content
      if (messages.length > 1) {
        await saveConversationToHistory(messages, conversationHistory);
      }

      // Clear current conversation
      await clearCurrentConversation();

      // Reset to welcome message only
      const welcomeMessage: IMessage = {
        _id: Math.random().toString(),
        text: "Hello! I'm your English practice buddy. You can type or speak to me - I'm here to help you practice conversational English! 😊",
        createdAt: new Date(),
        user: {
          _id: "ai",
          name: "English Tutor",
          avatar: "🤖",
        },
      };

      setMessages([welcomeMessage]);
      setConversationHistory([]);

      return welcomeMessage;
    } catch (error) {
      console.error("Failed to start new conversation:", error);
      return null;
    }
  }, [messages, conversationHistory, setMessages, setConversationHistory]);

  // Auto-save conversation when messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveConversation();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [saveConversation]);

  return {
    loadConversation,
    saveConversation,
    startNewConversation,
  };
};
