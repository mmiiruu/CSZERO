"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) { setMembers(data); }
        else { setMembers(fallbackMembers); }
      })
      .catch(() => setMembers(fallbackMembers))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-3">our team</p>
          <h1 className="text-5xl font-bold text-slate-800 mb-4">Meet the Team</h1>
          <p className="text-slate-500 max-w-lg mx-auto">The passionate students behind CSKU, working together to build an amazing CS community.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {members.map((member) => (
            <Link key={member._id} href={`/team/${member._id}`} className="group">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center hover:shadow-md hover:border-blue-200 transition-all duration-300 h-full">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                  {member.image ? <img src={member.image} alt={member.name} className="w-full h-full object-cover" /> : member.name.charAt(0)}
                </div>
                <h3 className="text-slate-800 font-semibold">{member.name}</h3>
                <p className="text-slate-400 text-sm mt-1">{member.role}</p>
                <div className="mt-4 flex items-center justify-center gap-1 text-xs text-slate-400 group-hover:text-blue-500 transition-colors">
                  <span>View profile</span>
                  <svg className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const fallbackMembers: TeamMember[] = [
  { _id: "1", name: "Alex Chen", role: "President", image: "", bio: "Leading CSKU with vision and passion." },
  { _id: "2", name: "Sari Wongsakul", role: "Vice President", image: "", bio: "Organizing events and building community." },
  { _id: "3", name: "Mike Tanaka", role: "Tech Lead", image: "", bio: "Building tools and teaching technology." },
  { _id: "4", name: "Ploy Kittirat", role: "Events Lead", image: "", bio: "Creating memorable experiences for all." },
  { _id: "5", name: "Nina Park", role: "Design Lead", image: "", bio: "Making everything look beautiful." },
  { _id: "6", name: "James Liu", role: "Secretary", image: "", bio: "Keeping things organized and running smoothly." },
  { _id: "7", name: "Fern Suthep", role: "PR Lead", image: "", bio: "Spreading the word and building connections." },
  { _id: "8", name: "Ben Torres", role: "Academic Lead", image: "", bio: "Helping students excel in their studies." },
];
