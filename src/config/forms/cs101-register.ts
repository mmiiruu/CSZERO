export interface SelectOption {
  value: string;
  label: string;
}

export interface CheckboxOption {
  value: string;
  label: string;
}

export type FieldType = "text" | "email" | "tel" | "textarea" | "select" | "checkbox-group";

// Conditional rendering — show this field only when another field's value matches.
//   equals   — exact match              (e.g. foodAllergy === "yes")
//   in       — value in a set           (e.g. experienceLevel ∈ ["little","serious"])
//   contains — multi-select includes v  (e.g. languages list contains "other")
export type ShowIfCondition =
  | { field: string; equals: string }
  | { field: string; in: string[] }
  | { field: string; contains: string };

export interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  options?: SelectOption[];           // for select
  checkboxOptions?: CheckboxOption[]; // for checkbox-group
  showIf?: ShowIfCondition;
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
  authGate: {
    title: string;
    description: string;
    signInLabel: string;
  };
  emailLockedNotice: string;
  success: {
    title: string;
    message: string;
    button: { label: string; href: string };
  };
}

export const cs101FormConfig: CS101FormConfig = {
  pageTitle: "สมัคร CS101",
  pageSubtitle: "กรอกแบบฟอร์มด้านล่างเพื่อจองที่นั่งของคุณ",
  stepLabels: ["ข้อมูลส่วนตัว", "พื้นฐาน", "อุปกรณ์", "ความคาดหวัง", "ความพร้อม"],
  steps: [
    /* ── Page 1 — ข้อมูลส่วนตัว ──────────────────────────────────────── */
    {
      title: "ข้อมูลส่วนตัว",
      description: "บอกเราเกี่ยวกับตัวคุณ",
      fields: [
        { name: "name",       label: "ชื่อ-นามสกุล",      type: "text", placeholder: "เช่น สมชาย ใจดี",        required: true },
        { name: "nickname",   label: "ชื่อเล่น",            type: "text", placeholder: "เช่น อาร์ม",              required: true },
        { name: "studentId",  label: "รหัสนิสิต (ถ้ามี)",  type: "text", placeholder: "เช่น 6710405xxx",         helperText: "เฉพาะนิสิต KU ถ้าไม่มีให้ข้าม" },
        { name: "contact",    label: "ช่องทางติดต่อ",      type: "text", placeholder: "เช่น Line ID, IG, เบอร์โทร", required: true },
        { name: "gender", label: "เพศ", type: "select", required: true, options: [
          { value: "male",   label: "ชาย" },
          { value: "female", label: "หญิง" },
        ]},
        { name: "type", label: "ภาค", type: "select", required: true, options: [
          { value: "regular", label: "ปกติ" },
          { value: "special", label: "พิเศษ" },
        ]},
        { name: "foodAllergy", label: "มีอาการแพ้อาหารหรือไม่", type: "select", required: true, options: [
          { value: "no",  label: "ไม่มี" },
          { value: "yes", label: "มี (โปรดระบุ)" },
        ]},
        { name: "foodAllergyDetail", label: "อาหารที่แพ้", type: "text",
          placeholder: "เช่น ถั่ว, อาหารทะเล, นม", required: true,
          showIf: { field: "foodAllergy", equals: "yes" } },
      ],
    },

    /* ── Page 2 — พื้นฐานการเขียนโปรแกรม ─────────────────────────────── */
    {
      title: "พื้นฐานการเขียนโปรแกรม",
      description: "บอกเราเกี่ยวกับประสบการณ์โค้ดดิ้งของคุณ",
      fields: [
        { name: "experienceLevel", label: "เคยเขียนโปรแกรมมาก่อนหรือไม่", type: "select", required: true, options: [
          { value: "none",    label: "ไม่เคยเลย" },
          { value: "little",  label: "เคยเล็กน้อย" },
          { value: "serious", label: "เคยเรียนจริงจัง" },
        ]},
        { name: "languages", label: "เคยใช้ภาษาใดบ้าง (เลือกได้หลายข้อ)", type: "checkbox-group",
          showIf: { field: "experienceLevel", in: ["little", "serious"] },
          checkboxOptions: [
            { value: "python",  label: "Python" },
            { value: "cpp",     label: "C / C++" },
            { value: "java",    label: "Java" },
            { value: "scratch", label: "Scratch" },
            { value: "other",   label: "อื่น ๆ (โปรดระบุ)" },
          ]},
        { name: "languagesOther", label: "ภาษาอื่น ๆ ที่เคยใช้", type: "text",
          placeholder: "เช่น JavaScript, Go, Ruby",
          showIf: { field: "languages", contains: "other" } },
      ],
    },

    /* ── Page 3 — อุปกรณ์ ──────────────────────────────────────────── */
    {
      title: "อุปกรณ์",
      description: "เกี่ยวกับโน้ตบุ๊กที่คุณจะนำมาใช้",
      fields: [
        { name: "hasLaptop", label: "มีคอมพิวเตอร์โน้ตบุ๊กส่วนตัวหรือไม่", type: "select", required: true, options: [
          { value: "yes", label: "มี" },
          { value: "no",  label: "ไม่มี" },
        ]},
        { name: "os", label: "ใช้ระบบปฏิบัติการอะไร", type: "select", required: true,
          showIf: { field: "hasLaptop", equals: "yes" },
          options: [
            { value: "windows", label: "Windows" },
            { value: "macos",   label: "macOS" },
            { value: "linux",   label: "Linux" },
          ]},
      ],
    },

    /* ── Page 4 — ความคาดหวัง ───────────────────────────────────────── */
    {
      title: "ความคาดหวัง",
      description: "บอกเราว่าคุณคาดหวังอะไรจากโครงการนี้",
      fields: [
        { name: "expectations",  label: "สิ่งที่คาดว่าจะได้รับจากโครงการนี้", type: "text",
          placeholder: "ตอบสั้น ๆ", required: true },
        { name: "messageToTeam", label: "มีคำถามหรืออยากฝากอะไรถึงพี่ ๆ หรือไม่", type: "textarea",
          placeholder: "ตอบยาวได้เลย ถ้าไม่มีก็ข้ามได้" },
      ],
    },

    /* ── Page 5 — ความพร้อม ─────────────────────────────────────────── */
    {
      title: "ความพร้อม",
      description: "ตรวจสอบความพร้อมก่อนยืนยันการสมัคร",
      fields: [
        { name: "availability", label: "สามารถเข้าร่วมกิจกรรมได้ครบตามช่วงเวลาที่กำหนดหรือไม่", type: "select", required: true, options: [
          { value: "full",           label: "ได้ ครบทั้งหมด" },
          { value: "missing-day-9",  label: "ไม่ครบ ไม่สะดวกวันที่ 9" },
          { value: "missing-day-10", label: "ไม่ครบ ไม่สะดวกวันที่ 10" },
        ]},
      ],
    },
  ],
  authGate: {
    title: "เข้าสู่ระบบก่อนสมัคร",
    description: "เพื่อบันทึกอีเมลและจองที่นั่งของคุณ กรุณาเข้าสู่ระบบด้วยบัญชี Google ก่อน",
    signInLabel: "เข้าสู่ระบบด้วย Google",
  },
  emailLockedNotice: "บันทึกด้วยอีเมล",
  success: {
    title: "สมัครสำเร็จแล้ว!",
    message: "ขอบคุณที่สมัคร CS101 เราจะส่งอีเมลยืนยันพร้อมรายละเอียดทั้งหมดให้คุณ",
    button: { label: "กลับไปหน้า CS101", href: "/events/cs101" },
  },
};
