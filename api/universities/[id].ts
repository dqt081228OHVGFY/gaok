import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities } from "../_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const { id } = req.query as { id: string };
  const u = universities.find((u: any) => u.id === id);
  if (!u) return res.status(404).json({ error: "Not found" });
  res.status(200).json(u);
}
