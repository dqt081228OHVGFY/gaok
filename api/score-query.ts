import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUniversities, getSchoolScores, paginate } from "./_data";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const universities = getUniversities();
  const schoolScores = getSchoolScores();
  const {
    score,
    province,
    subjects = "综合",
    year = "2024",
    type,
    tag,
    page = "1",
    pageSize = "20",
  } = req.query as Record<string, string>;

  if (!score || !province)
    return res
      .status(400)
      .json({ error: "score and province are required" });

  const userScore = parseInt(score);
  const queryYear = parseInt(year);

  let candidateScores = schoolScores.filter(
    (s: any) =>
      s.province === province &&
      s.year === queryYear &&
      (s.subjects === subjects ||
        s.subjects === "综合" ||
        subjects === "综合"),
  );

  const scored: any[] = [];
  for (const s of candidateScores) {
    const uni = universities.find((u: any) => u.name === s.school_name);
    if (!uni) continue;
    if (type && uni.type !== type) continue;
    if (
      tag &&
      !(
        Array.isArray(uni.tags) &&
        uni.tags.some((t: string) => t.includes(tag))
      )
    )
      continue;

    const diff = userScore - s.min_score;
    let chance: string;
    if (diff >= 30) chance = "保底";
    else if (diff >= 0) chance = "稳妥";
    else chance = "冲刺";

    if (diff >= -30) {
      scored.push({ university: uni, score: s, scoreDiff: diff, chance });
    }
  }

  scored.sort((a: any, b: any) => b.scoreDiff - a.scoreDiff);
  const paged = paginate(scored, parseInt(page), parseInt(pageSize));
  res.status(200).json({ ...paged, inputScore: userScore, province });
}
