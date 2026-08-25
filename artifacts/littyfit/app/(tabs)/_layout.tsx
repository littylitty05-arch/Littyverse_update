import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.violet,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.bgElevated,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 10),
          height: 64 + Math.max(insets.bottom, 10),
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bold,
          fontSize: 9,
          letterSpacing: 1.5,
          textTransform: "uppercase",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="flame" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          title: "Train",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="barbell" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="yoga"
        options={{
          title: "Recover",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="moon" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="diamond" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} />
          ),
        }}
      />
      {/* Hidden from tab bar but still routable */}
      <Tabs.Screen
        name="nutrition"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="squad"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 44, height: 32 }}>
      {focused && (
        <View
          style={{
            position: "absolute",
            top: -6,
            width: 28,
            height: 3,
            borderRadius: 2,
            backgroundColor: Colors.violet,
            boxShadow: `0 0 12px ${Colors.violet}`,
          }}
        />
      )}
      <Ionicons name={name} size={22} color={focused ? Colors.violet : Colors.textMuted} />
    </View>
  );
}
