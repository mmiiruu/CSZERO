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
  theme: "purple" | "pink";
  options: ChoiceOption[];
  required?: boolean;
}

export interface SimpleField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea";
  placeholder?: string;
  required?: boolean;
}

export type HWFormField = SimpleField | ChoiceField;

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
    emoji: "👋",
    title: "Hello World",
    titleAccent: "Hello World",
    subtitle: "4 ขั้นตอนง่าย ๆ เพื่อเข้าร่วมความสนุก!",
  },
  stepLabels: ["ข้อมูลพื้นฐาน", "บุคลิกภาพ", "แรงจูงใจ", "ความคาดหวัง"],
  steps: [
    {
      title: "ข้อมูลพื้นฐาน",
      description: "บอกเราว่าคุณเป็นใคร",
      fields: [
        { name: "name", label: "ชื่อ-นามสกุล", type: "text", placeholder: "ชื่อของคุณ", required: true },
        { name: "email", label: "อีเมล", type: "email", placeholder: "your@email.com", required: true },
      ],
    },
    {
      title: "บุคลิกภาพและความชอบ",
      description: "อะไรทำให้คุณเป็นคุณ?",
      fields: [
        {
          name: "personalityType",
          label: "ประเภทบุคลิกภาพ",
          type: "choice",
          layout: "grid2",
          theme: "purple",
          required: true,
          options: [
            { value: "thinker", label: "🧠 นักคิด", desc: "วิเคราะห์และมีเหตุผล" },
            { value: "action", label: "⚡ คนลงมือ", desc: "กล้าหาญและตัดสินใจเด็ดขาด" },
            { value: "creative", label: "🎨 ครีเอทีฟ", desc: "จินตนาการและแสดงออก" },
            { value: "team", label: "🤝 ทีมเวิร์ก", desc: "ทำงานร่วมกันและสนับสนุนผู้อื่น" },
          ],
        },
        {
          name: "codingExperience",
          label: "มีประสบการณ์เขียนโค้ดไหม?",
          type: "choice",
          layout: "flex",
          theme: "purple",
          required: true,
          options: [
            { value: "yes", label: "✅ มี" },
            { value: "no", label: "🙅 ไม่มี" },
          ],
        },
        {
          name: "eventVibe",
          label: "บรรยากาศงานที่ชอบ",
          type: "choice",
          layout: "grid2",
          theme: "pink",
          required: true,
          options: [
            { value: "fun", label: "🎉 สนุกและผ่อนคลาย", desc: "เกม เสียงหัวเราะ และบรรยากาศดี ๆ" },
            { value: "serious", label: "📚 จริงจังและมีโครงสร้าง", desc: "เน้นการเรียนรู้และเป็นระบบ" },
          ],
        },
      ],
    },
    {
      title: "แรงจูงใจ",
      description: "ทำไมคุณถึงอยากเข้าร่วม?",
      fields: [
        { name: "whyJoin", label: "ทำไมคุณถึงอยากเข้าร่วม Hello World?", type: "textarea", placeholder: "บอกเราว่าอะไรทำให้คุณตื่นเต้นกับงานนี้..." },
      ],
    },
    {
      title: "ความคาดหวัง",
      description: "มีอะไรอื่นไหม?",
      fields: [
        { name: "expectations", label: "คุณคาดหวังอะไรจากงานนี้?", type: "textarea", placeholder: "ความสนุก การเรียนรู้ เพื่อนใหม่..." },
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
