export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: number; // seconds
  muscles: string[];
}

export interface Session {
  id: string;
  name: string;
  focus: string;
  duration: number; // minutes
  exercises: Exercise[];
}

export interface Week {
  weekNum: number;
  sessions: Session[];
}

export interface Program {
  id: "foundation" | "performance" | "elite";
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  weeks: number;
  color: string;
  description: string;
  image: string;
  weeksPlan: Week[];
}

const foundationWeek = (weekNum: number): Week => ({
  weekNum,
  sessions: [
    {
      id: `f-w${weekNum}-d1`,
      name: "Push Day",
      focus: "Chest, Shoulders, Triceps",
      duration: 45,
      exercises: [
        { name: "Barbell Bench Press", sets: 3, reps: "8-10", rest: 90, muscles: ["Chest"] },
        { name: "Overhead Press", sets: 3, reps: "8-10", rest: 90, muscles: ["Shoulders"] },
        { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: 60, muscles: ["Upper Chest"] },
        { name: "Tricep Pushdowns", sets: 3, reps: "12-15", rest: 60, muscles: ["Triceps"] },
      ],
    },
    {
      id: `f-w${weekNum}-d2`,
      name: "Pull Day",
      focus: "Back, Biceps",
      duration: 45,
      exercises: [
        { name: "Deadlift", sets: 3, reps: "6-8", rest: 120, muscles: ["Back", "Hamstrings"] },
        { name: "Pull-Ups", sets: 3, reps: "Max", rest: 90, muscles: ["Lats"] },
        { name: "Barbell Row", sets: 3, reps: "8-10", rest: 90, muscles: ["Back"] },
        { name: "Bicep Curls", sets: 3, reps: "12", rest: 60, muscles: ["Biceps"] },
      ],
    },
    {
      id: `f-w${weekNum}-d3`,
      name: "Lower Body Power",
      focus: "Quads, Glutes, Hamstrings",
      duration: 50,
      exercises: [
        { name: "Barbell Back Squat", sets: 4, reps: "6", rest: 120, muscles: ["Quads", "Glutes"] },
        { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: 90, muscles: ["Hamstrings", "Glutes"] },
        { name: "Box Jumps", sets: 3, reps: "5", rest: 90, muscles: ["Quads", "Calves"] },
        { name: "Walking Lunges", sets: 3, reps: "12 ea", rest: 60, muscles: ["Quads", "Glutes"] },
      ],
    },
  ],
});

const performanceWeek = (weekNum: number): Week => ({
  weekNum,
  sessions: [
    {
      id: `p-w${weekNum}-d1`,
      name: "Upper Strength",
      focus: "Compound Strength",
      duration: 60,
      exercises: [
        { name: "Barbell Bench Press", sets: 5, reps: "5", rest: 120, muscles: ["Chest"] },
        { name: "Weighted Pull-Ups", sets: 4, reps: "6", rest: 120, muscles: ["Back"] },
        { name: "Push Press", sets: 4, reps: "5", rest: 120, muscles: ["Shoulders"] },
        { name: "Pendlay Row", sets: 4, reps: "6", rest: 90, muscles: ["Back"] },
      ],
    },
    {
      id: `p-w${weekNum}-d2`,
      name: "Lower Body Power",
      focus: "Strength + Explosiveness",
      duration: 65,
      exercises: [
        { name: "Barbell Back Squat", sets: 4, reps: "5", rest: 180, muscles: ["Quads", "Glutes"] },
        { name: "Romanian Deadlift", sets: 3, reps: "8-10", rest: 120, muscles: ["Hamstrings"] },
        { name: "Box Jumps", sets: 3, reps: "5", rest: 90, muscles: ["Power"] },
        { name: "Bulgarian Split Squat", sets: 3, reps: "10 ea", rest: 90, muscles: ["Legs"] },
      ],
    },
    {
      id: `p-w${weekNum}-d3`,
      name: "Conditioning",
      focus: "Metabolic + Core",
      duration: 40,
      exercises: [
        { name: "Kettlebell Swings", sets: 5, reps: "20", rest: 60, muscles: ["Posterior"] },
        { name: "Burpees", sets: 4, reps: "15", rest: 60, muscles: ["Full Body"] },
        { name: "Farmers Carry", sets: 4, reps: "40m", rest: 60, muscles: ["Grip", "Core"] },
        { name: "Ab Wheel Rollout", sets: 4, reps: "10", rest: 60, muscles: ["Core"] },
      ],
    },
  ],
});

