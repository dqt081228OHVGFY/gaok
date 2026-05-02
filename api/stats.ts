import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities, getSchoolScores, getMajors } from "./_data";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const schoolScores = getSchoolScores();
  const majors = getMajors();

  const years = [...new Set(schoolScores.map((s: any) => s.year))].sort(
    (a: any, b: any) => b - a,
  );
  res.status(200).json({
    universities: universities.length,
    majors: majors.length,
    provinces: [...new Set(universities.map((u: any) => u.province))].length,
    years,
    count985: universities.filter((u: any) => u.tags?.includes("985")).length,
    count211: universities.filter((u: any) => u.tags?.includes("211")).length,
    doubleFirstClass: universities.filter((u: any) =>
      u.tags?.some((t: string) => t.startsWith("双一流")),
    ).length,
  });
}
