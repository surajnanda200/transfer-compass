import Link from "next/link";
import collegesData from "@/app/data/colleges.json";
import deadlinesData from "@/app/data/deadlines.json";
import EssaysProgressClient from "./EssaysProgressClient";
import CollegeProgressCardClient from "./CollegeProgressCardClient";



type College = {
  name: string;
  category: string;
  location?: string;
  slug?: string;
  notes?: string;
};

type Deadline = {
  // we’ll try to support common shapes
  college?: string; // slug or college name
  collegeId?: string;
  slug?: string;

  date?: string; // ISO date string
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



export default function DashboardPage() {
  const colleges = collegesData as College[];
  const deadlines = deadlinesData as Deadline[];

  // Build a map: slug -> next upcoming deadline (date + label)
  const now = new Date();
  const nextDeadlineBySlug: Record<
    string,
    { date: string; label: string } | null
  > = {};

  for (const c of colleges) {
    const slug = c.slug ?? normalizeSlug(c.name);

    const candidates = deadlines
      .map((d) => {
        const collegeKeyRaw = pickCollegeKey(d);
        const collegeKey = collegeKeyRaw ? normalizeSlug(collegeKeyRaw) : null;

        const dateStr = pickDate(d);
        const dt = dateStr ? new Date(dateStr) : null;

        const label =
          d.label ?? d.name ?? d.type ?? "Deadline";

        return { collegeKey, dateStr, dt, label };
      })
      .filter((x) => x.collegeKey === slug && x.dateStr && x.dt && x.dt >= now)
      .sort((a, b) => (a.dt!.getTime() - b.dt!.getTime()));

    nextDeadlineBySlug[slug] = candidates.length
      ? { date: candidates[0].dateStr!, label: candidates[0].label }
      : null;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-2 text-zinc-400">
          Your command center — track progress and jump to what matters next.
        </p>
      </div>

      <EssaysProgressClient />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your colleges</h2>
          <Link
            href="/colleges"
            className="text-sm text-sky-400 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((c) => {
            const slug = c.slug ?? normalizeSlug(c.name);
            const nextDeadline = nextDeadlineBySlug[slug] ?? null;

            return (
              <CollegeProgressCardClient
                key={slug}
                college={{ ...c, slug }}
                nextDeadline={nextDeadline}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
