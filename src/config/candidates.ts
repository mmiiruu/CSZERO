export interface CandidateData {
  name: string;
  role: string;
  image: string;
  bio: string;
  voteCount: number;
}

export const CANDIDATES: CandidateData[] = [
  {
    name: "Alice Johnson",
    role: "President Candidate",
    image: "",
    bio: "Passionate about making CS accessible to everyone. 3 years in CSKU with experience leading workshops and hackathons.",
    voteCount: 0,
  },
  {
    name: "David Kim",
    role: "President Candidate",
    image: "",
    bio: "Focused on industry partnerships and internship opportunities. Strong connections with tech companies.",
    voteCount: 0,
  },
  {
    name: "Sara Martinez",
    role: "President Candidate",
    image: "",
    bio: "Believes in community-first leadership and inclusive events. Wants to expand CSKU's reach to all faculties.",
    voteCount: 0,
  },
];
