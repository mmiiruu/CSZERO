import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";

const teamMembers = [
  {
    name: "Alex Chen",
    role: "President",
    bio: "CS senior passionate about AI and community building. Leading CSKU to create meaningful experiences for all CS students.",
    skills: ["Python", "Machine Learning", "Leadership", "Public Speaking"],
    image: "",
    socialLinks: { github: "https://github.com", linkedin: "https://linkedin.com" },
    order: 1,
  },
  {
    name: "Sari Wongsakul",
    role: "Vice President",
    bio: "Dedicated to bridging the gap between academics and real-world tech. Loves organizing hackathons and workshops.",
    skills: ["JavaScript", "React", "Event Planning", "UI/UX"],
    image: "",
    socialLinks: { github: "https://github.com", linkedin: "https://linkedin.com" },
    order: 2,
  },
  {
    name: "Mike Tanaka",
    role: "Tech Lead",
    bio: "Full-stack developer and open-source contributor. Believes in learning by building.",
    skills: ["TypeScript", "Next.js", "Node.js", "Docker"],
    image: "",
    socialLinks: { github: "https://github.com" },
    order: 3,
  },
  {
    name: "Ploy Kittirat",
    role: "Events Lead",
    bio: "Creative event planner who turns ideas into unforgettable experiences for the CS community.",
    skills: ["Project Management", "Design Thinking", "Communication"],
    image: "",
    socialLinks: { linkedin: "https://linkedin.com" },
    order: 4,
  },
  {
    name: "Nina Park",
    role: "Design Lead",
    bio: "UI/UX designer with a passion for creating beautiful, accessible interfaces.",
    skills: ["Figma", "CSS", "Design Systems", "Illustration"],
    image: "",
    socialLinks: { website: "https://example.com" },
    order: 5,
  },
  {
    name: "James Liu",
    role: "Secretary",
    bio: "Organized and detail-oriented. Keeps CSKU running smoothly behind the scenes.",
    skills: ["Documentation", "Communication", "Planning"],
    image: "",
    socialLinks: {},
    order: 6,
  },
  {
    name: "Fern Suthep",
    role: "PR Lead",
    bio: "Social media maven and community builder. Connecting CSKU with the wider tech community.",
    skills: ["Social Media", "Content Writing", "Networking"],
    image: "",
    socialLinks: { twitter: "https://twitter.com" },
    order: 7,
  },
  {
    name: "Ben Torres",
    role: "Academic Lead",
    bio: "Tutoring enthusiast who helps fellow students master algorithms and data structures.",
    skills: ["Algorithms", "C++", "Teaching", "Problem Solving"],
    image: "",
    socialLinks: { github: "https://github.com" },
    order: 8,
  },
];

async function seedTeam() {
  await dbConnect();

  await TeamMember.deleteMany({});
  console.log("Cleared existing team members");

  await TeamMember.insertMany(teamMembers);
  console.log(`Seeded ${teamMembers.length} team members`);

  process.exit(0);
}

seedTeam().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
