import type { RegistrationConfig } from "@/lib/registration";

export interface CandidateRegistrationConfig extends RegistrationConfig {
  pageTitle: string;
  pageSubtitle: string;
  navLabel: string;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
  fields: {
    name: { label: string; placeholder: string };
    email: { label: string; lockedNotice: string };
    studentId: { label: string; placeholder: string };
    year: { label: string; options: Array<{ value: string; label: string }> };
    role: { label: string; placeholder: string };
    bio: { label: string; placeholder: string };
    motivation: { label: string; placeholder: string };
    image: { label: string; placeholder: string; helper: string };
  };
}

export const candidateRegistrationConfig: CandidateRegistrationConfig = {
  open: false,
  opensAt: null,
  comingSoon: {
    title: "เปิดรับสมัครเร็วๆ นี้",
    message: "การสมัครเป็นผู้สมัครรับเลือกตั้งยังไม่เปิดสำหรับนิสิตทั่วไป",
    backButton: { label: "กลับหน้าหลัก", href: "/" },
  },
  pageTitle: "สมัครเป็นผู้สมัครรับเลือกตั้ง",
  pageSubtitle: "กรอกข้อมูลด้านล่างเพื่อลงสมัคร ทีมงานจะตรวจสอบและเพิ่มเข้าระบบโหวต",
  navLabel: "สมัครผู้สมัคร",
  submitLabel: "ส่งใบสมัคร",
  successTitle: "ส่งใบสมัครเรียบร้อย",
  successMessage: "ทีมงานจะตรวจสอบและเพิ่มคุณเข้าสู่ระบบโหวตในเร็วๆ นี้",
  fields: {
    name: { label: "ชื่อ-นามสกุล", placeholder: "ชื่อ นามสกุล" },
    email: { label: "อีเมล", lockedNotice: "ใช้อีเมลที่ลงชื่อเข้าใช้" },
    studentId: { label: "รหัสนิสิต", placeholder: "เช่น 6510512345" },
    year: {
      label: "ชั้นปี",
      options: [
        { value: "1", label: "ปี 1" },
        { value: "2", label: "ปี 2" },
        { value: "3", label: "ปี 3" },
        { value: "4", label: "ปี 4" },
        { value: "other", label: "อื่นๆ" },
      ],
    },
    role: { label: "ตำแหน่งที่ลงสมัคร", placeholder: "เช่น ประธานชุมนุม" },
    bio: { label: "แนะนำตัวสั้นๆ", placeholder: "1-2 ประโยค จะแสดงในการ์ดโหวต" },
    motivation: { label: "ทำไมถึงสมัครตำแหน่งนี้", placeholder: "อธิบายแรงจูงใจและวิสัยทัศน์ของคุณ" },
    image: {
      label: "รูปโปรไฟล์ (URL)",
      placeholder: "https://...",
      helper: "ลิงก์รูปที่อัปโหลดไว้แล้ว ถ้าไม่มีจะใช้อักษรย่อแทน",
    },
  },
};
