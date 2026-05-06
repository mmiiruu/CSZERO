type RegistrationEvent = {
  event: "cs101" | "hello-world";
  name: string;
  email: string;
  answers?: Record<string, unknown>;
};

const EVENT_META: Record<string, { label: string; color: number; emoji: string }> = {
  "cs101":       { label: "CS101",       color: 0x2563eb, emoji: "🧠" },
  "hello-world": { label: "Hello World", color: 0xa855f7, emoji: "👋" },
};

/**
 * Sends a Discord webhook notification for a new registration.
 * Silently no-ops if DISCORD_WEBHOOK_URL is not set.
 */
export async function notifyRegistration(data: RegistrationEvent): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const meta = EVENT_META[data.event] ?? { label: data.event, color: 0x64748b, emoji: "📋" };

  // Defang Markdown link/image syntax and mass-mentions so attacker-controlled
  // text cannot inject clickable links or pings into the Discord channel.
  const defang = (s: string): string =>
    s
      .replace(/!?\[/g, "(")
      .replace(/\]/g, ")")
      .replace(/@everyone/gi, "@​everyone")
      .replace(/@here/gi, "@​here")
      .slice(0, 1024);

  const answerFields =
    data.answers && Object.keys(data.answers).length > 0
      ? Object.entries(data.answers)
          .filter(([, v]) => v && String(v).trim())
          .slice(0, 10) // Discord cap: 25 fields; keep it tidy
          .map(([key, value]) => ({
            name: defang(String(key)),
            value: defang(String(value)),
            inline: String(value).length < 80,
          }))
      : [];

  const payload = {
    embeds: [
      {
        title: `${meta.emoji} การสมัครใหม่ — ${meta.label}`,
        color: meta.color,
        fields: [
          { name: "ชื่อ", value: defang(data.name), inline: true },
          { name: "อีเมล", value: defang(data.email), inline: true },
          { name: "กิจกรรม", value: meta.label, inline: true },
          ...answerFields,
        ],
        footer: { text: "CSKU Registration System" },
        timestamp: new Date().toISOString(),
      },
    ],
    allowed_mentions: { parse: [] as string[] },
  };

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Never let a webhook failure break registration
  }
}
