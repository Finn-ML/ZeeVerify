import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BrandCard } from "@/components/brand-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
} from "lucide-react";
import type { Brand } from "@shared/schema";

const CATEGORIES = [
  "Food & Beverage",
  "Health & Fitness",
  "Retail",
  "Automotive",
  "Home Services",
  "Education",
  "Business Services",
  "Real Estate",
  "Travel & Hospitality",
  "Personal Services",
];

const INVESTMENT_RANGES = [
  { label: "Under $50K", min: 0, max: 50000 },
  { label: "$50K - $100K", min: 50000, max: 100000 },
  { label: "$100K - $250K", min: 100000, max: 250000 },
  { label: "$250K - $500K", min: 250000, max: 500000 },
  { label: "$500K - $1M", min: 500000, max: 1000000 },
  { label: "Over $1M", min: 1000000, max: null },
];

export default function Directory() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");

  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedInvestmentRange, setSelectedInvestmentRange] = useState<string>("");
  const [sortBy, setSortBy] = useState("z-score");
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data, isLoading } = useQuery<{ brands: Brand[]; total: number }>({
    queryKey: [
      "/api/brands",
      {
        search: searchQuery,
        categories: selectedCategories,
        investmentRange: selectedInvestmentRange,
        sortBy,
        onlyVerified,
        page,
      },
    ],
  });

  const brands = data?.brands || [];
  const totalPages = Math.ceil((data?.total || 0) / 12);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedInvestmentRange("");
    setOnlyVerified(false);
    setPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategories.length > 0 ||
    selectedInvestmentRange ||
    onlyVerified;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-3 block">Categories</Label>
        <div className="space-y-2">
          {CATEGORIES.map((category) => (
            <div key={category} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category}`}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => handleCategoryToggle(category)}
                data-testid={`checkbox-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
              />
              <Label
                htmlFor={`category-${category}`}
                className="text-sm font-normal cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium mb-3 block">
          Investment Range
        </Label>
        <Select
          value={selectedInvestmentRange}
          onValueChange={(value) => {
            setSelectedInvestmentRange(value);
            setPage(1);
          }}
        >
          <SelectTrigger data-testid="select-investment-range">
            <SelectValue placeholder="Any investment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any investment</SelectItem>
            {INVESTMENT_RANGES.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="verified-only"
          checked={onlyVerified}
          onCheckedChange={(checked) => {
            setOnlyVerified(checked as boolean);
            setPage(1);
          }}
          data-testid="checkbox-verified-only"
        />
        <Label htmlFor="verified-only" className="text-sm font-normal cursor-pointer">
          Verified brands only
        </Label>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full gap-2"
          data-testid="button-clear-filters"
        >
          <X className="h-4 w-4" />
          Clear all filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Franchise Directory</h1>
              <p className="text-muted-foreground mt-1">
                Browse and compare {data?.total || "thousands of"} franchise opportunities
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10"
                  data-testid="input-directory-search"
                />
              </div>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 md:hidden"
                    data-testid="button-mobile-filters"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="ml-1">
                        {selectedCategories.length +
                          (selectedInvestmentRange ? 1 : 0) +
                          (onlyVerified ? 1 : 0)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40" data-testid="select-sort">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="z-score">Top Z Score</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  {category}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-transparent"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-8">
            <aside className="hidden md:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterContent />
              </div>
            </aside>

            <div className="flex-1">
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="aspect-video rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No brands found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {brands.map((brand) => (
                      <BrandCard key={brand.id} brand={brand} />
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <Button
                        variant="outline"
                        size="icon"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm text-muted-foreground px-4">
                        Page {page} of {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
