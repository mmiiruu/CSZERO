"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { teamConfig, DEPARTMENTS, getMemberColor, DOT_PATTERN, type FallbackMember } from "@/config/team";

interface TeamMember {
  _id: string;
  name: string;
  nickname: string;
  role: string;
  image: string;
  bio: string;
  department: string;
  isHead: boolean;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonSection() {
  return (
    <div className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="skeleton w-3 h-3 rounded-full" />
        <div className="skeleton w-36 h-3 rounded" />
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
      </div>
      <div className="skeleton w-full h-28 rounded-2xl mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <div className="skeleton w-24 h-3 rounded mb-4" />
          <div className="skeleton w-64 h-12 rounded-lg mb-4" />
          <div className="skeleton w-72 h-4 rounded" />
        </div>
        <SkeletonSection />
        <SkeletonSection />
      </div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionDivider({ label, color }: { label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} aria-hidden="true" />
      <span className="text-xs font-mono uppercase tracking-widest whitespace-nowrap font-semibold" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

// ─── Leadership card (บริหาร) ────────────────────────────────────────────────

function LeaderCard({ member }: { member: TeamMember | FallbackMember }) {
  const accentColor = getMemberColor(member._id);
  return (
    <Link href={`/team/${member._id}`} className="group" aria-label={`ดูโปรไฟล์ของ ${member.name}`}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 flex gap-5 items-start hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full">
        <div
          className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl flex items-center justify-center text-xl font-black text-white group-hover:scale-105 transition-transform duration-300 overflow-hidden"
          style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
        >
          {member.image ? (
            <Image src={member.image} alt={member.name} width={80} height={80} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col justify-between min-h-[64px] flex-1 min-w-0">
          <div>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 truncate">{member.role}</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight truncate">
              {member.nickname || member.name}
              {member.nickname && <span className="ml-1.5 text-sm font-normal text-slate-400 dark:text-slate-500 truncate">{member.name}</span>}
            </h3>
            {member.bio && (
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{member.bio}</p>
            )}
          </div>
          <div aria-hidden="true" className="mt-3 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
            <span>{teamConfig.viewProfileLabel}</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Department head card ─────────────────────────────────────────────────────

function DeptHeadCard({ member, deptColor }: { member: TeamMember | FallbackMember; deptColor: string }) {
  const accentColor = getMemberColor(member._id);
  return (
    <Link href={`/team/${member._id}`} className="group" aria-label={`ดูโปรไฟล์ของ ${member.name}`}>
      <div
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 flex gap-5 items-center hover:shadow-md transition-all duration-300"
        style={{ borderLeftWidth: "4px", borderLeftColor: deptColor }}
      >
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl flex items-center justify-center text-lg font-black text-white group-hover:scale-105 transition-transform duration-300 overflow-hidden"
          style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
        >
          {member.image ? (
            <Image src={member.image} alt={member.name} width={64} height={64} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: deptColor }}>
              หัวหน้าฝ่าย
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">{member.role}</p>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">
            {member.nickname || member.name}
            {member.nickname && <span className="ml-1.5 text-sm font-normal text-slate-400 dark:text-slate-500">{member.name}</span>}
          </h3>
          {member.bio && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-1">{member.bio}</p>
          )}
        </div>
        <div aria-hidden="true" className="shrink-0 flex items-center gap-1 text-xs text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          <span className="hidden sm:inline">{teamConfig.viewProfileLabel}</span>
          <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Member card ──────────────────────────────────────────────────────────────

function MemberCard({ member }: { member: TeamMember | FallbackMember }) {
  const accentColor = getMemberColor(member._id);
  return (
    <Link href={`/team/${member._id}`} className="group" aria-label={`ดูโปรไฟล์ของ ${member.name}`}>
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full">
        <div
          className="w-12 h-12 rounded-full mx-auto mb-2.5 flex items-center justify-center text-base font-black text-white group-hover:scale-110 transition-transform duration-300 overflow-hidden"
          style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
        >
          {member.image ? (
            <Image src={member.image} alt={member.name} width={48} height={48} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          )}
        </div>
        <h3 className="text-slate-800 dark:text-white font-semibold text-sm leading-snug">
          {member.nickname || member.name}
        </h3>
        {member.nickname && <p className="text-slate-400 dark:text-slate-500 text-xs leading-snug">{member.name}</p>}
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 line-clamp-1">{member.role}</p>
        <div aria-hidden="true" className="mt-2.5 flex items-center justify-center gap-1 text-xs text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          <span>{teamConfig.viewProfileLabel}</span>
          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setMembers(data);
        else setMembers(teamConfig.fallbackMembers as TeamMember[]);
      })
      .catch(() => setMembers(teamConfig.fallbackMembers as TeamMember[]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TeamPageSkeleton />;

  const grouped = DEPARTMENTS.map((dept) => {
    const deptMembers = members.filter((m) => m.department === dept.key);
    if (dept.key === "บริหาร") {
      return { ...dept, head: null, members: deptMembers };
    }
    return {
      ...dept,
      head: deptMembers.find((m) => m.isHead) ?? null,
      members: deptMembers.filter((m) => !m.isHead),
    };
  }).filter((d) => d.members.length > 0 || d.head);

  // Members with no department assigned
  const unassigned = members.filter((m) => !m.department || !DEPARTMENTS.find((d) => d.key === m.department));

  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900 animate-fade-in">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="mb-16">
          <p className="text-sm font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest mb-3">
            {teamConfig.eyebrow}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-slate-800 dark:text-white mb-4 tracking-tight">
            {teamConfig.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
            {teamConfig.description}
          </p>
        </div>

        {/* Department sections */}
        {grouped.map((dept) => (
          <section key={dept.key} aria-labelledby={`dept-${dept.key}`} className="mb-14">
            <h2 id={`dept-${dept.key}`} className="sr-only">{dept.label}</h2>
            <SectionDivider label={dept.label} color={dept.color} />

            {/* บริหาร: grid of leader cards */}
            {dept.key === "บริหาร" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dept.members.map((m) => (
                  <LeaderCard key={m._id} member={m} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Head card */}
                {dept.head && (
                  <DeptHeadCard member={dept.head} deptColor={dept.color} />
                )}
                {/* Members grid */}
                {dept.members.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dept.members.map((m) => (
                      <MemberCard key={m._id} member={m} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>
        ))}

        {/* Unassigned members */}
        {unassigned.length > 0 && (
          <section aria-label="สมาชิกอื่นๆ" className="mb-14">
            <SectionDivider label="สมาชิก" color="#64748b" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {unassigned.map((m) => (
                <MemberCard key={m._id} member={m} />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
