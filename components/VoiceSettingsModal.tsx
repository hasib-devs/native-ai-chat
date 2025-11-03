import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import { VoiceSettings } from "../hooks/useEnhancedSpeechToText";

interface VoiceSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (settings: VoiceSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  visible,
  onClose,
  settings,
  onUpdateSettings,
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

  const updateSetting = <K extends keyof VoiceSettings>(
    key: K,
    value: VoiceSettings[K]
  ) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const toggleFocusArea = (area: string) => {
    const newFocusAreas = settings.focusAreas.includes(area)
      ? settings.focusAreas.filter((a) => a !== area)
      : [...settings.focusAreas, area];
    updateSetting("focusAreas", newFocusAreas);
  };

  const renderOption = (
    title: string,
    options: readonly string[],
    currentValue: string,
    onSelect: (value: string) => void
  ) => (
    <View style={[styles.optionGroup, { backgroundColor: cardColor }]}>
      <Text style={[styles.optionTitle, { color: textColor }]}>{title}</Text>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.optionItem}
          onPress={() => onSelect(option)}
        >
          <Text style={[styles.optionText, { color: textColor }]}>
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </Text>
          <View
            style={[
              styles.radioButton,
              { borderColor: primaryColor },
              currentValue === option && { backgroundColor: primaryColor },
            ]}
          >
            {currentValue === option && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const focusAreaOptions = [
    {
      key: "pronunciation",
      label: "Pronunciation",
      description: "Word and sound accuracy",
    },
    {
      key: "fluency",
      label: "Fluency",
      description: "Speaking rhythm and pace",
    },
    { key: "grammar", label: "Grammar", description: "Sentence structure" },
    {
      key: "vocabulary",
      label: "Vocabulary",
      description: "Word choice and usage",
    },
  ];

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
            Voice Settings
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Analysis Toggle */}
          <View style={[styles.settingGroup, { backgroundColor: cardColor }]}>
            <Text style={[styles.groupTitle, { color: textColor }]}>
              Pronunciation Analysis
            </Text>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: textColor }]}>
                  Enable Analysis
                </Text>
                <Text style={[styles.settingDescription, { color: "#8E8E93" }]}>
                  Get detailed feedback on your pronunciation
                </Text>
              </View>
              <Switch
                value={settings.analysisEnabled}
                onValueChange={(value) =>
                  updateSetting("analysisEnabled", value)
                }
                trackColor={{ false: "#767577", true: primaryColor }}
                thumbColor={settings.analysisEnabled ? "#FFFFFF" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Feedback Level */}
          {renderOption(
            "Feedback Level",
            ["basic", "detailed", "expert"] as const,
            settings.feedbackLevel,
            (value) => updateSetting("feedbackLevel", value as any)
          )}

          {/* Target Accent */}
          {renderOption(
            "Target Accent",
            ["american", "british", "neutral"] as const,
            settings.targetAccent,
            (value) => updateSetting("targetAccent", value as any)
          )}

          {/* Focus Areas */}
          <View style={[styles.settingGroup, { backgroundColor: cardColor }]}>
            <Text style={[styles.groupTitle, { color: textColor }]}>
              Focus Areas
            </Text>
            <Text style={[styles.groupDescription, { color: "#8E8E93" }]}>
              Select what you want to improve
            </Text>
            {focusAreaOptions.map((area) => (
              <TouchableOpacity
                key={area.key}
                style={styles.focusAreaItem}
                onPress={() => toggleFocusArea(area.key)}
              >
                <View style={styles.focusAreaInfo}>
                  <Text style={[styles.focusAreaTitle, { color: textColor }]}>
                    {area.label}
                  </Text>
                  <Text
                    style={[styles.focusAreaDescription, { color: "#8E8E93" }]}
                  >
                    {area.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: primaryColor },
                    settings.focusAreas.includes(area.key) && {
                      backgroundColor: primaryColor,
                    },
                  ]}
                >
                  {settings.focusAreas.includes(area.key) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

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
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingGroup: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  optionGroup: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
  },
  focusAreaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  focusAreaInfo: {
    flex: 1,
  },
  focusAreaTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  focusAreaDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 40,
  },
});
