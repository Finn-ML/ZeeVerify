import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ZScoreBadgeProps {
  score: number | string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showTrend?: boolean;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function ZScoreBadge({
  score,
  size = "md",
  showLabel = false,
  showTrend = false,
  trend = "neutral",
  className,
}: ZScoreBadgeProps) {
  const numericScore = typeof score === "string" ? parseFloat(score) : score;

  const getScoreStyles = (s: number) => {
    if (s >= 4.5) return {
      bg: "bg-gradient-to-br from-success to-success/80",
      text: "text-success-foreground",
      ring: "ring-success/20",
      glow: "shadow-success/30",
    };
    if (s >= 4) return {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      text: "text-white",
      ring: "ring-emerald-500/20",
      glow: "shadow-emerald-500/30",
    };
    if (s >= 3) return {
      bg: "bg-gradient-to-br from-accent to-accent/80",
      text: "text-accent-foreground",
      ring: "ring-accent/20",
      glow: "shadow-accent/30",
    };
    if (s >= 2) return {
      bg: "bg-gradient-to-br from-amber-500 to-amber-600",
      text: "text-white",
      ring: "ring-amber-500/20",
      glow: "shadow-amber-500/30",
    };
    return {
      bg: "bg-gradient-to-br from-destructive to-destructive/80",
      text: "text-destructive-foreground",
      ring: "ring-destructive/20",
      glow: "shadow-destructive/30",
    };
  };

  const getScoreLabel = (s: number) => {
    if (s >= 4.5) return "Excellent";
    if (s >= 4) return "Very Good";
    if (s >= 3) return "Good";
    if (s >= 2) return "Fair";
    return "Poor";
  };

  const sizeClasses = {
    sm: {
      container: "w-11 h-11",
      text: "text-sm font-bold",
      label: "text-[10px]",
      trend: "h-3 w-3",
    },
    md: {
      container: "w-16 h-16",
      text: "text-xl font-bold",
      label: "text-xs",
      trend: "h-3.5 w-3.5",
    },
    lg: {
      container: "w-24 h-24",
      text: "text-3xl font-bold",
      label: "text-sm",
      trend: "h-4 w-4",
    },
  };

  const styles = getScoreStyles(numericScore);
  const sizes = sizeClasses[size];

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div className="relative">
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl blur-md opacity-50",
            styles.bg
          )}
        />

        {/* Main badge */}
        <div
          className={cn(
            "relative rounded-xl flex items-center justify-center ring-2 shadow-lg",
            sizes.container,
            styles.bg,
            styles.text,
            styles.ring,
            styles.glow
          )}
          data-testid="badge-z-score"
        >
          <span className={cn("data-ticker", sizes.text)}>
            {numericScore.toFixed(1)}
          </span>
        </div>

        {/* Trend indicator */}
        {showTrend && trend !== "neutral" && (
          <div
            className={cn(
              "absolute -top-1 -right-1 rounded-full p-1 shadow-sm",
              trend === "up"
                ? "bg-success text-success-foreground"
                : "bg-destructive text-destructive-foreground"
            )}
          >
            <TrendIcon className={sizes.trend} />
          </div>
        )}
      </div>

      {showLabel && (
        <div className="text-center">
          <span
            className={cn(
              "font-semibold uppercase tracking-wider text-foreground",
              sizes.label
            )}
          >
            {getScoreLabel(numericScore)}
          </span>
        </div>
      )}
    </div>
  );
}
