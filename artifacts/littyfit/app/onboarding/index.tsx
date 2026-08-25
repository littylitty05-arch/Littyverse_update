import React, { useRef, useState } from "react";
import {
  View,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/constants/Colors";
import { Btn, Txt, HapticTap } from "@/components/ui";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const slides = [
  {
    title: "LITTYFIT",
    tagline: "This is not a fitness app.\nThis is your life OS.",
    icon: "flame" as const,
    iconColor: Colors.violet,
    body: "Welcome, athlete. Strap in. We're rebuilding your baseline from the ground up.",
  },
  {
    title: "LIFE OS",
    tagline: "Train. Fuel. Recover. Repeat.",
    icon: "infinite" as const,
    iconColor: Colors.blue,
    body: "Workouts. Nutrition. Yoga. Breathwork. Stats. One system. One output: the best version of you.",
  },
  {
    title: "LTK REWARDS",
    tagline: "Every action earns.",
    icon: "wallet" as const,
    iconColor: Colors.amber,
    body: "Earn LTK tokens for workouts, meals, streaks, and non-negotiables. Redeem at littyverse.com.",
  },
  {
    title: "LITTYVERSE",
    tagline: "You're part of something bigger.",
    icon: "planet" as const,
    iconColor: Colors.green,
    body: "Connect your grind with the wider Littyverse at littyverse.com. Let's go.",
  },
];

export default function OnboardingIntro() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const p = Math.round(e.nativeEvent.contentOffset.x / width);
    if (p !== page) setPage(p);
  };

  const next = () => {
    HapticTap.medium();
    if (page < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
    } else {
      router.push("/onboarding/name");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {slides.map((s, i) => (
          <View
            key={i}
            style={{
              width,
              flex: 1,
              paddingHorizontal: 28,
              paddingTop: insets.top + 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Animated.View
              entering={FadeIn.delay(100).duration(500)}
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 1,
                borderColor: s.iconColor,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 48,
                boxShadow: `0 0 60px ${s.iconColor}44`,
              }}
            >
              <Ionicons name={s.icon} size={64} color={s.iconColor} />
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Txt
                size={12}
                weight="bold"
                color={s.iconColor}
                uppercase
                letterSpacing={4}
                style={{ textAlign: "center", marginBottom: 16 }}
              >
                {s.title}
              </Txt>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <Txt
                size={32}
                weight="bold"
                style={{ textAlign: "center", marginBottom: 20, lineHeight: 38 }}
              >
                {s.tagline}
              </Txt>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <Txt
                size={15}
                color={Colors.textDim}
                style={{ textAlign: "center", lineHeight: 22 }}
              >
                {s.body}
              </Txt>
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          top: insets.top + 16,
          right: 20,
        }}
      >
        <Pressable
          onPress={() => {
            HapticTap.light();
            router.push("/onboarding/name");
          }}
        >
          <Txt size={13} weight="semiBold" color={Colors.textDim} uppercase letterSpacing={1.5}>
            Skip
          </Txt>
        </Pressable>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 24,
          left: 0,
          right: 0,
          paddingHorizontal: 28,
          gap: 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === page ? 24 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === page ? Colors.violet : Colors.border,
              }}
            />
          ))}
        </View>
        <Btn
          title={page === slides.length - 1 ? "Let's go" : "Next"}
          onPress={next}
          size="lg"
        />
        <Pressable
          onPress={async () => {
            HapticTap.light();
            await WebBrowser.openBrowserAsync("https://littyverse.com");
          }}
        >
          <Txt
            size={12}
            weight="semiBold"
            color={Colors.textDim}
            uppercase
            letterSpacing={2}
            style={{ textAlign: "center" }}
          >
            Visit littyverse.com
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}
