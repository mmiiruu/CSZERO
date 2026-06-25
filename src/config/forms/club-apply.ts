import type { SimpleField, ChoiceField, ImageField } from "./hello-world-register";

export type ClubFormField = SimpleField | ChoiceField | ImageField;

export interface ClubFormStepConfig {
  title: string;
  description: string;
  fields: ClubFormField[];
}

export interface ClubApplyFormConfig {
  hero: {
    emoji: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  stepLabels: string[];
  steps: ClubFormStepConfig[];
  success: {
    emoji: string;
    title: string;
    message: string;
    backButton: { label: string; href: string };
    slotsButton: { label: string; href: string };
  };
}

export const clubApplyFormConfig: ClubApplyFormConfig = {
  hero: {
    emoji: "🏫",
    title: "สมัครชุมนุม",
    titleAccent: "CSKU",
    subtitle: "กรอกข้อมูลเพื่อสมัครเข้าชุมนุมนิสิตวิทยาการคอมพิวเตอร์",
  },
  stepLabels: ["ข้อมูลพื้นฐาน", "การศึกษา & รูปถ่าย", "คำถาม"],
  steps: [
    {
      title: "ข้อมูลพื้นฐาน",
      description: "บอกเราว่าคุณเป็นใคร",
      fields: [
        { name: "name", label: "ชื่อ", type: "text", placeholder: "เช่น สมชาย", required: true },
        { name: "surname", label: "นามสกุล", type: "text", placeholder: "เช่น ใจดี", required: true },
        { name: "nickname", label: "ชื่อเล่น", type: "text", placeholder: "เช่น อาร์ม", required: true },
        { name: "email", label: "อีเมล", type: "email", placeholder: "your@email.com", required: true },
        { name: "phone", label: "เบอร์โทรศัพท์", type: "tel", placeholder: "08x-xxx-xxxx", required: true },
        { name: "contactChannel", label: "ช่องทางติดต่อ (IG, Line)", type: "text", placeholder: "เช่น IG: @armm หรือ Line: armcoder", required: true },
      ],
    },
    {
      title: "การศึกษา & รูปถ่าย",
      description: "ข้อมูลการศึกษาและรูปถ่ายของคุณ",
      fields: [
        {
          name: "educationType",
          label: "ประเภทการศึกษา",
          type: "choice",
          layout: "flex",
          theme: "purple",
          required: true,
          options: [
            { value: "regular", label: "📘 ภาคปกติ" },
            { value: "special", label: "📗 ภาคพิเศษ" },
          ],
        },
        {
          name: "photo",
          label: "รูปถ่ายตนเองที่เห็นใบหน้าชัดเจน",
          type: "image",
          helperText: "ใช้สำหรับยืนยันตัวตน",
          required: true,
        },
      ],
    },
    {
      title: "คำถาม",
      description: "ตอบคำถามเพื่อให้เรารู้จักคุณมากขึ้น",
      fields: [
        {
          name: "motivation",
          label: "ทำไมถึงอยากเข้าชุมนุม CS?",
          type: "textarea",
          placeholder: "เล่าเหตุผลที่สนใจเข้าร่วมชุมนุม...",
          required: true,
        },
        {
          name: "skills",
          label: "ความสามารถพิเศษหรือทักษะที่มี",
          type: "textarea",
          placeholder: "เช่น เขียนโปรแกรม, ออกแบบกราฟิก, ถ่ายภาพ...",
          required: true,
        },
        {
          name: "expectations",
          label: "สิ่งที่คาดหวังจากการเข้าชุมนุม",
          type: "textarea",
          placeholder: "อยากได้อะไรกลับไปจากการเข้าร่วม...",
          required: true,
        },
      ],
    },
  ],
  success: {
    emoji: "🎉",
    title: "สมัครสำเร็จแล้ว!",
    message: "กรุณารอประกาศเปิดจองรอบสัมภาษณ์ ติดตามข่าวสารได้ที่ Instagram ของชุมนุม",
    backButton: { label: "กลับหน้าหลัก", href: "/" },
    slotsButton: { label: "ดูรอบสัมภาษณ์", href: "/club/slots" },
  },
};
