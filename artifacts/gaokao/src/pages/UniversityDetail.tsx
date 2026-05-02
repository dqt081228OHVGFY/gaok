import { useParams, Link } from "wouter";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import {
  useGetUniversity,
  useGetUniversityScores,
  getGetUniversityQueryKey,
  getGetUniversityScoresQueryKey,
} from "@workspace/api-client-react";

const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","内蒙古","广西","西藏","宁夏","新疆"];

const TAG_COLORS: Record<string, string> = {
  "985": "bg-red-100 text-red-700",
  "211": "bg-orange-100 text-orange-700",
  "双一流A": "bg-purple-100 text-purple-700",
  "双一流B": "bg-blue-100 text-blue-700",
  "教育部直属": "bg-green-100 text-green-700",
};

export default function UniversityDetail() {
  const { id } = useParams<{ id: string }>();
  const [province, setProvince] = useState("all");
  const [year, setYear] = useState("all");

  const { data: uni, isLoading: uniLoading } = useGetUniversity(id!, {
    query: { enabled: !!id, queryKey: getGetUniversityQueryKey(id!) },
  });

  const scoreParams = {
    province: province !== "all" ? province : undefined,
    year: year !== "all" ? parseInt(year) : undefined,
  };

  const { data: scoresData, isLoading: scoresLoading } = useGetUniversityScores(id!, scoreParams, {
    query: {
      enabled: !!id,
      queryKey: getGetUniversityScoresQueryKey(id!, scoreParams),
    },
  });

  const scores = scoresData?.scores ?? [];
  const years = [...new Set(scores.map((s: any) => s.year))].sort((a, b) => (b as number) - (a as number));

  if (uniLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-48 rounded-xl" />
      </main>
    );
  }

  if (!uni) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-muted-foreground">未找到该院校</p>
        <Link href="/universities">
          <Button variant="ghost" className="mt-4">返回高校库</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/universities">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" data-testid="button-back">
          <ArrowLeft className="h-4 w-4 mr-1" /> 返回高校库
        </Button>
      </Link>

      <Card className="mb-6" data-testid="uni-detail-card">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{uni.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {uni.province} · {uni.city}
                </span>
                <span>{uni.type}类</span>
                {uni.established && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    创办于{uni.established}年
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {uni.tags?.map((t) => (
                  <span key={t} className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${TAG_COLORS[t] ?? "bg-muted text-muted-foreground"}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-6 sm:flex-col sm:gap-2 text-center shrink-0">
              {uni.rank_soft ? (
                <div>
                  <div className="text-2xl font-bold text-primary">#{uni.rank_soft}</div>
                  <div className="text-xs text-muted-foreground">软科排名</div>
                </div>
              ) : null}
              {uni.rank_qs ? (
                <div>
                  <div className="text-lg font-semibold">#{uni.rank_qs}</div>
                  <div className="text-xs text-muted-foreground">QS排名</div>
                </div>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <CardTitle className="text-base">历年录取分数线</CardTitle>
            <div className="flex gap-2">
              <Select value={province} onValueChange={setProvince}>
                <SelectTrigger className="w-32 h-8 text-sm" data-testid="select-score-province">
                  <SelectValue placeholder="省份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部省份</SelectItem>
                  {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-24 h-8 text-sm" data-testid="select-score-year">
                  <SelectValue placeholder="年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部年份</SelectItem>
                  {(years.length > 0 ? years : [2024,2023,2022,2021,2020]).map((y) => (
                    <SelectItem key={y as number} value={String(y)}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {scoresLoading ? (
            <div className="p-6"><Skeleton className="h-32" /></div>
          ) : scores.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">暂无该条件下的录取数据</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>年份</TableHead>
                    <TableHead>省份</TableHead>
                    <TableHead>科类</TableHead>
                    <TableHead>批次</TableHead>
                    <TableHead className="text-right">最低分</TableHead>
                    <TableHead className="text-right">最低位次</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scores.map((s: any, i: number) => (
                    <TableRow key={i} data-testid={`score-row-${i}`}>
                      <TableCell className="font-medium">{s.year}</TableCell>
                      <TableCell>{s.province}</TableCell>
                      <TableCell>{s.subjects}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{s.batch}</Badge></TableCell>
                      <TableCell className="text-right font-semibold text-primary">{s.min_score}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {s.min_rank ? s.min_rank.toLocaleString() : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
