"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Utensils, Map, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/explore", label: "Explore Map", icon: Map },
  { href: "/submit",  label: "Submit a Restaurant", icon: Plus },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 glass">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-shadow">
            <Utensils size={14} className="text-black" />
          </div>
          <span className="font-semibold text-sm tracking-tight">
            Indie<span className="text-emerald-400">Eats</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}>
                <Button
                  variant={active ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-1.5 text-xs font-medium transition-colors",
                    active
                      ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "text-zinc-400 hover:text-zinc-200"
                  )}
                >
                  <Icon size={13} />
                  {label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
