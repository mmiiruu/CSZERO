import type { SimpleField, ChoiceField, ImageField } from "./hello-world-register";
import { APPLICANT_DEPARTMENTS } from "@/config/team";

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
  };
}

export const clubApplyFormConfig: ClubApplyFormConfig = {
  hero: {
    emoji: "🏫",
    title: "สมัครชุมนุม",
    titleAccent: "CSKU",
    subtitle: "กรอกข้อมูลเพื่อสมัครเข้าชุมนุมนิสิตวิทยาการคอมพิวเตอร์",
  },
  stepLabels: ["ข้อมูลพื้นฐาน", "เลือกฝ่าย", "คำถาม", "เลือกเวลาสัมภาษณ์"],
  steps: [
    {
      title: "ข้อมูลพื้นฐาน",
      description: "บอกเราว่าคุณเป็นใคร",
      fields: [
        { name: "name", label: "ชื่อ-นามสกุล", type: "text", placeholder: "เช่น สมชาย ใจดี", required: true },
        { name: "nickname", label: "ชื่อเล่น", type: "text", placeholder: "เช่น อาร์ม", required: true },
        { name: "studentId", label: "รหัสนิสิต", type: "text", placeholder: "เช่น 6710500000", required: true },
        { name: "email", label: "อีเมล", type: "email", placeholder: "your@email.com", required: true },
        { name: "phone", label: "เบอร์โทรศัพท์", type: "tel", placeholder: "08x-xxx-xxxx", required: true },
        { name: "contactChannel", label: "ช่องทางติดต่อ (IG, Line)", type: "text", placeholder: "เช่น IG: @armm หรือ Line: armcoder", required: true },
        {
          name: "educationType",
          label: "ภาค",
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
      title: "เลือกฝ่าย",
      description: "ตำแหน่งที่อยากทำ เรียงลำดับความสนใจ",
      fields: [
        {
          name: "preferredDepartment1",
          label: "ตำแหน่งที่อยากทำ — อันดับ 1",
          type: "choice",
          layout: "grid2",
          theme: "purple",
          required: true,
          options: APPLICANT_DEPARTMENTS.map((d) => ({ value: d.key, label: d.label })),
        },
        {
          name: "preferredDepartment2",
          label: "ตำแหน่งที่อยากทำ — อันดับ 2",
          type: "choice",
          layout: "grid2",
          theme: "purple",
          required: true,
          options: APPLICANT_DEPARTMENTS.map((d) => ({ value: d.key, label: d.label })),
        },
      ],
    },
    {
      title: "คำถาม",
      description: "ตอบคำถามเพื่อให้เรารู้จักคุณมากขึ้น",
      fields: [
        {
          name: "motivation",
          label: "ทำไมถึงอยากเข้าชุมนุมนิสิต?",
          type: "textarea",
          placeholder: "เล่าเหตุผลที่สนใจเข้าร่วมชุมนุม...",
          required: true,
        },
        {
          name: "departmentReason1",
          label: "ทำไมถึงเลือกฝ่ายนี้เป็นอันดับ 1 เพราะอะไร",
          type: "textarea",
          placeholder: "เล่าเหตุผล...",
          required: true,
        },
        {
          name: "departmentReason2",
          label: "ทำไมถึงเลือกฝ่ายนี้เป็นอันดับ 2 เพราะอะไร",
          type: "textarea",
          placeholder: "เล่าเหตุผล...",
          required: true,
        },
        {
          name: "expectations",
          label: "คาดหวังอะไรจากชุมนุมนิสิต",
          type: "textarea",
          placeholder: "อยากได้อะไรกลับไปจากการเข้าร่วม...",
          required: true,
        },
        {
          name: "selfIntro",
          label: "แนะนำตัวเองให้พี่จำเราได้",
          type: "textarea",
          placeholder: "เล่าอะไรก็ได้ที่ทำให้พี่ๆ จำคุณได้...",
          required: true,
        },
      ],
    },
  ],
  success: {
    emoji: "🎉",
    title: "สมัครสำเร็จแล้ว!",
    message: "เราได้บันทึกรอบสัมภาษณ์ของคุณไว้แล้ว ติดตามข่าวสารเพิ่มเติมได้ที่ Instagram ของชุมนุม",
    backButton: { label: "กลับหน้าหลัก", href: "/" },
  },
};
