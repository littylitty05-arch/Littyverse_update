export const MOTIVATION_QUOTES = [
  "Discipline equals freedom.",
  "The standard is the standard.",
  "Embrace the suck. It's where growth lives.",
  "Hard days build diamond minds.",
  "Consistency beats intensity.",
  "You don't rise to the occasion. You fall to your training.",
  "Get comfortable being uncomfortable.",
];

export const NON_NEGOTIABLES = [
  { key: "sleep", label: "Sleep", icon: "moon" as const },
  { key: "hydration", label: "Hydration", icon: "water" as const },
  { key: "movement", label: "Movement", icon: "walk" as const },
  { key: "training", label: "Training", icon: "barbell" as const },
  { key: "nutrition", label: "Nutrition", icon: "nutrition" as const },
  { key: "mentalReset", label: "Mental Reset", icon: "flower" as const },
] as const;

export const PRESET_FOODS = [
  { name: "Oatmeal & Berries", protein: 12, carbs: 78, fat: 8, calories: 400 },
  { name: "Grilled Chicken & Rice", protein: 45, carbs: 55, fat: 8, calories: 500 },
  { name: "Protein Shake", protein: 30, carbs: 12, fat: 3, calories: 190 },
  { name: "Salmon & Sweet Potato", protein: 38, carbs: 42, fat: 18, calories: 480 },
  { name: "Greek Yogurt Bowl", protein: 22, carbs: 28, fat: 6, calories: 260 },
  { name: "Ground Beef & Quinoa", protein: 40, carbs: 38, fat: 22, calories: 520 },
  { name: "Egg & Avocado Toast", protein: 20, carbs: 32, fat: 22, calories: 410 },
  { name: "Turkey Wrap", protein: 32, carbs: 40, fat: 12, calories: 400 },
  { name: "Mixed Nuts & Banana", protein: 7, carbs: 32, fat: 14, calories: 290 },
  { name: "Tuna Salad", protein: 35, carbs: 8, fat: 14, calories: 290 },
];

export const MACRO_GOALS = {
  protein: 180,
  carbs: 300,
  fat: 80,
  calories: 2800,
};

export const YOGA_PROGRAMS = [
  {
    id: "morning",
    name: "Morning Flow",
    duration: 15,
    color: "#fbbf24",
    description: "Wake up the body. Energize for the day.",
    poses: [
      { name: "Child's Pose", duration: 60, cue: "Slow deep breaths" },
      { name: "Cat-Cow", duration: 60, cue: "Sync breath with spine" },
      { name: "Downward Dog", duration: 60, cue: "Lengthen the spine" },
      { name: "Low Lunge", duration: 60, cue: "Sink the hips" },
      { name: "Warrior II", duration: 60, cue: "Strong legs, open chest" },
      { name: "Standing Forward Fold", duration: 60, cue: "Release the neck" },
      { name: "Mountain Pose", duration: 60, cue: "Ground down, rise tall" },
    ],
  },
  {
    id: "recovery",
    name: "Recovery Stretch",
    duration: 20,
    color: "#a78bfa",
    description: "Post-workout decompression for tight muscles.",
    poses: [
      { name: "Pigeon Pose", duration: 90, cue: "Breathe into the hip" },
      { name: "Seated Forward Fold", duration: 90, cue: "Soften the hamstrings" },
      { name: "Supine Twist", duration: 90, cue: "Let gravity twist the spine" },
      { name: "Happy Baby", duration: 60, cue: "Rock side to side" },
      { name: "Legs Up The Wall", duration: 120, cue: "Full relaxation" },
      { name: "Savasana", duration: 120, cue: "Complete stillness" },
    ],
  },
  {
    id: "mobility",
    name: "Mobility & Flexibility",
    duration: 25,
    color: "#38bdf8",
    description: "Open the hips, shoulders, spine.",
    poses: [
      { name: "Cat-Cow", duration: 60, cue: "Articulate every vertebra" },
      { name: "Thread The Needle", duration: 60, cue: "Open the shoulders" },
      { name: "Lizard Pose", duration: 90, cue: "Hip flexor release" },
      { name: "Frog Pose", duration: 90, cue: "Breathe through discomfort" },
      { name: "Cobra", duration: 60, cue: "Lengthen through the chest" },
      { name: "Bow Pose", duration: 60, cue: "Open the front body" },
      { name: "Half Pigeon", duration: 90, cue: "Both sides" },
    ],
  },
  {
    id: "sleep",
    name: "Sleep Wind-Down",
    duration: 12,
    color: "#7c3aed",
    description: "Calm the nervous system before bed.",
    poses: [
      { name: "Child's Pose", duration: 120, cue: "Slow exhales" },
      { name: "Seated Twist", duration: 60, cue: "Release the day" },
      { name: "Reclined Butterfly", duration: 120, cue: "Hands on belly" },
      { name: "Legs Up The Wall", duration: 180, cue: "Deep parasympathetic" },
      { name: "Savasana", duration: 180, cue: "Drift into rest" },
    ],
  },
];

export const findYoga = (id: string) =>
  YOGA_PROGRAMS.find((y) => y.id === id) || YOGA_PROGRAMS[0];

export const ACHIEVEMENTS_ALL = [
  { id: "first-workout", name: "First Rep", icon: "barbell", desc: "Complete your first workout" },
  { id: "streak-7", name: "7-Day Streak", icon: "flame", desc: "Stay litty for a week" },
  { id: "streak-30", name: "Month Monk", icon: "flame-sharp", desc: "30-day streak" },
  { id: "ltk-1000", name: "LTK Earner", icon: "wallet", desc: "Earn 1,000 LTK" },
  { id: "ltk-10k", name: "LTK Millionaire", icon: "diamond", desc: "Earn 10,000 LTK" },
  { id: "yoga-warrior", name: "Yoga Warrior", icon: "moon", desc: "Complete 10 yoga sessions" },
  { id: "clean-plate", name: "Clean Plate", icon: "leaf", desc: "Log 50 clean meals" },
  { id: "hydrated", name: "Hydrated", icon: "water", desc: "Hit hydration goal 7 days" },
];
