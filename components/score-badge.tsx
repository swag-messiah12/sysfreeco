import { cn } from "@/lib/utils";
import { getVerdictBadge } from "@/lib/restaurant-utils";

interface Props {
  score: number;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ScoreBadge({ score, showScore = false, size = "md" }: Props) {
  const badge = getVerdictBadge(score);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border",
        badge.bg,
        badge.text,
        badge.border,
        {
          sm: "px-2 py-0.5 text-xs",
          md: "px-2.5 py-1 text-xs",
          lg: "px-3 py-1.5 text-sm",
        }[size]
      )}
    >
      <span
        className={cn(
          "rounded-full shrink-0",
          badge.dotColor,
          { sm: "w-1.5 h-1.5", md: "w-2 h-2", lg: "w-2.5 h-2.5" }[size]
        )}
      />
      {badge.label}
      {showScore && (
        <span className="opacity-60 font-mono ml-0.5">
          {score > 0 ? `+${score}` : score}
        </span>
      )}
    </span>
  );
}
