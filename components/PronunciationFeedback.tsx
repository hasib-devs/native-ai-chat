import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import {
  AudioAnalysisResult,
  WordPronunciation,
} from "../hooks/useEnhancedSpeechToText";

interface PronunciationFeedbackProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: AudioAnalysisResult | null;
  onRetry: () => void;
}

export const PronunciationFeedback: React.FC<PronunciationFeedbackProps> = ({
  visible,
  onClose,
  analysisResult,
  onRetry,
}) => {
  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const backgroundColor = useThemeColor(
    { light: "#FFFFFF", dark: "#1C1C1E" },
    "background"
  );
  const cardColor = useThemeColor(
    { light: "#F2F2F7", dark: "#2C2C2E" },
    "background"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#FFFFFF" },
    "text"
  );
  const secondaryText = "#8E8E93";

  if (!analysisResult) return null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#34C759"; // Green
    if (score >= 75) return "#FF9500"; // Orange
    if (score >= 60) return "#FF9500"; // Orange
    return "#FF3B30"; // Red
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "#34C759";
      case "good":
        return "#30D158";
      case "fair":
        return "#FF9500";
      case "poor":
        return "#FF3B30";
      default:
        return secondaryText;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor":
        return "#34C759";
      case "moderate":
        return "#FF9500";
      case "major":
        return "#FF3B30";
      default:
        return secondaryText;
    }
  };

  const renderWordAnalysis = (word: WordPronunciation, index: number) => (
    <View key={index} style={[styles.wordCard, { backgroundColor: cardColor }]}>
      <View style={styles.wordHeader}>
        <Text style={[styles.wordText, { color: textColor }]}>{word.word}</Text>
        <View
          style={[
            styles.scoreContainer,
            { backgroundColor: getScoreColor(word.score) },
          ]}
        >
          <Text style={styles.scoreText}>{word.score}</Text>
        </View>
      </View>

      <Text style={[styles.phoneticText, { color: secondaryText }]}>
        {word.phonetic}
      </Text>

      {word.issues.length > 0 && (
        <View style={styles.issuesContainer}>
          {word.issues.map((issue, issueIndex) => (
            <View key={issueIndex} style={styles.issueItem}>
              <View
                style={[
                  styles.severityDot,
                  { backgroundColor: getSeverityColor(issue.severity) },
                ]}
              />
              <View style={styles.issueContent}>
                <Text style={[styles.issueDescription, { color: textColor }]}>
                  {issue.description}
                </Text>
                <Text
                  style={[styles.issueSuggestion, { color: secondaryText }]}
                >
                  💡 {issue.suggestion}
                </Text>
              </View>
            </View>
          ))}
        </View>
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
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: primaryColor }]}>
              Done
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: textColor }]}>
            Pronunciation Feedback
          </Text>
          <TouchableOpacity onPress={onRetry}>
            <Text style={[styles.retryButton, { color: primaryColor }]}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overall Score */}
          <View style={[styles.overallCard, { backgroundColor: cardColor }]}>
            <View style={styles.scoreSection}>
              <Text style={[styles.overallScoreTitle, { color: textColor }]}>
                Overall Pronunciation
              </Text>
              <View style={styles.mainScoreContainer}>
                <Text
                  style={[
                    styles.mainScore,
                    { color: getScoreColor(analysisResult.pronunciationScore) },
                  ]}
                >
                  {analysisResult.pronunciationScore}
                </Text>
                <Text style={[styles.scoreOutOf, { color: secondaryText }]}>
                  /100
                </Text>
              </View>
            </View>

            <View style={styles.qualitySection}>
              <Text style={[styles.qualityLabel, { color: secondaryText }]}>
                Audio Quality
              </Text>
              <Text
                style={[
                  styles.qualityValue,
                  { color: getQualityColor(analysisResult.audioQuality) },
                ]}
              >
                {analysisResult.audioQuality.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Transcription */}
          <View
            style={[styles.transcriptionCard, { backgroundColor: cardColor }]}
          >
            <Text style={[styles.transcriptionTitle, { color: textColor }]}>
              What you said:
            </Text>
            <Text style={[styles.transcriptionText, { color: textColor }]}>
              &ldquo;{analysisResult.transcription}&rdquo;
            </Text>
            <Text style={[styles.confidenceText, { color: secondaryText }]}>
              Confidence: {Math.round(analysisResult.confidence * 100)}%
            </Text>
          </View>

          {/* Word-by-word Analysis */}
          {analysisResult.wordAnalysis.length > 0 && (
            <View style={styles.wordsSection}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                Word Analysis
              </Text>
              {analysisResult.wordAnalysis.map(renderWordAnalysis)}
            </View>
          )}

          {/* Suggestions */}
          {analysisResult.suggestedImprovements.length > 0 && (
            <View
              style={[styles.suggestionsCard, { backgroundColor: cardColor }]}
            >
              <Text style={[styles.suggestionsTitle, { color: textColor }]}>
                Suggestions for Improvement
              </Text>
              {analysisResult.suggestedImprovements.map((suggestion, index) => (
                <View key={index} style={styles.suggestionItem}>
                  <Text
                    style={[styles.suggestionBullet, { color: primaryColor }]}
                  >
                    •
                  </Text>
                  <Text style={[styles.suggestionText, { color: textColor }]}>
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E5EA",
  },
  closeButton: {
    fontSize: 17,
    fontWeight: "400",
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  retryButton: {
    fontSize: 17,
    fontWeight: "400",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overallCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  scoreSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  overallScoreTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  mainScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  mainScore: {
    fontSize: 48,
    fontWeight: "bold",
  },
  scoreOutOf: {
    fontSize: 20,
    marginLeft: 4,
  },
  qualitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E5EA",
  },
  qualityLabel: {
    fontSize: 14,
  },
  qualityValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  transcriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  transcriptionText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontStyle: "italic",
  },
  confidenceText: {
    fontSize: 12,
  },
  wordsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  wordCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  wordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  wordText: {
    fontSize: 16,
    fontWeight: "600",
  },
  scoreContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: "center",
  },
  scoreText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  phoneticText: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: "Menlo",
  },
  issuesContainer: {
    marginTop: 8,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 8,
  },
  issueContent: {
    flex: 1,
  },
  issueDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  issueSuggestion: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
  suggestionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  suggestionBullet: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
