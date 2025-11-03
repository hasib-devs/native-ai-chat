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

interface PronunciationStatsProps {
  visible: boolean;
  onClose: () => void;
  stats: PronunciationStats;
}

export interface PronunciationStats {
  totalSessions: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  improvementAreas: string[];
  weeklyProgress: number[];
  recentScores: number[];
}

export const PronunciationStatsModal: React.FC<PronunciationStatsProps> = ({
  visible,
  onClose,
  stats,
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "#34C759";
    if (score >= 75) return "#30D158";
    if (score >= 60) return "#FF9500";
    return "#FF3B30";
  };

  const renderWeeklyChart = () => {
    const maxScore = Math.max(...stats.weeklyProgress, 50);
    return (
      <View style={styles.chartContainer}>
        {stats.weeklyProgress.map((score, index) => (
          <View key={index} style={styles.chartBar}>
            <View
              style={[
                styles.bar,
                {
                  height: `${(score / maxScore) * 100}%`,
                  backgroundColor: getScoreColor(score),
                },
              ]}
            />
            <Text style={[styles.chartLabel, { color: textColor }]}>
              {["M", "T", "W", "T", "F", "S", "S"][index]}
            </Text>
          </View>
        ))}
      </View>
    );
  };

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
            Pronunciation Progress
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overview Stats */}
          <View style={[styles.statsGrid, { backgroundColor: cardColor }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: primaryColor }]}>
                {stats.totalSessions}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Sessions
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statValue,
                  { color: getScoreColor(stats.averageScore) },
                ]}
              >
                {stats.averageScore}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Average
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#34C759" }]}>
                {stats.bestScore}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Best Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#FF9500" }]}>
                {stats.currentStreak}
              </Text>
              <Text style={[styles.statLabel, { color: textColor }]}>
                Day Streak
              </Text>
            </View>
          </View>

          {/* Weekly Progress Chart */}
          <View style={[styles.chartCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.chartTitle, { color: textColor }]}>
              This Week
            </Text>
            {renderWeeklyChart()}
          </View>

          {/* Recent Scores */}
          <View style={[styles.recentCard, { backgroundColor: cardColor }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Recent Scores
            </Text>
            <View style={styles.scoresContainer}>
              {stats.recentScores.slice(0, 10).map((score, index) => (
                <View
                  key={index}
                  style={[
                    styles.scoreChip,
                    { backgroundColor: getScoreColor(score) },
                  ]}
                >
                  <Text style={styles.scoreChipText}>{score}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Improvement Areas */}
          <View
            style={[styles.improvementCard, { backgroundColor: cardColor }]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Focus Areas
            </Text>
            {stats.improvementAreas.length > 0 ? (
              stats.improvementAreas.map((area, index) => (
                <View key={index} style={styles.improvementItem}>
                  <Text
                    style={[styles.improvementBullet, { color: primaryColor }]}
                  >
                    •
                  </Text>
                  <Text style={[styles.improvementText, { color: textColor }]}>
                    {area}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.noImprovementText, { color: "#8E8E93" }]}>
                Great job! Keep practicing to maintain your progress.
              </Text>
            )}
          </View>

          {/* Achievement Section */}
          <View
            style={[styles.achievementCard, { backgroundColor: cardColor }]}
          >
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Achievements
            </Text>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🔥</Text>
              <Text style={[styles.achievementText, { color: textColor }]}>
                {stats.longestStreak} day longest streak
              </Text>
            </View>
            {stats.bestScore >= 90 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>⭐</Text>
                <Text style={[styles.achievementText, { color: textColor }]}>
                  Excellence: 90+ pronunciation score
                </Text>
              </View>
            )}
            {stats.totalSessions >= 10 && (
              <View style={styles.achievementItem}>
                <Text style={styles.achievementIcon}>🎯</Text>
                <Text style={[styles.achievementText, { color: textColor }]}>
                  Dedicated: 10+ practice sessions
                </Text>
              </View>
            )}
          </View>

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
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingHorizontal: 8,
  },
  chartBar: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    marginHorizontal: 2,
  },
  bar: {
    width: 20,
    minHeight: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  recentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  scoresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  scoreChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 40,
    alignItems: "center",
  },
  scoreChipText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  improvementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  improvementItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  improvementBullet: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    marginTop: 2,
  },
  improvementText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  noImprovementText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  achievementCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  achievementText: {
    fontSize: 14,
    flex: 1,
  },
  bottomSpacing: {
    height: 40,
  },
});
