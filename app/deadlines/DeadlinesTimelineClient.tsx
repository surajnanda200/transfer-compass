"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type TimelineItem = {
  id: string;
  collegeSlug: string;
  collegeName: string;
  label: string;
  date: string; // ISO string
};

function daysUntil(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function deadlineStyle(days: number) {
  if (days <= 0)
    return {
      badge: "text-red-300 bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
    };
  if (days <= 14)
    return {
      badge: "text-red-300 bg-red-500/10 border-red-500/30",
      dot: "bg-red-400",
    };
  if (days <= 30)
    return {
      badge: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
      dot: "bg-yellow-400",
    };
  return {
    badge: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    dot: "bg-emerald-400",
  };
}

function prettyDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function DeadlinesTimelineClient({
  items,
  colleges,
}: {
  items: TimelineItem[];
  colleges: { slug: string; name: string }[];
}) {
  const [collegeFilter, setCollegeFilter] = useState<string>("all");
  const [query, setQuery] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items
      .filter((it) => (collegeFilter === "all" ? true : it.collegeSlug === collegeFilter))
      .filter((it) => {
        if (!q) return true;
        return (
          it.collegeName.toLowerCase().includes(q) ||
          it.label.toLowerCase().includes(q) ||
          it.date.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [items, collegeFilter, query]);

  const grouped = useMemo(() => {
    const now = new Date();
    const sections: { title: string; data: TimelineItem[] }[] = [
      { title: "Overdue / Today", data: [] },
      { title: "Next 7 days", data: [] },
      { title: "Next 30 days", data: [] },
      { title: "Later", data: [] },
    ];

    filtered.forEach((it) => {
      const d = new Date(it.date);
      const diffDays = daysUntil(it.date);

      if (d < now || diffDays <= 0) sections[0].data.push(it);
      else if (diffDays <= 7) sections[1].data.push(it);
      else if (diffDays <= 30) sections[2].data.push(it);
      else sections[3].data.push(it);
    });

    return sections;
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Filter by college</label>
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="w-full sm:w-64 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm"
          >
            <option value="all">All colleges</option>
            {colleges.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-zinc-400">Search</label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Vanderbilt, application, priority..."
            className="w-full sm:w-80 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Timeline */}
      {grouped.map((section) => {
        if (section.data.length === 0) return null;

        return (
          <section key={section.title} className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-200">{section.title}</h2>

            <div className="space-y-2">
              {section.data.map((it) => {
                const d = daysUntil(it.date);
                const s = deadlineStyle(d);

                return (
                  <div
                    key={it.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                        <p className="text-sm font-semibold truncate">
                          {it.label}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-zinc-400">
                        {it.collegeName} • {prettyDate(it.date)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`text-[11px] border rounded-full px-2 py-1 ${s.badge}`}
                      >
                        {d <= 0 ? "Due today/overdue" : `Due in ${d}d`}
                      </div>

                      <Link
                        href={`/colleges/${it.collegeSlug}`}
                        className="text-xs text-sky-400 hover:underline"
                      >
                        Open college →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-sm text-zinc-400">
          No deadlines match your filters.
        </div>
      ) : null}
    </div>
  );
}
