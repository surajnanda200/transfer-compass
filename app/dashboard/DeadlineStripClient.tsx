"use client";

import Link from "next/link";
import { useMemo } from "react";
import deadlinesData from "@/app/data/deadlines.json";
import DeadlineStripClient from "./DeadlineStripClient";

type StripItem = {
  id: string;
  collegeSlug: string;
  collegeName: string;
  label: string;
  date: string; // ISO
};
type Deadline = {
  college?: string;
  collegeId?: string;
  slug?: string;

  date?: string;
  deadline?: string;
  dueDate?: string;

  label?: string;
  name?: string;
  type?: string;
};

function normalizeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function pickDate(d: Deadline): string | null {
  return d.date ?? d.deadline ?? d.dueDate ?? null;
}

function pickCollegeKey(d: Deadline): string | null {
  return d.collegeId ?? d.slug ?? d.college ?? null;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
const deadlines = deadlinesData as Deadline[];

const collegesWithSlug = colleges.map((c) => ({
  ...c,
  slug: c.slug ?? normalizeSlug(c.name),
}));

const collegeNameBySlug = Object.fromEntries(
  collegesWithSlug.map((c) => [c.slug as string, c.name])
);

const stripItems = deadlines
  .map((d, i) => {
    const collegeKeyRaw = pickCollegeKey(d);
    const collegeSlug = collegeKeyRaw ? normalizeSlug(collegeKeyRaw) : null;

    const date = pickDate(d);
    const label = d.label ?? d.name ?? d.type ?? "Deadline";

    if (!collegeSlug || !date) return null;

    return {
      id: `${collegeSlug}:${date}:${i}`,
      collegeSlug,
      collegeName: collegeNameBySlug[collegeSlug] ?? collegeSlug,
      label,
      date,
    };
  })
  .filter(Boolean) as {
  id: string;
  collegeSlug: string;
  collegeName: string;
  label: string;
  date: string;
}[];

function urgencyBadge(days: number) {
  if (days <= 0) return { text: "Due today/overdue", cls: "text-red-300 bg-red-500/10 border-red-500/30" };
  if (days <= 7) return { text: `Due in ${days}d`, cls: "text-red-300 bg-red-500/10 border-red-500/30" };
  if (days <= 30) return { text: `Due in ${days}d`, cls: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30" };
  return { text: `Due in ${days}d`, cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30" };
}

export default function DeadlineStripClient({ items }: { items: StripItem[] }) {
  const { next, next30Count } = useMemo(() => {
    const now = new Date();

    const upcoming = items
      .filter((it) => {
        const d = new Date(it.date);
        return !isNaN(d.getTime()) && d >= now;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const next = upcoming[0] ?? null;

    const next30Count = upcoming.filter((it) => daysUntil(it.date) <= 30).length;

    return { next, next30Count };
  }, [items]);

  if (!items.length) return null;

  return (
    <Link
      href="/deadlines"
      className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-zinc-400">Up next</p>

          {next ? (
            <p className="mt-1 text-sm font-semibold truncate">
              {next.collegeName}: {next.label}
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold">
              No upcoming deadlines found
            </p>
          )}

          <p className="mt-1 text-[11px] text-zinc-500">
            {next30Count} deadline{next30Count === 1 ? "" : "s"} in the next 30 days • Click to view all →
          </p>
        </div>

        {next ? (
          <div className="flex items-center gap-2">
            <div className="text-[11px] text-zinc-400 hidden sm:block">
              {new Date(next.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </div>

            {(() => {
              const d = daysUntil(next.date);
              const b = urgencyBadge(d);
              return (
                <div className={`text-[11px] border rounded-full px-2 py-1 ${b.cls}`}>
                  {b.text}
                </div>
              );
            })()}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
