import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useColorScheme } from "react-native";
import "react-native-gesture-handler";
import "react-native-reanimated";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // useEffect(() => {
  //   // Ignore specific warnings during development
  //   LogBox.ignoreLogs([
  //     "Failed to call into JavaScript module method RCTEventEmitter",
  //   ]);
  // }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: true, title: "Chat" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
