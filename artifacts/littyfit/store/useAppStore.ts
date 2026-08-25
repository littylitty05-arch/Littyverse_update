import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Preferences,
  UserProfile,
  LtkActivity,
  NonNegotiables,
  CompletedWorkout,
  PersonalRecord,
  DailyNutrition,
  MealEntry,
  YogaSession,
  BodyStatEntry,
  Achievement,
  ActiveSession,
} from "./types";

const todayStr = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

export const LTK_DAILY_CAP = 100;

export const LEVEL_TITLES: { level: number; title: string }[] = [
  { level: 1, title: "Base Activated" },
  { level: 5, title: "Stable Routine" },
  { level: 10, title: "Optimized Human" },
  { level: 20, title: "Elite Performance" },
  { level: 50, title: "Longevity Master" },
];

export const XP_PER_LEVEL = 500;

export const levelTitle = (level: number): string => {
  let t = LEVEL_TITLES[0].title;
  for (const l of LEVEL_TITLES) if (level >= l.level) t = l.title;
  return t;
};

export const defaultNonNegotiables: NonNegotiables = {
  sleep: false,
  hydration: false,
  movement: false,
  training: false,
  nutrition: false,
  mentalReset: false,
};

interface State {
  preferences: Preferences;
  profile: UserProfile | null;

  ltkBalance: number;
  ltkTotalEarned: number;
  ltkActivity: LtkActivity[];
  ltkTodayDate: string;
  ltkTodayEarned: number;

  xp: number;

  currentStreak: number;
  bestStreak: number;
  lastCheckInDate: string | null;
  yogaStreak: number;
  lastYogaDate: string | null;
  lastYogaLtkDate: string | null;

  nonNegotiables: NonNegotiables;
  nonNegotiablesDate: string;

  selectedProgram: string | null;
  completedWorkouts: CompletedWorkout[];
  personalRecords: Record<string, PersonalRecord>;

  nutritionToday: DailyNutrition;

  yogaSessions: YogaSession[];

  bodyStats: BodyStatEntry[];

  achievements: Achievement[];

  activeSession: ActiveSession | null;

  setPreferences: (p: Partial<Preferences>) => void;
  setProfile: (p: Partial<UserProfile>) => void;
  initGuest: (name: string) => void;
  logout: () => void;

  addLtk: (
    amount: number,
    type: LtkActivity["type"],
    description: string
  ) => void;

  checkIn: () => void;
  toggleNonNegotiable: (key: keyof NonNegotiables) => void;
  resetNonNegotiablesIfNewDay: () => void;

  selectProgram: (id: string) => void;
  completeWorkout: (w: Omit<CompletedWorkout, "id" | "date" | "ltkEarned">) => void;
  setPr: (exercise: string, pr: PersonalRecord) => void;

  addMeal: (
    slot: "breakfast" | "lunch" | "dinner" | "snacks",
    meal: Omit<MealEntry, "id">
  ) => void;
  removeMeal: (
    slot: "breakfast" | "lunch" | "dinner" | "snacks",
    id: string
  ) => void;
  addHydration: () => void;
  toggleSupplement: (key: "supplementsMorning" | "supplementsEvening") => void;
  resetNutritionIfNewDay: () => void;

  completeYoga: (type: string, duration: number) => void;

  addBodyStat: (s: BodyStatEntry) => void;

  unlockAchievement: (a: Omit<Achievement, "earnedDate">) => void;

  setActiveSession: (s: ActiveSession | null) => void;
}

const emptyNutrition = (): DailyNutrition => ({
  date: todayStr(),
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
  hydrationGlasses: 0,
  supplementsMorning: false,
  supplementsEvening: false,
});

