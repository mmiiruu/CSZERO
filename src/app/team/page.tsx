"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { teamConfig, getMemberColor, DOT_PATTERN } from "@/config/team";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonDivider() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="skeleton w-4 h-2.5 rounded" />
      <div className="skeleton w-32 h-2.5 rounded" />
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

function TeamPageSkeleton() {
  return (
    <div className="min-h-screen py-20 px-4 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <div className="skeleton w-24 h-3 rounded mb-4" />
          <div className="skeleton w-64 h-10 sm:h-14 rounded-lg mb-5" />
          <div className="skeleton w-72 h-4 rounded mb-2" />
          <div className="skeleton w-48 h-4 rounded" />
        </div>

        {/* Leadership cards */}
        <div className="mb-16">
          <SkeletonDivider />
          <div className="grid sm:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 flex gap-6 items-start"
              >
                <div className="skeleton w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton w-20 h-2.5 rounded" />
                  <div className="skeleton w-36 h-5 rounded-md" />
                  <div className="skeleton w-full h-3 rounded" />
                  <div className="skeleton w-4/5 h-3 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member grid */}
        <div>
          <SkeletonDivider />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center"
              >
                <div className="skeleton w-14 h-14 rounded-full mx-auto mb-3" />
                <div className="skeleton w-20 h-4 rounded mx-auto mb-2" />
                <div className="skeleton w-16 h-3 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Section divider ─────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-10">
      <span className="font-mono text-xs text-slate-400 dark:text-slate-600 select-none">//</span>
      <span className="text-xs font-mono text-blue-500 dark:text-blue-400 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────

function LeaderCard({ member }: { member: TeamMember }) {
  const accentColor = getMemberColor(member._id);
  return (
    <Link
      href={`/team/${member._id}`}
      className="group"
      aria-label={`ดูโปรไฟล์ของ ${member.name}`}
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-8 flex gap-6 items-start hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full">
        <div
          className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white group-hover:scale-105 transition-transform duration-300 overflow-hidden"
          style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
        >
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              width={96}
              height={96}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          )}
        </div>

        <div className="flex flex-col justify-between min-h-[80px] flex-1">
          <div>
            <p className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              {member.role}
            </p>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
              {member.name}
            </h3>
            {member.bio && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                {member.bio}
              </p>
            )}
          </div>
          <div
            aria-hidden="true"
            className="mt-4 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200"
          >
            <span>{teamConfig.viewProfileLabel}</span>
            <svg
              className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  const accentColor = getMemberColor(member._id);
  return (
    <Link
      href={`/team/${member._id}`}
      className="group"
      aria-label={`ดูโปรไฟล์ของ ${member.name}`}
    >
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 h-full">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-black text-white group-hover:scale-110 transition-transform duration-300 overflow-hidden"
          style={{ backgroundColor: accentColor, ...DOT_PATTERN }}
        >
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span aria-hidden="true">{member.name.charAt(0)}</span>
          )}
        </div>
        <h3 className="text-slate-800 dark:text-white font-semibold text-sm leading-snug">
          {member.name}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{member.role}</p>
        <div
          aria-hidden="true"
          className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200"
        >
          <span>{teamConfig.viewProfileLabel}</span>
          <svg
            className="w-3 h-3 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
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
        if (Array.isArray(data) && data.length > 0) { setMembers(data); }
        else { setMembers(teamConfig.fallbackMembers); }
      })
      .catch(() => setMembers(teamConfig.fallbackMembers))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <TeamPageSkeleton />;

  const leaders = members.filter((m) => teamConfig.leadershipRoles.includes(m.role));
  const others  = members.filter((m) => !teamConfig.leadershipRoles.includes(m.role));

  return (
    // animate-fade-in: content fades in after replacing skeleton — feels intentional, not a snap
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

        {/* Leadership */}
        {leaders.length > 0 && (
          <section aria-labelledby="leadership-heading" className="mb-16">
            <h2 id="leadership-heading" className="sr-only">
              {teamConfig.sections.leadership}
            </h2>
            <SectionDivider label={teamConfig.sections.leadership} />
            <div className="grid sm:grid-cols-2 gap-4">
              {leaders.map((member) => (
                <LeaderCard key={member._id} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* All other members */}
        {others.length > 0 && (
          <section aria-labelledby="members-heading">
            <h2 id="members-heading" className="sr-only">
              {teamConfig.sections.members}
            </h2>
            <SectionDivider label={teamConfig.sections.members} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {others.map((member) => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          </section>
        )}

        {/* Fallback */}
        {leaders.length === 0 && others.length === 0 && members.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {members.map((member) => (
              <MemberCard key={member._id} member={member} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
