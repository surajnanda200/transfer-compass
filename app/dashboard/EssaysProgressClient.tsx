"use client";

import { useEffect, useMemo, useState } from "react";
import collegesData from "../data/colleges.json";
import essaysData from "../data/essays.json";
import { getCollegeState, saveCollegeState } from "@/app/lib/storage";

type College = {
  name: string;
  category: string;
  location?: string;
  slug?: string;
  notes?: string;
};

type Essay = {
  college: string; // slug OR college name (your data supports both)
  prompt: string;
  status: string; // "Not Started" | "Draft" | "Final" | "Submitted" (string for flexibility)
  wordLimit?: number | string;
  notes?: string;
};

type EssayEntry = {
  collegeId: string;
  defaultStatus: string;
  idx: number; // index within that college's essays list
};

function normalizeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function legacyStatusKey(collegeId: string, idx: number) {
  return `essayStatus:${collegeId}:${idx}`;
}

export default function EssaysProgressClient() {
  const colleges = collegesData as College[];
  const allEssays = essaysData as Essay[];

  // Build a stable list of essay "slots" across all colleges
  const entries: EssayEntry[] = useMemo(() => {
    const list: EssayEntry[] = [];

    colleges.forEach((college) => {
      const collegeId = college.slug ?? normalizeSlug(college.name);

      const collegeEssays = allEssays.filter(
        (e) => e.college === collegeId || e.college === college.name
      );

      collegeEssays.forEach((essay, idx) => {
        list.push({
          collegeId,
          defaultStatus: essay.status ?? "Not Started",
          idx,
        });
      });
    });

    return list;
  }, [colleges, allEssays]);

  const [statuses, setStatuses] = useState<string[]>(() =>
    entries.map((e) => e.defaultStatus ?? "Not Started")
  );

  // Load from new shared storage; fallback to legacy keys and migrate
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const loaded = entries.map((entry) => {
        const saved = getCollegeState(entry.collegeId);

        // New format: per-college essaysStatus: string[]
        const fromNew =
          Array.isArray(saved?.essaysStatus) && saved.essaysStatus[entry.idx]
            ? saved.essaysStatus[entry.idx]
            : null;

        if (fromNew) return fromNew;

        // Legacy fallback
        const fromLegacy =
          localStorage.getItem(legacyStatusKey(entry.collegeId, entry.idx)) ??
          entry.defaultStatus ??
          "Not Started";

        return fromLegacy;
      });

      setStatuses(loaded);

      // Optional migration: write legacy values into new format per college
      const byCollege: Record<string, string[]> = {};
      entries.forEach((entry, i) => {
        if (!byCollege[entry.collegeId]) byCollege[entry.collegeId] = [];
        byCollege[entry.collegeId][entry.idx] = loaded[i];
      });

      Object.entries(byCollege).forEach(([collegeId, arr]) => {
        const existing = getCollegeState(collegeId) || {};
        saveCollegeState(collegeId, {
          ...existing,
          essaysStatus: arr,
        });
      });
    } catch {
      // ignore if storage is unavailable
    }
  }, [entries]);

  const totalEssays = entries.length;

  if (totalEssays === 0) {
    return (
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <h2 className="text-sm font-semibold">Essay progress</h2>
        <p className="mt-1 text-xs text-zinc-400">
          No essays configured yet. Add entries in{" "}
          <code>app/data/essays.json</code>.
        </p>
      </section>
    );
  }

  const lower = statuses.map((s) => (s ?? "not started").toLowerCase());

  const countNotStarted = lower.filter((s) => s === "not started").length;
  const countDraft = lower.filter((s) => s === "draft").length;
  const countFinal = lower.filter((s) => s === "final").length;
  const countSubmitted = lower.filter((s) => s === "submitted").length;

  const countStarted = totalEssays - countNotStarted;
  const countCompleted = countFinal + countSubmitted;

  const percentComplete =
    totalEssays === 0 ? 0 : Math.round((countCompleted / totalEssays) * 100);

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Essay progress</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Tracks status across all schools (saved locally in your browser).
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold">{percentComplete}%</p>
          <p className="text-[11px] text-zinc-500">completed (Final/Submitted)</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-1 h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
        <div className="h-full bg-sky-500 transition-all" style={{ width: `${percentComplete}%` }} />
      </div>

      {/* Breakdown */}
      <div className="flex flex-wrap gap-4 text-[11px] text-zinc-400 mt-1">
        <span>
          Total: <span className="text-zinc-100">{totalEssays}</span>
        </span>
        <span>
          Started:{" "}
          <span className="text-zinc-100">
            {countStarted}/{totalEssays}
          </span>
        </span>
        <span>
          Draft: <span className="text-zinc-100">{countDraft}</span>
        </span>
        <span>
          Final: <span className="text-zinc-100">{countFinal}</span>
        </span>
        <span>
          Submitted: <span className="text-zinc-100">{countSubmitted}</span>
        </span>
      </div>
    </section>
  );
}
