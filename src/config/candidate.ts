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
    conflictAnswer: { label: string; placeholder: string };
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
  open: true,
  opensAt: "2026-06-24T05:00:00.000Z",
  closesAt: "2026-06-30T17:00:00.000Z",
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
    { title: "คลิปวิดีโอ ส่วนนี้จะเป็นส่วนนึงที่ให้เพื่อนๆโหวต", subtitle: "แนะนำตัวและตอบคำถามในคลิป" },
    { title: "คำถามเขียน", subtitle: "ตอบคำถามเกี่ยวกับตำแหน่งประธานรุ่น" },
  ],
  fields: {
    name: { label: "ชื่อจริง-นามสกุล (ใส่คำนำหน้า)", placeholder: "เช่น นาย สมชาย ใจดี" },
    nickname: { label: "ชื่อเล่น", placeholder: "ชื่อเล่น" },
    image: {
      label: "รูปตนเอง",
      placeholder: "",
      helper: "",
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
      label: "หน้าที่ของประธานรุ่นคืออะไร",
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
    conflictAnswer: {
      label: "ในระหว่างการจัดกิจกรรม มีเพื่อนสองคนมีความเห็นที่ไม่ตรงกัน น้องจะจัดการสถานการณ์นี้ยังไง",
      placeholder: "อธิบายแนวทางที่คุณจะใช้จัดการความขัดแย้งระหว่างเพื่อนในทีม",
    },
  },
};
