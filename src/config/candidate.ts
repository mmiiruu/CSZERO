import type { RegistrationConfig } from "@/lib/registration";

export interface CandidateRegistrationConfig extends RegistrationConfig {
  pageTitle: string;
  pageSubtitle: string;
  navLabel: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  steps: Array<{ title: string; subtitle: string }>;
  fields: {
    name: { label: string; placeholder: string };
    nickname: { label: string; placeholder: string };
    image: { label: string; placeholder: string; helper: string };
    motto: { label: string; placeholder: string };
    email: { label: string; lockedNotice: string };
    videoUrl: { label: string; placeholder: string; helper: string };
    videoQuestions: string[];
    dutyAnswer: { label: string; placeholder: string };
    visionAnswer: { label: string; placeholder: string };
    strengthWeaknessAnswer: { label: string; placeholder: string };
  };
}

export const candidateRegistrationConfig: CandidateRegistrationConfig = {
  open: false,
  opensAt: null,
  comingSoon: {
    title: "เปิดรับสมัครเร็วๆ นี้",
    message: "การสมัครเป็นประธานรุ่นยังไม่เปิดสำหรับนิสิตทั่วไป",
    backButton: { label: "กลับหน้าหลัก", href: "/" },
  },
  pageTitle: "สมัครประธานรุ่น",
  pageSubtitle: "กรอกข้อมูลให้ครบทุก 3 ขั้นตอน ทีมงานจะตรวจสอบและเพิ่มเข้าระบบโหวต",
  navLabel: "สมัครประธาน",
  submitLabel: "ส่งใบสมัคร",
  successTitle: "ส่งใบสมัครเรียบร้อย",
  successMessage: "ทีมงานจะตรวจสอบและเพิ่มคุณเข้าสู่ระบบโหวตในเร็วๆ นี้",
  steps: [
    { title: "ข้อมูลส่วนตัว", subtitle: "ชื่อ รูปภาพ และคติประจำใจ" },
    { title: "คลิปวิดีโอ", subtitle: "แนะนำตัวและตอบคำถามในคลิป" },
    { title: "คำถามเขียน", subtitle: "ตอบคำถามเกี่ยวกับตำแหน่งประธานรุ่น" },
  ],
  fields: {
    name: { label: "ชื่อจริง–นามสกุล", placeholder: "ชื่อ นามสกุล" },
    nickname: { label: "ชื่อเล่น", placeholder: "ชื่อเล่น" },
    image: {
      label: "รูปตนเอง (URL)",
      placeholder: "https://...",
      helper: "ลิงก์รูปภาพที่อัปโหลดไว้แล้ว หากไม่มีจะใช้อักษรย่อแทน",
    },
    motto: { label: "คติประจำใจ", placeholder: "คติประจำใจที่สร้างแรงบันดาลใจให้คุณ" },
    email: { label: "อีเมล", lockedNotice: "ใช้อีเมลที่ลงชื่อเข้าใช้" },
    videoUrl: {
      label: "ลิงก์คลิปวิดีโอ (YouTube)",
      placeholder: "https://youtu.be/...",
      helper: "อัดคลิปแล้วอัปโหลดขึ้น YouTube จากนั้นวางลิงก์ที่นี่",
    },
    videoQuestions: [
      "ช่วยแนะนำตัวเองหน่อย และเล่าว่าทำไมถึงอยากเป็นประธานรุ่น",
      "หากได้รับเลือกเป็นประธานรุ่น คุณอยากเห็นรุ่นของเราเป็นแบบไหน",
      "ฝากข้อความถึงเพื่อนในรุ่นที่กำลังตัดสินใจเลือกประธานรุ่น",
    ],
    dutyAnswer: {
      label: "คิดว่าหน้าที่ของประธานรุ่นคืออะไร",
      placeholder: "อธิบายความเข้าใจของคุณเกี่ยวกับบทบาทและหน้าที่ของประธานรุ่น",
    },
    visionAnswer: {
      label: "คุณมีแนวคิดหรือกิจกรรมอะไรที่อยากผลักดันให้เกิดขึ้นในรุ่น",
      placeholder: "เล่าถึงแนวคิด แผนงาน หรือกิจกรรมที่คุณอยากทำเพื่อรุ่น",
    },
    strengthWeaknessAnswer: {
      label: "คุณคิดว่าจุดแข็งและจุดอ่อนของตัวเองคืออะไร",
      placeholder: "อธิบายจุดแข็งที่จะช่วยให้คุณทำหน้าที่ได้ดี และจุดอ่อนที่คุณกำลังพัฒนา",
    },
  },
};
