import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";

import { MicButton } from "@/components/MicButton";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { ChatMessage, getAIResponse } from "@/utils/aiResponses";

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const { isListening, startListening, stopListening } = useSpeechToText();
  const { speak } = useTextToSpeech();

  // Initialize chat with welcome message
  useEffect(() => {
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

    // Speak welcome message
    speak(welcomeMessage.text);
  }, [speak]);

  // Handle sending new messages
  const onSend = useCallback(
    (newMessages: IMessage[] = []) => {
      const userMessage = newMessages[0];

      // Add user message to conversation
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, newMessages)
      );

      // Update conversation history
      const userChatMessage: ChatMessage = {
        id: userMessage._id.toString(),
        text: userMessage.text,
        sender: "user",
        timestamp: userMessage.createdAt as Date,
      };

      setConversationHistory((prev) => [...prev, userChatMessage]);

      // Generate AI response
      setTimeout(() => {
        const aiResponseText = getAIResponse(
          userMessage.text,
          conversationHistory
        );

        const aiMessage: IMessage = {
          _id: Math.random().toString(),
          text: aiResponseText,
          createdAt: new Date(),
          user: {
            _id: "ai",
            name: "English Tutor",
            avatar: "🤖",
          },
        };

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [aiMessage])
        );

        // Update conversation history
        const aiChatMessage: ChatMessage = {
          id: aiMessage._id.toString(),
          text: aiResponseText,
          sender: "ai",
          timestamp: aiMessage.createdAt as Date,
        };

        setConversationHistory((prev) => [...prev, aiChatMessage]);

        // Speak AI response
        speak(aiResponseText);
      }, 1000); // Small delay to simulate thinking
    },
    [conversationHistory, speak]
  );

  // Handle voice input
  const handleStartListening = useCallback(async () => {
    try {
      await startListening();
    } catch (error) {
      Alert.alert("Error", "Failed to start voice recording");
    }
  }, [startListening]);

  const handleStopListening = useCallback(async () => {
    try {
      const transcribedText = await stopListening();
      if (transcribedText.trim()) {
        const userMessage: IMessage = {
          _id: Math.random().toString(),
          text: transcribedText,
          createdAt: new Date(),
          user: {
            _id: "user",
            name: "You",
          },
        };
        onSend([userMessage]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to process voice input");
    }
  }, [stopListening, onSend]);

  // Custom bubble styling
  const renderBubble = (props: any) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: colors.tint,
        },
        left: {
          backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0",
        },
      }}
      textStyle={{
        right: {
          color: "white",
        },
        left: {
          color: colors.text,
        },
      }}
    />
  );

  // Custom input toolbar with microphone button
  const renderInputToolbar = (props: any) => (
    <View style={styles.inputToolbarContainer}>
      <InputToolbar
        {...props}
        containerStyle={[
          styles.inputToolbar,
          {
            backgroundColor: colors.background,
            borderTopColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
          },
        ]}
        primaryStyle={{ alignItems: "center" }}
      />
      <View style={styles.micButtonContainer}>
        <MicButton
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
        />
      </View>
    </View>
  );

  // Custom send button
  const renderSend = (props: any) => (
    <Send {...props}>
      <View style={styles.sendButton}>
        <IconSymbol name="arrow.up.circle.fill" size={32} color={colors.tint} />
      </View>
    </Send>
  );

  return (
    <ThemedView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: "user",
          name: "You",
        }}
        placeholder="Type your message or use the microphone..."
        showAvatarForEveryMessage={true}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        scrollToBottom
        scrollToBottomComponent={() => (
          <IconSymbol name="arrow.down.circle" size={24} color={colors.tint} />
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inputToolbarContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputToolbar: {
    flex: 1,
    marginRight: 10,
    borderTopWidth: 1,
    borderRadius: 25,
    paddingTop: 8,
  },
  micButtonContainer: {
    marginBottom: 8,
  },
  sendButton: {
    marginBottom: 8,
    marginRight: 8,
  },
});
