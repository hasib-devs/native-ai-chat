import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, useColorScheme, View } from "react-native";

interface TypingIndicatorProps {
  visible: boolean;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  visible,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      const animate = () => {
        const duration = 600;
        const sequence = Animated.sequence([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: duration / 3,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: duration / 3,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: duration / 3,
            useNativeDriver: true,
          }),
        ]);

        const reset = Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]);

        Animated.sequence([sequence, reset]).start(() => {
          if (visible) {
            animate();
          }
        });
      };

      animate();
    }
  }, [visible, dot1Anim, dot2Anim, dot3Anim]);

  if (!visible) return null;

  const getDotStyle = (animValue: Animated.Value) => ({
    opacity: animValue,
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
      },
    ],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#333" : "#f0f0f0" },
      ]}
    >
      <View style={styles.avatar}>
        <ThemedText style={styles.avatarText}>🤖</ThemedText>
      </View>
      <View style={styles.typingContainer}>
        <ThemedText style={[styles.typingText, { color: colors.text }]}>
          English Tutor is typing
        </ThemedText>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.tint },
              getDotStyle(dot1Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.tint },
              getDotStyle(dot2Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.tint },
              getDotStyle(dot3Anim),
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 20,
    maxWidth: "80%",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
  },
  typingContainer: {
    flex: 1,
  },
  typingText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
