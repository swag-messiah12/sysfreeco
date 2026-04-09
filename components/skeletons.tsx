"use client";

import { cn } from "@/lib/utils";

// ─── Base shimmer ────────────────────────────────────────────────────────────
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded bg-zinc-200/80 animate-pulse",
        className
      )}
    />
  );
}

// ─── Single restaurant card skeleton ─────────────────────────────────────────
export function RestaurantCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3.5 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <Shimmer className="h-4 w-3/4" />
          <Shimmer className="h-3 w-1/2" />
        </div>
        <Shimmer className="h-4 w-4 rounded mt-0.5 shrink-0" />
      </div>
      {/* Badge row */}
      <div className="flex items-center gap-2">
        <Shimmer className="h-5 w-28 rounded-full" />
        <Shimmer className="h-3 w-12 ml-auto" />
      </div>
      {/* Signal tags */}
      <div className="flex gap-1.5">
        <Shimmer className="h-5 w-16 rounded" />
        <Shimmer className="h-5 w-20 rounded" />
        <Shimmer className="h-5 w-14 rounded" />
      </div>
    </div>
  );
}

// ─── Sidebar list of card skeletons ──────────────────────────────────────────
export function SidebarSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="p-2.5 space-y-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ─── Map placeholder skeleton ─────────────────────────────────────────────────
export function MapSkeleton() {
  return (
    <div className="w-full h-full bg-[#e8ecf1] flex items-center justify-center relative overflow-hidden">
      {/* Fake grid lines */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Fake pins */}
      {[
        { top: "35%", left: "55%", color: "#22c55e", size: 14 },
        { top: "42%", left: "48%", color: "#eab308", size: 11 },
        { top: "28%", left: "60%", color: "#22c55e", size: 12 },
        { top: "50%", left: "44%", color: "#f97316", size: 10 },
        { top: "38%", left: "65%", color: "#22c55e", size: 13 },
        { top: "60%", left: "50%", color: "#ef4444", size: 10 },
        { top: "30%", left: "40%", color: "#9ca3af", size: 9  },
      ].map(({ top, left, color, size }, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            top,
            left,
            width: size,
            height: size,
            background: color,
            opacity: 0.6,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      {/* Loading label */}
      <div className="relative flex flex-col items-center gap-3 z-10">
        <div className="flex gap-1.5">
          {["#22c55e", "#eab308", "#f97316"].map((c, i) => (
            <span
              key={c}
              className="w-2.5 h-2.5 rounded-full animate-bounce"
              style={{ background: c, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-xs text-zinc-500 font-medium">Loading map…</p>
      </div>
    </div>
  );
}

// ─── Hero stat skeleton ───────────────────────────────────────────────────────
export function StatSkeleton() {
  return (
    <div className="text-center space-y-2">
      <Shimmer className="h-8 w-14 mx-auto rounded" />
      <Shimmer className="h-3 w-24 mx-auto rounded" />
    </div>
  );
}
