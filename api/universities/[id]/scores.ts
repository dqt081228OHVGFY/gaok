import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities, getSchoolScores } from "../../_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const schoolScores = getSchoolScores();
  const { id, province, year } = req.query as Record<string, string>;

  const u = universities.find((u: any) => u.id === id);
  if (!u) return res.status(404).json({ error: "Not found" });

  let scores = schoolScores.filter((s: any) => s.school_name === u.name);
  if (province) scores = scores.filter((s: any) => s.province === province);
  if (year) scores = scores.filter((s: any) => s.year === parseInt(year));

  scores.sort(
    (a: any, b: any) =>
      b.year - a.year || a.province.localeCompare(b.province, "zh"),
  );
  res.status(200).json({ scores });
}
