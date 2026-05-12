import type { TimelineDay } from "@/components/ui/Timeline";

export interface FeatureCard {
  icon: string;
  title: string;
  desc: string;
}

export interface CS101Config {
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
  features: {
    title: string;
    cards: FeatureCard[];
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

export const cs101Config: CS101Config = {
  hero: {
    badge: "โปรแกรม 2 วัน",
    description:
      "ก้าวแรกสู่โลกของวิทยาการคอมพิวเตอร์ โปรแกรม 2 วันที่ออกแบบมาสำหรับผู้เริ่มต้น เรียนรู้พื้นฐานการเขียนโปรแกรม การคิดเชิงคำนวณ และสร้างโปรเจกต์แรกของคุณ",
    primaryButton: { label: "สมัครเลย", href: "/events/cs101/register" },
    secondaryButton: { label: "ดูตารางกิจกรรม", href: "#schedule" },
  },
  homeCard: {
    badge: "โปรแกรม 2 วัน",
    title: "CS101",
    shortDescription:
      "เวิร์กช็อป 2 วันสำหรับผู้เริ่มต้น เรียนรู้พื้นฐานการเขียนโปรแกรม การแก้ปัญหา และการคิดเชิงคำนวณ",
    href: "/events/cs101",
  },
  features: {
    title: "ทำไมต้อง CS101?",
    cards: [
      { icon: "🧠", title: "เริ่มจากศูนย์", desc: "ไม่ต้องมีพื้นฐานก็มาได้ จะปูพื้นฐาน Calculus และ Python ตั้งแต่แรก ให้พร้อมก่อนเปิดเทอมจริง" },
      { icon: "💻", title: "เรียนแบบลงมือทำ", desc: "ไม่ใช่แค่นั่งฟัง แต่ได้ลองทำโจทย์จริง เขียนโค้ดจริง เข้าใจตั้งแต่วันแรก" },
      { icon: "👥", title: "ทำความรู้จักเพื่อนๆ และพี่ๆ", desc: "มารู้จักเพื่อนในภาคตั้งแต่ก่อนเปิดเทอม และมีพี่ๆคอยแนะนำตลอดการเรียน" },
      { icon: "✍🏻", title: "พร้อมก่อนเรียนจริง", desc: "เข้าใจเนื้อหาพื้นฐานก่อนเข้าเรียน ลดความเครียด ลดการตามไม่ทันในเทอมแรก" },
      { icon: "💭", title: "ฝึก Critical Thinking", desc: "ได้ฝึก logic + problem solving ที่ใช้ทั้งใน Calculus และการเขียนโปรแกรม" },
      { icon: "📚", title: "ปรับตัวก่อนเปิดเทอม", desc: "เข้าใจบรรยากาศการเรียน รู้แนวทางก่อนเริ่มจริง" },
    ],
  },
  schedule: {
    eyebrow: "กำหนดการ",
    title: "ตารางกิจกรรม",
    accentColor: "#2563eb",
    days: [
      {
        day: "วันที่ 1",
        date: "Calculus",
        items: [
          { time: "08:30", title: "ลงทะเบียน", type: "social", description: "ลงทะเบียนเข้าร่วมงานและรับเอกสาร" },
          { time: "09:00", title: "สอนเนื้อหา: Calculus", type: "talk", description: "เนื้อหาวิชา Calculus" },
          { time: "09:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "10:00", title: "สอนเนื้อหา: Calculus (ต่อ)", type: "talk", description: "เนื้อหาวิชา Calculus (ต่อ)" },
          { time: "10:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "11:00", title: "ทำแบบฝึกหัด", type: "workshop", description: "ฝึกปฏิบัติจากเนื้อหาที่เรียนมา" },
          { time: "12:00", title: "พักรับประทานอาหารกลางวัน", type: "break" },
          { time: "13:00", title: "สอนเนื้อหา: Calculus (ต่อ)", type: "talk", description: "เนื้อหาวิชา Calculus (ต่อ)" },
          { time: "13:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "14:00", title: "สอนเนื้อหา: Calculus (ต่อ)", type: "talk", description: "เนื้อหาวิชา Calculus (ต่อ)" },
          { time: "14:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "15:00", title: "ทำแบบฝึกหัด", type: "workshop", description: "ฝึกปฏิบัติจากเนื้อหาทั้งหมดของวัน" },
        ],
      },
      {
        day: "วันที่ 2",
        date: "Python",
        items: [
          { time: "08:30", title: "ลงทะเบียน", type: "social", description: "ลงทะเบียนเข้าร่วมงานและรับเอกสาร" },
          { time: "09:00", title: "สอนเนื้อหา: ชนิดของข้อมูล และการแสดงผลกับการรับค่า", type: "talk", description: "เรียนรู้ชนิดข้อมูลพื้นฐาน (int, float, str, bool) การใช้ print() และ input()" },
          { time: "09:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "10:00", title: "สอนเนื้อหา: if else, While Loop และ For Loop", type: "talk", description: "เรียนรู้การใช้เงื่อนไข if/elif/else และการวนซ้ำด้วย while/for" },
          { time: "10:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "11:00", title: "ทำแบบฝึกหัด", type: "workshop", description: "ฝึกปฏิบัติจากเนื้อหาชนิดข้อมูล เงื่อนไข และ Loop" },
          { time: "12:00", title: "พักรับประทานอาหารกลางวัน", type: "break" },
          { time: "13:00", title: "สอนเนื้อหา: Function", type: "talk", description: "เรียนรู้การเขียนและเรียกใช้งาน Function รวมถึง parameter และ return value" },
          { time: "13:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "14:00", title: "สอนเนื้อหา: List", type: "talk", description: "เรียนรู้โครงสร้างข้อมูลประเภท List การเข้าถึงและจัดการข้อมูล" },
          { time: "14:50", title: "พักรับประทานอาหารว่าง", type: "break" },
          { time: "15:00", title: "ทำแบบฝึกหัด", type: "workshop", description: "ฝึกปฏิบัติจากเนื้อหา Function และ List ของวัน" },
        ],
      },
    ],
  },
  cta: {
    title: "พร้อมเริ่มต้นการเดินทาง CS ของคุณแล้วหรือยัง?",
    description: "ที่นั่งมีจำนวนจำกัด สมัครเลยเพื่อจองที่นั่งของคุณ",
    button: { label: "สมัคร CS101", href: "/events/cs101/register" },
  },
  registration: {
    open: true,
    opensAt: null,
    comingSoon: {
      title: "เปิดรับสมัครเร็วๆ นี้",
      message: "การสมัคร CS101 ยังไม่เปิด คอยติดตามได้เร็วๆ นี้!",
      backButton: { label: "กลับไปหน้า CS101", href: "/events/cs101" },
    },
  },
};
