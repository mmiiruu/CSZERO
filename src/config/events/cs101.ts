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
      { icon: "🧠", title: "จากศูนย์สู่ฮีโร่", desc: "ไม่ต้องมีประสบการณ์มาก่อน เราเริ่มจากพื้นฐานที่สุด" },
      { icon: "🛠️", title: "เรียนรู้จากการลงมือทำ", desc: "ฝึกปฏิบัติ 80% ทฤษฎี 20% สร้างสิ่งจริงตั้งแต่วันแรก" },
      { icon: "👥", title: "ชุมชน", desc: "เข้าร่วมกลุ่มผู้เรียนที่น่าอยู่และพี่เลี้ยงที่มีประสบการณ์" },
      { icon: "🏆", title: "ใบประกาศนียบัตร", desc: "รับใบประกาศนียบัตรหลังจบโปรแกรม" },
      { icon: "💡", title: "การแก้ปัญหา", desc: "พัฒนาทักษะการคิดเชิงคำนวณที่ใช้ได้ทุกที่" },
      { icon: "🚀", title: "จุดเริ่มต้นของการเดินทาง", desc: "วางรากฐานเพื่อเรียนรู้ CS ต่อด้วยตัวเอง" },
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
        date: "ชนิดข้อมูล · เงื่อนไข · Loop · Function · List",
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
};
