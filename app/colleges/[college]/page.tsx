import Link from "next/link";
import collegesData from "@/app/data/colleges.json";
import deadlinesData from "@/app/data/deadlines.json";
import essaysData from "@/app/data/essays.json";
import MaterialsChecklistClient from "@/app/colleges/MaterialsChecklist";
import EssaysProgressClient from "@/app/dashboard/EssaysProgressClient";


interface CollegePageProps {
  // Next.js App Router uses Promise for params in server components
  params: Promise<{
    college: string;
  }>;
}

type College = {
  name: string;
  category: string;
  location?: string;
  slug?: string;
  website?: string;
  notes?: string;
};

type Deadline = {
  college: string; 
  term: string;
  type: string;
  date: string;
  notes?: string;
};

type Essay = {
  college: string; 
  prompt: string;
  status: string;
  wordLimit?: number;
  notes?: string;
};

export default async function CollegePage({ params }: CollegePageProps) {
  const { college: slug } = await params;

  const colleges = collegesData as College[];
  const allDeadlines = deadlinesData as Deadline[];
  const allEssays = essaysData as Essay[];

  const college = colleges.find((c) => c.slug === slug);

  if (!college) {
    return (
      <main className="px-6 py-10 max-w-5xl mx-auto text-zinc-100">
        <Link
          href="/colleges"
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back to colleges
        </Link>

        <h1 className="mt-6 text-3xl font-bold">College not found</h1>
        <p className="mt-2 text-zinc-400">
          We couldn&apos;t find that school.
        </p>
      </main>
    );
  }


  // --- deadlines (filter by full college.name) ---
  const collegeDeadlines = allDeadlines
    .filter((d) => d.college === college.name)
    .sort((a, b) => a.date.localeCompare(b.date));


  // --- essays (match either slug or name) ---
  const collegeEssays = allEssays.filter(
    (essay) => essay.college === slug || essay.college === college.name
  );


  return (
    <main className="px-6 py-10 max-w-5xl mx-auto text-zinc-100">
      {/* BACK */}
      <Link
        href="/colleges"
        className="text-sm text-zinc-400 hover:text-zinc-200"
      >
        ← Back to colleges
      </Link>


      {/* HEADER */}
      <header className="mt-6 space-y-2">
        <h1 className="text-3xl font-bold">{college.name}</h1>

        {college.location && (
          <p className="text-zinc-400 text-sm">{college.location}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5">
            {college.category}
          </span>

          {college.website && (
            <Link
              href={college.website}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-400 hover:text-sky-300"
            >
              Visit website
            </Link>
          )}
        </div>

        {college.notes && (
          <p className="mt-2 text-sm text-zinc-400">{college.notes}</p>
        )}
      </header>


      {/* CHECKLIST */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-3 gap-4">
          <h2 className="text-lg font-semibold">
            Application materials checklist
          </h2>
          <MaterialsChecklistClient collegeSlug={slug} />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40">
          <MaterialsChecklistClient collegeSlug={slug} showItems />
        </div>
      </section>


      {/* DEADLINES */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">Deadlines</h2>

        {collegeDeadlines.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No deadlines entered yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/40">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900/70 text-left text-xs uppercase tracking-wide text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Term</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {collegeDeadlines.map((deadline, idx) => (
                  <tr
                    key={`${deadline.term}-${deadline.type}-${idx}`}
                    className="border-t border-zinc-800/80"
                  >
                    <td className="px-4 py-3 text-zinc-200">
                      {deadline.term}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {deadline.type}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {new Date(deadline.date).toLocaleDateString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {deadline.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* ESSAYS */}
      <section className="mt-10 mb-16">
        <div className="flex items-center justify-between mb-3 gap-4">
          <h2 className="text-lg font-semibold">Essays</h2>
          <EssaysProgressClient essays={collegeEssays} />
        </div>

        {collegeEssays.length === 0 ? (
          <p className="text-sm text-zinc-400">
            No essays logged yet.
          </p>
        ) : (
          <div className="space-y-4">
            {collegeEssays.map((essay, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-zinc-400">
                      ESSAY {idx + 1}
                    </p>
                    <p className="text-sm font-medium text-zinc-100">
                      {essay.prompt}
                    </p>
                    {essay.notes && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {essay.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-xs">
                    <span className="inline-flex items-center rounded-full border border-zinc-700 px-2 py-0.5 text-zinc-200">
                      {essay.status}
                    </span>
                    {essay.wordLimit && (
                      <span className="text-zinc-500">
                        {essay.wordLimit} words
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
