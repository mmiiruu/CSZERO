"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getMemberColor, DOT_PATTERN } from "@/config/team";

interface TeamMember {
  _id: string; name: string; role: string; bio: string; skills: string[];
  image: string; socialLinks: { github?: string; linkedin?: string; twitter?: string; website?: string; };
}

const fallbackMembers: Record<string, TeamMember> = {
  "1": { _id: "1", name: "Alex Chen",      role: "ประธาน",                    bio: "นำพา CSKU ด้วยวิสัยทัศน์และความมุ่งมั่น",                   skills: ["Python", "Machine Learning", "Leadership"],  image: "", socialLinks: { github: "#", linkedin: "#" } },
  "2": { _id: "2", name: "Sari Wongsakul", role: "รองประธาน",                 bio: "จัดกิจกรรมและสร้างชุมชนให้เข้มแข็ง",                        skills: ["JavaScript", "React", "Event Planning"],     image: "", socialLinks: { github: "#" } },
  "3": { _id: "3", name: "Mike Tanaka",    role: "หัวหน้าฝ่ายเทคนิค",        bio: "พัฒนาเครื่องมือและถ่ายทอดความรู้ด้านเทคโนโลยี",             skills: ["TypeScript", "Next.js", "Node.js"],          image: "", socialLinks: { github: "#" } },
  "4": { _id: "4", name: "Ploy Kittirat",  role: "หัวหน้าฝ่ายกิจกรรม",       bio: "สร้างประสบการณ์ที่น่าจดจำให้กับทุกคน",                      skills: ["Project Management", "Communication"],       image: "", socialLinks: {} },
  "5": { _id: "5", name: "Nina Park",      role: "หัวหน้าฝ่ายดีไซน์",        bio: "ทำให้ทุกอย่างสวยงามและน่าใช้งาน",                           skills: ["Figma", "CSS", "Design Systems"],            image: "", socialLinks: {} },
  "6": { _id: "6", name: "James Liu",      role: "เลขานุการ",                 bio: "ดูแลความเป็นระเบียบเรียบร้อยของทุกอย่าง",                   skills: ["Documentation", "Planning"],                 image: "", socialLinks: {} },
  "7": { _id: "7", name: "Fern Suthep",    role: "หัวหน้าฝ่ายประชาสัมพันธ์", bio: "เผยแพร่ข่าวสารและสร้างการเชื่อมต่อ",                        skills: ["Social Media", "Content Writing"],           image: "", socialLinks: {} },
  "8": { _id: "8", name: "Ben Torres",     role: "หัวหน้าฝ่ายวิชาการ",       bio: "ช่วยให้นิสิตประสบความสำเร็จในการเรียน",                     skills: ["Algorithms", "C++", "Teaching"],             image: "", socialLinks: { github: "#" } },
};

const SOCIAL_LABELS: Record<string, string> = {
  github:   "GitHub",
  linkedin: "LinkedIn",
  twitter:  "Twitter / X",
  website:  "Website",
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
// Mirrors the exact two-zone layout (dark hero + light content) so there's
// zero layout shift when the real member data arrives.

function MemberPageSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Dark hero zone — skeleton-dark elements on bg-slate-900 */}
      <div className="bg-slate-900 pt-20 pb-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          {/* Back link */}
          <div className="skeleton-dark w-24 h-4 rounded mb-10" />

          <div className="flex items-end gap-6 sm:gap-8">
            {/* Square avatar */}
            <div className="skeleton-dark w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl" />
            <div className="pb-1 space-y-3">
              {/* Role label */}
              <div className="skeleton-dark w-24 h-3 rounded" />
              {/* Name */}
              <div className="skeleton-dark w-48 sm:w-64 h-9 sm:h-11 rounded-md" />
            </div>
          </div>

          {/* Bio lines */}
          <div className="mt-8 space-y-2.5">
            <div className="skeleton-dark w-full max-w-lg h-4 rounded" />
            <div className="skeleton-dark w-3/4 max-w-xs h-4 rounded" />
          </div>

        </div>
      </div>

      {/* Content zone — .skeleton responds to light/dark theme */}
      <div className="px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Skills section */}
          <div>
            <div className="skeleton w-16 h-2.5 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              {[76, 108, 64, 88, 72, 96].map((w) => (
                <div key={w} className="skeleton h-8 rounded" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>

          {/* Connect section */}
          <div>
            <div className="skeleton w-20 h-2.5 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              {[88, 100].map((w) => (
                <div key={w} className="skeleton h-9 rounded-lg" style={{ width: `${w}px` }} />
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamMemberPage() {
  const params = useParams();
  const id = params.id as string;
  const [member, setMember]   = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(`/api/team/${id}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => setMember(d))
      .catch(() => { const fb = fallbackMembers[id]; if (fb) setMember(fb); else setError(true); })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <MemberPageSkeleton />;

  if (error || !member) return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Member not found</h1>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to team
        </Link>
      </div>
    </div>
  );

  const accentColor    = getMemberColor(member._id);
  const hasSkills      = member.skills?.length > 0;
  const hasSocialLinks = member.socialLinks && Object.values(member.socialLinks).some(Boolean);

  return (
    // animate-fade-in: content fades in after replacing skeleton
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in">

      {/* ── Dark editorial hero ──────────────────────────────────────────── */}
      <div className="bg-slate-900 pt-20 pb-14 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">

          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors duration-200 mb-10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to team
          </Link>

          <div className="flex items-end gap-6 sm:gap-8">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-black text-white overflow-hidden"
              style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
            >
              {member.image ? (
                <Image
                  src={member.image}
                  alt={member.name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <span aria-hidden="true">{member.name.charAt(0)}</span>
              )}
            </div>

            <div className="pb-1 min-w-0">
              <p className="text-xs font-mono text-blue-400 uppercase tracking-widest mb-2">
                {member.role}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none break-words">
                {member.name}
              </h1>
            </div>
          </div>

          {member.bio && (
            <p className="mt-8 text-slate-400 leading-relaxed max-w-lg text-sm sm:text-base">
              {member.bio}
            </p>
          )}
        </div>
      </div>

      {/* ── Content sections ─────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-10">

          {hasSkills && (
            <section>
              <p className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-4">
                <span className="text-slate-400 dark:text-slate-600">//</span>
                <span className="text-blue-500 dark:text-blue-400">skills</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {member.skills.map((s) => (
                  <code
                    key={s}
                    className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-sm font-mono text-slate-700 dark:text-slate-300"
                  >
                    {s}
                  </code>
                ))}
              </div>
            </section>
          )}

          {hasSocialLinks && (
            <section>
              <p className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest mb-4">
                <span className="text-slate-400 dark:text-slate-600">//</span>
                <span className="text-blue-500 dark:text-blue-400">connect</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(member.socialLinks).map(([k, url]) =>
                  url ? (
                    <a
                      key={k}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-700 transition-all"
                    >
                      <span className="font-mono text-slate-400 dark:text-slate-600 text-xs" aria-hidden="true">→</span>
                      {SOCIAL_LABELS[k] ?? k.charAt(0).toUpperCase() + k.slice(1)}
                    </a>
                  ) : null
                )}
              </div>
            </section>
          )}

        </div>
      </div>

    </div>
  );
}
