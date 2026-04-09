"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import RestaurantCard from "@/components/restaurant-card";
import RestaurantDetailSheet from "@/components/restaurant-detail-sheet";
import ScoreBadge from "@/components/score-badge";
import AdBanner from "@/components/ad-banner";
import { SidebarSkeleton, MapSkeleton } from "@/components/skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Restaurant, FilterState, VerdictFilter, CityFilter } from "@/lib/types";
import { filterRestaurants, sortByScore } from "@/lib/restaurant-utils";
import rawData from "@/data/restaurants.json";

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

const ALL_RESTAURANTS = sortByScore(rawData as Restaurant[]);

const VERDICT_TABS: { value: VerdictFilter; label: string; score: number }[] = [
  { value: "all",         label: "All",         score: 999  },
  { value: "independent", label: "Independent", score: 10   },
  { value: "signals",     label: "Signals",     score: 1    },
  { value: "nodata",      label: "No Data",     score: 0    },
  { value: "sysco",       label: "Sysco",       score: -5   },
];

const CITIES: { value: CityFilter; label: string }[] = [
  { value: "all",          label: "All Canada" },
  { value: "Toronto",      label: "Toronto" },
  { value: "Hamilton",     label: "Hamilton" },
  { value: "Ottawa",       label: "Ottawa" },
  { value: "Vancouver",    label: "Vancouver" },
  { value: "Calgary",      label: "Calgary" },
  { value: "Edmonton",     label: "Edmonton" },
  { value: "Montreal",     label: "Montréal" },
  { value: "Quebec City",  label: "Québec City" },
  { value: "Winnipeg",     label: "Winnipeg" },
  { value: "Halifax",      label: "Halifax" },
  { value: "Victoria",     label: "Victoria" },
];

export default function ExplorePage() {
  const [mounted, setMounted] = useState(false);
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

  useEffect(() => { setMounted(true); }, []);

  const handleSelect = useCallback((r: Restaurant) => {
    setSelected((prev) => (prev?.name === r.name ? null : r));
  }, []);

  const clearSearch = () => setFilters((f) => ({ ...f, search: "" }));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f5f5f7]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Sidebar ──────────────────────────────────────────────── */}
        <aside className="w-[360px] shrink-0 flex flex-col border-r border-zinc-200 bg-white overflow-hidden shadow-sm">
          {/* Search + filter toggle */}
          <div className="p-3 border-b border-zinc-100 space-y-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <Input
                placeholder="Search restaurants, signals..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value }))
                }
                className="pl-8 pr-8 bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-500/40 text-sm"
              />
              <AnimatePresence>
                {filters.search && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
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
                className={`gap-1.5 text-xs shrink-0 ${showFilters ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"}`}
              >
                <SlidersHorizontal size={12} />
                Filters
              </Button>

              {/* City pills */}
              <div className="flex gap-1 overflow-x-auto scrollbar-none">
                {CITIES.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setFilters((f) => ({ ...f, city: value }))}
                    className={`shrink-0 px-2 py-1 rounded-md text-xs transition-colors ${
                      filters.city === value
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                    }`}
                  >
                    {label}
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
                            ? "bg-zinc-900 text-white border border-zinc-900"
                            : "text-zinc-500 hover:text-zinc-800 border border-zinc-200"
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
          <div className="px-3 py-1.5 border-b border-zinc-100 flex items-center justify-between">
            <span className="text-xs text-zinc-500">
              {filtered.length} restaurant{filtered.length !== 1 ? "s" : ""}
            </span>
            <span className="text-xs text-zinc-400">sorted by indie score</span>
          </div>

          {/* Restaurant list */}
          <div className="flex-1 overflow-y-auto">
            {!mounted ? (
              <SidebarSkeleton count={5} />
            ) : (
              <div className="p-2.5 space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {filtered.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 text-zinc-400 text-sm"
                    >
                      No restaurants match your filters.
                    </motion.div>
                  ) : (
                    filtered.map((r, i) => (
                      <div key={r.name}>
                        <RestaurantCard
                          restaurant={r}
                          selected={selected?.name === r.name}
                          onClick={() => handleSelect(r)}
                          index={i}
                        />
                        {/* Ad slot after the 4th card */}
                        {i === 3 && (
                          <AdBanner
                            slot="sidebar-mid"
                            className="mt-1.5 h-[100px]"
                          />
                        )}
                      </div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Bottom ad + legend */}
          <div className="border-t border-zinc-100 bg-white">
            {/* Leaderboard ad */}
            <AdBanner
              slot="sidebar-bottom"
              format="rectangle"
              className="h-[90px] border-b border-zinc-100"
            />

            {/* Legend */}
            <div className="p-3">
              <p className="text-xs text-zinc-500 font-semibold mb-2">Score legend</p>
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
                    <span className="text-xs text-zinc-500">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Map ──────────────────────────────────────────────────── */}
        <main className="flex-1 relative">
          <MapView
            restaurants={filtered}
            selected={selected}
            onSelect={handleSelect}
            city={filters.city}
          />

          {/* Tip overlay */}
          <AnimatePresence>
            {!selected && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl shadow-md border border-black/8 px-3 py-2 text-xs text-zinc-500 z-[1000] pointer-events-none"
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
