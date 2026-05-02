import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useListControlScores } from "@workspace/api-client-react";

const PROVINCES = ["北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江","江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南","广东","海南","四川","贵州","云南","陕西","甘肃","青海","内蒙古","广西","西藏","宁夏","新疆"];

const BATCH_COLORS: Record<string, string> = {
  "一本": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "本科": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "二本": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "专科": "bg-muted text-muted-foreground",
};

const cardVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const rowVariant = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
};

const provinceCardVariant = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export default function ControlScores() {
  const [province, setProvince] = useState("all");
  const [year, setYear] = useState("2024");
  const [subjects, setSubjects] = useState("all");

  const { data, isLoading } = useListControlScores({
    province: province !== "all" ? province : undefined,
    year: year !== "all" ? parseInt(year) : undefined,
    subjects: subjects !== "all" ? subjects : undefined,
  });

  const items = data?.items ?? [];

  const groupedByProvince = items.reduce((acc: Record<string, any[]>, item: any) => {
    if (!acc[item.province]) acc[item.province] = [];
    acc[item.province].push(item);
    return acc;
  }, {});

  return (
    <motion.main
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">各省控制线</h1>
        <p className="text-sm text-muted-foreground">2020-2024年全国31省市高考录取控制分数线</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-28" data-testid="select-year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部年份</SelectItem>
            {[2024,2023,2022,2021,2020].map(y => <SelectItem key={y} value={String(y)}>{y}年</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={province} onValueChange={setProvince}>
          <SelectTrigger className="w-32" data-testid="select-province">
            <SelectValue placeholder="省份" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部省份</SelectItem>
            {PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={subjects} onValueChange={setSubjects}>
          <SelectTrigger className="w-32" data-testid="select-subjects">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部科类</SelectItem>
            <SelectItem value="综合">综合（新高考）</SelectItem>
            <SelectItem value="理科">理科</SelectItem>
            <SelectItem value="文科">文科</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </motion.div>
        ) : items.length === 0 ? (
          <motion.div
            key="empty"
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>暂无该条件下的数据</p>
          </motion.div>
        ) : province !== "all" ? (
          <motion.div
            key={`single-${province}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{province} · {year !== "all" ? year + "年" : "历年"} 控制线</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>年份</TableHead>
                        <TableHead>批次</TableHead>
                        <TableHead>科类</TableHead>
                        <TableHead className="text-right">控制线分数</TableHead>
                      </TableRow>
                    </TableHeader>
                    <motion.tbody variants={cardVariants} initial="hidden" animate="show">
                      {items.map((item: any, i: number) => (
                        <motion.tr
                          key={i}
                          variants={rowVariant}
                          className="border-b transition-colors hover:bg-muted/50"
                          data-testid={`control-row-${i}`}
                        >
                          <TableCell className="font-medium">{item.year}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${BATCH_COLORS[item.batch] ?? "bg-muted text-muted-foreground"}`}>
                              {item.batch}
                            </span>
                          </TableCell>
                          <TableCell>{item.subjects}</TableCell>
                          <TableCell className="text-right font-bold text-primary text-lg">{item.score}</TableCell>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key={`all-${year}-${subjects}`}
            className="space-y-4"
            variants={cardVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
          >
            {Object.entries(groupedByProvince)
              .sort(([a], [b]) => a.localeCompare(b, "zh"))
              .map(([prov, rows]) => (
                <motion.div key={prov} variants={provinceCardVariant} data-testid={`province-card-${prov}`}>
                  <Card>
                    <CardHeader className="pb-2 pt-4 px-5">
                      <CardTitle className="text-sm font-semibold">{prov}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="pl-5">批次</TableHead>
                              <TableHead>科类</TableHead>
                              <TableHead className="text-right pr-5">分数线</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(rows as any[]).map((item: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="pl-5">
                                  <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${BATCH_COLORS[item.batch] ?? "bg-muted text-muted-foreground"}`}>
                                    {item.batch}
                                  </span>
                                </TableCell>
                                <TableCell>{item.subjects}</TableCell>
                                <TableCell className="text-right pr-5 font-bold text-primary">{item.score}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
