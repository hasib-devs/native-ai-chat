import RealtimeTranscriberRoot from "@/components/core/RealtimeTranscriber";
import { ThemedView } from "@/components/themed-view";
import { StyleSheet } from "react-native";

export default function ChatScreen() {
  return (
    <ThemedView style={styles.container}>
      <RealtimeTranscriberRoot />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
});
