export interface ChoiceOption {
  value: string;
  label: string;
  desc?: string;
}

export interface ChoiceField {
  name: string;
  label: string;
  type: "choice";
  layout: "grid2" | "flex";
  theme: "purple" | "pink" | "amber";
  options: ChoiceOption[];
  required?: boolean;
}

export interface SimpleField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export interface ImageField {
  name: string;
  label: string;
  type: "image";
  helperText?: string;
  required?: boolean;
}

export type HWFormField = SimpleField | ChoiceField | ImageField;

export interface HWFormStepConfig {
  title: string;
  description: string;
  fields: HWFormField[];
}

export interface HelloWorldFormConfig {
  hero: {
    emoji: string;
    title: string;
    titleAccent: string;
    subtitle: string;
  };
  stepLabels: string[];
  steps: HWFormStepConfig[];
  success: {
    emoji: string;
    title: string;
    message: string;
    backButton: { label: string; href: string };
    revealButton: { label: string; href: string };
  };
}

export const helloWorldFormConfig: HelloWorldFormConfig = {
  hero: {
    emoji: "🎬",
    title: "Hello World",
    titleAccent: "Hello World",
    subtitle: "4 ขั้นตอนง่าย ๆ เพื่อเข้าร่วมโลกการ์ตูน CS!",
  },
  stepLabels: ["ข้อมูลพื้นฐาน", "บุคลิกภาพ", "แรงจูงใจ", "ความคาดหวัง"],
  steps: [
    {
      title: "ข้อมูลพื้นฐาน",
      description: "บอกเราว่าคุณเป็นใคร",
      fields: [
        { name: "name",            label: "ชื่อ-นามสกุล",                       type: "text",  placeholder: "เช่น นาย สมชาย ใจดี", required: true },
        { name: "nickname",        label: "ชื่อเล่น",                            type: "text",  placeholder: "เช่น อาร์ม",         required: true },
        { name: "email",           label: "อีเมล",                               type: "email", placeholder: "your@email.com",     required: true },
        { name: "phone",           label: "เบอร์โทรศัพท์ส่วนตัว",               type: "tel",   placeholder: "08x-xxx-xxxx",       required: true },
        { name: "emergencyPhone",  label: "เบอร์โทรศัพท์ติดต่อกรณีฉุกเฉิน",     type: "tel",   placeholder: "08x-xxx-xxxx",       required: true },
        {
          name: "educationType",
          label: "ประเภทการศึกษา",
          type: "choice",
          layout: "flex",
          theme: "amber",
          required: true,
          options: [
            { value: "regular", label: "📘 ภาคปกติ" },
            { value: "special", label: "📗 ภาคพิเศษ" },
          ],
        },
        {
          name: "tcasImage",
          label: "รูปยืนยันสิทธิ์การเข้าศึกษา (รอบ TCAS 1–3)",
          type: "image",
          helperText: "อัปโหลดภาพหน้าจอผลการยืนยันสิทธิ์ TCAS",
          required: true,
        },
        {
          name: "selfImage",
          label: "รูปถ่ายตนเองที่เห็นใบหน้าชัดเจน",
          type: "image",
          helperText: "ใช้สำหรับยืนยันตัวตนในวันงาน",
          required: true,
        },
      ],
    },
    {
      title: "บุคลิกภาพและทัศนคติ",
      description: "อะไรทำให้คุณเป็นคุณ?",
      fields: [
        {
          name: "introduction",
          label: "แนะนำตนเองโดยสังเขป",
          type: "textarea",
          placeholder: "เล่าเกี่ยวกับตัวคุณ ความสนใจ หรือเรื่องที่อยากให้ทีมรู้...",
          required: true,
        },
      ],
    },
    {
      title: "แรงจูงใจ",
      description: "ทำไมคุณถึงอยากเข้าร่วม?",
      fields: [
        {
          name: "motivation",
          label: "เหตุผลที่สนใจสมัครเข้าร่วมกิจกรรม Hello World",
          type: "textarea",
          placeholder: "อะไรทำให้คุณตื่นเต้นกับงานนี้?",
          required: true,
        },
      ],
    },
    {
      title: "ความคาดหวัง",
      description: "อยากได้อะไรกลับไปจากกิจกรรม?",
      fields: [
        {
          name: "expectations",
          label: "สิ่งที่คาดหวังจากการเข้าร่วมกิจกรรม",
          type: "textarea",
          placeholder: "ความสนุก การเรียนรู้ เพื่อนใหม่...",
          required: true,
        },
      ],
    },
  ],
  success: {
    emoji: "🎉",
    title: "คุณเข้าร่วมแล้ว!",
    message: "ยินดีต้อนรับสู่ Hello World! บ้านของคุณจะถูกเปิดเผยในเร็ว ๆ นี้!",
    backButton: { label: "กลับไปหน้ากิจกรรม", href: "/events/hello-world" },
    revealButton: { label: "เปิดเผยบ้านของคุณ", href: "/events/hello-world/reveal" },
  },
};
