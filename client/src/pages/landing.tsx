import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  CheckCircle2,
  Shield,
  Users,
  BarChart3,
  ArrowRight,
  Star,
  TrendingUp,
  Search,
  Award,
  Building2,
} from "lucide-react";
import logoImage from "@assets/Fractional Franchise Business Coach (1)_1764591066959.png";

export default function Landing() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Verified Reviews",
      description:
        "Every review comes from a verified franchisee, ensuring authenticity and trustworthiness.",
    },
    {
      icon: Shield,
      title: "AI-Powered Moderation",
      description:
        "Advanced sentiment analysis and content moderation keeps reviews honest and helpful.",
    },
    {
      icon: BarChart3,
      title: "Z Score Ratings",
      description:
        "Our proprietary scoring system helps you compare franchise opportunities objectively.",
    },
    {
      icon: Users,
      title: "Community Insights",
      description:
        "Access real experiences from thousands of franchise owners across the country.",
    },
  ];

  const stats = [
    { value: "4,000+", label: "Franchise Brands" },
    { value: "50K+", label: "Verified Reviews" },
    { value: "98%", label: "Verification Rate" },
    { value: "4.8", label: "Average Rating" },
  ];

  const categories = [
    "Food & Beverage",
    "Health & Fitness",
    "Retail",
    "Automotive",
    "Home Services",
    "Education",
    "Business Services",
    "Real Estate",
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-cyan-500/5" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMTIxMjEiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Badge variant="secondary" className="gap-2 px-4 py-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Trusted by 50,000+ franchise investors
                </Badge>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                  <span className="text-primary">Verified Reviews</span>
                  <br />
                  <span className="text-foreground">Powered by Franchisees</span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-lg">
                  Make informed franchise investment decisions with authentic reviews
                  from verified franchise owners. Compare brands, analyze trends, and
                  find your perfect opportunity.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild className="gap-2" data-testid="button-explore-brands">
                    <Link href="/directory">
                      Explore Brands
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild data-testid="button-write-review">
                    <a href="/api/login">Write a Review</a>
                  </Button>
                </div>

                <div className="flex items-center gap-6 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-cyan-500 border-2 border-background flex items-center justify-center text-primary-foreground text-xs font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Rated 4.9/5 by franchise investors
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-500/20 rounded-3xl blur-3xl" />
                <div className="relative bg-card border rounded-2xl p-8 shadow-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={logoImage}
                      alt="ZeeVerify"
                      className="h-16 w-16 object-contain"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">ZeeVerify</h3>
                      <p className="text-sm text-muted-foreground">
                        Franchise Intelligence Platform
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium">Z Score</p>
                          <p className="text-sm text-muted-foreground">
                            Franchise Rating
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-emerald-500">
                        4.7
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">156</p>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <p className="text-2xl font-bold text-primary">94%</p>
                        <p className="text-sm text-muted-foreground">
                          Recommend
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why Choose ZeeVerify?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're committed to providing the most comprehensive and trustworthy
                franchise review platform.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore franchise opportunities across various industries.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <Link href={`/directory?category=${encodeURIComponent(category)}`} key={index}>
                  <Button
                    variant="outline"
                    className="gap-2 hover-elevate"
                    data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Building2 className="h-4 w-4" />
                    {category}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <Badge variant="secondary" className="gap-2">
                  <Award className="h-3.5 w-3.5" />
                  For Franchise Owners
                </Badge>

                <h2 className="text-3xl sm:text-4xl font-bold">
                  Share Your Experience
                </h2>

                <p className="text-lg text-muted-foreground">
                  Help future franchise investors make informed decisions by
                  sharing your authentic experience. Your review could make a
                  difference.
                </p>

                <ul className="space-y-3">
                  {[
                    "Get verified as a legitimate franchisee",
                    "Share detailed ratings across multiple categories",
                    "Help others avoid pitfalls and find success",
                    "Build a community of informed franchise owners",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button size="lg" asChild className="gap-2" data-testid="button-start-review">
                  <a href="/api/login">
                    Start Your Review
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="col-span-2 p-6">
                  <div className="flex items-center gap-4">
                    <Search className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Find Your Brand</h4>
                      <p className="text-sm text-muted-foreground">
                        Search our database of 4,000+ franchises
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="space-y-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <h4 className="font-semibold">Get Verified</h4>
                    <p className="text-sm text-muted-foreground">
                      Prove your franchise ownership
                    </p>
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="space-y-2">
                    <Star className="h-8 w-8 text-primary" />
                    <h4 className="font-semibold">Leave Reviews</h4>
                    <p className="text-sm text-muted-foreground">
                      Rate and review your experience
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Find Your Perfect Franchise?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of franchise investors who trust ZeeVerify to make
              informed decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="gap-2"
                data-testid="button-get-started"
              >
                <Link href="/directory">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                <Link href="/compare">Compare Brands</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
