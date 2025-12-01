import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ZScoreBadge } from "@/components/z-score-badge";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  X,
  Building2,
  Check,
  Share2,
  Download,
  Save,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Brand } from "@shared/schema";

const MAX_COMPARE = 4;

export default function Compare() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const initialBrandIds = searchParams.get("brands")?.split(",").filter(Boolean) || [];

  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>(initialBrandIds);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: brandsData } = useQuery<{ brands: Brand[] }>({
    queryKey: ["/api/brands", { ids: selectedBrandIds }],
    enabled: selectedBrandIds.length > 0,
  });

  const { data: searchResults } = useQuery<{ brands: Brand[] }>({
    queryKey: ["/api/brands", { search: searchQuery, limit: 10 }],
    enabled: searchQuery.length > 1,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; brandIds: string[] }) => {
      return apiRequest("POST", "/api/comparisons", data);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Comparison saved!",
        description: `Share link: ${window.location.origin}/compare/${data.shareToken}`,
      });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save comparison.", variant: "destructive" });
    },
  });

  const selectedBrands = brandsData?.brands || [];
  const availableSearchResults = searchResults?.brands?.filter(
    (b) => !selectedBrandIds.includes(b.id)
  ) || [];

  const addBrand = (brandId: string) => {
    if (selectedBrandIds.length < MAX_COMPARE && !selectedBrandIds.includes(brandId)) {
      setSelectedBrandIds([...selectedBrandIds, brandId]);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const removeBrand = (brandId: string) => {
    setSelectedBrandIds(selectedBrandIds.filter((id) => id !== brandId));
  };

  const formatCurrency = (value: string | null) => {
    if (!value) return "N/A";
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toLocaleString()}`;
  };

  const handleShare = () => {
    const url = `${window.location.origin}/compare?brands=${selectedBrandIds.join(",")}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!", description: "Comparison link copied to clipboard." });
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save comparisons.",
        variant: "destructive",
      });
      return;
    }
    const name = prompt("Enter a name for this comparison:");
    if (name) {
      saveMutation.mutate({ name, brandIds: selectedBrandIds });
    }
  };

  const comparisonMetrics = [
    { key: "zScore", label: "Z Score", format: (v: string) => parseFloat(v || "0").toFixed(1), icon: TrendingUp },
    { key: "averageRating", label: "Rating", format: (v: string) => parseFloat(v || "0").toFixed(1), icon: Star },
    { key: "totalReviews", label: "Reviews", format: (v: number) => (v || 0).toLocaleString(), icon: BarChart3 },
    { key: "unitCount", label: "Units", format: (v: number) => (v || 0).toLocaleString(), icon: Users },
    { key: "franchiseFee", label: "Franchise Fee", format: formatCurrency, icon: DollarSign },
    { key: "totalInvestmentMin", label: "Min Investment", format: formatCurrency, icon: DollarSign },
    { key: "totalInvestmentMax", label: "Max Investment", format: formatCurrency, icon: DollarSign },
  ];

  const categoryScores = [
    { key: "supportScore", label: "Support" },
    { key: "trainingScore", label: "Training" },
    { key: "profitabilityScore", label: "Profitability" },
    { key: "cultureScore", label: "Culture" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Compare Franchises</h1>
              <p className="text-muted-foreground mt-1">
                Select up to {MAX_COMPARE} brands to compare side by side
              </p>
            </div>

            {selectedBrandIds.length > 1 && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleShare} className="gap-2" data-testid="button-share-compare">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={handleSave} className="gap-2" data-testid="button-save-compare">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {selectedBrands.map((brand) => (
              <Card key={brand.id} className="relative" data-testid={`card-compare-${brand.id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => removeBrand(brand.id)}
                  data-testid={`button-remove-${brand.id}`}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardContent className="pt-6 text-center">
                  <div className="h-16 w-16 mx-auto rounded-lg bg-muted flex items-center justify-center mb-3">
                    {brand.logoUrl ? (
                      <img src={brand.logoUrl} alt={brand.name} className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold truncate">{brand.name}</h3>
                  <div className="flex justify-center mt-2">
                    <ZScoreBadge score={parseFloat(brand.zScore || "0")} size="sm" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {selectedBrandIds.length < MAX_COMPARE && (
              <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                <PopoverTrigger asChild>
                  <Card
                    className="border-dashed cursor-pointer hover-elevate"
                    data-testid="button-add-brand"
                  >
                    <CardContent className="flex flex-col items-center justify-center h-full py-8">
                      <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Add Brand</span>
                    </CardContent>
                  </Card>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search brands..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      data-testid="input-search-brand"
                    />
                    <CommandList>
                      {searchQuery.length < 2 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                          Type at least 2 characters to search...
                        </div>
                      ) : availableSearchResults.length === 0 ? (
                        <CommandEmpty>No brands found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {availableSearchResults.map((brand) => (
                            <CommandItem
                              key={brand.id}
                              value={brand.name}
                              onSelect={() => addBrand(brand.id)}
                              className="flex items-center gap-3 cursor-pointer"
                              data-testid={`option-brand-${brand.id}`}
                            >
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                                {brand.logoUrl ? (
                                  <img src={brand.logoUrl} alt="" className="h-full w-full object-cover rounded" />
                                ) : (
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{brand.name}</p>
                                <p className="text-xs text-muted-foreground">{brand.category}</p>
                              </div>
                              <ZScoreBadge score={parseFloat(brand.zScore || "0")} size="sm" />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {selectedBrands.length > 0 ? (
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-40">Metric</TableHead>
                        {selectedBrands.map((brand) => (
                          <TableHead key={brand.id} className="text-center">
                            {brand.name}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonMetrics.map((metric) => (
                        <TableRow key={metric.key}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <metric.icon className="h-4 w-4 text-muted-foreground" />
                              {metric.label}
                            </div>
                          </TableCell>
                          {selectedBrands.map((brand) => (
                            <TableCell key={brand.id} className="text-center font-medium">
                              {metric.format((brand as any)[metric.key])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {categoryScores.map((category) => (
                    <div key={category.key}>
                      <h4 className="font-medium mb-3">{category.label}</h4>
                      <div className="space-y-2">
                        {selectedBrands.map((brand) => {
                          const score = parseFloat((brand as any)[category.key] || "0");
                          return (
                            <div key={brand.id} className="flex items-center gap-4">
                              <span className="w-32 text-sm truncate">{brand.name}</span>
                              <Progress value={score * 20} className="flex-1 h-3" />
                              <span className="w-12 text-right font-medium">{score.toFixed(1)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedBrands.map((brand) => (
                      <div key={brand.id} className="space-y-2">
                        <h4 className="font-medium text-center truncate">{brand.name}</h4>
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" asChild className="w-full">
                            <Link href={`/brand/${brand.slug}`}>View Details</Link>
                          </Button>
                          <Button size="sm" className="w-full" data-testid={`button-request-info-${brand.id}`}>
                            Request Info
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="py-16">
              <CardContent className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Start Comparing</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Add franchise brands above to compare their metrics, ratings, and investment requirements side by side.
                </p>
                <Button asChild>
                  <Link href="/directory">Browse Directory</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
