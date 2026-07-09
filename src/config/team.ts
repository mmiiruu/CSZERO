export const DOT_PATTERN = {
  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.22) 1.5px, transparent 1.5px)",
  backgroundSize: "10px 10px",
} as const;

const memberColorPalette = [
  "oklch(0.511 0.096 186)",  // teal-700
  "oklch(0.555 0.163 49)",   // amber-700
  "oklch(0.455 0.188 14)",   // rose-800
  "oklch(0.511 0.262 277)",  // indigo-600
  "oklch(0.432 0.095 166)",  // emerald-800
  "oklch(0.491 0.270 293)",  // violet-700
  "oklch(0.470 0.156 37)",   // orange-800
  "oklch(0.520 0.105 221)",  // cyan-700
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
  { key: "บริหาร",        label: "คณะกรรมการบริหาร", color: "oklch(0.546 0.245 263)", mono: "blue-500"    },
  { key: "ธุรการ",        label: "ฝ่ายธุรการ",        color: "oklch(0.541 0.216 293)", mono: "violet-500"  },
  { key: "วิชาการ",       label: "ฝ่ายวิชาการ",       color: "oklch(0.596 0.145 163)", mono: "emerald-500" },
  { key: "ประชาสัมพันธ์", label: "ฝ่ายประชาสัมพันธ์", color: "oklch(0.586 0.253 18)",  mono: "rose-500"    },
  { key: "กิจกรรม",       label: "ฝ่ายกิจกรรม",       color: "oklch(0.666 0.179 58)",  mono: "amber-500"   },
] as const;

export type DepartmentKey = typeof DEPARTMENTS[number]["key"];

// Departments a club applicant can apply into — excludes "บริหาร" since that
// committee is elected/appointed, not something a new applicant picks.
export const APPLICANT_DEPARTMENTS = DEPARTMENTS.filter((d) => d.key !== "บริหาร");

export interface FallbackMember {
  _id: string;
  name: string;
  nickname: string;
  role: string;
  image: string;
  bio: string;
  department: string;
  isHead: boolean;
}

export const teamConfig = {
  eyebrow: "บุคลากรผู้ทำงานให้กับภาควิชาวิทยาการคอมพิวเตอร์",
  title: "สมาชิกชุมนุมนิสิต",
  subtitle: "ภาควิทยาการคอมพิวเตอร์",
  description: "นิสิต ComSci ที่ออกแบบกิจกรรม ดูแลระบบ และขับเคลื่อนชุมนุมให้เดินหน้า",
  viewProfileLabel: "ดูโปรไฟล์",
  fallbackMembers: [
    { _id: "1",  name: "Alex Chen",      nickname: "Alex",  role: "ประธาน",                    bio: "นำพา CSKU ด้วยวิสัยทัศน์และความมุ่งมั่น",          department: "บริหาร",        isHead: false },
    { _id: "2",  name: "Sari Wongsakul",nickname: "Sari",  role: "รองประธาน",                 bio: "จัดกิจกรรมและสร้างชุมชนให้เข้มแข็ง",               department: "บริหาร",        isHead: false },
    { _id: "6",  name: "James Liu",      nickname: "James", role: "เลขานุการ",                 bio: "ดูแลความเป็นระเบียบเรียบร้อยของทุกอย่าง",          department: "บริหาร",        isHead: false },
    { _id: "4",  name: "Ploy Kittirat",  nickname: "Ploy",  role: "หัวหน้าฝ่ายกิจกรรม",       bio: "สร้างประสบการณ์ที่น่าจดจำให้กับทุกคน",             department: "กิจกรรม",       isHead: true  },
    { _id: "9",  name: "Mint Charoen",   nickname: "Mint",  role: "สมาชิกฝ่ายกิจกรรม",        bio: "",                                                  department: "กิจกรรม",       isHead: false },
    { _id: "7",  name: "Fern Suthep",    nickname: "Fern",  role: "หัวหน้าฝ่ายประชาสัมพันธ์", bio: "เผยแพร่ข่าวสารและสร้างการเชื่อมต่อ",               department: "ประชาสัมพันธ์", isHead: true  },
    { _id: "10", name: "Pim Natthida",   nickname: "Pim",   role: "สมาชิกฝ่ายประชาสัมพันธ์",  bio: "",                                                  department: "ประชาสัมพันธ์", isHead: false },
    { _id: "8",  name: "Ben Torres",     nickname: "Ben",   role: "หัวหน้าฝ่ายวิชาการ",       bio: "ช่วยให้นิสิตประสบความสำเร็จในการเรียน",            department: "วิชาการ",       isHead: true  },
    { _id: "11", name: "Krit Somchai",   nickname: "Krit",  role: "สมาชิกฝ่ายวิชาการ",        bio: "",                                                  department: "วิชาการ",       isHead: false },
  ].map(m => ({ ...m, image: "" })) satisfies FallbackMember[],
};
