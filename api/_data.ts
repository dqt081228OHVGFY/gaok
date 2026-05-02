import fs from "node:fs";
import path from "node:path";

function loadJson(filename: string) {
  const filePath = path.join(process.cwd(), "data", "raw", filename);
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

let _universities: any[] | null = null;
let _controlScores: any[] | null = null;
let _schoolScores: any[] | null = null;
let _majors: any[] | null = null;

export function getUniversities() {
  if (!_universities) _universities = loadJson("universities_raw.json");
  return _universities!;
}

export function getControlScores() {
  if (!_controlScores) _controlScores = loadJson("control_scores_raw.json");
  return _controlScores!;
}

export function getSchoolScores() {
  if (!_schoolScores) _schoolScores = loadJson("school_scores_raw.json");
  return _schoolScores!;
}

export function getMajors() {
  if (!_majors) _majors = loadJson("majors_raw.json");
  return _majors!;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
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
