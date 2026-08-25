import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, Btn, HapticTap, SectionHeader } from "@/components/ui";
import { Fonts } from "@/constants/Typography";
import { MultiRing, Ring } from "@/components/ring";
import { useAppStore, useTodayMacros } from "@/store/useAppStore";
import { MACRO_GOALS, PRESET_FOODS } from "@/data/content";
import type { MealEntry } from "@/store/types";

type Slot = "breakfast" | "lunch" | "dinner" | "snacks";
const SLOTS: { key: Slot; label: string; icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap }[] = [
  { key: "breakfast", label: "Breakfast", icon: "sunny" },
  { key: "lunch", label: "Lunch", icon: "restaurant" },
  { key: "dinner", label: "Dinner", icon: "moon" },
  { key: "snacks", label: "Snacks", icon: "cafe" },
];

export default function Nutrition() {
  const insets = useSafeAreaInsets();
  const macros = useTodayMacros();
  const nutrition = useAppStore((s) => s.nutritionToday);
  const addMeal = useAppStore((s) => s.addMeal);
  const removeMeal = useAppStore((s) => s.removeMeal);
  const addHydration = useAppStore((s) => s.addHydration);
  const toggleSupp = useAppStore((s) => s.toggleSupplement);
  const resetIfNew = useAppStore((s) => s.resetNutritionIfNewDay);

  const [modalSlot, setModalSlot] = useState<Slot | null>(null);

  React.useEffect(() => {
    resetIfNew();
  }, [resetIfNew]);

  const proteinP = Math.min(1, macros.protein / MACRO_GOALS.protein);
  const carbsP = Math.min(1, macros.carbs / MACRO_GOALS.carbs);
  const fatP = Math.min(1, macros.fat / MACRO_GOALS.fat);

  const cleanEatingScore = useMemo(() => {
    const all = [
      ...nutrition.breakfast,
      ...nutrition.lunch,
      ...nutrition.dinner,
      ...nutrition.snacks,
    ];
    if (all.length === 0) return 92;
    const preset = all.filter((m) => PRESET_FOODS.some((p) => p.name === m.name)).length;
    return Math.max(60, Math.round((preset / all.length) * 100));
  }, [nutrition]);

  // Weekly mock chart based on recent workouts
  const weekData = useMemo(() => {
    const days = ["M", "T", "W", "T", "F", "S", "S"];
    return days.map((d, i) => ({
      day: d,
      value: i === 6 ? macros.calories / MACRO_GOALS.calories : 0.3 + Math.random() * 0.6,
    }));
  }, [macros.calories]);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.bg }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 120,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Txt size={11} weight="bold" color={Colors.green} uppercase letterSpacing={3}>
            Fuel Protocol
          </Txt>
          <Txt size={28} weight="bold" style={{ marginTop: 4 }}>
            Eat clean. Train dirty.
          </Txt>
        </View>

        {/* Macro Rings */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <Card padding={20}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
              <View style={{ width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
                <MultiRing
                  size={160}
                  strokeWidth={10}
                  values={[
                    { progress: Math.min(1, macros.calories / MACRO_GOALS.calories), color: Colors.amber },
                    { progress: proteinP, color: Colors.violet },
                    { progress: carbsP, color: Colors.orange },
                    { progress: fatP, color: Colors.blue },
                  ]}
                />
                <View style={{ position: "absolute", alignItems: "center" }}>
                  <Txt size={22} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
                    {Math.round(macros.calories)}
                  </Txt>
                  <Txt size={9} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
                    Calories
                  </Txt>
                  <Txt size={10} color={Colors.textMuted}>
                    / {MACRO_GOALS.calories} kcal
                  </Txt>
                </View>
              </View>
              <View style={{ flex: 1, gap: 10 }}>
                <MacroLegend
                  color={Colors.violet}
                  label="Protein"
                  value={`${Math.round(macros.protein)}g`}
                  goal={`${MACRO_GOALS.protein}g`}
                />
                <MacroLegend
                  color={Colors.orange}
                  label="Carbs"
                  value={`${Math.round(macros.carbs)}g`}
                  goal={`${MACRO_GOALS.carbs}g`}
                />
                <MacroLegend
                  color={Colors.blue}
                  label="Fat"
                  value={`${Math.round(macros.fat)}g`}
                  goal={`${MACRO_GOALS.fat}g`}
                />
                <MacroLegend
                  color={Colors.amber}
                  label="Cals"
                  value={`${Math.round(macros.calories)}`}
                  goal={`${MACRO_GOALS.calories}`}
                />
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Meals */}
        <Animated.View entering={FadeInDown.delay(80).duration(400)}>
          <SectionHeader title="Meals" />
        </Animated.View>
        <View style={{ gap: 10 }}>
          {SLOTS.map((slot, i) => {
            const meals = nutrition[slot.key];
            const hasMeal = meals.length > 0;
            const totalCals = meals.reduce((a, m) => a + m.calories, 0);
            return (
              <Animated.View key={slot.key} entering={FadeInDown.delay(100 + i * 40).duration(400)}>
                <Card padding={14}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        backgroundColor: hasMeal ? `${Colors.green}22` : Colors.cardAlt,
                        borderWidth: 1,
                        borderColor: hasMeal ? Colors.green : Colors.border,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {hasMeal ? (
                        <Ionicons name="checkmark" size={16} color={Colors.green} />
                      ) : (
                        <Ionicons name={slot.icon} size={14} color={Colors.textDim} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt size={14} weight="bold">
                        {slot.label}
                      </Txt>
                      {hasMeal ? (
                        <Txt size={11} color={Colors.textDim} numberOfLines={1}>
                          {meals.map((m) => m.name).join(", ")} · {totalCals} kcal
                        </Txt>
                      ) : (
                        <Txt size={11} color={Colors.textMuted}>
                          No entry yet
                        </Txt>
                      )}
                    </View>
                    {hasMeal && (
                      <Txt size={11} weight="bold" color={Colors.green}>
                        +10 LTK
                      </Txt>
                    )}
                    <Pressable
                      onPress={() => {
                        HapticTap.light();
                        setModalSlot(slot.key);
                      }}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 999,
                        backgroundColor: Colors.violet,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="add" size={14} color={Colors.bg} />
                      <Txt size={11} weight="bold" color={Colors.bg} uppercase letterSpacing={1}>
                        Add
                      </Txt>
                    </Pressable>
                  </View>

                  {meals.length > 0 && (
                    <View style={{ marginTop: 10, gap: 6 }}>
                      {meals.map((m) => (
                        <Pressable
                          key={m.id}
                          onPress={() => {
                            HapticTap.light();
                            removeMeal(slot.key, m.id);
                          }}
                          style={{
                            flexDirection: "row",
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: Colors.cardAlt,
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Txt size={12} weight="semiBold">
                              {m.name}
                            </Txt>
                            <Txt size={10} color={Colors.textDim}>
                              P {m.protein}g · C {m.carbs}g · F {m.fat}g
                            </Txt>
                          </View>
                          <Txt size={11} weight="bold" color={Colors.amber}>
                            {m.calories} kcal
                          </Txt>
                          <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </Card>
              </Animated.View>
            );
          })}
        </View>

        {/* Hydration */}
        <SectionHeader title="Hydration Tracker" />
        <Card padding={16}>
          <View style={{ flexDirection: "row", gap: 6, marginBottom: 12 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const filled = i < nutrition.hydrationGlasses;
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    if (!filled) addHydration();
                    HapticTap.light();
                  }}
                  style={{
                    flex: 1,
                    height: 52,
                    borderRadius: 10,
                    backgroundColor: filled ? `${Colors.blue}33` : Colors.cardAlt,
                    borderWidth: 1,
                    borderColor: filled ? Colors.blue : Colors.border,
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: filled ? `0 0 10px ${Colors.blue}55` : undefined,
                  }}
                >
                  <Ionicons name="water" size={22} color={filled ? Colors.blue : Colors.textMuted} />
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Txt size={11} color={Colors.textDim}>
              {nutrition.hydrationGlasses} of 8 glasses
            </Txt>
            <Txt size={11} weight="bold" color={nutrition.hydrationGlasses >= 8 ? Colors.green : Colors.textDim}>
              {nutrition.hydrationGlasses >= 8 ? "Goal hit · +5 LTK" : `${8 - nutrition.hydrationGlasses} to go`}
            </Txt>
          </View>
        </Card>

        {/* Clean Eating Score */}
        <Card padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Ring
              size={80}
              strokeWidth={8}
              progress={cleanEatingScore / 100}
              color={Colors.green}
              gradient={[Colors.green, Colors.blue]}
            >
              <Txt size={20} weight="bold" color={Colors.green}>
                {cleanEatingScore}%
              </Txt>
            </Ring>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={11} weight="bold" color={Colors.green} uppercase letterSpacing={2}>
                Clean Eating Score
              </Txt>
              <Txt size={15} weight="bold">
                You&apos;re dialed in.
              </Txt>
              <Txt size={11} color={Colors.textDim}>
                Stick to whole foods. Protein first. Hydrate hard.
              </Txt>
            </View>
          </View>
        </Card>

        {/* Weekly Chart */}
        <SectionHeader title="Weekly Calories" />
        <Card padding={16}>
          <View style={{ flexDirection: "row", height: 120, gap: 8, alignItems: "flex-end" }}>
            {weekData.map((d, i) => (
              <View key={i} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <View
                  style={{
                    width: "100%",
                    height: Math.max(6, d.value * 100),
                    borderRadius: 6,
                    backgroundColor: i === weekData.length - 1 ? Colors.green : Colors.violet,
                    opacity: i === weekData.length - 1 ? 1 : 0.55,
                  }}
                />
                <Txt size={10} weight="bold" color={Colors.textDim} uppercase>
                  {d.day}
                </Txt>
              </View>
            ))}
          </View>
        </Card>

        {/* Supplements */}
        <SectionHeader title="Supplement Stack" />
        <Card padding={16}>
          <View style={{ gap: 10 }}>
            <SupplementRow
              label="Morning Stack"
              sub="Multivitamin · Omega-3 · Creatine"
              checked={nutrition.supplementsMorning}
              onPress={() => toggleSupp("supplementsMorning")}
              icon="sunny"
              color={Colors.amber}
            />
            <SupplementRow
              label="Evening Stack"
              sub="Magnesium · Zinc · Vitamin D"
              checked={nutrition.supplementsEvening}
              onPress={() => toggleSupp("supplementsEvening")}
              icon="moon"
              color={Colors.violet}
            />
          </View>
        </Card>

        {/* Tip */}
        <View
          style={{
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: `${Colors.green}44`,
            backgroundColor: `${Colors.green}11`,
            flexDirection: "row",
            gap: 12,
            alignItems: "center",
          }}
        >
          <Ionicons name="bulb" size={20} color={Colors.green} />
          <Txt size={12} color={Colors.textDim} style={{ flex: 1, lineHeight: 18 }}>
            Protein in the first hour post-workout accelerates recovery. Don&apos;t skip it.
          </Txt>
        </View>
      </ScrollView>

      <AddMealModal slot={modalSlot} onClose={() => setModalSlot(null)} onAdd={(meal) => {
        if (modalSlot) addMeal(modalSlot, meal);
        setModalSlot(null);
      }} />
    </>
  );
}

function MacroLegend({
  color,
  label,
  value,
  goal,
}: {
  color: string;
  label: string;
  value: string;
  goal: string;
}) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <View style={{ flex: 1 }}>
        <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
          {label}
        </Txt>
        <Txt size={13} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
          {value} <Txt size={10} color={Colors.textMuted}>/ {goal}</Txt>
        </Txt>
      </View>
    </View>
  );
}

function SupplementRow({
  label,
  sub,
  checked,
  onPress,
  icon,
  color,
}: {
  label: string;
  sub: string;
  checked: boolean;
  onPress: () => void;
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  color: string;
}) {
  return (
    <Pressable
      onPress={() => {
        HapticTap.light();
        onPress();
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: checked ? `${color}15` : Colors.cardAlt,
        borderWidth: 1,
        borderColor: checked ? color : Colors.border,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: `${color}22`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={13} weight="bold">
          {label}
        </Txt>
        <Txt size={10} color={Colors.textDim}>
          {sub}
        </Txt>
      </View>
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: checked ? color : Colors.border,
          backgroundColor: checked ? color : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Ionicons name="checkmark" size={14} color={Colors.bg} />}
      </View>
    </Pressable>
  );
}

function AddMealModal({
  slot,
  onClose,
  onAdd,
}: {
  slot: Slot | null;
  onClose: () => void;
  onAdd: (m: Omit<MealEntry, "id">) => void;
}) {
  const insets = useSafeAreaInsets();
  const [custom, setCustom] = useState({ name: "", protein: "", carbs: "", fat: "", calories: "" });

  const addPreset = (p: (typeof PRESET_FOODS)[number]) => {
    HapticTap.success();
    onAdd({ name: p.name, protein: p.protein, carbs: p.carbs, fat: p.fat, calories: p.calories });
  };

  const addCustom = () => {
    if (!custom.name.trim()) return;
    HapticTap.success();
    onAdd({
      name: custom.name.trim(),
      protein: parseFloat(custom.protein) || 0,
      carbs: parseFloat(custom.carbs) || 0,
      fat: parseFloat(custom.fat) || 0,
      calories: parseFloat(custom.calories) || 0,
    });
    setCustom({ name: "", protein: "", carbs: "", fat: "", calories: "" });
  };

  return (
    <Modal visible={!!slot} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            backgroundColor: Colors.bgElevated,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            borderTopWidth: 1,
            borderColor: Colors.border,
            maxHeight: "85%",
          }}
        >
          <ScrollView
            contentContainerStyle={{
              padding: 20,
              paddingBottom: insets.bottom + 24,
              gap: 14,
            }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: "center", marginBottom: 4 }}>
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.border,
                }}
              />
            </View>
            <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
              Log {slot}
            </Txt>
            <Txt size={20} weight="bold" style={{ marginBottom: 4 }}>
              Clean Foods
            </Txt>
            <View style={{ gap: 8 }}>
              {PRESET_FOODS.map((p) => (
                <Pressable
                  key={p.name}
                  onPress={() => addPreset(p)}
                  style={{
                    flexDirection: "row",
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Txt size={13} weight="semiBold">
                      {p.name}
                    </Txt>
                    <Txt size={10} color={Colors.textDim}>
                      P {p.protein}g · C {p.carbs}g · F {p.fat}g
                    </Txt>
                  </View>
                  <Txt size={12} weight="bold" color={Colors.amber}>
                    {p.calories} kcal
                  </Txt>
                  <Ionicons name="add-circle" size={22} color={Colors.violet} />
                </Pressable>
              ))}
            </View>

            <Txt size={20} weight="bold" style={{ marginTop: 12 }}>
              Custom Entry
            </Txt>
            <TextInput
              value={custom.name}
              onChangeText={(v) => setCustom((c) => ({ ...c, name: v }))}
              placeholder="Meal name"
              placeholderTextColor={Colors.textMuted}
              style={{
                borderWidth: 1,
                borderColor: Colors.border,
                borderRadius: 12,
                padding: 12,
                color: Colors.text,
                fontFamily: Fonts.medium,
                fontSize: 14,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(["protein", "carbs", "fat", "calories"] as const).map((k) => (
                <View key={k} style={{ flex: 1 }}>
                  <TextInput
                    value={custom[k]}
                    onChangeText={(v) => setCustom((c) => ({ ...c, [k]: v }))}
                    keyboardType="decimal-pad"
                    placeholder={k === "calories" ? "kcal" : "g"}
                    placeholderTextColor={Colors.textMuted}
                    style={{
                      borderWidth: 1,
                      borderColor: Colors.border,
                      borderRadius: 12,
                      padding: 10,
                      color: Colors.text,
                      fontFamily: Fonts.semiBold,
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  />
                  <Txt size={9} weight="bold" color={Colors.textDim} uppercase letterSpacing={1} style={{ textAlign: "center", marginTop: 4 }}>
                    {k}
                  </Txt>
                </View>
              ))}
            </View>
            <Btn title="Add Meal (+10 LTK)" onPress={addCustom} size="md" disabled={!custom.name.trim()} />
            <Btn title="Close" variant="ghost" onPress={onClose} size="md" />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
