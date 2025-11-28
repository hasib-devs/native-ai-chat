import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet, Text } from "react-native";

export default function ChatRoot() {
  return (
    <ThemedView style={styles.container}>
      {/* <ChatScreen /> */}
      <Text>ChatScreen is currently disabled for demonstration purposes.</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    color: "red",
    textAlign: "center",
  },
});
