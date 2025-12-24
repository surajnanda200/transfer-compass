"use client";

import { useEffect, useState } from "react";

type Essay = {
  prompt: string;
  status: string;
  wordLimit?: number | string;
  notes?: string;
};

type Props = {
  collegeName: string;
  collegeId: string;
  essays: Essay[];
};

const STATUS_OPTIONS = ["Not started", "Draft", "Final", "Submitted"];

function bodyKey(collegeId: string, idx: number) {
  return `essayBody:${collegeId}:${idx}`;
}

function statusKey(collegeId: string, idx: number) {
  return `essayStatus:${collegeId}:${idx}`;
}

export default function EssayEditorClient({
  collegeName,
  collegeId,
  essays,
}: Props) {
  const [bodies, setBodies] = useState<string[]>(() =>
    essays.map(() => "")
  );
  const [statuses, setStatuses] = useState<string[]>(() =>
    essays.map((e) => e.status)
  );

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const loadedBodies = essays.map((_, idx) => {
        if (typeof window === "undefined") return "";
        return localStorage.getItem(bodyKey(collegeId, idx)) ?? "";
      });

      const loadedStatuses = essays.map((essay, idx) => {
        if (typeof window === "undefined") return essay.status;
        return (
          localStorage.getItem(statusKey(collegeId, idx)) ?? essay.status
        );
      });

      setBodies(loadedBodies);
      setStatuses(loadedStatuses);
    } catch {
      // ignore if localStorage not available
    }
  }, [collegeId, essays]);

  const handleBodyChange = (idx: number, value: string) => {
    setBodies((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(bodyKey(collegeId, idx), value);
      }
    } catch {
      // ignore
    }
  };

  const handleStatusChange = (idx: number, value: string) => {
    setStatuses((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(statusKey(collegeId, idx), value);
      }
    } catch {
      // ignore
    }
  };

  const wordCount = (text: string) =>
    text.trim() === ""
      ? 0
      : text
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;

  if (essays.length === 0) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{collegeName} — Essays</h1>
        <p className="text-sm text-zinc-400">
          No essays configured yet for this school in your data file.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">{collegeName} — Essays</h1>
        <p className="text-sm text-zinc-400">
          Draft and track your transfer essays here. Content and status are
          saved in your browser.
        </p>
      </header>

      <div className="space-y-4">
        {essays.map((essay, idx) => {
          const body = bodies[idx] ?? "";
          const status = statuses[idx] ?? essay.status;
          const wc = wordCount(body);

          return (
            <section
              key={idx}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-400 uppercase tracking-wide">
                    Essay {idx + 1}
                  </p>
                  <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                    {essay.prompt}
                  </p>
                  {essay.notes && (
                    <p className="text-xs text-zinc-500 whitespace-pre-wrap">
                      {essay.notes}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  {essay.wordLimit && (
                    <span className="text-xs text-zinc-400">
                      {essay.wordLimit} words
                    </span>
                  )}
                  <select
                    className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-100"
                    value={status}
                    onChange={(e) =>
                      handleStatusChange(idx, e.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Essay draft</span>
                  <span>
                    {wc} words
                    {essay.wordLimit
                      ? ` / ${essay.wordLimit} max`
                      : ""}
                  </span>
                </div>
                <textarea
                  className="mt-1 h-40 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                  value={body}
                  onChange={(e) =>
                    handleBodyChange(idx, e.target.value)
                  }
                  placeholder="Start drafting your essay here..."
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
