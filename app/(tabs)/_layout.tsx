import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="message.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
