import { Stack } from "expo-router";
import { Colors } from "@/constants/Colors";

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
        animation: "slide_from_right",
      }}
    />
  );
}
