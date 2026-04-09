"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface TeamMember {
  _id: string; name: string; role: string; bio: string; skills: string[];
  image: string; socialLinks: { github?: string; linkedin?: string; twitter?: string; website?: string; };
}

const fallbackMembers: Record<string, TeamMember> = {
  "1": { _id: "1", name: "Alex Chen", role: "President", bio: "CS senior passionate about AI and community building.", skills: ["Python", "Machine Learning", "Leadership"], image: "", socialLinks: { github: "#", linkedin: "#" } },
  "2": { _id: "2", name: "Sari Wongsakul", role: "Vice President", bio: "Bridging academics and real-world tech.", skills: ["JavaScript", "React", "Event Planning"], image: "", socialLinks: { github: "#" } },
  "3": { _id: "3", name: "Mike Tanaka", role: "Tech Lead", bio: "Full-stack developer and open-source contributor.", skills: ["TypeScript", "Next.js", "Node.js"], image: "", socialLinks: { github: "#" } },
  "4": { _id: "4", name: "Ploy Kittirat", role: "Events Lead", bio: "Creative event planner.", skills: ["Project Management", "Communication"], image: "", socialLinks: {} },
  "5": { _id: "5", name: "Nina Park", role: "Design Lead", bio: "UI/UX designer.", skills: ["Figma", "CSS", "Design Systems"], image: "", socialLinks: {} },
  "6": { _id: "6", name: "James Liu", role: "Secretary", bio: "Organized and detail-oriented.", skills: ["Documentation", "Planning"], image: "", socialLinks: {} },
  "7": { _id: "7", name: "Fern Suthep", role: "PR Lead", bio: "Social media maven.", skills: ["Social Media", "Content Writing"], image: "", socialLinks: {} },
  "8": { _id: "8", name: "Ben Torres", role: "Academic Lead", bio: "Tutoring enthusiast.", skills: ["Algorithms", "C++", "Teaching"], image: "", socialLinks: { github: "#" } },
};

export default function TeamMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/team/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setMember(d))
      .catch(() => { const fb = fallbackMembers[id]; if (fb) setMember(fb); else setError(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (error || !member) return <div className="min-h-screen flex items-center justify-center px-4"><div className="text-center"><h1 className="text-2xl font-bold text-slate-800 mb-4">Member not found</h1><Link href="/team" className="text-blue-500 hover:text-blue-600 text-sm">← Back to team</Link></div></div>;

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50">
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Link href="/team" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to team
        </Link>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white mb-6 overflow-hidden">
              {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
            </div>
            <h1 className="text-3xl font-bold text-slate-800">{member.name}</h1>
            <p className="text-slate-500 mt-1">{member.role}</p>
          </div>
          <div className="mb-8"><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">About</h2><p className="text-slate-600 leading-relaxed">{member.bio}</p></div>
          {member.skills?.length > 0 && (
            <div className="mb-8"><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">{member.skills.map((s) => <span key={s} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-600">{s}</span>)}</div>
            </div>
          )}
          {member.socialLinks && Object.values(member.socialLinks).some(Boolean) && (
            <div><h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Connect</h2>
              <div className="flex flex-wrap gap-3">{Object.entries(member.socialLinks).map(([k, url]) => url && <a key={k} href={url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all">{k.charAt(0).toUpperCase() + k.slice(1)}</a>)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
