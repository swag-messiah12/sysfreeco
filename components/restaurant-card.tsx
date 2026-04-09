"use client";

import { motion } from "framer-motion";
import { MapPin, Star, ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Restaurant } from "@/lib/types";
import ScoreBadge from "./score-badge";

interface Props {
  restaurant: Restaurant;
  selected: boolean;
  onClick: () => void;
  index?: number;
}

export default function RestaurantCard({
  restaurant: r,
  selected,
  onClick,
  index = 0,
}: Props) {
  const topSignals = [...r.supplier_hits, ...r.positive_hits].slice(0, 3);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-xl border transition-all duration-200 group",
        selected
          ? "border-emerald-300 shadow-md shadow-emerald-100 bg-emerald-50/60"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm"
      )}
    >
      <div className="p-3.5">
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-sm truncate leading-snug transition-colors",
              selected ? "text-emerald-700" : "text-zinc-900 group-hover:text-zinc-950"
            )}>
              {r.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-zinc-400 text-xs">
              <MapPin size={10} className="shrink-0" />
              <span className="truncate">{r.city} · {r.address.split(",")[0]}</span>
            </div>
          </div>
          <ChevronRight
            size={14}
            className={cn(
              "shrink-0 mt-0.5 transition-all",
              selected ? "text-emerald-500 translate-x-0.5" : "text-zinc-300 group-hover:text-zinc-500"
            )}
          />
        </div>

        {/* Badge + rating */}
        <div className="flex items-center gap-2 mt-2.5">
          <ScoreBadge score={r.indie_score} showScore />
          {r.rating && (
            <span className="flex items-center gap-1 text-xs text-zinc-400 ml-auto">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              {r.rating}
            </span>
          )}
        </div>

        {/* Signals */}
        {topSignals.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {topSignals.map((s) => (
              <span
                key={s}
                className={cn(
                  "px-1.5 py-0.5 rounded text-xs",
                  r.supplier_hits.includes(s)
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                )}
              >
                {r.supplier_hits.includes(s) ? "🧑‍🌾 " : ""}{s}
              </span>
            ))}
          </div>
        )}

        {/* Negative signals */}
        {r.negative_hits.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {r.negative_hits.slice(0, 2).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded text-xs bg-red-50 text-red-600 border border-red-100">
                ⚠ {s}
              </span>
            ))}
          </div>
        )}

        {/* Website */}
        {r.website && (
          <a
            href={r.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 mt-2 text-xs text-zinc-400 hover:text-emerald-600 transition-colors"
          >
            <ExternalLink size={10} />
            <span className="truncate">{r.website.replace(/^https?:\/\//, "")}</span>
          </a>
        )}
      </div>
    </motion.button>
  );
}
