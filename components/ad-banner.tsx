"use client";

import { useEffect } from "react";

interface Props {
  slot: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
  label?: string;
}

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdBanner({
  slot,
  format = "auto",
  className = "",
  label = "Advertisement",
}: Props) {
  useEffect(() => {
    if (!CLIENT) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch {
      // AdSense not loaded yet — safe to ignore
    }
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <p className="absolute top-1.5 left-1/2 -translate-x-1/2 text-[9px] font-medium tracking-widest text-zinc-400 uppercase z-10 pointer-events-none">
        {label}
      </p>

      {CLIENT ? (
        /* Real AdSense unit — shown in production once CLIENT is set */
        <ins
          className="adsbygoogle block"
          style={{ display: "block" }}
          data-ad-client={CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      ) : (
        /* Dev placeholder — looks like an ad slot so layout is visible */
        <div className="flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 rounded-xl h-full min-h-[100px] text-zinc-400">
          <div className="text-center">
            <p className="text-xs font-medium text-zinc-500">Ad Slot</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">Set NEXT_PUBLIC_ADSENSE_CLIENT to activate</p>
          </div>
        </div>
      )}
    </div>
  );
}
