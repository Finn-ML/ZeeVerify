import { CheckCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

const containerSizes = {
  sm: "p-0.5",
  md: "p-1",
  lg: "p-1.5",
};

export function VerifiedBadge({
  size = "md",
  showTooltip = true,
  className,
}: VerifiedBadgeProps) {
  const badge = (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#c9a962]",
        containerSizes[size],
        className
      )}
    >
      <CheckCircle className={cn("text-[#1a1f36]", sizeClasses[size])} />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Verified Brand</p>
          <p className="text-xs text-muted-foreground">
            This franchisor has claimed and verified their listing
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Text badge variant for detail pages
export function VerifiedBadgeText({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-[#c9a962]/10 px-3 py-1 text-sm font-medium text-[#c9a962]",
        className
      )}
    >
      <Shield className="h-4 w-4" />
      Verified Franchisor
    </div>
  );
}
