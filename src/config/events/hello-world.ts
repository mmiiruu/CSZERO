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
}

export const helloWorldConfig: HelloWorldConfig = {
  hero: {
    badge: "🎬 กิจกรรม 1 วัน",
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
        revealGradient: "from-yellow-400 to-amber-500",
        revealTextColor: "text-yellow-500",
      },
      {
        key: "conan",
        name: "Conan",
        symbol: "🔍",
        desc: "ช่างสังเกต วิเคราะห์เก่ง และไขปริศนาได้",
        image: "/conan_stand.png",
        revealImage: "/conan.png",
        revealGradient: "from-red-600 to-red-900",
        revealTextColor: "text-red-500",
      },
      {
        key: "kungfupanda",
        name: "Kung Fu Panda",
        symbol: "🐼",
        desc: "มุ่งมั่น ฝึกฝน และเชื่อในพลังของตัวเอง",
        image: "/kungfu_panda.png",
        revealImage: "/kungfu_panda.png",
        revealGradient: "from-green-500 to-emerald-800",
        revealTextColor: "text-green-500",
      },
      {
        key: "zootopia",
        name: "Zootopia",
        symbol: "🦊",
        desc: "กล้าหาญ ยุติธรรม และทำลายขีดจำกัด",
        image: "/zootopia_rabbit.png",
        revealImage: "/zootopia_couple.png",
        revealGradient: "from-orange-400 to-orange-700",
        revealTextColor: "text-orange-400",
      },
      {
        key: "toystory",
        name: "Toy Story",
        symbol: "🚀",
        desc: "จงรักภักดี ผจญภัย และ 'ไปพ้นกว่านั้น'",
        image: "/toystory_woody.png",
        revealImage: "/toystory_buzzlightyear.png",
        revealGradient: "from-blue-500 to-indigo-700",
        revealTextColor: "text-blue-400",
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
          { time: "08:30", title: "ลงทะเบียนและต้อนรับ", type: "social", description: "รับป้ายชื่อและพบเพื่อนใหม่" },
          { time: "09:00", title: "พิธีเปิด", type: "talk" },
          { time: "09:30", title: "พิธีจับสลากบ้านการ์ตูน", type: "social", description: "ค้นพบบ้านของคุณ: 🧽 🔍 🐼 🦊 🚀" },
          { time: "10:00", title: "กิจกรรมละลายพฤติกรรมและเกมทีม", type: "social" },
          { time: "11:00", title: "CS Lightning Talks", type: "talk" },
          { time: "12:00", title: "รับประทานอาหารกลางวันและ Networking", type: "break" },
          { time: "13:00", title: "เวิร์กช็อป: สร้างแอปแรกของคุณ", type: "workshop", description: "เซสชันแบบ Hands-on พร้อมคำแนะนำ" },
          { time: "15:00", title: "การแข่งขันระหว่างบ้าน", type: "workshop", description: "แข่งเพื่อบ้านการ์ตูนของคุณ!" },
          { time: "16:00", title: "มอบรางวัลและพิธีปิด", type: "social" },
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
};