export const useAppStore = create<State>()(
  persist(
    (set, get) => ({
      preferences: {},
      profile: null,

      ltkBalance: 0,
      ltkTotalEarned: 0,
      ltkActivity: [],
      ltkTodayDate: todayStr(),
      ltkTodayEarned: 0,

      xp: 0,

      currentStreak: 0,
      bestStreak: 0,
      lastCheckInDate: null,
      yogaStreak: 0,
      lastYogaDate: null,
      lastYogaLtkDate: null,

      nonNegotiables: { ...defaultNonNegotiables },
      nonNegotiablesDate: todayStr(),

      selectedProgram: null,
      completedWorkouts: [],
      personalRecords: {},

      nutritionToday: emptyNutrition(),

      yogaSessions: [],

      bodyStats: [],

      achievements: [],

      activeSession: null,

      setPreferences: (p) =>
        set((s) => ({ preferences: { ...s.preferences, ...p } })),

      setProfile: (p) =>
        set((s) => ({
          profile: s.profile ? { ...s.profile, ...p } : (p as UserProfile),
        })),

      initGuest: (name) =>
        set(() => ({
          profile: {
            name,
            fitnessLevel: "Intermediate",
            primaryGoal: "Build Muscle",
            memberSince: new Date().toISOString(),
            units: "imperial",
            darkMode: true,
            isGuest: true,
          },
        })),

      logout: () =>
        set(() => ({
          profile: null,
          preferences: {},
          ltkBalance: 0,
          ltkTotalEarned: 0,
          ltkActivity: [],
          ltkTodayDate: todayStr(),
          ltkTodayEarned: 0,
          xp: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastCheckInDate: null,
          yogaStreak: 0,
          lastYogaDate: null,
          lastYogaLtkDate: null,
          nonNegotiables: { ...defaultNonNegotiables },
          selectedProgram: null,
          completedWorkouts: [],
          personalRecords: {},
          nutritionToday: emptyNutrition(),
          yogaSessions: [],
          bodyStats: [],
          achievements: [],
          activeSession: null,
        })),

      addLtk: (amount, type, description) =>
        set((s) => {
          const t = todayStr();
          const todayEarned = s.ltkTodayDate === t ? s.ltkTodayEarned : 0;
          const remaining = Math.max(0, LTK_DAILY_CAP - todayEarned);
          const capped = Math.min(Math.max(0, amount), remaining);
          if (capped <= 0 && amount > 0) return {};
          const a: LtkActivity = {
            id: uid(),
            type,
            description,
            amount: capped,
            timestamp: Date.now(),
          };
          return {
            ltkBalance: s.ltkBalance + capped,
            ltkTotalEarned: s.ltkTotalEarned + capped,
            ltkActivity: [a, ...s.ltkActivity].slice(0, 100),
            xp: s.xp + Math.max(0, Math.floor(capped / 2)),
            ltkTodayDate: t,
            ltkTodayEarned: todayEarned + capped,
          };
        }),

      checkIn: () => {
        const t = todayStr();
        const { lastCheckInDate, currentStreak, bestStreak } = get();
        if (lastCheckInDate === t) return;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        const newStreak = lastCheckInDate === y ? currentStreak + 1 : 1;
        set({
          currentStreak: newStreak,
          bestStreak: Math.max(bestStreak, newStreak),
          lastCheckInDate: t,
        });
        get().addLtk(5, "checkin", "Daily check-in");
        if (newStreak > 1) get().addLtk(10, "streak", `${newStreak}-day streak`);
      },

      toggleNonNegotiable: (key) => {
        get().resetNonNegotiablesIfNewDay();
        const curr = get().nonNegotiables;
        const next = { ...curr, [key]: !curr[key] };
        const wasAll = Object.values(curr).every(Boolean);
        const isAll = Object.values(next).every(Boolean);
        set({ nonNegotiables: next });
        if (!wasAll && isAll) {
          get().addLtk(20, "non_negotiables", "All Non-Negotiables complete");
        }
      },

      resetNonNegotiablesIfNewDay: () => {
        const t = todayStr();
        if (get().nonNegotiablesDate !== t) {
          set({
            nonNegotiables: { ...defaultNonNegotiables },
            nonNegotiablesDate: t,
          });
        }
      },

      selectProgram: (id) => set({ selectedProgram: id }),

      completeWorkout: (w) => {
        const t = todayStr();
        const todayWorkouts = get().completedWorkouts.filter(
          (cw) => cw.date.slice(0, 10) === t
        );
        const ltk = todayWorkouts.length < 2 ? 25 : 0;
        const entry: CompletedWorkout = {
          ...w,
          id: uid(),
          date: new Date().toISOString(),
          ltkEarned: ltk,
        };
        set((s) => ({
          completedWorkouts: [entry, ...s.completedWorkouts],
          activeSession: null,
        }));
        if (ltk > 0) get().addLtk(ltk, "workout", `Workout: ${w.sessionName}`);
        get().checkIn();
      },

      setPr: (exercise, pr) =>
        set((s) => ({
          personalRecords: { ...s.personalRecords, [exercise]: pr },
        })),

      addMeal: (slot, meal) => {
        get().resetNutritionIfNewDay();
        const entry: MealEntry = { ...meal, id: uid() };
        set((s) => ({
          nutritionToday: {
            ...s.nutritionToday,
            [slot]: [...s.nutritionToday[slot], entry],
          },
        }));
        get().addLtk(10, "meal", `Logged ${slot}: ${meal.name}`);
      },

      removeMeal: (slot, id) =>
        set((s) => ({
          nutritionToday: {
            ...s.nutritionToday,
            [slot]: s.nutritionToday[slot].filter((m) => m.id !== id),
          },
        })),

      addHydration: () => {
        get().resetNutritionIfNewDay();
        const n = get().nutritionToday;
        if (n.hydrationGlasses >= 8) return;
        const next = n.hydrationGlasses + 1;
        set({ nutritionToday: { ...n, hydrationGlasses: next } });
        if (next === 8) {
          get().addLtk(5, "hydration", "Hydration goal hit");
          get().toggleNonNegotiable("hydration");
        }
      },

      toggleSupplement: (key) => {
        get().resetNutritionIfNewDay();
        set((s) => ({
          nutritionToday: {
            ...s.nutritionToday,
            [key]: !s.nutritionToday[key],
          },
        }));
      },

      resetNutritionIfNewDay: () => {
        const t = todayStr();
        if (get().nutritionToday.date !== t) {
          set({ nutritionToday: emptyNutrition() });
        }
      },

      completeYoga: (type, duration) => {
        const t = todayStr();
        const { lastYogaDate, lastYogaLtkDate, yogaStreak } = get();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const y = yesterday.toISOString().slice(0, 10);
        const newStreak =
          lastYogaDate === t
            ? yogaStreak
            : lastYogaDate === y
              ? yogaStreak + 1
              : 1;
        const session: YogaSession = {
          id: uid(),
          type,
          date: new Date().toISOString(),
          duration,
          ltkEarned: lastYogaLtkDate !== t ? 15 : 0,
        };
        set((s) => ({
          yogaSessions: [session, ...s.yogaSessions],
          yogaStreak: newStreak,
          lastYogaDate: t,
          lastYogaLtkDate: lastYogaLtkDate !== t ? t : s.lastYogaLtkDate,
          activeSession: null,
        }));
        if (lastYogaLtkDate !== t) {
          get().addLtk(15, "yoga", `Recovery: ${type}`);
        }
      },

      addBodyStat: (s) =>
        set((prev) => ({ bodyStats: [s, ...prev.bodyStats] })),

      unlockAchievement: (a) => {
        const existing = get().achievements.find((x) => x.id === a.id);
        if (existing) return;
        set((s) => ({
          achievements: [
            ...s.achievements,
            { ...a, earnedDate: new Date().toISOString() },
          ],
        }));
      },

      setActiveSession: (s) => set({ activeSession: s }),
    }),
    {
      name: "littyfit-store",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useLevel = () => {
  const xp = useAppStore((s) => s.xp);
  const level = Math.max(1, Math.floor(xp / XP_PER_LEVEL) + 1);
  const intoLevel = xp % XP_PER_LEVEL;
  const progress = intoLevel / XP_PER_LEVEL;
  return { level, progress, xp, title: levelTitle(level) };
};

export const useTodayMacros = () => {
  const n = useAppStore((s) => s.nutritionToday);
  const all = [...n.breakfast, ...n.lunch, ...n.dinner, ...n.snacks];
  return all.reduce(
    (acc, m) => ({
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
      calories: acc.calories + m.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
};

export const useTodayLtk = () => {
  const ltkTodayDate = useAppStore((s) => s.ltkTodayDate);
  const ltkTodayEarned = useAppStore((s) => s.ltkTodayEarned);
  const t = todayStr();
  return ltkTodayDate === t ? ltkTodayEarned : 0;
};
