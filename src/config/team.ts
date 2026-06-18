export const DOT_PATTERN = {
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
  backgroundSize: "10px 10px",
} as const;

const memberColorPalette = [
  "#0f766e",
  "#b45309",
  "#9f1239",
  "#4338ca",
  "#065f46",
  "#6d28d9",
  "#9a3412",
  "#0e7490",
];

export function getMemberColor(id: string): string {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) + hash) + id.charCodeAt(i);
    hash = hash & hash;
  }
  return memberColorPalette[Math.abs(hash) % memberColorPalette.length];
}

export const DEPARTMENTS = [
  { key: "บริหาร",        label: "คณะกรรมการบริหาร", color: "#2563eb", mono: "blue-500"  },
  { key: "กิจกรรม",       label: "ฝ่ายกิจกรรม",       color: "#d97706", mono: "amber-500" },
  { key: "ประชาสัมพันธ์", label: "ฝ่ายประชาสัมพันธ์", color: "#e11d48", mono: "rose-500"  },
  { key: "วิชาการ",       label: "ฝ่ายวิชาการ",       color: "#059669", mono: "emerald-500" },
] as const;

export type DepartmentKey = typeof DEPARTMENTS[number]["key"];

export interface FallbackMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
  department: string;
  isHead: boolean;
}

export const teamConfig = {
  eyebrow: "ชุมนุมนิสิตของเรา",
  title: "พบกับชุมนุมนิสิต",
  description: "นิสิตที่มีความมุ่งมั่นเบื้องหลัง CSKU ร่วมกันสร้างชุมชน CS ที่ยอดเยี่ยม",
  viewProfileLabel: "ดูโปรไฟล์",
  fallbackMembers: [
    { _id: "1", name: "Alex Chen",      role: "ประธาน",                    bio: "นำพา CSKU ด้วยวิสัยทัศน์และความมุ่งมั่น",          department: "บริหาร",        isHead: false },
    { _id: "2", name: "Sari Wongsakul", role: "รองประธาน",                 bio: "จัดกิจกรรมและสร้างชุมชนให้เข้มแข็ง",               department: "บริหาร",        isHead: false },
    { _id: "6", name: "James Liu",      role: "เลขานุการ",                 bio: "ดูแลความเป็นระเบียบเรียบร้อยของทุกอย่าง",          department: "บริหาร",        isHead: false },
    { _id: "4", name: "Ploy Kittirat",  role: "หัวหน้าฝ่ายกิจกรรม",       bio: "สร้างประสบการณ์ที่น่าจดจำให้กับทุกคน",             department: "กิจกรรม",       isHead: true  },
    { _id: "9", name: "Mint Charoen",   role: "สมาชิกฝ่ายกิจกรรม",        bio: "",                                                  department: "กิจกรรม",       isHead: false },
    { _id: "7", name: "Fern Suthep",    role: "หัวหน้าฝ่ายประชาสัมพันธ์", bio: "เผยแพร่ข่าวสารและสร้างการเชื่อมต่อ",               department: "ประชาสัมพันธ์", isHead: true  },
    { _id: "10", name: "Pim Natthida",  role: "สมาชิกฝ่ายประชาสัมพันธ์",  bio: "",                                                  department: "ประชาสัมพันธ์", isHead: false },
    { _id: "8", name: "Ben Torres",     role: "หัวหน้าฝ่ายวิชาการ",       bio: "ช่วยให้นิสิตประสบความสำเร็จในการเรียน",            department: "วิชาการ",       isHead: true  },
    { _id: "11", name: "Krit Somchai",  role: "สมาชิกฝ่ายวิชาการ",        bio: "",                                                  department: "วิชาการ",       isHead: false },
  ].map(m => ({ ...m, image: "" })) satisfies FallbackMember[],
};
