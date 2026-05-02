import { useState } from "react";
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
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
          <Button onClick={handleSearch} data-testid="button-search-majors">
            <Search className="h-4 w-4" />
          </Button>
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

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : data ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">共 <strong>{data.total}</strong> 个专业</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((major) => (
              <Card key={major.code} className="hover:border-primary/50 hover:shadow-sm transition-all" data-testid={`major-card-${major.code}`}>
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
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} data-testid="button-prev-page">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">第 {page} / {data.totalPages} 页</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages} data-testid="button-next-page">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : null}
    </main>
  );
}
