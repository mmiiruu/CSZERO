export const site = {
  name: "CSKU",
  shortName: "CS",
  fullName: "ชุมนุมนิสิตวิทยาการคอมพิวเตอร์",
  university: "มหาวิทยาลัยเกษตรศาสตร์",
  tagline: "สร้างชุมชน แบ่งปันความรู้ สร้างโอกาส",
  description:
    "ชุมนุมนิสิตวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์ สร้างชุมชน แบ่งปันความรู้ และสร้างโอกาสให้กับนิสิต CS",
  email: "thitikorn.ba@ku.th",
  social: {
    github: "https://github.com/mmiiruu",
    instagram: "https://www.instagram.com/comsci40.ku/",
  },
};

export const navLinks: Array<{
  href: string;
  label: string;
  adminOnly?: boolean;
  candidateRegistration?: boolean;
}> = [
  { href: "/events/cs101", label: "CS101" },
  { href: "/events/hello-world", label: "Hello World" },
  { href: "/team", label: "คณะทำงาน" },
  { href: "/vote", label: "โหวต", adminOnly: true },
  { href: "/candidate/register", label: "สมัครผู้สมัคร", candidateRegistration: true },
];

export const navbar = {
  adminLink: {
    label: "Dashboard",
    mobileLabel: "Dashboard",
    href: "/admin",
  },
  profileLink: {
    label: "โปรไฟล์",
    href: "/profile",
  },
  signOut: "ออกจากระบบ",
  signIn: { label: "เข้าสู่ระบบ", href: "/auth/signin" },
};

export const footer = {
  quickLinksHeading: "ลิงก์",
  connectHeading: "ติดต่อเรา",
  socialLinks: [
    { label: "GitHub", href: site.social.github, external: true },
    { label: "Instagram", href: site.social.instagram, external: true },
    { label: site.email, href: `mailto:${site.email}`, external: false },
  ],
};

export const homePage = {
  hero: {
    badge: "เปิดรับสมัครแล้วตอนนี้",
    title: "CSKU",
    tagline:
      "ชุมนุมนิสิตวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์\nสร้างชุมชน แบ่งปันความรู้ สร้างโอกาส",
    primaryButton: { label: "CS101", href: "/events/cs101" },
    secondaryButton: { label: "Hello World", href: "/events/hello-world" },
  },
  eventsSection: {
    eyebrow: "กิจกรรมที่กำลังจะมาถึง",
    title: "กิจกรรม",
    learnMoreLabel: "ดูเพิ่มเติม",
  },
  teamSection: {
    eyebrow: "คณะทำงานของเรา",
    title: "คณะทำงาน",
    description: "นิสิตที่มีความมุ่งมั่นในการสร้างชุมชน CS ที่ KU",
    viewAllLabel: "ดูสมาชิกทั้งหมด",
    preview: [
      { name: "Alex Chen", role: "ประธาน" },
      { name: "Sari W.", role: "รองประธาน" },
      { name: "Mike T.", role: "หัวหน้าฝ่ายเทคนิค" },
      { name: "Ploy K.", role: "หัวหน้าฝ่ายกิจกรรม" },
    ],
  },
  cta: {
    title: "พร้อมเข้าร่วมแล้วหรือยัง?",
    description:
      "ไม่ว่าจะเป็นมือใหม่หรือมีประสบการณ์ ชุมชนของเรามีที่สำหรับทุกคน",
    primaryButton: { label: "สมัคร CS101", href: "/events/cs101/register" },
    secondaryButton: { label: "เข้าร่วม Hello World", href: "/events/hello-world/register" },
  },
};
