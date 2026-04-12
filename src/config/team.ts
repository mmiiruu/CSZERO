// Subtle dot texture applied to all avatar backgrounds — gives them a technical
// surface quality without relying on photos.
export const DOT_PATTERN = {
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
  backgroundSize: "10px 10px",
} as const;

// Eight distinct, confident colors for member identity — not blue (already the site primary),
// not neon, not gradient. Each is dark enough to hold white text at WCAG AA contrast.
const memberColorPalette = [
  "#0f766e", // deep teal
  "#b45309", // warm amber
  "#9f1239", // deep rose
  "#4338ca", // cool indigo
  "#065f46", // forest emerald
  "#6d28d9", // violet
  "#9a3412", // burnt rust
  "#0e7490", // ocean cyan
];

// Deterministic color assignment: same ID always maps to the same color.
export function getMemberColor(id: string): string {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash) + id.charCodeAt(i);
    hash = hash & hash; // keep 32-bit
  }
  return memberColorPalette[Math.abs(hash) % memberColorPalette.length];
}

export interface FallbackMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export const teamConfig = {
  eyebrow: "คณะทำงานของเรา",
  title: "พบกับคณะทำงาน",
  description:
    "นิสิตที่มีความมุ่งมั่นเบื้องหลัง CSKU ร่วมกันสร้างชุมชน CS ที่ยอดเยี่ยม",
  viewProfileLabel: "ดูโปรไฟล์",
  // Roles that appear in the featured leadership row
  leadershipRoles: ["ประธาน", "รองประธาน"],
  sections: {
    leadership: "คณะกรรมการบริหาร",
    members: "คณะทำงาน",
  },
  fallbackMembers: [
    { _id: "1", name: "Alex Chen", role: "ประธาน", image: "", bio: "นำพา CSKU ด้วยวิสัยทัศน์และความมุ่งมั่น" },
    { _id: "2", name: "Sari Wongsakul", role: "รองประธาน", image: "", bio: "จัดกิจกรรมและสร้างชุมชนให้เข้มแข็ง" },
    { _id: "3", name: "Mike Tanaka", role: "หัวหน้าฝ่ายเทคนิค", image: "", bio: "พัฒนาเครื่องมือและถ่ายทอดความรู้ด้านเทคโนโลยี" },
    { _id: "4", name: "Ploy Kittirat", role: "หัวหน้าฝ่ายกิจกรรม", image: "", bio: "สร้างประสบการณ์ที่น่าจดจำให้กับทุกคน" },
    { _id: "5", name: "Nina Park", role: "หัวหน้าฝ่ายดีไซน์", image: "", bio: "ทำให้ทุกอย่างสวยงามและน่าใช้งาน" },
    { _id: "6", name: "James Liu", role: "เลขานุการ", image: "", bio: "ดูแลความเป็นระเบียบเรียบร้อยของทุกอย่าง" },
    { _id: "7", name: "Fern Suthep", role: "หัวหน้าฝ่ายประชาสัมพันธ์", image: "", bio: "เผยแพร่ข่าวสารและสร้างการเชื่อมต่อ" },
    { _id: "8", name: "Ben Torres", role: "หัวหน้าฝ่ายวิชาการ", image: "", bio: "ช่วยให้นิสิตประสบความสำเร็จในการเรียน" },
  ] satisfies FallbackMember[],
};
