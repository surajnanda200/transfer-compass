"use client";

import { useEffect, useState } from "react";
import { getCollegeState, saveCollegeState } from "@/app/lib/storage";

type ChecklistItem = {
  id: string;
  label: string;
};

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "research", label: "Research programs, major requirements, and transfer policies" },
  { id: "account", label: "Create application portal account" },
  { id: "transcript", label: "Request official transcripts" },
  { id: "recs-requested", label: "Ask for recommendation letters" },
  { id: "recs-received", label: "Confirm recommendation letters received" },
  { id: "essays-draft", label: "Draft all required essays" },
  { id: "essays-final", label: "Finalize and proofread essays" },
  { id: "application-submitted", label: "Submit application" },
  { id: "financial-aid", label: "Submit FAFSA / CSS Profile (if needed)" },
];

type Props = {
  collegeId: string; // slug from the URL, e.g. "ut-austin"
};

export default function MaterialsChecklist({ collegeId }: Props) {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Load saved checklist from localStorage (via helper)
  useEffect(() => {
    const saved = getCollegeState(collegeId);
    if (saved?.materials) {
      setCheckedItems(saved.materials);
    }
  }, [collegeId]);

  // Toggle + persist
  const toggleItem = (id: string) => {
    const updated = {
      ...checkedItems,
      [id]: !checkedItems[id],
    };

    setCheckedItems(updated);

    const existing = getCollegeState(collegeId) || {};
    saveCollegeState(collegeId, {
      ...existing,
      materials: updated,
    });
  };

  const total = DEFAULT_ITEMS.length;
  const completed = DEFAULT_ITEMS.filter((item) => checkedItems[item.id]).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <section className="mt-8 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Application materials checklist
        </h2>
        <span className="text-xs text-zinc-400">
          {completed}/{total} done • {percent}%
        </span>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-2">
        {DEFAULT_ITEMS.map((item) => {
          const isDone = !!checkedItems[item.id];
          return (
            <label
              key={item.id}
              className="flex items-center gap-3 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-900 text-emerald-500 focus:ring-emerald-400"
              />
              <span
                className={
                  isDone
                    ? "text-zinc-400 line-through"
                    : "text-zinc-200"
                }
              >
                {item.label}
              </span>
            </label>
          );
        })}

        <p className="mt-2 text-[11px] text-zinc-500">
          This checklist is stored locally in your browser for each school.
        </p>
      </div>
    </section>
  );
}
