import type { TimelineDay } from "@/components/ui/Timeline";

export interface HouseConfig {
  key: "spade" | "heart" | "diamond" | "club";
  name: string;
  symbol: string;
  desc: string;
  // Event page card styles
  cardBg: string;
  cardGradient: string;
  // Reveal page styles
  revealGradient: string;
  revealTextColor: string;
}

export interface HelloWorldConfig {
  hero: {
    badge: string;
    description: string;
    primaryButton: { label: string; href: string };
    secondaryButton: { label: string; href: string };
  };
  // Used in the home page event card
  homeCard: {
    badge: string;
    title: string;
    shortDescription: string;
    href: string;
  };
  houses: {
    eyebrow: string;
    title: string;
    items: HouseConfig[];
  };
  schedule: {
    eyebrow: string;
    title: string;
    accentColor: string;
    days: TimelineDay[];
  };
  cta: {
    title: string;
    description: string;
    button: { label: string; href: string };
  };
  reveal: {
    emoji: string;
    title: string;
    description: string;
    button: string;
    revealedMessage: string;
    revealAgainButton: string;
    shufflingTitle: string;
    shufflingSubtitle: string;
  };
}

export const helloWorldConfig: HelloWorldConfig = {
  hero: {
    badge: "✨ กิจกรรม 1 วัน",
    description:
      "วันแรกในชุมชน CS! จับฉลากบ้าน พบเพื่อนใหม่สุดเจ๋ง เล่นเกม และค้นพบว่าวิทยาการคอมพิวเตอร์คืออะไร",
    primaryButton: { label: "สมัครเลย 🎉", href: "/events/hello-world/register" },
    secondaryButton: { label: "เปิดเผยบ้านของคุณ 🎴", href: "/events/hello-world/reveal" },
  },
  homeCard: {
    badge: "กิจกรรม 1 วัน",
    title: "Hello World",
    shortDescription:
      "กิจกรรมต้อนรับสุดสนุกสำหรับนิสิตใหม่ทุกคน จับฉลากบ้าน พบเพื่อน และเริ่มต้นการเดินทาง CS!",
    href: "/events/hello-world",
  },
  houses: {
    eyebrow: "สี่บ้าน",
    title: "คุณจะอยู่บ้านไหน?",
    items: [
      {
        key: "spade",
        name: "สเปด",
        symbol: "♠",
        desc: "มีกลยุทธ์และวิเคราะห์เก่ง",
        cardBg: "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-600",
        cardGradient: "from-slate-500 to-slate-700",
        revealGradient: "from-slate-600 to-slate-800",
        revealTextColor: "text-slate-600",
      },
      {
        key: "heart",
        name: "หัวใจ",
        symbol: "♥",
        desc: "มีความหลงใหลและสร้างสรรค์",
        cardBg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
        cardGradient: "from-red-400 to-pink-500",
        revealGradient: "from-red-500 to-pink-600",
        revealTextColor: "text-red-500",
      },
      {
        key: "diamond",
        name: "ไดมอนด์",
        symbol: "♦",
        desc: "ฉลาดและนวัตกรรม",
        cardBg: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
        cardGradient: "from-blue-400 to-cyan-500",
        revealGradient: "from-blue-500 to-cyan-500",
        revealTextColor: "text-blue-500",
      },
      {
        key: "club",
        name: "คลับ",
        symbol: "♣",
        desc: "ทำงานร่วมกันและยืดหยุ่น",
        cardBg: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        cardGradient: "from-green-400 to-emerald-500",
        revealGradient: "from-green-500 to-emerald-600",
        revealTextColor: "text-green-500",
      },
    ],
  },
  schedule: {
    eyebrow: "กำหนดการ",
    title: "ไทม์ไลน์กิจกรรม",
    accentColor: "#a855f7",
    days: [
      {
        day: "วันกิจกรรม",
        date: "Hello World — ยินดีต้อนรับสู่ CS!",
        items: [
          { time: "08:30", title: "ลงทะเบียนและต้อนรับ", type: "social", description: "รับป้ายชื่อและพบเพื่อนใหม่" },
          { time: "09:00", title: "พิธีเปิด", type: "talk" },
          { time: "09:30", title: "พิธีจับฉลากบ้าน", type: "social", description: "ค้นพบบ้านของคุณ: ♠ ♥ ♦ ♣" },
          { time: "10:00", title: "กิจกรรมละลายพฤติกรรมและเกมทีม", type: "social" },
          { time: "11:00", title: "CS Lightning Talks", type: "talk" },
          { time: "12:00", title: "รับประทานอาหารกลางวันและ Networking", type: "break" },
          { time: "13:00", title: "เวิร์กช็อป: สร้างแอปแรกของคุณ", type: "workshop", description: "เซสชันแบบ Hands-on พร้อมคำแนะนำ" },
          { time: "15:00", title: "การแข่งขันระหว่างบ้าน", type: "workshop", description: "แข่งเพื่อบ้านของคุณ!" },
          { time: "16:00", title: "มอบรางวัลและพิธีปิด", type: "social" },
        ],
      },
    ],
  },
  cta: {
    title: "อย่าพลาด! 🎉",
    description: "ที่นั่งมีจำนวนจำกัด สมัครเลยและดูว่าคุณจะอยู่บ้านไหน",
    button: { label: "สมัคร Hello World", href: "/events/hello-world/register" },
  },
  reveal: {
    emoji: "🎴",
    title: "เปิดเผยบ้านของคุณ",
    description: "กดปุ่มด้านล่างเพื่อค้นพบว่าคุณอยู่บ้านไหน",
    button: "เปิดเผยบ้านของฉัน",
    revealedMessage: "ยินดีต้อนรับสู่บ้านใหม่ของคุณ! สวมสีของบ้านด้วยความภาคภูมิใจ",
    revealAgainButton: "เปิดเผยอีกครั้ง",
    shufflingTitle: "กำลังจับฉลาก...",
    shufflingSubtitle: "กำลังค้นหาบ้านของคุณ",
  },
};
