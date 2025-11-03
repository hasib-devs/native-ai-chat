import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { ChatMessage } from "@/utils/aiResponses";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface LearningStats {
  totalMessages: number;
  wordsLearned: number;
  grammarCorrections: number;
  topicsDiscussed: Set<string>;
  conversationLevel: "beginner" | "intermediate" | "advanced";
  streakDays: number;
  lastActive: string;
}

interface LearningProgressProps {
  visible: boolean;
  onClose: () => void;
  conversationHistory: ChatMessage[];
}

const STATS_STORAGE_KEY = "@english_chat_learning_stats";

export const LearningProgress: React.FC<LearningProgressProps> = ({
  visible,
  onClose,
  conversationHistory,
}) => {
  const [stats, setStats] = useState<LearningStats>({
    totalMessages: 0,
    wordsLearned: 0,
    grammarCorrections: 0,
    topicsDiscussed: new Set(),
    conversationLevel: "beginner",
    streakDays: 1,
    lastActive: new Date().toDateString(),
  });
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    if (visible) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, conversationHistory]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const savedStats = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      let currentStats: LearningStats = {
        totalMessages: 0,
        wordsLearned: 0,
        grammarCorrections: 0,
        topicsDiscussed: new Set(),
        conversationLevel: "beginner",
        streakDays: 1,
        lastActive: new Date().toDateString(),
      };

      if (savedStats) {
        const parsed = JSON.parse(savedStats);
        currentStats = {
          ...parsed,
          topicsDiscussed: new Set(parsed.topicsDiscussed || []),
        };
      }

      // Update stats based on current conversation
      const userMessages = conversationHistory.filter(
        (msg) => msg.sender === "user"
      );
      currentStats.totalMessages = userMessages.length;

      // Calculate conversation level based on complexity
      const avgWordCount =
        userMessages.reduce((acc, msg) => acc + msg.text.split(" ").length, 0) /
        Math.max(userMessages.length, 1);

      if (avgWordCount > 15) currentStats.conversationLevel = "advanced";
      else if (avgWordCount > 8)
        currentStats.conversationLevel = "intermediate";
      else currentStats.conversationLevel = "beginner";

      // Update streak
      const today = new Date().toDateString();
      if (currentStats.lastActive !== today) {
        const lastActiveDate = new Date(currentStats.lastActive);
        const todayDate = new Date(today);
        const diffTime = Math.abs(
          todayDate.getTime() - lastActiveDate.getTime()
        );
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStats.streakDays += 1;
        } else if (diffDays > 1) {
          currentStats.streakDays = 1;
        }
        currentStats.lastActive = today;
      }

      setStats(currentStats);
      await saveStats(currentStats);
    } catch (error) {
      console.error("Failed to load learning stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveStats = async (statsToSave: LearningStats) => {
    try {
      const serializable = {
        ...statsToSave,
        topicsDiscussed: Array.from(statsToSave.topicsDiscussed),
      };
      await AsyncStorage.setItem(
        STATS_STORAGE_KEY,
        JSON.stringify(serializable)
      );
    } catch (error) {
      console.error("Failed to save learning stats:", error);
    }
  };

  const getLevelColor = () => {
    switch (stats.conversationLevel) {
      case "beginner":
        return "#51cf66";
      case "intermediate":
        return "#ffd43b";
      case "advanced":
        return "#ff6b6b";
    }
  };

  const getLevelIcon = () => {
    switch (stats.conversationLevel) {
      case "beginner":
        return "leaf.fill";
      case "intermediate":
        return "star.fill";
      case "advanced":
        return "crown.fill";
    }
  };

  const StatCard: React.FC<{
    icon: string;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }> = ({ icon, title, value, subtitle, color = colors.tint }) => (
    <View
      style={[
        styles.statCard,
        { borderColor: color + "30", backgroundColor: color + "10" },
      ]}
    >
      <IconSymbol name={icon as any} size={24} color={color} />
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={styles.statTitle}>{title}</ThemedText>
      {subtitle && (
        <ThemedText style={styles.statSubtitle}>{subtitle}</ThemedText>
      )}
    </View>
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
            Learning Progress 📈
          </ThemedText>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.tint }]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={16} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>
              Loading your progress...
            </ThemedText>
          </View>
        ) : (
          <View style={styles.content}>
            {/* Level Badge */}
            <View
              style={[styles.levelBadge, { backgroundColor: getLevelColor() }]}
            >
              <IconSymbol name={getLevelIcon()} size={20} color="white" />
              <ThemedText style={styles.levelText}>
                {stats.conversationLevel.toUpperCase()} LEVEL
              </ThemedText>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="message.fill"
                title="Messages Sent"
                value={stats.totalMessages}
                subtitle="Keep chatting!"
                color="#4ecdc4"
              />

              <StatCard
                icon="flame.fill"
                title="Day Streak"
                value={stats.streakDays}
                subtitle="Consistency is key!"
                color="#ff6b6b"
              />

              <StatCard
                icon="book.fill"
                title="Words Learned"
                value={stats.wordsLearned}
                subtitle="Building vocabulary"
                color="#ffd43b"
              />

              <StatCard
                icon="checkmark.circle.fill"
                title="Grammar Tips"
                value={stats.grammarCorrections}
                subtitle="Improving accuracy"
                color="#51cf66"
              />
            </View>

            {/* Encouragement */}
            <View style={styles.encouragementSection}>
              <ThemedText style={styles.encouragementTitle}>
                🎉 Great Progress!
              </ThemedText>
              <ThemedText style={styles.encouragementText}>
                {stats.conversationLevel === "beginner" &&
                  "You're building a strong foundation! Keep practicing daily to improve your confidence."}
                {stats.conversationLevel === "intermediate" &&
                  "Excellent improvement! You're expressing yourself well. Try using more complex vocabulary."}
                {stats.conversationLevel === "advanced" &&
                  "Outstanding! Your English is very sophisticated. Focus on nuanced expressions and idioms."}
              </ThemedText>
            </View>

            {/* Next Goal */}
            <View style={styles.goalSection}>
              <ThemedText style={styles.goalTitle}>Next Goal 🎯</ThemedText>
              <ThemedText style={styles.goalText}>
                {stats.totalMessages < 10 &&
                  "Send 10 messages to unlock vocabulary tracking"}
                {stats.totalMessages >= 10 &&
                  stats.totalMessages < 25 &&
                  "Reach 25 messages to improve your level"}
                {stats.totalMessages >= 25 &&
                  stats.totalMessages < 50 &&
                  "Keep your streak going for 7 days"}
                {stats.totalMessages >= 50 &&
                  "You're doing amazing! Keep practicing daily!"}
              </ThemedText>
            </View>
          </View>
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
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 24,
    gap: 8,
  },
  levelText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: "center",
  },
  encouragementSection: {
    padding: 16,
    backgroundColor: "rgba(69, 183, 209, 0.1)",
    borderRadius: 12,
    marginBottom: 16,
  },
  encouragementTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  encouragementText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    opacity: 0.8,
  },
  goalSection: {
    padding: 16,
    backgroundColor: "rgba(255, 212, 59, 0.1)",
    borderRadius: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  goalText: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.8,
  },
});
