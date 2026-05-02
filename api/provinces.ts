import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities } from "./_data";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const provinces = [
    ...new Set(universities.map((u: any) => u.province)),
  ].sort((a: any, b: any) => a.localeCompare(b, "zh"));
  res.status(200).json({ provinces });
}
