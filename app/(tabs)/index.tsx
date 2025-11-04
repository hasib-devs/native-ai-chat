import { MicButton } from "@/components/mic-button";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useWhisper } from "@/hooks/use-whisper";
import { useState } from "react";
import { Pressable, StyleSheet, useColorScheme, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { transcriber, isRealtimeActive } = useWhisper();

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const onSend = (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  // const speak = async (text: string) => {
  //   console.log("Speaking...");
  //   Speech.speak(text);
  // };

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
              <View style={styles.inputToolbar}>
                <Pressable
                  style={styles.touchable}
                  // onPress={() => {
                  //   console.log("Start...");
                  //   if (transcriber) {
                  //     if (isRealtimeActive) {
                  //       transcriber.stop();
                  //     } else {
                  //       transcriber.start();
                  //     }
                  //   }
                  // }}
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
