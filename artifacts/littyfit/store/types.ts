export type FitnessLevel = "Beginner" | "Intermediate" | "Advanced";
export type PrimaryGoal =
  | "Build Muscle"
  | "Lose Fat"
  | "Improve Performance"
  | "Longevity";

export interface UserProfile {
  name: string;
  email?: string;
  fitnessLevel: FitnessLevel;
  primaryGoal: PrimaryGoal;
  memberSince: string;
  units: "metric" | "imperial";
  darkMode: boolean;
  isGuest: boolean;
}

export interface LtkActivity {
  id: string;
  type:
    | "workout"
    | "yoga"
    | "meal"
    | "checkin"
    | "streak"
    | "hydration"
    | "non_negotiables";
  description: string;
  amount: number;
  timestamp: number;
}

export interface NonNegotiables {
  sleep: boolean;
  hydration: boolean;
  movement: boolean;
  training: boolean;
  nutrition: boolean;
  mentalReset: boolean;
}

export interface CompletedWorkout {
  id: string;
  programId: string;
  weekNum: number;
  sessionName: string;
  date: string;
  duration: number;
  exercises: number;
  ltkEarned: number;
  difficulty?: number;
}

export interface PersonalRecord {
  weight: number;
  reps: number;
  date: string;
}

export interface MealEntry {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface DailyNutrition {
  date: string;
  breakfast: MealEntry[];
  lunch: MealEntry[];
  dinner: MealEntry[];
  snacks: MealEntry[];
  hydrationGlasses: number;
  supplementsMorning: boolean;
  supplementsEvening: boolean;
}

export interface YogaSession {
  id: string;
  type: string;
  date: string;
  duration: number;
  ltkEarned: number;
}

export interface BodyStatEntry {
  date: string;
  weight?: number;
  bodyFat?: number;
  chest?: number;
  waist?: number;
  arms?: number;
}

export interface Achievement {
  id: string;
  name: string;
  icon: string;
  earnedDate: string;
}

export interface Preferences {
  onboardingComplete?: boolean;
  authed?: boolean;
}

export interface ActiveSession {
  type: "workout" | "yoga";
  id: string;
  programId?: string;
  label: string;
  startedAt: number;
}