const eliteWeek = (weekNum: number): Week => ({
  weekNum,
  sessions: [
    {
      id: `e-w${weekNum}-d1`,
      name: "Max Effort Upper",
      focus: "Peak Strength",
      duration: 75,
      exercises: [
        { name: "Bench Press", sets: 6, reps: "3", rest: 180, muscles: ["Chest"] },
        { name: "Weighted Chin-Ups", sets: 5, reps: "5", rest: 150, muscles: ["Back"] },
        { name: "Strict Press", sets: 5, reps: "5", rest: 150, muscles: ["Shoulders"] },
        { name: "Barbell Row", sets: 4, reps: "6", rest: 120, muscles: ["Back"] },
        { name: "Dips", sets: 4, reps: "10", rest: 90, muscles: ["Chest", "Tris"] },
      ],
    },
    {
      id: `e-w${weekNum}-d2`,
      name: "Max Effort Lower",
      focus: "Heavy Compounds",
      duration: 80,
      exercises: [
        { name: "Back Squat", sets: 6, reps: "3", rest: 210, muscles: ["Legs"] },
        { name: "Deadlift", sets: 5, reps: "3", rest: 210, muscles: ["Posterior"] },
        { name: "Front Squat", sets: 4, reps: "6", rest: 150, muscles: ["Quads"] },
        { name: "GHR", sets: 4, reps: "8", rest: 90, muscles: ["Hamstrings"] },
      ],
    },
    {
      id: `e-w${weekNum}-d3`,
      name: "Olympic Lifting",
      focus: "Power Development",
      duration: 70,
      exercises: [
        { name: "Clean & Jerk", sets: 6, reps: "2", rest: 180, muscles: ["Power"] },
        { name: "Snatch", sets: 5, reps: "2", rest: 180, muscles: ["Power"] },
        { name: "Hang Clean", sets: 4, reps: "3", rest: 120, muscles: ["Power"] },
        { name: "Depth Jumps", sets: 4, reps: "5", rest: 90, muscles: ["Plyo"] },
      ],
    },
  ],
});

export const PROGRAMS: Program[] = [
  {
    id: "foundation",
    name: "FOUNDATION",
    level: "Beginner",
    weeks: 12,
    color: "#4ade80",
    description: "Build the base. Master compounds. Dial in form.",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    weeksPlan: Array.from({ length: 12 }, (_, i) => foundationWeek(i + 1)),
  },
  {
    id: "performance",
    name: "PERFORMANCE",
    level: "Intermediate",
    weeks: 16,
    color: "#a78bfa",
    description: "Break plateaus. Unlock next-level strength & power.",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80",
    weeksPlan: Array.from({ length: 16 }, (_, i) => performanceWeek(i + 1)),
  },
  {
    id: "elite",
    name: "ELITE",
    level: "Advanced",
    weeks: 20,
    color: "#f97316",
    description: "No excuses. Peak output. Built for athletes.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    weeksPlan: Array.from({ length: 20 }, (_, i) => eliteWeek(i + 1)),
  },
];

export const findProgram = (id: string) =>
  PROGRAMS.find((p) => p.id === id) || PROGRAMS[1];

export const findSession = (programId: string, sessionId: string) => {
  const p = findProgram(programId);
  for (const w of p.weeksPlan) {
    for (const s of w.sessions) {
      if (s.id === sessionId) return { program: p, week: w, session: s };
    }
  }
  return null;
};

export const quickWorkout: Session = {
  id: "quick-amrap",
  name: "Quick Bodyweight AMRAP",
  focus: "No equipment. Full body.",
  duration: 20,
  exercises: [
    { name: "Push-Ups", sets: 5, reps: "15", rest: 30, muscles: ["Chest"] },
    { name: "Air Squats", sets: 5, reps: "20", rest: 30, muscles: ["Legs"] },
    { name: "Mountain Climbers", sets: 5, reps: "40", rest: 30, muscles: ["Core"] },
    { name: "Burpees", sets: 5, reps: "10", rest: 30, muscles: ["Full Body"] },
  ],
};
