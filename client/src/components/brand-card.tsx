import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ZScoreBadge } from "@/components/z-score-badge";
import { StarRating } from "@/components/star-rating";
import { Building2, MapPin, Users, CheckCircle2 } from "lucide-react";
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

  return (
    <Link href={`/brand/${brand.slug}`}>
      <Card
        className={cn(
          "group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200",
          className
        )}
        data-testid={`card-brand-${brand.id}`}
      >
        <div className="aspect-video relative bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="h-16 w-16 text-primary/30" />
          )}
          
          <div className="absolute top-3 right-3">
            <ZScoreBadge score={parseFloat(brand.zScore || "0")} size="sm" />
          </div>

          {brand.isClaimed && (
            <Badge
              variant="secondary"
              className="absolute top-3 left-3 gap-1 bg-background/90 backdrop-blur-sm"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              Verified
            </Badge>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {brand.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={parseFloat(brand.averageRating || "0")} size="sm" />
              <span className="text-sm text-muted-foreground">
                ({brand.totalReviews || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {brand.category && (
              <Badge variant="outline" className="text-xs">
                {brand.category}
              </Badge>
            )}
            {brand.industry && (
              <Badge variant="outline" className="text-xs">
                {brand.industry}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{brand.headquarters || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{brand.unitCount?.toLocaleString() || "N/A"} units</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t text-sm">
            <div>
              <span className="text-muted-foreground">Investment</span>
              <p className="font-medium">
                {formatCurrency(brand.totalInvestmentMin)} - {formatCurrency(brand.totalInvestmentMax)}
              </p>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">Franchise Fee</span>
              <p className="font-medium">{formatCurrency(brand.franchiseFee)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
