import ChatScreen from "@/components/core/chat-screen";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function ChatRoot() {
  return (
    <ThemedView style={styles.container}>
      <ChatScreen />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
