import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleSheet, TouchableOpacity, ViewStyle } from "react-native";

interface MicButtonProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  style?: ViewStyle;
}

// Microphone button component for voice input
// - Shows microphone icon
// - Toggles recording state
// - Fires start/stop callbacks
// - Visually indicates listening
export const MicButton: React.FC<MicButtonProps> = ({
  isListening,
  onStartListening,
  onStopListening,
  style,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handlePress = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: isListening ? "#ff4444" : colors.tint,
          borderColor: isListening ? "#cc0000" : colors.tint,
        },
        style,
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <IconSymbol
        name={isListening ? "mic.fill" : "mic"}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    elevation: 3, // Android shadow
    boxShadow: "0px 2px 3.84px rgba(0, 0, 0, 0.25)", // iOS shadow
  },
});
