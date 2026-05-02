import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities, paginate } from "./_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  let result = [...universities];
  const {
    search,
    province,
    type,
    tag,
    sortBy,
    page = "1",
    pageSize = "20",
  } = req.query as Record<string, string>;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(
      (u: any) =>
        u.name.toLowerCase().includes(q) ||
        u.city?.toLowerCase().includes(q),
    );
  }
  if (province) result = result.filter((u: any) => u.province === province);
  if (type) result = result.filter((u: any) => u.type === type);
  if (tag)
    result = result.filter(
      (u: any) =>
        Array.isArray(u.tags) &&
        u.tags.some((t: string) => t.includes(tag)),
    );

  if (sortBy === "rank_qs") {
    result.sort((a: any, b: any) => (a.rank_qs || 9999) - (b.rank_qs || 9999));
  } else if (sortBy === "name") {
    result.sort((a: any, b: any) => a.name.localeCompare(b.name, "zh"));
  } else if (sortBy === "established") {
    result.sort(
      (a: any, b: any) => (a.established || 9999) - (b.established || 9999),
    );
  } else {
    result.sort(
      (a: any, b: any) => (a.rank_soft || 9999) - (b.rank_soft || 9999),
    );
  }

  res
    .status(200)
    .json(paginate(result, parseInt(page), parseInt(pageSize)));
}
