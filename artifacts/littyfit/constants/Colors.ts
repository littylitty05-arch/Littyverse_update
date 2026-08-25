export const Colors = {
  bg: "#0a0a0a",
  bgElevated: "#111111",
  card: "#151515",
  cardAlt: "#1a1a1a",
  border: "#242424",
  borderActive: "#a78bfa",

  violet: "#a78bfa",
  violetDim: "#7c3aed",
  violetGlow: "rgba(167, 139, 250, 0.35)",

  blue: "#38bdf8",
  green: "#4ade80",
  orange: "#f97316",
  amber: "#f59e0b",
  red: "#ef4444",
  crimson: "#b91c1c",
  pink: "#ec4899",

  text: "#ffffff",
  textDim: "#9ca3af",
  textMuted: "#6b7280",

  // streak colors
  streakGray: "#4b5563",
  streakOrange: "#f97316",
  streakRed: "#ef4444",
  streakDeepRed: "#b91c1c",
  streakCrimson: "#991b1b",
};

export const streakColor = (days: number) => {
  if (days <= 0) return Colors.streakGray;
  if (days < 3) return Colors.streakOrange;
  if (days < 7) return Colors.streakRed;
  if (days < 14) return Colors.streakDeepRed;
  return Colors.streakCrimson;
};
