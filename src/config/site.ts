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
    instagram: "https://www.instagram.com/ku.comsciclub/",
  },
};

export const navLinks: Array<{
  href: string;
  label: string;
  adminOnly?: boolean;
  candidateRegistration?: boolean;
}> = [
  { href: "/team", label: "ชุมนุมนิสิต", adminOnly: true },
  { href: "/vote", label: "โหวต", adminOnly: true },
  { href: "/candidate/register", label: "สมัครประธาน", candidateRegistration: true },
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
    { label: "Instagram", href: site.social.instagram, external: true },
  ],
};

export const homePage = {
  hero: {
    badge: "ชุมนุมนิสิต CS · มหาวิทยาลัยเกษตรศาสตร์",
    title: "CSKU",
    tagline:
      "ชุมนุมนิสิตวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเกษตรศาสตร์\nสร้างชุมชน แบ่งปันความรู้ สร้างโอกาส",
    primaryButton: { label: "ดู CS101", href: "/events/cs101" },
    secondaryButton: { label: "ดู Hello World", href: "/events/hello-world" },
  },
  eventsSection: {
    eyebrow: "สิ่งที่เราสร้างขึ้น",
    title: "กิจกรรมหลัก",
    learnMoreLabel: "ดูรายละเอียด",
  },
  teamSection: {
    eyebrow: "คนเบื้องหลัง CSKU",
    title: "ทีมงาน CSKU",
    description: "นิสิต CS ที่ออกแบบกิจกรรม ดูแลชุมชน และขับเคลื่อน CSKU ให้เดินหน้าต่อ",
    viewAllLabel: "ดูสมาชิกทั้งหมด",
    preview: [
      { name: "Alex Chen", role: "ประธาน" },
      { name: "Sari W.", role: "รองประธาน" },
      { name: "Mike T.", role: "หัวหน้าฝ่ายเทคนิค" },
      { name: "Ploy K.", role: "หัวหน้าฝ่ายกิจกรรม" },
    ],
  },
  cta: {
    title: "ติดตาม CSKU",
    description:
      "กิจกรรมปีนี้จบแล้ว ติดตามข่าวสารและกิจกรรมในปีถัดไปได้ที่ Instagram ของเรา",
    instagramButton: { label: "ติดตามบน Instagram", href: "https://www.instagram.com/ku.comsciclub/" },
  },
};
