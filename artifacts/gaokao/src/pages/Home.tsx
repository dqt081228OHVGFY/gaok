import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, GraduationCap, BookOpen, BarChart3, TrendingUp, Award, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetStats, useListProvinces } from "@workspace/api-client-react";

const CHINA_PROVINCES = [
  "北京","天津","上海","重庆","河北","山西","辽宁","吉林","黑龙江",
  "江苏","浙江","安徽","福建","江西","山东","河南","湖北","湖南",
  "广东","海南","四川","贵州","云南","陕西","甘肃","青海","内蒙古",
  "广西","西藏","宁夏","新疆"
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const statVariant = {
  hidden: { opacity: 0, scale: 0.7 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function Home() {
  const [, setLocation] = useLocation();
  const [score, setScore] = useState("");
  const [province, setProvince] = useState("");

  const { data: stats } = useGetStats();
  const { data: provincesData } = useListProvinces();
  const provinces = provincesData?.provinces ?? CHINA_PROVINCES;

  function handleQuery() {
    if (!score || !province) return;
    setLocation(`/score-query?score=${score}&province=${encodeURIComponent(province)}`);
  }

  const features = [
    { icon: Search, title: "智能分数匹配", desc: "输入分数和省份，智能匹配适合你的院校，按冲刺/稳妥/保底分类展示", href: "/score-query" },
    { icon: GraduationCap, title: "全国高校库", desc: "258所重点高校完整信息，含985、211、双一流详细资料和历年录取数据", href: "/universities" },
    { icon: BookOpen, title: "专业大全", desc: "240个本科专业分类查询，了解学制、学位、就业方向等关键信息", href: "/majors" },
    { icon: BarChart3, title: "各省控制线", desc: "2020-2024年全国31省市高考控制分数线（一本/二本/专科）", href: "/control-scores" },
  ];

  return (
    <main>
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/30 py-16 px-4 overflow-hidden">
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
        >
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </motion.div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-4 text-sm px-3 py-1">
              2024年高考志愿填报参考数据
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            高考志愿填报平台
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            涵盖全国258所重点高校、31省历年录取分数线、240个本科专业，助你科学填报志愿
          </motion.p>

          <motion.div
            className="bg-card border rounded-2xl p-6 shadow-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-testid="hero-query-form"
          >
            <h2 className="text-base font-semibold text-foreground mb-4 text-left">快速查询可报院校</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="number"
                placeholder="输入高考分数"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
                className="flex-1 text-lg h-11"
                min={0}
                max={750}
                data-testid="input-score"
              />
              <Select value={province} onValueChange={setProvince} data-testid="select-province">
                <SelectTrigger className="sm:w-36 h-11">
                  <SelectValue placeholder="选择省份" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p) => (
                    <SelectItem key={p} value={p} data-testid={`province-option-${p}`}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
              >
                <Button
                  className="h-11 px-6 text-base w-full sm:w-auto"
                  onClick={handleQuery}
                  disabled={!score || !province}
                  data-testid="button-query"
                >
                  查询 <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {stats && (
        <section className="border-y bg-card py-8 px-4">
          <motion.div
            className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[
              { label: "收录高校", value: stats.universities, suffix: "所", icon: GraduationCap },
              { label: "985院校", value: stats.count985, suffix: "所", icon: Award },
              { label: "211院校", value: stats.count211, suffix: "所", icon: TrendingUp },
              { label: "覆盖省份", value: stats.provinces, suffix: "个", icon: MapPin },
            ].map(({ label, value, suffix, icon: Icon }) => (
              <motion.div
                key={label}
                className="flex flex-col items-center gap-1"
                variants={statVariant}
                data-testid={`stat-${label}`}
              >
                <Icon className="h-5 w-5 text-primary mb-1" />
                <span className="text-3xl font-bold text-primary">
                  {value}
                  <span className="text-base font-normal text-muted-foreground ml-0.5">{suffix}</span>
                </span>
                <span className="text-sm text-muted-foreground">{label}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold mb-2">平台功能</h2>
            <p className="text-center text-muted-foreground">科学填报，从了解数据开始</p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
          >
            {features.map(({ icon: Icon, title, desc, href }) => (
              <motion.div key={href} variants={itemVariant}>
                <Link href={href}>
                  <Card className="h-full cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group" data-testid={`feature-card-${title}`}>
                    <CardContent className="p-6 flex gap-4">
                      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-base mb-1">{title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-4 bg-primary/5 border-t">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55 }}
        >
          <h2 className="text-2xl font-bold mb-3">开始你的志愿填报之旅</h2>
          <p className="text-muted-foreground mb-6">数据涵盖2020-2024年历年录取分数线，参考价值高</p>
          <div className="flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
              <Link href="/score-query">
                <Button size="lg" data-testid="cta-score-query">分数查询院校</Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 18 }}>
              <Link href="/universities">
                <Button variant="outline" size="lg" data-testid="cta-universities">浏览全国高校</Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
