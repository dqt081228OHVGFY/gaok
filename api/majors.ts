import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getMajors, paginate } from "./_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const majors = getMajors();
  let result = [...majors];
  const { search, category, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (m: any) =>
        m.name.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q),
    );
  }
  if (category) result = result.filter((m: any) => m.category === category);

  result.sort((a: any, b: any) => a.code.localeCompare(b.code));
  const categories = [...new Set(majors.map((m: any) => m.category))].sort();
  const paged = paginate(result, parseInt(page), parseInt(pageSize));
  res.status(200).json({ ...paged, categories });
}
