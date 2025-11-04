import { MicButton } from "@/components/MicButton";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

const Index = () => {
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
  ]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const onSend = (newMessages: IMessage[] = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View>
        <Text>Welcome to Native AI Chat!</Text>
      </View>

      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: "user",
          name: "You",
        }}
        placeholder="Type your message or use the microphone..."
        showAvatarForEveryMessage={true}
        // renderBubble={renderBubble}
        renderInputToolbar={() => {
          return (
            <>
              <View style={styles.inputToolbarContainer}>
                <MicButton />
              </View>
            </>
          );
        }}
        // renderSend={renderSend}
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
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  inputToolbarContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});
