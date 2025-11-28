import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Button,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import { getStateColor, getStateText } from "@/constants/chat.constants";
import { AudioContext, AudioRecorder } from "react-native-audio-api";
import { Colors } from "../../constants/theme";

type VoiceState = "idle" | "listening" | "speaking";

const ChatScreen = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");

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

  const toggleVoiceState = () => {
    if (voiceState === "idle") {
      setVoiceState("listening");
    } else {
      setVoiceState("idle");
    }
  };

  const handlePlay = async () => {
    const audioContext = new AudioContext();

    const audioBuffer = await fetch(
      "https://software-mansion.github.io/react-native-audio-api/audio/music/example-music-01.mp3"
    )
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer));

    const playerNode = audioContext.createBufferSource();
    playerNode.buffer = audioBuffer;

    playerNode.connect(audioContext.destination);
    playerNode.start(audioContext.currentTime);
    playerNode.stop(audioContext.currentTime + 10);
  };

  const handleRecord = () => {
    const recorder = new AudioRecorder({
      sampleRate: 16000,
      bufferLengthInSamples: 16000,
    });

    recorder.onAudioReady((event) => {
      const { buffer, numFrames, when } = event;

      console.log(
        "Audio recorder buffer ready:",
        buffer.duration,
        numFrames,
        when
      );
    });

    recorder.start();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main orb container */}
      <View style={styles.orbContainer}>
        <Button onPress={handlePlay} title="Play sound!" />
        <Button onPress={handleRecord} title="Start Record" />
        {/* Rotating outer ring for listening state */}
        {voiceState === "listening" && (
          <Animated.View
            style={[
              styles.rotatingRing,
              {
                borderColor: getStateColor(voiceState),
                transform: [{ rotate: rotation }],
              },
            ]}
          >
            <View
              style={[
                styles.ringDot,
                { backgroundColor: getStateColor(voiceState) },
              ]}
            />
            <View
              style={[
                styles.ringDot,
                { backgroundColor: getStateColor(voiceState) },
              ]}
            />
            <View
              style={[
                styles.ringDot,
                { backgroundColor: getStateColor(voiceState) },
              ]}
            />
          </Animated.View>
        )}

        {/* Main orb */}
        <TouchableOpacity onPress={toggleVoiceState} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.orb,
              {
                backgroundColor: getStateColor(voiceState),
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
        {getStateText(voiceState)}
      </Text>
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
});

export default ChatScreen;
