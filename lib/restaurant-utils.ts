import { Restaurant, FilterState } from "./types";

export interface VerdictBadge {
  label: string;
  shortLabel: string;
  bg: string;
  text: string;
  border: string;
  dotColor: string;   // Tailwind class
  mapColor: string;   // Hex for Leaflet
  emoji: string;
}

export function getVerdictBadge(score: number): VerdictBadge {
  if (score >= 10)
    return {
      label: "Very Likely Independent",
      shortLabel: "Independent",
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      dotColor: "bg-emerald-500",
      mapColor: "#22c55e",
      emoji: "🟢",
    };

  if (score >= 5)
    return {
      label: "Probably Independent",
      shortLabel: "Probably Independent",
      bg: "bg-yellow-500/15",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      dotColor: "bg-yellow-400",
      mapColor: "#eab308",
      emoji: "🟡",
    };

  if (score >= 1)
    return {
      label: "Some Signals",
      shortLabel: "Some Signals",
      bg: "bg-orange-500/15",
      text: "text-orange-400",
      border: "border-orange-500/30",
      dotColor: "bg-orange-400",
      mapColor: "#f97316",
      emoji: "🟠",
    };

  if (score <= -3)
    return {
      label: "Likely Sysco / Chain",
      shortLabel: "Likely Sysco",
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
      dotColor: "bg-red-500",
      mapColor: "#ef4444",
      emoji: "🔴",
    };

  return {
    label: "No Data",
    shortLabel: "No Data",
    bg: "bg-white/5",
    text: "text-zinc-400",
    border: "border-white/10",
    dotColor: "bg-zinc-500",
    mapColor: "#6b7280",
    emoji: "⚪",
  };
}

export function filterRestaurants(
  restaurants: Restaurant[],
  filters: FilterState
): Restaurant[] {
  return restaurants.filter((r) => {
    // City filter
    if (filters.city !== "all" && r.city !== filters.city) return false;

    // Verdict filter
    if (filters.verdict === "independent" && r.indie_score < 5) return false;
    if (
      filters.verdict === "signals" &&
      (r.indie_score < 1 || r.indie_score >= 5)
    )
      return false;
    if (
      filters.verdict === "nodata" &&
      (r.indie_score < -2 || r.indie_score > 0)
    )
      return false;
    if (filters.verdict === "sysco" && r.indie_score > -3) return false;

    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack =
        `${r.name} ${r.address} ${r.city} ${r.positive_hits.join(" ")} ${r.supplier_hits.join(" ")}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function sortByScore(restaurants: Restaurant[]): Restaurant[] {
  return [...restaurants].sort((a, b) => b.indie_score - a.indie_score);
}

export function getStats(restaurants: Restaurant[]) {
  const total = restaurants.length;
  const independent = restaurants.filter((r) => r.indie_score >= 5).length;
  const sysco = restaurants.filter((r) => r.indie_score <= -3).length;
  const cities = new Set(restaurants.map((r) => r.city)).size;
  return { total, independent, sysco, cities };
}
