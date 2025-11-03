import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import {
  clearAllConversations,
  ConversationSession,
  loadConversationHistory,
} from "@/utils/conversationStorage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface ConversationHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectConversation: (session: ConversationSession) => void;
}

export const ConversationHistoryModal: React.FC<
  ConversationHistoryModalProps
> = ({ visible, onClose, onSelectConversation }) => {
  const [conversations, setConversations] = useState<ConversationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (visible) {
      loadConversations();
    }
  }, [visible]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const history = await loadConversationHistory();
      setConversations(history);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Conversations",
      "This will permanently delete all saved conversations. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await clearAllConversations();
              setConversations([]);
            } catch {
              Alert.alert("Error", "Failed to clear conversations");
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderConversationItem = ({ item }: { item: ConversationSession }) => (
    <TouchableOpacity
      style={[
        styles.conversationItem,
        {
          backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8",
          borderColor: colorScheme === "dark" ? "#444" : "#e0e0e0",
        },
      ]}
      onPress={() => {
        onSelectConversation(item);
        onClose();
      }}
    >
      <View style={styles.conversationHeader}>
        <ThemedText style={styles.conversationTitle} numberOfLines={1}>
          {item.title}
        </ThemedText>
        <ThemedText style={styles.conversationDate}>
          {formatDate(item.updatedAt)}
        </ThemedText>
      </View>
      <ThemedText style={styles.messageCount} numberOfLines={1}>
        {item.messages.length} messages
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.header,
            { borderBottomColor: colorScheme === "dark" ? "#333" : "#e0e0e0" },
          ]}
        >
          <ThemedText type="title" style={styles.headerTitle}>
            Conversation History
          </ThemedText>
          <View style={styles.headerButtons}>
            {conversations.length > 0 && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: "#ff4444" }]}
                onPress={handleClearAll}
              >
                <IconSymbol name="trash" size={16} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.tint }]}
              onPress={onClose}
            >
              <IconSymbol name="xmark" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              Loading conversations...
            </ThemedText>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="message" size={48} color={colors.icon} />
            <ThemedText style={styles.emptyText}>
              No saved conversations yet
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Your chat history will appear here after you start conversations
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  clearButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    padding: 16,
  },
  conversationItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  conversationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  conversationDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  messageCount: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
});
