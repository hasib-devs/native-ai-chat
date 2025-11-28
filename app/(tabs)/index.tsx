import { ThemedView } from "@/components/themed-view";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { StyleSheet, Text } from "react-native";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetail}>{this.state.error?.message}</Text>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

export default function ChatRoot() {
  return (
    <ErrorBoundary>
      <ThemedView style={styles.container}>
        {/* <ChatScreen /> */}
        <Text>
          ChatScreen is currently disabled for demonstration purposes.
        </Text>
      </ThemedView>
    </ErrorBoundary>
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
