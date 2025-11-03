import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { AIResponseContext } from "@/utils/aiResponses";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface LearningInsightsProps {
  context: AIResponseContext;
  onDismiss: () => void;
}

export const LearningInsights: React.FC<LearningInsightsProps> = ({
  context,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const hasInsights =
    (context.grammarSuggestions && context.grammarSuggestions.length > 0) ||
    (context.vocabularyWords && context.vocabularyWords.length > 0) ||
    context.detectedTopics.length > 0;

  if (!hasInsights) return null;

  const getResponseTypeColor = () => {
    switch (context.responseType) {
      case "correction":
        return "#ff6b6b";
      case "teaching":
        return "#4ecdc4";
      case "encouragement":
        return "#45b7d1";
      default:
        return colors.tint;
    }
  };

  const getResponseTypeIcon = () => {
    switch (context.responseType) {
      case "correction":
        return "checkmark.circle";
      case "teaching":
        return "book.fill";
      case "encouragement":
        return "star.fill";
      case "question":
        return "questionmark.circle";
      default:
        return "message.fill";
    }
  };

  const getDifficultyColor = (difficulty: "easy" | "medium" | "hard") => {
    switch (difficulty) {
      case "easy":
        return "#51cf66";
      case "medium":
        return "#ffd43b";
      case "hard":
        return "#ff6b6b";
    }
  };

  return (
    <ThemedView
      style={[styles.container, { borderColor: getResponseTypeColor() }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconSymbol
            name={getResponseTypeIcon()}
            size={16}
            color={getResponseTypeColor()}
          />
          <ThemedText
            style={[styles.headerTitle, { color: getResponseTypeColor() }]}
          >
            Learning Insights
          </ThemedText>
          {context.conversationLevel && (
            <View
              style={[
                styles.levelBadge,
                { backgroundColor: getResponseTypeColor() },
              ]}
            >
              <ThemedText style={styles.levelText}>
                {context.conversationLevel.toUpperCase()}
              </ThemedText>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <IconSymbol name="xmark" size={14} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Grammar Suggestions */}
      {context.grammarSuggestions && context.grammarSuggestions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="pencil" size={14} color="#ff6b6b" />
            <ThemedText style={[styles.sectionTitle, { color: "#ff6b6b" }]}>
              Grammar Tip
            </ThemedText>
          </View>
          {context.grammarSuggestions.map((suggestion, index) => (
            <ThemedText key={index} style={styles.suggestionText}>
              {suggestion}
            </ThemedText>
          ))}
        </View>
      )}

      {/* Vocabulary Words */}
      {context.vocabularyWords && context.vocabularyWords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="book" size={14} color="#4ecdc4" />
            <ThemedText style={[styles.sectionTitle, { color: "#4ecdc4" }]}>
              New Vocabulary
            </ThemedText>
          </View>
          {context.vocabularyWords.map((word, index) => (
            <View key={index} style={styles.vocabularyCard}>
              <View style={styles.vocabularyHeader}>
                <ThemedText style={styles.vocabularyWord}>
                  {word.word}
                </ThemedText>
                <View
                  style={[
                    styles.difficultyBadge,
                    { backgroundColor: getDifficultyColor(word.difficulty) },
                  ]}
                >
                  <ThemedText style={styles.difficultyText}>
                    {word.difficulty}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.vocabularyDefinition}>
                {word.definition}
              </ThemedText>
              <ThemedText style={styles.vocabularyExample}>
                Example:{" "}
                <ThemedText style={styles.exampleText}>
                  &quot;{word.example}&quot;
                </ThemedText>
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Detected Topics */}
      {context.detectedTopics.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <IconSymbol name="tag" size={14} color="#9c88ff" />
            <ThemedText style={[styles.sectionTitle, { color: "#9c88ff" }]}>
              Topics Discussed
            </ThemedText>
          </View>
          <View style={styles.topicsContainer}>
            {context.detectedTopics.map((topic, index) => (
              <View
                key={index}
                style={[
                  styles.topicTag,
                  {
                    backgroundColor: colors.tint + "20",
                    borderColor: colors.tint,
                  },
                ]}
              >
                <ThemedText style={[styles.topicText, { color: colors.tint }]}>
                  {topic}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  dismissButton: {
    padding: 4,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  vocabularyCard: {
    padding: 12,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    borderRadius: 8,
    marginBottom: 8,
  },
  vocabularyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  vocabularyWord: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4ecdc4",
  },
  difficultyBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "600",
    color: "white",
  },
  vocabularyDefinition: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.8,
  },
  vocabularyExample: {
    fontSize: 13,
    fontStyle: "italic",
    opacity: 0.7,
  },
  exampleText: {
    fontWeight: "500",
  },
  topicsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  topicTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  topicText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
