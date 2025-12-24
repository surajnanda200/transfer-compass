// app/essays/page.tsx

import Link from "next/link";
import collegesData from "../data/colleges.json";
import essaysData from "../data/essays.json";

type College = {
  name: string;
  category: string;
  location?: string;
  slug?: string;
  notes?: string;
};

type Essay = {
  college: string;
  prompt: string;
  status: string;
  wordLimit?: number | string;
};

function normalizeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default function EssaysPage() {
  const colleges = collegesData as College[];
  const essays = essaysData as Essay[];

  const withEssays = colleges.filter((college) => {
    const id = college.slug ?? normalizeSlug(college.name);
    return essays.some(
      (e) => e.college === id || e.college === college.name
    );
  });

  return (
    <main className="px-6 py-8 max-w-5xl mx-auto space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Essays</h1>
        <p className="text-sm text-zinc-400">
          Overview of all essays by college. Click into a school to draft and
          edit.
        </p>
      </header>

      {withEssays.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No essays configured yet. Add entries to <code>app/data/essays.json</code>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {withEssays.map((college) => {
            const id = college.slug ?? normalizeSlug(college.name);
            const collegeEssays = essays.filter(
              (e) => e.college === id || e.college === college.name
            );

            const startedCount = collegeEssays.filter(
              (e) => e.status.toLowerCase() !== "not started"
            ).length;

            return (
              <Link
                key={id}
                href={`/essays/${id}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-500 transition flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold">
                      {college.name}
                    </h2>
                    {college.location && (
                      <p className="text-xs text-zinc-400">
                        {college.location}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300">
                    {college.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {collegeEssays.length} essay
                  {collegeEssays.length !== 1 ? "s" : ""} —{" "}
                  {startedCount}/{collegeEssays.length} started
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
