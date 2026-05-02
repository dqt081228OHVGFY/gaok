import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getControlScores } from "./_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const controlScores = getControlScores();
  let result = [...controlScores];
  const { province, year, subjects } = req.query as Record<string, string>;
  if (province) result = result.filter((s: any) => s.province === province);
  if (year) result = result.filter((s: any) => s.year === parseInt(year));
  if (subjects) result = result.filter((s: any) => s.subjects === subjects);
  result.sort(
    (a: any, b: any) =>
      b.year - a.year || a.province.localeCompare(b.province, "zh"),
  );
  res.status(200).json({ items: result });
}
