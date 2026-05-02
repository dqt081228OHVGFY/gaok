import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, BookOpen, BarChart3, ListFilter, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "首页", icon: GraduationCap },
  { href: "/score-query", label: "分数查询", icon: Search },
  { href: "/universities", label: "高校库", icon: BookOpen },
  { href: "/majors", label: "专业库", icon: ListFilter },
  { href: "/control-scores", label: "控制线", icon: BarChart3 },
];

export default function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="h-6 w-6" />
          </motion.div>
          <span>高考志愿</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {navItems.map(({ href, label }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href} data-testid={`nav-link-${label}`}>
                <motion.div
                  className={`relative px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {active && (
                    <motion.div
                      className="absolute inset-0 bg-primary rounded-md"
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="nav-mobile-toggle"
        >
          <motion.div
            animate={{ rotate: mobileOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.div>
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden border-t bg-card px-4 py-3 space-y-1"
            data-testid="nav-mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {navItems.map(({ href, label, icon: Icon }, i) => {
              const active = href === "/" ? location === "/" : location.startsWith(href);
              return (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    data-testid={`nav-mobile-link-${label}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
