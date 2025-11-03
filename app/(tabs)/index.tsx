import React, { useCallback, useEffect, useState } from "react";
import { Alert, TouchableOpacity, View, useColorScheme } from "react-native";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
} from "react-native-gifted-chat";

import { ConversationHistoryModal } from "@/components/ConversationHistoryModal";
import { EnhancedMicButton } from "@/components/EnhancedMicButton";
import { LearningInsights } from "@/components/LearningInsights";
import { LearningProgress } from "@/components/LearningProgress";
import { ModelDownloadModal } from "@/components/ModelDownloadModal";
import { PronunciationFeedback } from "@/components/PronunciationFeedback";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { TypingIndicator } from "@/components/TypingIndicator";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { VoiceSettingsModal } from "@/components/VoiceSettingsModal";
import { Colors } from "@/constants/theme";
import { useConversationPersistence } from "@/hooks/useConversationPersistence";
import {
  AudioAnalysisResult,
  useEnhancedSpeechToText,
} from "@/hooks/useEnhancedSpeechToText";
import { useOfflineSpeechToText } from "@/hooks/useOfflineSpeechToText";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import {
  AIResponseContext,
  ChatMessage,
  getEnhancedAIResponse,
} from "@/utils/aiResponses";
import { ConversationSession } from "@/utils/conversationStorage";
import { styles } from "./styles";

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [currentInsights, setCurrentInsights] =
    useState<AIResponseContext | null>(null);
  const [isAITyping, setIsAITyping] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Pronunciation feedback states
  const [showPronunciationFeedback, setShowPronunciationFeedback] =
    useState(false);
  const [pronunciationResult, setPronunciationResult] =
    useState<AudioAnalysisResult | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);

  // Offline AI states
  const [showModelDownload, setShowModelDownload] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    isListening: isEnhancedListening,
    isAnalyzing,
    startListening: startEnhancedListening,
    stopListening: stopEnhancedListening,
    voiceSettings,
    loadVoiceSettings,
    saveVoiceSettings,
  } = useEnhancedSpeechToText();

  // Offline speech recognition
  const {
    isListening: isOfflineListening,
    isProcessing: isOfflineProcessing,
    isOnline,
    isOfflineCapable,
    currentModel,
    config: offlineConfig,
    startListening: startOfflineListening,
    stopListening: stopOfflineListening,
    getRecommendedStrategy,
    offlineService,
  } = useOfflineSpeechToText();

  const { speak } = useTextToSpeech();
  const { loadConversation, startNewConversation } = useConversationPersistence(
    {
      messages,
      conversationHistory,
      setMessages,
      setConversationHistory,
    }
  );

  const handleModelUpdate = useCallback(() => {
    // Refresh offline speech service when models are updated
    if (offlineService) {
      // This will trigger a re-check of available models
      loadVoiceSettings();
    }
  }, [offlineService, loadVoiceSettings]);

  // Load voice settings on mount
  useEffect(() => {
    loadVoiceSettings();
  }, [loadVoiceSettings]);

  // Initialize chat - load saved conversation or create welcome message
  useEffect(() => {
    const initializeChat = async () => {
      setIsLoading(true);
      const conversationLoaded = await loadConversation();

      if (!conversationLoaded) {
        // No saved conversation, create welcome message
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

        // Speak welcome message only for new conversations
        speak(welcomeMessage.text);
      }
      setIsLoading(false);
    };

    initializeChat();
  }, [loadConversation, speak]);

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

      // Show typing indicator
      setIsAITyping(true);

      // Generate AI response
      setTimeout(() => {
        setIsAITyping(false);
        const enhancedResponse = getEnhancedAIResponse(
          userMessage.text,
          conversationHistory
        );

        const aiMessage: IMessage = {
          _id: Math.random().toString(),
          text: enhancedResponse.text,
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
          text: enhancedResponse.text,
          sender: "ai",
          timestamp: aiMessage.createdAt as Date,
        };

        setConversationHistory((prev) => [...prev, aiChatMessage]);

        // Show learning insights if available
        if (
          enhancedResponse.context.responseType === "correction" ||
          enhancedResponse.context.responseType === "teaching" ||
          (enhancedResponse.context.vocabularyWords &&
            enhancedResponse.context.vocabularyWords.length > 0) ||
          (enhancedResponse.context.grammarSuggestions &&
            enhancedResponse.context.grammarSuggestions.length > 0)
        ) {
          setCurrentInsights(enhancedResponse.context);
        }

        // Speak AI response
        speak(enhancedResponse.text);
      }, 1000); // Small delay to simulate thinking
    },
    [conversationHistory, speak]
  );

  // Handle voice input
  // const handleStartListening = useCallback(async () => {
  //   try {
  //     await startListening();
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to start voice recording");
  //   }
  // }, [startListening]);

  // const handleStopListening = useCallback(async () => {
  //   try {
  //     const transcribedText = await stopListening();
  //     if (transcribedText.trim()) {
  //       const userMessage: IMessage = {
  //         _id: Math.random().toString(),
  //         text: transcribedText,
  //         createdAt: new Date(),
  //         user: {
  //           _id: "user",
  //           name: "You",
  //         },
  //       };
  //       onSend([userMessage]);
  //     }
  //   } catch (error) {
  //     Alert.alert("Error", "Failed to process voice input");
  //   }
  // }, [stopListening, onSend]);

  // Handle enhanced voice input with pronunciation analysis
  const handleEnhancedVoiceInput =
    useCallback(async (): Promise<AudioAnalysisResult> => {
      try {
        const result = await stopEnhancedListening();

        // If analysis is successful and has transcription, send as message
        if (result.transcription && result.transcription.trim()) {
          const userMessage: IMessage = {
            _id: Math.random().toString(),
            text: result.transcription,
            createdAt: new Date(),
            user: {
              _id: "user",
              name: "You",
            },
          };
          onSend([userMessage]);
        }

        return result;
      } catch {
        Alert.alert("Error", "Failed to analyze pronunciation");
        return {
          transcription: "",
          confidence: 0,
          pronunciationScore: 0,
          wordAnalysis: [],
          suggestedImprovements: ["Analysis failed. Please try again."],
          audioQuality: "poor",
        };
      }
    }, [stopEnhancedListening, onSend]);

  // Handle pronunciation feedback display
  const handleShowPronunciationFeedback = useCallback(
    (result: AudioAnalysisResult) => {
      setPronunciationResult(result);
      setShowPronunciationFeedback(true);
    },
    []
  );

  // Handle offline voice input
  // const handleOfflineVoiceInput = useCallback(async () => {
  //   try {
  //     const result = await stopOfflineListening();

  //     if (result && result.transcription.trim()) {
  //       const userMessage: IMessage = {
  //         _id: Math.random().toString(),
  //         text: result.transcription,
  //         createdAt: new Date(),
  //         user: {
  //           _id: "user",
  //           name: "You",
  //         },
  //       };
  //       onSend([userMessage]);
  //     }
  //   } catch (err) {
  //     console.error("Failed to process offline voice input:", err);
  //     Alert.alert("Error", "Failed to process offline voice input");
  //   }
  // }, [stopOfflineListening, onSend]);

  // Handle voice settings update
  const handleUpdateVoiceSettings = useCallback(
    (newSettings: typeof voiceSettings) => {
      saveVoiceSettings(newSettings);
    },
    [saveVoiceSettings]
  );

  // Handle new conversation
  const handleNewConversation = useCallback(async () => {
    Alert.alert(
      "Start New Conversation",
      "This will save your current conversation and start fresh. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Start New",
          onPress: async () => {
            const welcomeMessage = await startNewConversation();
            if (welcomeMessage) {
              speak(welcomeMessage.text);
            }
          },
        },
      ]
    );
  }, [startNewConversation, speak]);

  // Handle loading conversation from history
  const handleLoadConversation = useCallback((session: ConversationSession) => {
    setMessages(session.messages);
    setConversationHistory(session.history);
  }, []);

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
        {offlineConfig.preferOffline ? (
          <EnhancedMicButton
            isListening={isOfflineListening}
            isAnalyzing={isOfflineProcessing}
            onStartListening={startOfflineListening}
            onStopListening={async () => {
              try {
                const result = await stopOfflineListening();
                if (result) {
                  // Convert OfflineSTTResult to AudioAnalysisResult for feedback display
                  const analysisResult: AudioAnalysisResult = {
                    transcription: result.transcription,
                    confidence: result.confidence,
                    pronunciationScore: Math.round(result.confidence * 100),
                    wordAnalysis: [],
                    suggestedImprovements: [
                      `Processed ${
                        result.isOffline ? "offline" : "online"
                      } using ${result.model}`,
                    ],
                    audioQuality:
                      result.confidence > 0.8
                        ? "excellent"
                        : result.confidence > 0.6
                        ? "good"
                        : result.confidence > 0.4
                        ? "fair"
                        : "poor",
                  };
                  handleShowPronunciationFeedback(analysisResult);
                  return analysisResult;
                }
                return {
                  transcription: "",
                  confidence: 0,
                  pronunciationScore: 0,
                  wordAnalysis: [],
                  suggestedImprovements: [],
                  audioQuality: "poor" as const,
                };
              } catch (err) {
                console.error("Offline processing failed:", err);
                return {
                  transcription: "",
                  confidence: 0,
                  pronunciationScore: 0,
                  wordAnalysis: [],
                  suggestedImprovements: ["Processing failed"],
                  audioQuality: "poor" as const,
                };
              }
            }}
            onShowFeedback={handleShowPronunciationFeedback}
            disabled={!isOfflineCapable && !isOnline}
          />
        ) : (
          <EnhancedMicButton
            isListening={isEnhancedListening}
            isAnalyzing={isAnalyzing}
            onStartListening={startEnhancedListening}
            onStopListening={handleEnhancedVoiceInput}
            onShowFeedback={handleShowPronunciationFeedback}
            disabled={!voiceSettings.analysisEnabled}
          />
        )}
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
      {/* Header with New Chat button */}
      <View
        style={[
          styles.header,
          { borderBottomColor: colorScheme === "dark" ? "#333" : "#e0e0e0" },
        ]}
      >
        <ThemedText type="subtitle" style={styles.headerTitle}>
          English Practice Chat
        </ThemedText>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.progressButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowProgressModal(true)}
          >
            <IconSymbol name="chart.bar.fill" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.progressButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowModelDownload(true)}
          >
            <IconSymbol name="square.and.arrow.down" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.progressButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowVoiceSettings(true)}
          >
            <IconSymbol name="gear" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowHistoryModal(true)}
          >
            <IconSymbol name="clock" size={16} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.newChatButton, { backgroundColor: colors.tint }]}
            onPress={handleNewConversation}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="white" />
            <ThemedText style={[styles.newChatText, { color: "white" }]}>
              New
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Status Indicator */}
      <View style={styles.statusBar}>
        <View style={styles.connectionStatus}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: isOnline ? "#34C759" : "#FF9500" },
            ]}
          />
          <ThemedText style={styles.statusText}>
            {isOnline ? "Online" : "Offline"}
          </ThemedText>
        </View>

        {isOfflineCapable && (
          <View style={styles.offlineStatus}>
            <IconSymbol name="cpu" size={14} color={colors.tint} />
            <ThemedText style={[styles.statusText, { color: colors.tint }]}>
              {currentModel || "Offline Ready"}
            </ThemedText>
          </View>
        )}

        <ThemedText
          style={[styles.strategyText, { color: colors.text }]}
          numberOfLines={1}
        >
          {getRecommendedStrategy()}
        </ThemedText>
      </View>

      {/* Loading state */}
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>
            Loading conversation...
          </ThemedText>
        </ThemedView>
      ) : (
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
          scrollToBottomComponent={() => (
            <IconSymbol
              name="arrow.down.circle"
              size={24}
              color={colors.tint}
            />
          )}
        />
      )}

      {/* Typing Indicator */}
      <TypingIndicator visible={isAITyping} />

      {/* Learning Insights */}
      {currentInsights && (
        <LearningInsights
          context={currentInsights}
          onDismiss={() => setCurrentInsights(null)}
        />
      )}

      <ConversationHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectConversation={handleLoadConversation}
      />

      <LearningProgress
        visible={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        conversationHistory={conversationHistory}
      />

      <PronunciationFeedback
        visible={showPronunciationFeedback}
        onClose={() => setShowPronunciationFeedback(false)}
        analysisResult={pronunciationResult}
        onRetry={() => {
          setShowPronunciationFeedback(false);
          startEnhancedListening();
        }}
      />

      <VoiceSettingsModal
        visible={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        settings={voiceSettings}
        onUpdateSettings={handleUpdateVoiceSettings}
      />

      <ModelDownloadModal
        visible={showModelDownload}
        onClose={() => setShowModelDownload(false)}
        onModelUpdate={handleModelUpdate}
      />
    </ThemedView>
  );
}
