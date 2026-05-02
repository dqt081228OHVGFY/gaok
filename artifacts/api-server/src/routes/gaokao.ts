import { Router, type IRouter } from "express";
import fs from "fs";
import path from "path";

const router: IRouter = Router();

function loadJson(filename: string) {
  const filePath = path.resolve(process.cwd(), "../../data/raw", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

let universities: any[] = [];
let controlScores: any[] = [];
let schoolScores: any[] = [];
let majors: any[] = [];

try {
  universities = loadJson("universities_raw.json");
  controlScores = loadJson("control_scores_raw.json");
  schoolScores = loadJson("school_scores_raw.json");
  majors = loadJson("majors_raw.json");
} catch (e) {
  console.error("Failed to load data files:", e);
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    items: items.slice(start, end),
    total,
    page,
    pageSize,
    totalPages,
  };
}

router.get("/universities", (req, res) => {
  let result = [...universities];
  const { search, province, type, tag, sortBy, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((u) => u.name.toLowerCase().includes(q) || u.city?.toLowerCase().includes(q));
  }
  if (province) result = result.filter((u) => u.province === province);
  if (type) result = result.filter((u) => u.type === type);
  if (tag) result = result.filter((u) => Array.isArray(u.tags) && u.tags.some((t: string) => t.includes(tag)));

  if (sortBy === "rank_qs") {
    result.sort((a, b) => (a.rank_qs || 9999) - (b.rank_qs || 9999));
  } else if (sortBy === "name") {
    result.sort((a, b) => a.name.localeCompare(b.name, "zh"));
  } else if (sortBy === "established") {
    result.sort((a, b) => (a.established || 9999) - (b.established || 9999));
  } else {
    result.sort((a, b) => (a.rank_soft || 9999) - (b.rank_soft || 9999));
  }

  res.json(paginate(result, parseInt(page), parseInt(pageSize)));
});

router.get("/universities/:id", (req, res) => {
  const u = universities.find((u) => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: "Not found" });
  res.json(u);
});

router.get("/universities/:id/scores", (req, res) => {
  const u = universities.find((u) => u.id === req.params.id);
  if (!u) return res.status(404).json({ error: "Not found" });

  let scores = schoolScores.filter((s) => s.school_name === u.name);
  const { province, year } = req.query as Record<string, string>;
  if (province) scores = scores.filter((s) => s.province === province);
  if (year) scores = scores.filter((s) => s.year === parseInt(year));

  scores.sort((a, b) => b.year - a.year || a.province.localeCompare(b.province, "zh"));
  res.json({ scores });
});

router.get("/majors", (req, res) => {
  let result = [...majors];
  const { search, category, page = "1", pageSize = "20" } = req.query as Record<string, string>;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((m) => m.name.toLowerCase().includes(q) || m.category?.toLowerCase().includes(q));
  }
  if (category) result = result.filter((m) => m.category === category);

  result.sort((a, b) => a.code.localeCompare(b.code));
  const categories = [...new Set(majors.map((m: any) => m.category))].sort();
  const paged = paginate(result, parseInt(page), parseInt(pageSize));
  res.json({ ...paged, categories });
});

router.get("/control-scores", (req, res) => {
  let result = [...controlScores];
  const { province, year, subjects } = req.query as Record<string, string>;
  if (province) result = result.filter((s) => s.province === province);
  if (year) result = result.filter((s) => s.year === parseInt(year));
  if (subjects) result = result.filter((s) => s.subjects === subjects);
  result.sort((a, b) => b.year - a.year || a.province.localeCompare(b.province, "zh"));
  res.json({ items: result });
});

router.get("/score-query", (req, res) => {
  const { score, province, subjects = "综合", year = "2024", type, tag, page = "1", pageSize = "20" } = req.query as Record<string, string>;
  if (!score || !province) return res.status(400).json({ error: "score and province are required" });

  const userScore = parseInt(score);
  const queryYear = parseInt(year);

  let candidateScores = schoolScores.filter(
    (s) => s.province === province && s.year === queryYear && (s.subjects === subjects || s.subjects === "综合" || subjects === "综合")
  );

  const scored: any[] = [];
  for (const s of candidateScores) {
    const uni = universities.find((u) => u.name === s.school_name);
    if (!uni) continue;
    if (type && uni.type !== type) continue;
    if (tag && !(Array.isArray(uni.tags) && uni.tags.some((t: string) => t.includes(tag)))) continue;

    const diff = userScore - s.min_score;
    let chance: string;
    if (diff >= 30) chance = "保底";
    else if (diff >= 0) chance = "稳妥";
    else chance = "冲刺";

    if (diff >= -30) {
      scored.push({ university: uni, score: s, scoreDiff: diff, chance });
    }
  }

  scored.sort((a, b) => b.scoreDiff - a.scoreDiff);
  const paged = paginate(scored, parseInt(page), parseInt(pageSize));
  res.json({ ...paged, inputScore: userScore, province });
});

router.get("/stats", (_req, res) => {
  const years = [...new Set(schoolScores.map((s: any) => s.year))].sort((a, b) => b - a);
  res.json({
    universities: universities.length,
    majors: majors.length,
    provinces: [...new Set(universities.map((u: any) => u.province))].length,
    years,
    count985: universities.filter((u: any) => u.tags?.includes("985")).length,
    count211: universities.filter((u: any) => u.tags?.includes("211")).length,
    doubleFirstClass: universities.filter((u: any) => u.tags?.some((t: string) => t.startsWith("双一流"))).length,
  });
});

router.get("/provinces", (_req, res) => {
  const provinces = [...new Set(universities.map((u: any) => u.province))].sort((a, b) => a.localeCompare(b, "zh"));
  res.json({ provinces });
});

router.get("/university-types", (_req, res) => {
  const types = [...new Set(universities.map((u: any) => u.type))].sort();
  const tagSet = new Set<string>();
  universities.forEach((u: any) => (u.tags || []).forEach((t: string) => tagSet.add(t)));
  const tags = [...tagSet].sort();
  const majorCategories = [...new Set(majors.map((m: any) => m.category))].sort();
  res.json({ types, tags, majorCategories });
});

export default router;
