export interface FallbackMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export const teamConfig = {
  eyebrow: "ทีมงานของเรา",
  title: "พบกับทีมงาน",
  description:
    "นิสิตที่มีความมุ่งมั่นเบื้องหลัง CSKU ร่วมกันสร้างชุมชน CS ที่ยอดเยี่ยม",
  viewProfileLabel: "ดูโปรไฟล์",
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
