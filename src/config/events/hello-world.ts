import type { TimelineDay } from "@/components/ui/Timeline";

export interface HouseConfig {
  key: "spongebob" | "conan" | "kungfupanda" | "zootopia" | "toystory";
  name: string;
  symbol: string;
  desc: string;
  image: string;
  revealImage: string;
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
  registration: {
    open: boolean;
    // ISO datetime (e.g. "2026-06-01T09:00:00+07:00"). If set and in the future,
    // the page shows the Coming Soon screen with a countdown and auto-opens at that time.
    // Leave null to use `open` as the only gate.
    opensAt: string | null;
    comingSoon: {
      title: string;
      message: string;
      backButton: { label: string; href: string };
    };
  };
}

export const helloWorldConfig: HelloWorldConfig = {
  hero: {
    badge: "กิจกรรม 1 วัน",
    description:
      "วันแรกในโลกการ์ตูนของ CS! จับสลากบ้าน พบเพื่อนใหม่สุดเจ๋ง เล่นเกม และค้นพบว่าวิทยาการคอมพิวเตอร์คืออะไร",
    primaryButton: { label: "สมัครเลย 🎉", href: "/events/hello-world/register" },
    secondaryButton: { label: "เปิดเผยบ้านของคุณ 🎬", href: "/events/hello-world/reveal" },
  },
  homeCard: {
    badge: "กิจกรรม 1 วัน",
    title: "Hello World",
    shortDescription:
      "กิจกรรมต้อนรับสุดสนุกสำหรับนิสิตใหม่ทุกคน จับสลากบ้านการ์ตูน พบเพื่อน และเริ่มต้นการเดินทาง CS!",
    href: "/events/hello-world",
  },
  houses: {
    eyebrow: "ห้าบ้านการ์ตูน",
    title: "คุณจะอยู่บ้านไหน?",
    items: [
      {
        key: "spongebob",
        name: "SpongeBob",
        symbol: "🧽",
        desc: "สนุกสนาน ร่าเริง และมองโลกในแง่ดีเสมอ",
        image: "/spongebob_patrick.png",
        revealImage: "/spongebob.png",
        revealGradient: "from-yellow-300 to-pink-500",
        revealTextColor: "text-pink-500",
      },
      {
        key: "conan",
        name: "Conan",
        symbol: "🔍",
        desc: "ช่างสังเกต วิเคราะห์เก่ง และไขปริศนาได้",
        image: "/conan_stand.png",
        revealImage: "/conan.png",
        revealGradient: "from-blue-500 to-red-600",
        revealTextColor: "text-red-600",
      },
      {
        key: "kungfupanda",
        name: "Kung Fu Panda",
        symbol: "🐼",
        desc: "มุ่งมั่น ฝึกฝน และเชื่อในพลังของตัวเอง",
        image: "/new_kungfu_panda.png",
        revealImage: "/new_kungfu_panda.png",
        revealGradient: "from-green-500 to-yellow-500",
        revealTextColor: "text-yellow-600",
      },
      {
        key: "zootopia",
        name: "Zootopia",
        symbol: "🦊",
        desc: "กล้าหาญ ยุติธรรม และทำลายขีดจำกัด",
        image: "/new_zootopia_rabbit.png",
        revealImage: "/zootopia_couple.png",
        revealGradient: "from-gray-400 to-orange-500",
        revealTextColor: "text-orange-500",
      },
      {
        key: "toystory",
        name: "Toy Story",
        symbol: "🚀",
        desc: "จงรักภักดี ผจญภัย และ 'ไปพ้นกว่านั้น'",
        image: "/toystory_woody.png",
        revealImage: "/toystory_buzzlightyear.png",
        revealGradient: "from-purple-600 to-white",
        revealTextColor: "text-purple-600",
      },
    ],
  },
  schedule: {
    eyebrow: "กำหนดการ",
    title: "ไทม์ไลน์กิจกรรม",
    accentColor: "#FACC15",
    days: [
      {
        day: "วันกิจกรรม",
        date: "Hello World — ยินดีต้อนรับสู่โลกการ์ตูน CS!",
        items: [
          { time: "08:00", title: "ลงทะเบียน", type: "social" },
          { time: "08:30", title: "Intro to Comsci", type: "talk" },
          { time: "08:50", title: "กิจกรรม ice breaking", type: "social" },
          { time: "10:20", title: "พักเบรค", type: "break" },
          { time: "10:30", title: "กิจกรรมฐาน", type: "workshop" },
          { time: "12:30", title: "พักกลางวัน", type: "break" },
          { time: "13:30", title: "กิจกรรมฐาน", type: "workshop" },
          { time: "16:30", title: "พิธีปิด", type: "social" },
        ],
      },
    ],
  },
  cta: {
    title: "อย่าพลาด! 🎬",
    description: "ที่นั่งมีจำนวนจำกัด สมัครเลยและดูว่าคุณจะอยู่บ้านการ์ตูนไหน",
    button: { label: "สมัคร Hello World", href: "/events/hello-world/register" },
  },
  reveal: {
    emoji: "🎬",
    title: "เปิดเผยบ้านของคุณ",
    description: "กดปุ่มด้านล่างเพื่อค้นพบว่าคุณอยู่บ้านการ์ตูนไหน",
    button: "เปิดเผยบ้านของฉัน",
    revealedMessage: "ยินดีต้อนรับสู่บ้านการ์ตูนของคุณ! ภูมิใจในตัวละครของบ้านคุณได้เลย",
    revealAgainButton: "เปิดเผยอีกครั้ง",
    shufflingTitle: "กำลังสุ่มบ้าน...",
    shufflingSubtitle: "กำลังค้นหาบ้านการ์ตูนของคุณ",
  },
  registration: {
    open: true,
    opensAt: "2026-05-12T12:30:45Z",
    comingSoon: {
      title: "เปิดรับสมัครเร็วๆ นี้",
      message: "การสมัคร Hello World ยังไม่เปิด คอยติดตามได้เร็วๆ นี้!",
      backButton: { label: "กลับไปหน้า Hello World", href: "/events/hello-world" },
    },
  },
};

// Behavior:
//   - open: false → always Coming Soon (no countdown). Acts as kill switch.
//   - open: true + opensAt: null → registration is open right now.
//   - open: true + opensAt: <future ISO> → Coming Soon screen with a live 4-block countdown (วัน/ชั่วโมง/นาที/วินาที). When the time hits, the page auto-flips to the form — no refresh
//   needed.
//   - open: true + opensAt: <past ISO> → open.