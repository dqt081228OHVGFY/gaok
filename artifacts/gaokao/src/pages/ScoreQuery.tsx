import { useState } from "react";
import { useSearch } from "wouter";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, TrendingUp, Target, Shield, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryByScore, useListUniversityTypes } from "@workspace/api-client-react";

const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","内蒙古","广西","西藏","宁夏","新疆"];

const CHANCE_CONFIG = {
  "冲刺": { icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800", label: "冲刺" },
  "稳妥": { icon: Target, color: "text-green-600", bg: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800", label: "稳妥" },
  "保底": { icon: Shield, color: "text-blue-600", bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800", label: "保底" },
};

const TAG_COLORS: Record<string, string> = {
  "985": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "211": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "双一流A": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "双一流B": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function ScoreQuery() {
  const search = useSearch();
  const params = new URLSearchParams(search);

  const [score, setScore] = useState(params.get("score") ?? "");
  const [province, setProvince] = useState(params.get("province") ?? "");
  const [subjects, setSubjects] = useState("综合");
  const [year, setYear] = useState("2024");
  const [typeFilter, setTypeFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [queried, setQueried] = useState(!!(params.get("score") && params.get("province")));

  const { data: filtersData } = useListUniversityTypes();
  const types = filtersData?.types ?? [];
  const tags = filtersData?.tags?.filter(t => ["985","211","双一流A","双一流B"].includes(t)) ?? [];

  const { data, isLoading } = useQueryByScore(
    {
      score: parseInt(score) || 0,
      province: province || "",
      subjects,
      year: parseInt(year),
      type: typeFilter !== "all" ? typeFilter : undefined,
      tag: tagFilter !== "all" ? tagFilter : undefined,
      page,
      pageSize: 15,
    },
    {
      query: { enabled: queried && !!score && !!province },
    }
  );

  function handleQuery() {
    if (!score || !province) return;
    setPage(1);
    setQueried(true);
  }

  function reset() {
    setScore(""); setProvince(""); setSubjects("综合"); setYear("2024");
    setTypeFilter("all"); setTagFilter("all"); setPage(1); setQueried(false);
  }

  return (
    <motion.main
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">按分数查询院校</h1>
        <p className="text-sm text-muted-foreground">根据你的分数和省份，查找可报考的院校，按冲刺/稳妥/保底分类展示</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">高考分数</label>
              <Input
                type="number"
                placeholder="如：620"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                min={0} max={750}
                data-testid="input-score"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">考生省份</label>
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger data-testid="select-province">
                  <SelectValue placeholder="选择省份" />
                </SelectTrigger>
                <SelectContent>
                  {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">科类</label>
              <Select value={subjects} onValueChange={setSubjects}>
                <SelectTrigger data-testid="select-subjects">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="综合">综合（新高考）</SelectItem>
                  <SelectItem value="理科">理科</SelectItem>
                  <SelectItem value="文科">文科</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">参考年份</label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger data-testid="select-year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024,2023,2022,2021,2020].map(y => <SelectItem key={y} value={String(y)}>{y}年</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-28 h-8 text-sm">
                <SelectValue placeholder="院校类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tagFilter} onValueChange={(v) => { setTagFilter(v); setPage(1); }}>
              <SelectTrigger className="w-24 h-8 text-sm">
                <SelectValue placeholder="层次" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部层次</SelectItem>
                {tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" size="sm" onClick={reset} data-testid="button-reset">重置</Button>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                <Button
                  onClick={handleQuery}
                  disabled={!score || !province}
                  data-testid="button-query"
                  className="relative overflow-hidden"
                >
                  <motion.span
                    className="flex items-center gap-1.5"
                    animate={!score || !province ? {} : { x: [0, 0] }}
                  >
                    <Search className="h-4 w-4" /> 查询
                  </motion.span>
                  {score && province && (
                    <motion.span
                      className="absolute inset-0 bg-white/20 rounded"
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {!queried && (
          <motion.div
            key="empty"
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
            </motion.div>
            <p className="font-medium mb-1">输入分数和省份开始查询</p>
            <p className="text-sm">系统将自动按冲刺 / 稳妥 / 保底分类推荐院校</p>
          </motion.div>
        )}

        {queried && isLoading && (
          <motion.div
            key="loading"
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </motion.div>
        )}

        {queried && data && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {province} · <strong className="text-foreground">{score}分</strong> · 共找到 <strong className="text-foreground">{data.total}</strong> 所匹配院校
              </p>
            </div>

            {(["冲刺","稳妥","保底"] as const).map((chance) => {
              const items = data.items.filter((i: any) => i.chance === chance);
              if (items.length === 0) return null;
              const cfg = CHANCE_CONFIG[chance];
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={chance}
                  className="mb-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    <h2 className="font-semibold text-sm">{chance}院校</h2>
                    <span className="text-xs text-muted-foreground border rounded-full px-2 py-0.5">{items.length}所</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item: any, idx: number) => (
                      <motion.div
                        key={idx}
                        custom={idx}
                        variants={cardVariants}
                        initial="hidden"
                        animate="show"
                      >
                        <Link href={`/universities/${item.university.id}`}>
                          <motion.div
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-shadow ${cfg.bg}`}
                            whileHover={{ scale: 1.015, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                            whileTap={{ scale: 0.99 }}
                            transition={{ type: "spring", stiffness: 350, damping: 22 }}
                            data-testid={`result-card-${item.university.id}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-medium text-sm">{item.university.name}</span>
                                <div className="flex gap-1">
                                  {item.university.tags?.slice(0,2).filter((t: string) => TAG_COLORS[t]).map((t: string) => (
                                    <span key={t} className={`inline-flex items-center rounded px-1 py-0.5 text-xs font-medium ${TAG_COLORS[t]}`}>{t}</span>
                                  ))}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.university.province} · {item.university.type} · {item.score.year}年最低 <strong>{item.score.min_score}分</strong>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className={`text-lg font-bold ${cfg.color}`}>
                                {item.scoreDiff >= 0 ? "+" : ""}{item.scoreDiff}
                              </div>
                              <div className="text-xs text-muted-foreground">分差</div>
                            </div>
                          </motion.div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}

            {data.total === 0 && (
              <motion.div
                className="text-center py-16 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-base mb-2">未找到匹配的院校</p>
                <p className="text-sm">请尝试调整分数范围或切换年份/科类</p>
              </motion.div>
            )}

            {data.totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-3 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} data-testid="button-prev">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">第 {page} / {data.totalPages} 页</span>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} data-testid="button-next">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
