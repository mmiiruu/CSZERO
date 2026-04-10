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
        date: "แนะนำวิทยาการคอมพิวเตอร์",
        items: [
          { time: "09:00", title: "พิธีเปิดและต้อนรับ", type: "talk", description: "พบกับทีมงานและผู้เข้าร่วมคนอื่น ๆ" },
          { time: "09:30", title: "วิทยาการคอมพิวเตอร์คืออะไร?", type: "talk", description: "ภาพรวมของ CS และการประยุกต์ใช้ในชีวิตจริง" },
          { time: "10:30", title: "พักเบรก", type: "break" },
          { time: "10:45", title: "คิดแบบนักโปรแกรมเมอร์", type: "workshop", description: "ตรรกะ รูปแบบ และการแยกย่อยปัญหา" },
          { time: "12:00", title: "พักกลางวัน", type: "break" },
          { time: "13:00", title: "ลงมือทำ: โปรแกรมแรกของคุณ", type: "workshop", description: "เขียนโค้ดบรรทัดแรกด้วยตัวเองพร้อมคำแนะนำ" },
          { time: "15:00", title: "พักเบรก", type: "break" },
          { time: "15:15", title: "มินิชาเลนจ์", type: "workshop", description: "แก้โจทย์โปรแกรมมิ่งระดับเริ่มต้นเป็นทีม" },
          { time: "16:30", title: "สรุปวันที่ 1 และกิจกรรมสังสรรค์", type: "social" },
        ],
      },
      {
        day: "วันที่ 2",
        date: "สร้างและแก้ปัญหา",
        items: [
          { time: "09:00", title: "ทบทวนวันที่ 1", type: "talk" },
          { time: "09:30", title: "โครงสร้างข้อมูลเบื้องต้น", type: "talk", description: "อาเรย์ ลิสต์ และการจัดเก็บข้อมูล" },
          { time: "10:30", title: "พักเบรก", type: "break" },
          { time: "10:45", title: "อัลกอริทึมและประสิทธิภาพ", type: "workshop", description: "การเรียงลำดับ การค้นหา และการคิดเรื่องความเร็ว" },
          { time: "12:00", title: "พักกลางวัน", type: "break" },
          { time: "13:00", title: "สร้างโปรเจกต์ของตัวเอง", type: "workshop", description: "นำทุกอย่างที่เรียนมาสร้างโปรเจกต์แบบมีคำแนะนำ" },
          { time: "15:30", title: "นำเสนอโปรเจกต์", type: "talk", description: "โชว์สิ่งที่คุณสร้าง!" },
          { time: "16:30", title: "พิธีปิดและมอบใบประกาศนียบัตร", type: "social" },
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
