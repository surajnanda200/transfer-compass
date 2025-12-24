// app/essays/[college]/page.tsx

import collegesData from "../../data/colleges.json";
import essaysData from "../../data/essays.json";
import EssayEditorClient from "../EssayEditorClient";

type College = {
  name: string;
  category: string;
  location?: string;
  slug?: string;
  website?: string;
  notes?: string;
};

type Essay = {
  college: string;
  prompt: string;
  status: string;
  wordLimit?: number | string;
  notes?: string;
};

function normalizeSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

interface CollegeEssayPageProps {
  params: Promise<{ college: string }>;
}

export default async function CollegeEssayPage({
  params,
}: CollegeEssayPageProps) {
  const { college: slug } = await params;

  const colleges = collegesData as College[];
  const essays = essaysData as Essay[];

  const college =
    colleges.find((c) => c.slug === slug) ??
    colleges.find((c) => normalizeSlug(c.name) === slug);

  if (!college) {
    return (
      <main className="px-6 py-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">College not found</h1>
        <p className="text-sm text-zinc-400">
          Check that the slug in your URL matches a college in your data.
        </p>
      </main>
    );
  }

  const collegeId = college.slug ?? normalizeSlug(college.name);

  const collegeEssays = essays.filter(
    (e) => e.college === collegeId || e.college === college.name
  );

  return (
    <main className="px-6 py-8 max-w-4xl mx-auto">
      <EssayEditorClient
        collegeName={college.name}
        collegeId={collegeId}
        essays={collegeEssays}
      />
    </main>
  );
}
