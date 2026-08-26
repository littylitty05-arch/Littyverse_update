import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { FontMap } from "@/constants/Typography";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { Colors } from "@/constants/Colors";

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts(FontMap);
  const [fontFallback, setFontFallback] = useState(false);
  const ready = loaded || Boolean(error) || fontFallback;

  useEffect(() => {
    const hideSplash = () => {
      void SplashScreen.hideAsync().catch(() => {});
    };

    const fallbackTimer = setTimeout(() => {
      setFontFallback(true);
      hideSplash();
    }, 4000);

    if (loaded || error) {
      hideSplash();
    }

    return () => clearTimeout(fallbackTimer);
  }, [loaded, error]);

  if (!ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: Colors.bg }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.bg },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
