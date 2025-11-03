import React, { useState } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { useThemeColor } from "../hooks/use-theme-color";
import { AudioAnalysisResult } from "../hooks/useEnhancedSpeechToText";

interface EnhancedMicButtonProps {
  onStartListening: () => void;
  onStopListening: () => Promise<AudioAnalysisResult>;
  onShowFeedback: (result: AudioAnalysisResult) => void;
  isListening: boolean;
  isAnalyzing: boolean;
  disabled?: boolean;
}

export const EnhancedMicButton: React.FC<EnhancedMicButtonProps> = ({
  onStartListening,
  onStopListening,
  onShowFeedback,
  isListening,
  isAnalyzing,
  disabled = false,
}) => {
  const [rippleAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  const primaryColor = useThemeColor(
    { light: "#007AFF", dark: "#0A84FF" },
    "tint"
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#FFFFFF" },
    "text"
  );

  React.useEffect(() => {
    if (isListening) {
      // Start ripple animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      rippleAnim.stopAnimation();
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening, rippleAnim, pulseAnim]);

  React.useEffect(() => {
    if (isAnalyzing) {
      // Rotating animation for analysis
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isAnalyzing, pulseAnim]);

  const handlePress = async () => {
    if (disabled) return;

    if (isListening) {
      // Stop listening and analyze
      Vibration.vibrate(50);
      try {
        const result = await onStopListening();
        // Show feedback modal
        onShowFeedback(result);
      } catch (error) {
        console.error("Failed to analyze speech:", error);
      }
    } else {
      // Start listening
      Vibration.vibrate(50);
      onStartListening();
    }
  };

  const getButtonText = () => {
    if (isAnalyzing) return "Analyzing...";
    if (isListening) return "Tap to analyze";
    return "Hold to speak";
  };

  const getButtonIcon = () => {
    if (isAnalyzing) return "🔄";
    if (isListening) return "🎤";
    return "🎙️";
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2],
  });

  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0],
  });

  return (
    <View style={styles.container}>
      {/* Status text */}
      <Text style={[styles.statusText, { color: textColor }]}>
        {getButtonText()}
      </Text>

      {/* Button with animations */}
      <View style={styles.buttonContainer}>
        {/* Ripple effect for listening state */}
        {isListening && (
          <Animated.View
            style={[
              styles.ripple,
              {
                backgroundColor: primaryColor,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
        )}

        {/* Main button */}
        <Animated.View
          style={[
            styles.button,
            {
              backgroundColor: isListening ? "#FF3B30" : primaryColor,
              transform: [{ scale: pulseAnim }],
              opacity: disabled ? 0.5 : 1,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.touchable}
            onPress={handlePress}
            disabled={disabled || isAnalyzing}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonIcon}>{getButtonIcon()}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Hint text */}
      <Text style={[styles.hintText, { color: "#8E8E93" }]}>
        {isListening
          ? "Speak clearly for pronunciation analysis"
          : "Get detailed feedback on your pronunciation"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  buttonContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ripple: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  touchable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    fontSize: 32,
  },
  hintText: {
    fontSize: 12,
    textAlign: "center",
    maxWidth: 250,
    lineHeight: 16,
  },
});
