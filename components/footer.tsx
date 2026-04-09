import Link from "next/link";
import { Utensils, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 py-10 px-4">
      <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
            <Utensils size={12} className="text-black" />
          </div>
          <span className="text-sm font-medium">
            sysFREE<span className="text-emerald-400">co</span>
          </span>
          <span className="text-xs text-zinc-600 ml-2">
            · Open source · Toronto / GTA / Hamilton
          </span>
        </div>

        <div className="flex items-center gap-5 text-xs text-zinc-500">
          <Link href="/explore" className="hover:text-zinc-300 transition-colors">
            Explore
          </Link>
          <Link href="/submit" className="hover:text-zinc-300 transition-colors">
            Submit a Restaurant
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <ExternalLink size={13} />
            GitHub
          </a>
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto mt-6 text-center text-xs text-zinc-700">
        Scores are based on publicly available website text and known supplier signals.
        They are not a guarantee of sourcing practices.
      </div>
    </footer>
  );
}
