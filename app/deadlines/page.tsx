import collegesData from "@/app/data/colleges.json";
import deadlinesData from "@/app/data/deadlines.json";
import DeadlinesTimelineClient from "./DeadlinesTimelineClient";

type College = {
  name: string;
  slug?: string;
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

export default function DeadlinesPage() {
  const colleges = (collegesData as College[]).map((c) => ({
    slug: c.slug ?? normalizeSlug(c.name),
    name: c.name,
  }));

  const collegeNameBySlug = Object.fromEntries(
    colleges.map((c) => [c.slug, c.name])
  );

  const raw = deadlinesData as Deadline[];

  const items = raw
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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deadlines</h1>
        <p className="mt-2 text-zinc-400">
          All deadlines across your schools — sorted and urgency-coded.
        </p>
      </div>

      <DeadlinesTimelineClient items={items} colleges={colleges} />
    </div>
  );
}
