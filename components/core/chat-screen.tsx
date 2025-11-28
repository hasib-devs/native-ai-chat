import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
} from "react-native";

import { Colors } from "../../constants/theme";
import { useTextToSpeech } from "../../hooks/use-text-to-speech";
import { useAudioRecorder } from "../../hooks/use-audio-recorder";

type VoiceState = "idle" | "listening" | "speaking" | "processing";

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

  // Voice hooks
  const { speak, isSpeaking, stop: stopSpeaking } = useTextToSpeech();
  const {
    startRecording,
    stopRecording,
    isRecording,
    audioLevel,
    hasPermission,
    requestPermissions,
  } = useAudioRecorder();

  //  Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnimations = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.7),
    new Animated.Value(0.5),
    new Animated.Value(0.3),
  ]).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the main orb
  useEffect(() => {
    if (voiceState !== "idle") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceState]);

  // Wave animation for speaking/listening
  useEffect(() => {
    if (voiceState === "listening" || voiceState === "speaking") {
      const animations = waveAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 1,
              duration: 400 + index * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: 400 + index * 100,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      Animated.stagger(100, animations).start();
    }
  }, [voiceState]);

  // Rotation for listening state
  useEffect(() => {
    if (voiceState === "listening") {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [voiceState]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Check permissions on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermissions();
    }
  }, [hasPermission]);

  // Update voice state based on hooks
  useEffect(() => {
    if (isRecording) {
      setVoiceState("listening");
    } else if (isSpeaking) {
      setVoiceState("speaking");
    }
  }, [isRecording, isSpeaking]);

  // Update waveform based on actual audio level
  useEffect(() => {
    if (isRecording && audioLevel > 0) {
      // Animate waveforms based on real audio level
      waveAnimations.forEach((anim) => {
        Animated.timing(anim, {
          toValue: 0.3 + audioLevel * 0.7,
          duration: 100,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [audioLevel, isRecording]);

  const toggleVoiceState = async () => {
    try {
      if (voiceState === "idle") {
        // Start listening
        if (!hasPermission) {
          const granted = await requestPermissions();
          if (!granted) {
            Alert.alert(
              "Permission Required",
              "Microphone permission is needed for voice chat."
            );
            return;
          }
        }
        await startRecording();
      } else if (voiceState === "listening") {
        // Stop listening and process
        const audioUri = await stopRecording();

        if (audioUri) {
          setVoiceState("processing");

          // TODO: Send to speech-to-text service
          // For now, simulate with a demo response
          setTimeout(async () => {
            const demoResponse =
              "Great job! I heard you speaking. Let me respond: Hello! How can I help you practice English today?";

            await speak(demoResponse, {
              language: "en-US",
              rate: 0.9,
              pitch: 1.0,
            });

            // After speaking, return to idle
            setTimeout(() => {
              if (!isSpeaking) {
                setVoiceState("idle");
              }
            }, 1000);
          }, 500);
        }
      } else if (voiceState === "speaking") {
        // Stop speaking
        stopSpeaking();
        setVoiceState("idle");
      } else if (voiceState === "processing") {
        // Cancel processing
        setVoiceState("idle");
      }
    } catch (error) {
      console.error("Error toggling voice state:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setVoiceState("idle");
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case "listening":
        return "#10b981"; // Green
      case "speaking":
        return "#3b82f6"; // Blue
      case "processing":
        return "#f59e0b"; // Orange
      default:
        return colors.tint;
    }
  };

  const getStateText = () => {
    switch (voiceState) {
      case "listening":
        return "Listening...";
      case "speaking":
        return "Speaking...";
      case "processing":
        return "Processing...";
      default:
        return "Tap to start";
    }
  };

  const getSubtitleText = () => {
    switch (voiceState) {
      case "idle":
        return "Practice your English speaking";
      case "listening":
        return "I'm listening to you...";
      case "speaking":
        return "Listen to my response";
      case "processing":
        return "Understanding what you said...";
      default:
        return "";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main orb container */}
      <View style={styles.orbContainer}>
        {/* Rotating outer ring for listening state */}
        {voiceState === "listening" && (
          <Animated.View
            style={[
              styles.rotatingRing,
              {
                borderColor: getStateColor(),
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <View
              style={[styles.ringDot, { backgroundColor: getStateColor() }]}
            />
            <View
              style={[styles.ringDot, { backgroundColor: getStateColor() }]}
            />
            <View
              style={[styles.ringDot, { backgroundColor: getStateColor() }]}
            />
          </Animated.View>
        )}

        {/* Main orb */}
        <TouchableOpacity onPress={toggleVoiceState} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor: getStateColor(),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {/* Waveform visualization */}
            {(voiceState === "listening" || voiceState === "speaking") && (
              <View style={styles.waveformContainer}>
                {waveAnimations.map((anim, index) => (
                  <View key={index} style={styles.wavebarWrapper}>
                    <Animated.View
                      style={[
                        styles.wavebar,
                        {
                          transform: [
                            {
                              scaleY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.25, 1],
                              }),
                            },
                          ],
                          opacity: anim,
                          backgroundColor:
                            voiceState === "listening"
                              ? "rgba(255, 255, 255, 0.9)"
                              : "rgba(255, 255, 255, 0.8)",
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
            )}

            {/* Idle state icon */}
            {voiceState === "idle" && <Text style={styles.micIcon}>🎤</Text>}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Status text */}
      <Text style={[styles.statusText, { color: colors.text }]}>
        {getStateText()}
      </Text>

      {/* Subtitle */}
      <Text style={[styles.subtitleText, { color: colors.icon }]}>
        {getSubtitleText()}
      </Text>

      {/* Audio level indicator (debug) */}
      {isRecording && (
        <View style={styles.debugContainer}>
          <Text style={[styles.debugText, { color: colors.icon }]}>
            Audio Level: {(audioLevel * 100).toFixed(0)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  orbContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  rotatingRing: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderStyle: "dashed",
  },
  ringDot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: -4,
    left: "50%",
    marginLeft: -4,
  },
  orb: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 16,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  wavebarWrapper: {
    height: 80,
    justifyContent: "center",
    marginHorizontal: 3,
  },
  wavebar: {
    width: 6,
    height: 80,
    borderRadius: 3,
  },
  micIcon: {
    fontSize: 48,
  },
  statusText: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 30,
  },
  dotsContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 6,
  },
  debugContainer: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  debugText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default ChatScreen;
