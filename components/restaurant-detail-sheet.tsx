"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Star, ExternalLink, CheckCircle, XCircle, Leaf } from "lucide-react";
import { Restaurant } from "@/lib/types";
import ScoreBadge from "./score-badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface Props {
  restaurant: Restaurant | null;
  onClose: () => void;
}

export default function RestaurantDetailSheet({ restaurant: r, onClose }: Props) {
  return (
    <AnimatePresence>
      {r && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white border-l border-zinc-200 overflow-y-auto shadow-2xl shadow-black/10"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-zinc-100 px-5 py-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base text-zinc-900 leading-tight">{r.name}</h2>
                <div className="flex items-center gap-1 mt-1 text-zinc-400 text-xs">
                  <MapPin size={11} />
                  <span>{r.address}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 -mt-1 h-8 w-8 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
              >
                <X size={16} />
              </Button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-5">
              {/* Score */}
              <div className="flex items-center gap-3">
                <ScoreBadge score={r.indie_score} showScore size="lg" />
                {r.rating && (
                  <span className="flex items-center gap-1 text-sm text-zinc-500">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    {r.rating} / 5
                  </span>
                )}
                {r.verified && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Verified
                  </span>
                )}
              </div>

              {/* Website */}
              {r.website && (
                <a
                  href={r.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <ExternalLink size={14} />
                  Visit website
                </a>
              )}

              <Separator className="border-zinc-100" />

              {/* Known suppliers */}
              {r.supplier_hits.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Known Local Suppliers
                  </h3>
                  <ul className="space-y-1.5">
                    {r.supplier_hits.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-sm text-emerald-700">
                        <Leaf size={13} className="shrink-0 text-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Positive signals */}
              {r.positive_hits.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Positive Signals
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {r.positive_hits.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        <CheckCircle size={10} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negative signals */}
              {r.negative_hits.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Red Flags
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {r.negative_hits.map((s) => (
                      <span
                        key={s}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-red-50 text-red-600 border border-red-200"
                      >
                        <XCircle size={10} />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Data sources */}
              {r.data_sources.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Data Sources
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {r.data_sources.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-zinc-100 text-zinc-500 border border-zinc-200">
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* No data state */}
              {r.positive_hits.length === 0 &&
                r.negative_hits.length === 0 &&
                r.supplier_hits.length === 0 && (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-center">
                    <p className="text-sm text-zinc-500">
                      No sourcing data found yet.
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Know something about this restaurant?{" "}
                      <a href="/submit" className="text-emerald-600 hover:underline">
                        Submit info →
                      </a>
                    </p>
                  </div>
                )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
