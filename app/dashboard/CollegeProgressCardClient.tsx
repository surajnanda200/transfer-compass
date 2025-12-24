"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCollegeState } from "@/app/lib/storage";

type College = {
  name: string;
  category: string;
  location?: string;
  slug: string;
  notes?: string;
};

type NextDeadline = { date: string; label: string } | null;

// Must match your MaterialsChecklist DEFAULT_ITEMS ids
const MATERIAL_IDS = [
  "research",
  "account",
  "transcript",
  "recs-requested",
  "recs-received",
  "essays-draft",
  "essays-final",
  "application-submitted",
  "financial-aid",
] as const;

function nextTaskFromMaterials(materials: Record<string, boolean>) {
  const tasks = [
    { id: "research", label: "Research requirements" },
    { id: "account", label: "Create portal account" },
    { id: "transcript", label: "Request transcripts" },
    { id: "recs-requested", label: "Request recommendations" },
    { id: "recs-received", label: "Confirm recs received" },
    { id: "essays-draft", label: "Draft essays" },
    { id: "essays-final", label: "Finalize essays" },
    { id: "application-submitted", label: "Submit application" },
    { id: "financial-aid", label: "Submit FAFSA/CSS" },
  ];

  const firstIncomplete = tasks.find((t) => !materials?.[t.id]);
  return firstIncomplete ? firstIncomplete.label : "All checklist items complete 🎉";
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = d.getTime() - now.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function deadlineStyle(days: number) {
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

export default function CollegeProgressCardClient({
  college,
  nextDeadline,
}: {
  college: College;
  nextDeadline: NextDeadline;
}) {
  const [materials, setMaterials] = useState<Record<string, boolean>>({});
  const [essayStatuses, setEssayStatuses] = useState<string[]>([]);

  useEffect(() => {
    const saved = getCollegeState(college.slug);
    setMaterials(saved?.materials ?? {});
    setEssayStatuses(Array.isArray(saved?.essaysStatus) ? saved.essaysStatus : []);
  }, [college.slug]);

  const checklist = useMemo(() => {
    const total = MATERIAL_IDS.length;
    const done = MATERIAL_IDS.filter((id) => !!materials[id]).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    const nextTask = nextTaskFromMaterials(materials);
    return { total, done, percent, nextTask };
  }, [materials]);

  const essays = useMemo(() => {
    if (!essayStatuses.length) return { total: 0, completed: 0, percent: 0 };

    const lower = essayStatuses.map((s) => (s ?? "").toLowerCase());
    const completed = lower.filter((s) => s === "final" || s === "submitted").length;
    const total = essayStatuses.length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [essayStatuses]);

  return (
    <Link
      href={`/colleges/${college.slug}`}
      className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition block"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{college.name}</h3>
          <p className="mt-1 text-xs text-zinc-400">
            {college.location ?? "—"} • {college.category}
          </p>
          {college.notes ? (
            <p className="mt-2 text-xs text-zinc-500 line-clamp-2">{college.notes}</p>
          ) : null}
        </div>

        <span className="text-xs text-zinc-500">Open →</span>
      </div>

      {/* Deadline urgency */}
      {nextDeadline?.date ? (() => {
        const d = daysUntil(nextDeadline.date);
        const s = deadlineStyle(d);

        return (
          <div className="mt-3 flex items-center justify-between">
            <div className="text-[11px] text-zinc-400">Next deadline</div>

            <div
              className={`text-[11px] border rounded-full px-2 py-1 flex items-center gap-2 ${s.badge}`}
            >
              <span className={`h-2 w-2 rounded-full ${s.dot}`} />
              <span className="text-zinc-200">{nextDeadline.label}</span>
              <span className="text-zinc-400">
                {d <= 0 ? "Due today/overdue" : `Due in ${d}d`}
              </span>
            </div>
          </div>
        );
      })() : (
        <div className="mt-3 text-[11px] text-zinc-500">Next deadline: —</div>
      )}

      {/* Checklist progress */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>Checklist</span>
          <span>
            {checklist.done}/{checklist.total} • {checklist.percent}%
          </span>
        </div>
        <div className="mt-1 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${checklist.percent}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] text-zinc-500">
          Next: <span className="text-zinc-300">{checklist.nextTask}</span>
        </p>
      </div>

      {/* Essays progress */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>Essays</span>
          {essays.total === 0 ? <span>—</span> : <span>{essays.percent}%</span>}
        </div>
      </div>
    </Link>
  );
}
