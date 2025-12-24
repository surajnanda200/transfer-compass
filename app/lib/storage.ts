// app/lib/storage.ts

export function getCollegeState(slug: string) {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(`transferTracker:${slug}`);
  return raw ? JSON.parse(raw) : null;
}

export function saveCollegeState(slug: string, data: any) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    `transferTracker:${slug}`,
    JSON.stringify(data)
  );
}
