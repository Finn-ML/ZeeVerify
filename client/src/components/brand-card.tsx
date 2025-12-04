import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZScoreBadge } from "@/components/z-score-badge";
import { StarRating } from "@/components/star-rating";
import { Building2, MapPin, Users, CheckCircle2, ArrowUpRight, TrendingUp } from "lucide-react";
import type { Brand } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BrandCardProps {
  brand: Brand;
  className?: string;
}

export function BrandCard({ brand, className }: BrandCardProps) {
  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const zScore = parseFloat(brand.zScore || "0");
  const isHighRated = zScore >= 4.0;

  return (
    <Link href={`/brand/${brand.slug}`}>
      <Card
        className={cn(
          "group relative overflow-hidden border-border/50 hover:border-accent/30 cursor-pointer transition-all duration-500 hover:shadow-xl",
          className
        )}
        data-testid={`card-brand-${brand.id}`}
      >
        {/* Hover accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/80 to-accent/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

        {/* Image/Logo Section */}
        <div className="aspect-[16/10] relative bg-gradient-to-br from-muted/80 to-muted/40 flex items-center justify-center overflow-hidden">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </div>
          )}

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Z Score Badge */}
          <div className="absolute top-4 right-4 z-10">
            <ZScoreBadge score={zScore} size="sm" />
          </div>

          {/* Verified Badge */}
          {brand.isClaimed && (
            <Badge
              variant="secondary"
              className="absolute top-4 left-4 gap-1.5 bg-background/90 backdrop-blur-md border-0 shadow-sm"
            >
              <CheckCircle2 className="h-3 w-3 text-success" />
              <span className="text-xs font-medium">Verified</span>
            </Badge>
          )}

          {/* High rated indicator */}
          {isHighRated && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2 py-1 rounded-full bg-success/90 backdrop-blur-md text-success-foreground">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-semibold">Top Rated</span>
            </div>
          )}

          {/* View details indicator on hover */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg">
              View Details
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        <CardContent className="p-5 space-y-4">
          {/* Brand Name & Rating */}
          <div>
            <h3 className="font-display text-lg font-semibold line-clamp-1 group-hover:text-accent transition-colors duration-300">
              {brand.name}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <StarRating rating={parseFloat(brand.averageRating || "0")} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({brand.totalReviews || 0})
              </span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5">
            {brand.category && (
              <Badge
                variant="outline"
                className="text-xs border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                {brand.category}
              </Badge>
            )}
            {brand.industry && brand.industry !== brand.category && (
              <Badge
                variant="outline"
                className="text-xs border-border/50 bg-muted/30"
              >
                {brand.industry}
              </Badge>
            )}
          </div>

          {/* Location & Units */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-xs">{brand.headquarters || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-7 w-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs">{brand.unitCount?.toLocaleString() || "N/A"} units</span>
            </div>
          </div>

          {/* Investment Info */}
          <div className="flex justify-between items-end pt-3 border-t border-border/50">
            <div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Investment</span>
              <p className="text-sm font-semibold text-foreground mt-0.5 data-ticker">
                {formatCurrency(brand.totalInvestmentMin)} - {formatCurrency(brand.totalInvestmentMax)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Fee</span>
              <p className="text-sm font-semibold text-foreground mt-0.5 data-ticker">
                {formatCurrency(brand.franchiseFee)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
