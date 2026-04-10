export interface SelectOption {
  value: string;
  label: string;
}

export type FieldType = "text" | "email" | "tel" | "textarea" | "select";

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: SelectOption[]; // for select fields
}

export interface FormStepConfig {
  title: string;
  description: string;
  fields: FormField[];
}

export interface CS101FormConfig {
  pageTitle: string;
  pageSubtitle: string;
  stepLabels: string[];
  steps: FormStepConfig[];
  success: {
    title: string;
    message: string;
    button: { label: string; href: string };
  };
}

export const cs101FormConfig: CS101FormConfig = {
  pageTitle: "สมัคร CS101",
  pageSubtitle: "กรอกแบบฟอร์มด้านล่างเพื่อจองที่นั่งของคุณ",
  stepLabels: ["ข้อมูลส่วนตัว", "พื้นฐาน", "ทักษะ", "แรงจูงใจ", "การเรียนรู้", "ความคาดหวัง"],
  steps: [
    {
      title: "ข้อมูลส่วนตัว",
      description: "บอกเราเกี่ยวกับตัวคุณ",
      fields: [
        { name: "name", label: "ชื่อ-นามสกุล", type: "text", placeholder: "กรอกชื่อ-นามสกุลของคุณ", required: true },
        { name: "email", label: "อีเมล", type: "email", placeholder: "your@email.com", required: true },
        { name: "phone", label: "เบอร์โทรศัพท์ (ไม่บังคับ)", type: "tel", placeholder: "0xx-xxx-xxxx" },
        { name: "university", label: "มหาวิทยาลัย", type: "text", placeholder: "เช่น มหาวิทยาลัยเกษตรศาสตร์", required: true },
      ],
    },
    {
      title: "พื้นฐานการเขียนโปรแกรม",
      description: "คุณมีประสบการณ์โค้ดดิ้งแค่ไหน?",
      fields: [
        {
          name: "experienceLevel",
          label: "ระดับประสบการณ์",
          type: "select",
          required: true,
          options: [
            { value: "none", label: "ไม่มีประสบการณ์" },
            { value: "beginner", label: "เริ่มต้น (น้อยกว่า 6 เดือน)" },
            { value: "intermediate", label: "ปานกลาง (6 เดือน - 2 ปี)" },
            { value: "advanced", label: "ขั้นสูง (มากกว่า 2 ปี)" },
          ],
        },
        { name: "languages", label: "ภาษาโปรแกรมที่รู้จัก (ถ้ามี)", type: "text", placeholder: "เช่น Python, JavaScript, C++", helperText: "คั่นด้วยเครื่องหมายจุลภาค" },
        { name: "projects", label: "โปรเจกต์ที่เคยทำ (ไม่บังคับ)", type: "textarea", placeholder: "อธิบายโปรเจกต์โค้ดดิ้งที่เคยทำ..." },
      ],
    },
    {
      title: "ทักษะและการคิดวิเคราะห์",
      description: "คุณรับมือกับปัญหาอย่างไร?",
      fields: [
        { name: "problemSolving", label: "คุณรับมือกับปัญหาใหม่อย่างไร?", type: "textarea", placeholder: "อธิบายกระบวนการแก้ปัญหาของคุณ...", required: true },
        { name: "favoriteTopic", label: "หัวข้อ CS / เทคโนโลยีที่ชื่นชอบ (ถ้ามี)", type: "text", placeholder: "เช่น AI, เว็บดีเวลอปเมนต์, ไซเบอร์ซีเคียวริตี้" },
      ],
    },
    {
      title: "แรงจูงใจ",
      description: "ทำไมคุณถึงอยากเข้าร่วม CS101?",
      fields: [
        { name: "whyCS101", label: "ทำไมคุณถึงอยากเข้าร่วม CS101?", type: "textarea", placeholder: "บอกแรงจูงใจของคุณ...", required: true },
        { name: "whatToGain", label: "คุณหวังจะได้อะไรจากโปรแกรมนี้?", type: "textarea", placeholder: "ทักษะ ความรู้ การเชื่อมต่อ..." },
      ],
    },
    {
      title: "รูปแบบการเรียนรู้",
      description: "คุณเรียนรู้ได้ดีที่สุดแบบไหน?",
      fields: [
        {
          name: "learningStyle",
          label: "รูปแบบการเรียนที่ชื่นชอบ",
          type: "select",
          required: true,
          options: [
            { value: "lecture", label: "การบรรยายและทฤษฎี" },
            { value: "hands-on", label: "การฝึกปฏิบัติ" },
            { value: "mixed", label: "ผสมผสานทั้งสองแบบ" },
          ],
        },
        {
          name: "collaboration",
          label: "คุณชอบทำงานคนเดียวหรือเป็นกลุ่ม?",
          type: "select",
          required: true,
          options: [
            { value: "solo", label: "คนเดียว" },
            { value: "group", label: "เป็นกลุ่ม" },
            { value: "both", label: "ทั้งสองแบบก็ได้" },
          ],
        },
      ],
    },
    {
      title: "ความคาดหวัง",
      description: "มีอะไรอื่นที่เราควรรู้ไหม?",
      fields: [
        { name: "goals", label: "เป้าหมายของคุณในโปรแกรมนี้", type: "textarea", placeholder: "คุณอยากบรรลุอะไร..." },
        { name: "anythingElse", label: "อื่น ๆ (ไม่บังคับ)", type: "textarea", placeholder: "คำถาม ข้อจำกัดด้านอาหาร ความต้องการพิเศษ..." },
      ],
    },
  ],
  success: {
    title: "สมัครสำเร็จแล้ว!",
    message: "ขอบคุณที่สมัคร CS101 เราจะส่งอีเมลยืนยันพร้อมรายละเอียดทั้งหมดให้คุณ",
    button: { label: "กลับไปหน้า CS101", href: "/events/cs101" },
  },
};
