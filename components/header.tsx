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
    <header className="sticky top-0 z-50 border-b border-black/8 glass">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
            <Utensils size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">
            sysFREE
            <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
              co
            </span>
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
                      ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
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
