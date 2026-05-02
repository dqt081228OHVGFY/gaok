import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities, getMajors } from "./_data";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const majors = getMajors();

  const types = [
    ...new Set(universities.map((u: any) => u.type)),
  ].sort();
  const tagSet = new Set<string>();
  universities.forEach((u: any) =>
    (u.tags || []).forEach((t: string) => tagSet.add(t)),
  );
  const tags = [...tagSet].sort();
  const majorCategories = [
    ...new Set(majors.map((m: any) => m.category)),
  ].sort();
  res.status(200).json({ types, tags, majorCategories });
}
