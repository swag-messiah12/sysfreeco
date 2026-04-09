"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, MapPin, Scan, Shield, Leaf, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

// ─── Static data shown on landing page ────────────────────────────────────────
const STATS = [
  { value: "13+", label: "Restaurants scanned" },
  { value: "7",   label: "Likely independent" },
  { value: "50+", label: "Sourcing signals" },
  { value: "3",   label: "Cities covered" },
];

const HOW_IT_WORKS = [
  {
    icon: Scan,
    step: "01",
    title: "Website scanning",
    desc: "We scrape restaurant websites and about pages, extracting all visible text for analysis.",
  },
  {
    icon: Leaf,
    step: "02",
    title: "Signal detection",
    desc: "50+ regex patterns detect local sourcing language, farm names, and supplier mentions.",
  },
  {
    icon: Shield,
    step: "03",
    title: "sysFREEco score",
    desc: "Each signal adds or subtracts from a score. Franchise keywords trigger a hard penalty.",
  },
];

const FEATURED = [
  { name: "Earth to Table: Bread Bar", city: "Hamilton", score: 14, tag: "Pfenning, Kawartha Dairy" },
  { name: "Langdon Hall",               city: "Cambridge", score: 15, tag: "Monforte, Mariposa Farm" },
  { name: "Actinolite",                 city: "Toronto",   score: 12, tag: "100km Foods" },
];

const SCORE_LEGEND = [
  { color: "#22c55e", label: "≥10 Very Likely Independent" },
  { color: "#eab308", label: "5–9 Probably Independent" },
  { color: "#f97316", label: "1–4 Some Signals" },
  { color: "#9ca3af", label: "0 No Data" },
  { color: "#ef4444", label: "≤-3 Likely Sysco / Chain" },
];

// ─── Floating orbs (decorative) ───────────────────────────────────────────────
const ORBS = [
  { color: "#22c55e", x: "10%",  y: "20%", size: 280, delay: 0 },
  { color: "#eab308", x: "70%",  y: "10%", size: 200, delay: 1.5 },
  { color: "#f97316", x: "80%",  y: "60%", size: 160, delay: 0.8 },
  { color: "#ef4444", x: "15%",  y: "70%", size: 120, delay: 2 },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* ─── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden flex-1 flex items-center min-h-[85vh]">
        {/* Background orbs */}
        {ORBS.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: orb.x,
              top: orb.y,
              width: orb.size,
              height: orb.size,
              background: orb.color,
              filter: "blur(100px)",
              opacity: 0.07,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.07, 0.1, 0.07] }}
            transition={{ duration: 6, delay: orb.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(oklch(1 0 0 / 3%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 3%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-screen-xl mx-auto px-4 py-24 w-full">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="max-w-3xl"
          >
            {/* Eyebrow */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Toronto · Hamilton · GTA
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] text-zinc-100"
            >
              Find restaurants that{" "}
              <span className="text-emerald-400">actually know</span>
              {" "}their farmers.
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-zinc-400 max-w-xl leading-relaxed"
            >
              Sysco controls a third of North American restaurant supply. sysFREEco
              scans restaurant websites and scores them on independent sourcing signals
              — so you can eat with your values.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mt-8">
              <Link href="/explore">
                <Button
                  size="lg"
                  className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
                >
                  <MapPin size={16} />
                  Explore the map
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/submit">
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-white/12 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white/20"
                >
                  Submit a restaurant
                </Button>
              </Link>
            </motion.div>

            {/* Legend pills */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mt-10">
              {SCORE_LEGEND.map(({ color, label }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-zinc-400 bg-white/4 border border-white/8"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  {label}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-y border-white/8 bg-white/2">
        <div className="max-w-screen-xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-emerald-400">{value}</p>
              <p className="text-xs text-zinc-500 mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── How it works ──────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-xs text-emerald-400 font-medium tracking-widest uppercase mb-3">
              How it works
            </p>
            <h2 className="text-3xl font-bold text-zinc-100">
              Powered by your Python scanner
            </h2>
            <p className="text-zinc-500 mt-3 max-w-md mx-auto">
              The web app is the face. The CLI tool you built is the engine.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="glass-card rounded-2xl p-6 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/15 transition-colors">
                    <Icon size={18} className="text-emerald-400" />
                  </div>
                  <span className="text-3xl font-bold text-white/6 font-mono">{step}</span>
                </div>
                <h3 className="font-semibold text-zinc-200 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured restaurants ──────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t border-white/8">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-emerald-400 font-medium tracking-widest uppercase mb-2">
                Top picks
              </p>
              <h2 className="text-2xl font-bold text-zinc-100">Highest scoring right now</h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="gap-1 text-zinc-400 hover:text-zinc-200">
                View all <ChevronRight size={14} />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {FEATURED.map(({ name, city, score, tag }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href="/explore">
                  <div className="glass-card rounded-2xl p-5 hover:border-emerald-500/30 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors leading-tight">
                          {name}
                        </p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-zinc-500">
                          <MapPin size={10} />
                          {city}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Star size={12} className="fill-emerald-400 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">+{score}</span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Leaf size={10} className="text-emerald-500" />
                      {tag}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA banner ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card rounded-3xl p-10 border border-emerald-500/20 bg-emerald-500/5"
        >
          <p className="text-3xl font-bold text-zinc-100 mb-3">
            Know a spot we&apos;re missing?
          </p>
          <p className="text-zinc-500 mb-7 text-sm">
            Help the community grow. Submit a restaurant and our scanner will check it out.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/submit">
              <Button
                size="lg"
                className="gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/20"
              >
                Submit a restaurant
                <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="border-white/12 text-zinc-300 hover:bg-white/5">
                Browse the map
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
