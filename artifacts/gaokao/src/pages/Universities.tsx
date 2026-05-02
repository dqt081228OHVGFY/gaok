import { useState } from "react";
import { Link } from "wouter";
import { Search, SlidersHorizontal, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListUniversities, useListUniversityTypes } from "@workspace/api-client-react";

const TAG_COLORS: Record<string, string> = {
  "985": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "211": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "双一流A": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "双一流B": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "教育部直属": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_COLORS[tag] ?? "bg-muted text-muted-foreground";
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${cls}`}>{tag}</span>;
}

const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","内蒙古","广西","西藏","宁夏","新疆"];

export default function Universities() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [province, setProvince] = useState("all");
  const [type, setType] = useState("all");
  const [tag, setTag] = useState("all");
  const [sortBy, setSortBy] = useState<"rank_soft" | "rank_qs" | "name" | "established">("rank_soft");
  const [page, setPage] = useState(1);
  const pageSize = 18;

  const { data: filtersData } = useListUniversityTypes();
  const types = filtersData?.types ?? [];
  const tags = filtersData?.tags?.filter(t => ["985","211","双一流A","双一流B","教育部直属"].includes(t)) ?? [];

  const { data, isLoading } = useListUniversities({
    search: search || undefined,
    province: province !== "all" ? province : undefined,
    type: type !== "all" ? type : undefined,
    tag: tag !== "all" ? tag : undefined,
    sortBy,
    page,
    pageSize,
  });

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function resetFilters() {
    setSearch(""); setSearchInput(""); setProvince("all"); setType("all"); setTag("all"); setSortBy("rank_soft"); setPage(1);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">高校库</h1>
        <p className="text-muted-foreground text-sm">收录全国258所重点高校，含985、211、双一流详细信息</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="搜索高校名称或城市..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
            data-testid="input-search-universities"
          />
          <Button onClick={handleSearch} data-testid="button-search-universities">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={province} onValueChange={(v) => { setProvince(v); setPage(1); }}>
            <SelectTrigger className="w-28" data-testid="select-province">
              <SelectValue placeholder="省份" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部省份</SelectItem>
              {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger className="w-28" data-testid="select-type">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={tag} onValueChange={(v) => { setTag(v); setPage(1); }}>
            <SelectTrigger className="w-28" data-testid="select-tag">
              <SelectValue placeholder="层次" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部层次</SelectItem>
              {tags.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
            <SelectTrigger className="w-32" data-testid="select-sortby">
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank_soft">软科排名</SelectItem>
              <SelectItem value="rank_qs">QS排名</SelectItem>
              <SelectItem value="name">名称</SelectItem>
              <SelectItem value="established">建校年份</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="sm" onClick={resetFilters} data-testid="button-reset-filters">重置</Button>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">共找到 <strong>{data.total}</strong> 所院校</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((uni) => (
              <Link key={uni.id} href={`/universities/${uni.id}`}>
                <Card className="h-full cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" data-testid={`uni-card-${uni.id}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">{uni.name}</h3>
                      {uni.rank_soft ? (
                        <span className="shrink-0 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{uni.rank_soft}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      <span>{uni.province} · {uni.city}</span>
                      <span className="mx-1">·</span>
                      <span>{uni.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {uni.tags?.slice(0, 4).map((t) => (
                        <TagBadge key={t} tag={t} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
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
