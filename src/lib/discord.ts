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

// Defang Markdown link/image syntax and mass-mentions so attacker-controlled
// text cannot inject clickable links or pings into the Discord channel.
function defang(s: string): string {
  return s
    .replace(/!?\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/@everyone/gi, "@​everyone")
    .replace(/@here/gi, "@​here")
    .slice(0, 1024);
}

async function sendWebhook(payload: unknown): Promise<void> {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    // Never let a webhook failure break the caller's request
  }
}

/**
 * Sends a Discord webhook notification for a new registration.
 * Silently no-ops if DISCORD_WEBHOOK_URL is not set.
 */
export async function notifyRegistration(data: RegistrationEvent): Promise<void> {
  const meta = EVENT_META[data.event] ?? { label: data.event, color: 0x64748b, emoji: "📋" };

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

  await sendWebhook({
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
  });
}

type ClubApplicationEvent = {
  name: string;
  surname: string;
  nickname: string;
  email: string;
  educationType: "regular" | "special";
  preferredDepartment1: string;
  preferredDepartment2: string;
  interviewSlot: { date: string; startTime: string; endTime: string };
  answers?: Record<string, unknown>;
};

/**
 * Sends a Discord webhook notification for a new club application.
 * Silently no-ops if DISCORD_WEBHOOK_URL is not set.
 */
export async function notifyClubApplication(data: ClubApplicationEvent): Promise<void> {
  const answerFields =
    data.answers && Object.keys(data.answers).length > 0
      ? Object.entries(data.answers)
          .filter(([, v]) => v && String(v).trim())
          .slice(0, 10)
          .map(([key, value]) => ({
            name: defang(String(key)),
            value: defang(String(value)),
            inline: false,
          }))
      : [];

  await sendWebhook({
    embeds: [
      {
        title: "🏫 ใบสมัครชุมนุมนิสิตใหม่",
        color: 0x2563eb,
        fields: [
          { name: "ชื่อ-นามสกุล", value: defang(`${data.name} ${data.surname}`), inline: true },
          { name: "ชื่อเล่น", value: defang(data.nickname), inline: true },
          { name: "ภาค", value: data.educationType === "regular" ? "ปกติ" : "พิเศษ", inline: true },
          { name: "อีเมล", value: defang(data.email), inline: false },
          { name: "ตำแหน่งที่อยากทำ", value: `อันดับ 1: ${defang(data.preferredDepartment1)}\nอันดับ 2: ${defang(data.preferredDepartment2)}`, inline: false },
          { name: "รอบสัมภาษณ์", value: `${data.interviewSlot.date} ${data.interviewSlot.startTime}-${data.interviewSlot.endTime}`, inline: false },
          ...answerFields,
        ],
        footer: { text: "CSKU · สมัครชุมนุมนิสิต" },
        timestamp: new Date().toISOString(),
      },
    ],
    allowed_mentions: { parse: [] as string[] },
  });
}
