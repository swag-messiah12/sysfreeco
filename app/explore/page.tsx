"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantDetailSheet from "@/components/restaurant-detail-sheet";
import ScoreBadge from "@/components/score-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Restaurant, FilterState, VerdictFilter, CityFilter } from "@/lib/types";
import { filterRestaurants, sortByScore } from "@/lib/restaurant-utils";
import rawData from "@/data/restaurants.json";

const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

const ALL_RESTAURANTS = sortByScore(rawData as Restaurant[]);

const VERDICT_TABS: { value: VerdictFilter; label: string; score: number }[] = [
  { value: "all",         label: "All",         score: 999  },
  { value: "independent", label: "Independent", score: 10   },
  { value: "signals",     label: "Signals",     score: 1    },
  { value: "nodata",      label: "No Data",     score: 0    },
  { value: "sysco",       label: "Sysco",       score: -5   },
];

const CITIES: CityFilter[] = ["all", "Toronto", "Hamilton", "Cambridge"];

export default function ExplorePage() {
  const [selected, setSelected] = useState<Restaurant | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    city: "all",
    verdict: "all",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(
    () => filterRestaurants(ALL_RESTAURANTS, filters),
    [filters]
  );

  const handleSelect = useCallback((r: Restaurant) => {
    setSelected((prev) => (prev?.name === r.name ? null : r));
  }, []);

  const clearSearch = () => setFilters((f) => ({ ...f, search: "" }));

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ──────────────────────────────────────────────── */}
        <aside className="w-[360px] shrink-0 flex flex-col border-r border-white/8 bg-zinc-950/80 backdrop-blur-sm overflow-hidden">
          {/* Search + filter toggle */}
          <div className="p-3 border-b border-white/8 space-y-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <Input
                placeholder="Search restaurants, signals..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="pl-8 pr-8 bg-white/5 border-white/10 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 text-sm"
              />
              <AnimatePresence>
                {filters.search && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X size={13} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className={`gap-1.5 text-xs ${showFilters ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                <SlidersHorizontal size={12} />
                Filters
              </Button>

              {/* City pills */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilters((f) => ({ ...f, city: c }))}
                    className={`shrink-0 px-2 py-1 rounded-md text-xs transition-colors ${
                      filters.city === c
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "text-zinc-500 hover:text-zinc-300 border border-white/8"
                    }`}
                  >
                    {c === "all" ? "All cities" : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Verdict tabs */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-1 pt-1">
                    {VERDICT_TABS.map(({ value, label, score }) => (
                      <button
                        key={value}
                        onClick={() => setFilters((f) => ({ ...f, verdict: value }))}
                        className={`px-2 py-0.5 rounded-md text-xs transition-all ${
                          filters.verdict === value
                            ? "bg-white/10 text-zinc-100 border border-white/20"
                            : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                        }`}
                      >
                        {value === "all" ? "All verdicts" : (
                          <span className="flex items-center gap-1.5">
                            <ScoreBadge score={score === 999 ? 0 : score} size="sm" />
                            {label}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Count bar */}
          <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-zinc-700">sorted by indie score</span>
          </div>

          {/* Restaurant list */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filtered.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16 text-zinc-600 text-sm"
                >
                  No restaurants match your filters.
                </motion.div>
              ) : (
                filtered.map((r, i) => (
                  <RestaurantCard
                    key={r.name}
                    restaurant={r}
                    selected={selected?.name === r.name}
                    onClick={() => handleSelect(r)}
                    index={i}
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className="border-t border-white/8 p-3 bg-zinc-950/60">
            <p className="text-xs text-zinc-600 font-medium mb-2">Score legend</p>
            <div className="grid grid-cols-1 gap-1">
              {[
                { hex: "#22c55e", label: "≥10 Very Likely Independent" },
                { hex: "#eab308", label: "5–9 Probably Independent" },
                { hex: "#f97316", label: "1–4 Some Signals" },
                { hex: "#9ca3af", label: "0 No Data" },
                { hex: "#ef4444", label: "≤-3 Likely Sysco / Chain" },
              ].map(({ hex, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hex }} />
                  <span className="text-xs text-zinc-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ─── Map ──────────────────────────────────────────────────── */}
        <main className="flex-1 relative">
          <MapView
            restaurants={filtered}
            selected={selected}
            onSelect={handleSelect}
          />

          {/* Tip overlay */}
          <AnimatePresence>
            {!selected && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2 text-xs text-zinc-400 z-[1000] pointer-events-none"
              >
                Click a pin or card to view details
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* ─── Detail sheet ─────────────────────────────────────────── */}
      <RestaurantDetailSheet restaurant={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
