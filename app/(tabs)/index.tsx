import { MicButton } from "@/components/mic-button";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useWhisperModels } from "@/hooks/use-whisper-models";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

export default function ChatScreen() {
  const [error, setError] = useState<string>("");
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: "Hello! How can I assist you today?",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },
    {
      _id: 2,
      text: "Hi there! I am Native AI Chat. Ask me anything.",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 3,
      text: "Welcome to the Native AI Chat application!",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 4,
      text: "How can I help you today?",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 5,
      text: "I'm here to assist you with any questions you may have.",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 6,
      text: "Feel free to ask me anything!",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 7,
      text: "I'm here to help you with any questions you may have.",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 8,
      text: "Let's chat and explore what I can do for you!",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 9,
      text: "I'm here to assist you with any questions you may have.",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 10,
      text: "Feel free to ask me anything!",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 11,
      text: "I'm here to help you with any questions you may have.",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },

    {
      _id: 12,
      text: "Let's chat and explore what I can do for you!",
      createdAt: new Date(),
      user: {
        _id: "ai",
        name: "Native AI",
      },
    },
  ]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    initializeWhisperModel,
    isDownloading,
    getDownloadProgress,
    currentModelId,
    isInitializingModel,
    whisperContext,
    getCurrentModel,
  } = useWhisperModels();

  const onSend = (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  const speak = async (text: string) => {
    console.log("Speaking...");
    Speech.speak(text);
  };

  const initializeModel = async (modelId: string = "base") => {
    try {
      await initializeWhisperModel(modelId, { initVad: false });
    } catch (error) {
      console.error("Failed to initialize model:", error);
      setError(`Failed to initialize model: ${error}`);
    }
  };

  useEffect(() => {
    initializeModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const downloadPercentage = getDownloadProgress(currentModelId || "base") ?? 0;
  const activeModelLabel = getCurrentModel()?.label || "Model";
  const whisperStatusText = isDownloading
    ? `Downloading ${activeModelLabel} · ${(downloadPercentage * 100).toFixed(
        0
      )}%`
    : isInitializingModel
    ? "Initializing…"
    : whisperContext
    ? `Ready · ${activeModelLabel}`
    : "Not initialized";

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
        renderInputToolbar={() => {
          return (
            <>
              <View>
                {error ? (
                  <Text>Something went wrong: {error}</Text>
                ) : (
                  <Text>Status: {whisperStatusText}</Text>
                )}
              </View>

              <View style={styles.inputToolbar}>
                <Pressable
                  style={styles.touchable}
                  onPress={() => {
                    speak("Hello! How can I assist you today?");
                  }}
                >
                  <MicButton />
                </Pressable>
              </View>
            </>
          );
        }}
        scrollToBottomComponent={() => (
          <View>
            <IconSymbol
              name="arrow.down.circle"
              size={24}
              color={colors.tint}
            />
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  inputToolbar: {
    marginBottom: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  touchable: {
    width: 40,
    height: 40,
  },
});
