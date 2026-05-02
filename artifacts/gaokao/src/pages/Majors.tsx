import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListMajors } from "@workspace/api-client-react";

const DEGREE_COLORS: Record<string, string> = {
  "学士": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "工学学士": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "理学学士": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "文学学士": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "管理学学士": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "法学学士": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "医学学士": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "艺术学学士": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function Majors() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 24;

  const { data, isLoading } = useListMajors({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    page,
    pageSize,
  });

  const categories = data?.categories ?? [];

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function reset() {
    setSearch(""); setSearchInput(""); setCategory("all"); setPage(1);
  }

  return (
    <motion.main
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">专业库</h1>
        <p className="text-sm text-muted-foreground">收录240个本科专业，按学科门类分类查询</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="搜索专业名称..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
            data-testid="input-search-majors"
          />
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={{ type: "spring", stiffness: 420, damping: 18 }}>
            <Button onClick={handleSearch} data-testid="button-search-majors">
              <Search className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="select-category">
            <SelectValue placeholder="学科门类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部门类</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="sm" onClick={reset} data-testid="button-reset">重置</Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </motion.div>
        ) : data ? (
          <motion.div
            key={`${page}-${category}-${search}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-sm text-muted-foreground mb-4">共 <strong>{data.total}</strong> 个专业</p>
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              {data.items.map((major) => (
                <motion.div key={major.code} variants={cardVariant}>
                  <motion.div
                    whileHover={{ y: -3, boxShadow: "0 6px 24px rgba(0,0,0,0.09)" }}
                    transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  >
                    <Card className="hover:border-primary/50 transition-colors h-full" data-testid={`major-card-${major.code}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-sm leading-snug">{major.name}</h3>
                          <span className="shrink-0 text-xs text-muted-foreground font-mono">{major.code}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">{major.category}</Badge>
                          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${DEGREE_COLORS[major.degree] ?? "bg-muted text-muted-foreground"}`}>
                            {major.degree}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          <span>学制 {major.years} 年</span>
                          {major.employment_rate && (
                            <>
                              <span>·</span>
                              <span>就业率 {major.employment_rate}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {data.totalPages > 1 && (
              <motion.div
                className="flex items-center justify-center gap-3 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} data-testid="button-prev-page">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </motion.div>
                <span className="text-sm text-muted-foreground">第 {page} / {data.totalPages} 页</span>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}>
                  <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} data-testid="button-next-page">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.main>
  );
}
