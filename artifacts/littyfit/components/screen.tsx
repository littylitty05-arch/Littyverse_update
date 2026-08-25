import React from "react";
import { View, ScrollView, ScrollViewProps, StyleProp, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshControl?: ScrollViewProps["refreshControl"];
  padded?: boolean;
  padBottom?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = true,
  refreshControl,
  padded = true,
  padBottom = 120,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const content = (
    <View
      style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: padded ? 16 : 0,
        paddingBottom: padBottom,
        gap: 16,
      }}
    >
      {children}
    </View>
  );
  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: Colors.bg }, style]}>
        {content}
      </View>
    );
  }
  return (
    <ScrollView
      style={[{ flex: 1, backgroundColor: Colors.bg }, style]}
      contentContainerStyle={contentContainerStyle}
      refreshControl={refreshControl}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}
