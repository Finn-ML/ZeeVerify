import { cn } from "@/lib/utils";

interface ZScoreBadgeProps {
  score: number | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ZScoreBadge({ score, size = "md", showLabel = false, className }: ZScoreBadgeProps) {
  const numericScore = typeof score === "string" ? parseFloat(score) : score;
  
  const getScoreColor = (s: number) => {
    if (s >= 4) return "bg-emerald-500 text-white";
    if (s >= 3) return "bg-cyan-500 text-white";
    if (s >= 2) return "bg-amber-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 4.5) return "Excellent";
    if (s >= 4) return "Very Good";
    if (s >= 3) return "Good";
    if (s >= 2) return "Fair";
    return "Poor";
  };

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-semibold",
          sizeClasses[size],
          getScoreColor(numericScore)
        )}
        data-testid="badge-z-score"
      >
        {numericScore.toFixed(1)}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">
          {getScoreLabel(numericScore)}
        </span>
      )}
    </div>
  );
}
