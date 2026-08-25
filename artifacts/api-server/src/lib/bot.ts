const BOT_COMMANDS: Record<string, { label: string; unit: string; emoji: string }> = {
  bench: { label: "Bench Press", unit: "lbs", emoji: "🏋️" },
  squat: { label: "Squat", unit: "lbs", emoji: "🦵" },
  deadlift: { label: "Deadlift", unit: "lbs", emoji: "💪" },
  run: { label: "Run", unit: "miles", emoji: "🏃" },
  pullup: { label: "Pull-Ups", unit: "reps", emoji: "🔝" },
  pushup: { label: "Push-Ups", unit: "reps", emoji: "⬆️" },
  weight: { label: "Body Weight", unit: "lbs", emoji: "⚖️" },
  water: { label: "Water", unit: "oz", emoji: "💧" },
  sleep: { label: "Sleep", unit: "hrs", emoji: "😴" },
  calories: { label: "Calories", unit: "kcal", emoji: "🔥" },
  steps: { label: "Steps", unit: "steps", emoji: "👟" },
};

export interface BotResult {
  isBot: boolean;
  text?: string;
  data?: { command: string; value: number; label: string; unit: string; emoji: string };
}

export function processBotCommand(content: string, senderName: string): BotResult {
  const trimmed = content.trim();
  if (!trimmed.startsWith("/")) return { isBot: false };

  const parts = trimmed.slice(1).split(/\s+/);
  const cmd = parts[0]?.toLowerCase();
  const value = parseFloat(parts[1] ?? "");

  if (!cmd || !(cmd in BOT_COMMANDS)) {
    return {
      isBot: true,
      text: `Unknown command. Try: ${Object.keys(BOT_COMMANDS).map((c) => "/" + c).join(", ")}`,
    };
  }

  if (isNaN(value) || value <= 0) {
    const info = BOT_COMMANDS[cmd];
    return {
      isBot: true,
      text: `Usage: /${cmd} <${info.unit}> — e.g. /${cmd} ${cmd === "run" ? "3.1" : "225"}`,
    };
  }

  const info = BOT_COMMANDS[cmd];
  return {
    isBot: true,
    text: `${info.emoji} ${senderName} logged ${value} ${info.unit} of ${info.label}`,
    data: { command: cmd, value, label: info.label, unit: info.unit, emoji: info.emoji },
  };
}
