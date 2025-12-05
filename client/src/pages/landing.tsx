import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  ChevronRight,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: CheckCircle2,
      title: "Verified Reviews",
      description:
        "Every review comes from a verified franchisee, ensuring authenticity and trustworthiness.",
      stat: "50K+",
      statLabel: "Verified",
    },
    {
      icon: Shield,
      title: "AI-Powered Analysis",
      description:
        "Advanced sentiment analysis and content moderation keeps reviews honest and helpful.",
      stat: "99.2%",
      statLabel: "Accuracy",
    },
    {
      icon: BarChart3,
      title: "Z Score Ratings",
      description:
        "Our proprietary scoring system helps you compare franchise opportunities objectively.",
      stat: "4.8",
      statLabel: "Avg Score",
    },
    {
      icon: Users,
      title: "Community Insights",
      description:
        "Access real experiences from thousands of franchise owners across the country.",
      stat: "15K+",
      statLabel: "Members",
    },
  ];

  const stats = [
    { value: "4,000", suffix: "+", label: "Franchise Brands", icon: Building2 },
    { value: "50", suffix: "K+", label: "Verified Reviews", icon: Star },
    { value: "98", suffix: "%", label: "Verification Rate", icon: Shield },
    { value: "4.8", suffix: "", label: "Average Z Score", icon: TrendingUp },
  ];

  const categories = [
    { name: "Food & Beverage", count: "1,200+" },
    { name: "Health & Fitness", count: "450+" },
    { name: "Retail", count: "380+" },
    { name: "Automotive", count: "290+" },
    { name: "Home Services", count: "520+" },
    { name: "Education", count: "180+" },
    { name: "Business Services", count: "340+" },
    { name: "Real Estate", count: "210+" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Editorial Style */}
        <section className="relative overflow-hidden">
          {/* Background gradient mesh */}
          <div className="absolute inset-0 bg-gradient-mesh opacity-50" />

          {/* Geometric accent shapes */}
          <div className="absolute top-20 right-[10%] w-64 h-64 border border-accent/20 rounded-full opacity-50" />
          <div className="absolute bottom-20 left-[5%] w-32 h-32 border border-primary/10 rotate-45 opacity-30" />

          {/* Grain overlay */}
          <div className="absolute inset-0 grain-overlay pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-8">
                {/* Eyebrow */}
                <div className="flex items-center gap-3 animate-fade-in-up">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium text-accent">
                      Trusted by 50,000+ franchise investors
                    </span>
                  </div>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight animate-fade-in-up stagger-1">
                    <span className="block">Make Smarter</span>
                    <span className="block mt-1">
                      <span className="relative">
                        <span className="relative z-10">Franchise</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/30 -z-0" />
                      </span>{" "}
                      Decisions
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed animate-fade-in-up stagger-2">
                    Access verified reviews from real franchise owners. Compare opportunities
                    with our proprietary Z Score system. Invest with confidence.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                  <Button
                    size="lg"
                    asChild
                    className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 btn-glow group"
                    data-testid="button-explore-brands"
                  >
                    <Link href="/directory">
                      Explore Directory
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="h-14 px-8 text-base font-semibold border-2 hover:bg-muted/50"
                    data-testid="button-write-review"
                  >
                    <Link href="/login">Write a Review</Link>
                  </Button>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-6 pt-6 animate-fade-in-up stagger-4">
                  <div className="flex -space-x-3">
                    {[
                      "bg-gradient-to-br from-amber-400 to-orange-500",
                      "bg-gradient-to-br from-emerald-400 to-teal-500",
                      "bg-gradient-to-br from-violet-400 to-purple-500",
                      "bg-gradient-to-br from-rose-400 to-pink-500",
                      "bg-gradient-to-br from-blue-400 to-indigo-500",
                    ].map((gradient, i) => (
                      <div
                        key={i}
                        className={`h-11 w-11 rounded-full ${gradient} border-[3px] border-background flex items-center justify-center text-white text-sm font-semibold shadow-md`}
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <div className="border-l border-border pl-6">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className="h-5 w-5 fill-accent text-accent"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Rated <span className="font-semibold text-foreground">4.9/5</span> by franchise investors
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side - Featured Card */}
              <div className="lg:col-span-5 animate-fade-in-up stagger-3">
                <div className="relative">
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 rounded-3xl blur-2xl opacity-60" />

                  {/* Main card */}
                  <Card className="relative glass-card rounded-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-accent/80 to-accent/50" />
                    <CardContent className="p-8">
                      {/* Card Header */}
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                            <span className="text-2xl font-display font-bold text-primary-foreground">Z</span>
                          </div>
                          <div>
                            <h3 className="font-display text-xl font-semibold">ZeeVerify</h3>
                            <p className="text-sm text-muted-foreground">
                              Intelligence Platform
                            </p>
                          </div>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                      </div>

                      {/* Z Score Display */}
                      <div className="p-6 rounded-xl bg-muted/50 border border-border/50 mb-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Z Score</p>
                            <p className="text-4xl font-display font-bold text-success mt-1 data-ticker">4.7</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rank</p>
                            <p className="text-2xl font-semibold text-foreground mt-1">Top 5%</p>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[94%] bg-gradient-to-r from-success to-success/70 rounded-full" />
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                          <p className="text-2xl font-display font-bold text-foreground data-ticker">156</p>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Reviews</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/30 text-center">
                          <p className="text-2xl font-display font-bold text-foreground data-ticker">94%</p>
                          <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Recommend</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Floating badge */}
                  <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-background border shadow-lg flex items-center gap-2 animate-float">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">Verified Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section - Data Ticker Style */}
        <section className="relative border-y border-border/50 bg-muted/30">
          <div className="absolute inset-0 grain-overlay pointer-events-none opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-accent/10 text-accent mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground data-ticker">
                    {stat.value}<span className="text-accent">{stat.suffix}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section - Editorial Grid */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="max-w-3xl mb-16">
              <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                Why ZeeVerify
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
                Intelligence that drives
                <br />
                <span className="text-muted-foreground">confident decisions</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We've built the most comprehensive franchise intelligence platform,
                combining verified reviews with AI-powered analysis.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 hover:border-accent/30 hover:shadow-xl transition-all duration-500"
                >
                  <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                    {/* Icon */}
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-accent" />
                    </div>

                    {/* Content */}
                    <h3 className="font-display text-xl font-semibold mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-grow">
                      {feature.description}
                    </p>

                    {/* Stat */}
                    <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                      <span className="text-2xl font-display font-bold text-foreground data-ticker">
                        {feature.stat}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {feature.statLabel}
                      </span>
                    </div>
                  </CardContent>

                  {/* Hover accent line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-accent to-accent/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Section - Magazine Layout */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 grain-overlay pointer-events-none opacity-50" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-accent/5 to-transparent" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
              <div>
                <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">
                  Explore Categories
                </p>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
                  Find your industry
                </h2>
              </div>
              <Link href="/directory">
                <Button variant="outline" className="gap-2 border-2 hover:bg-background">
                  View All Categories
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Category Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <Link href={`/directory?category=${encodeURIComponent(category.name)}`} key={index}>
                  <Card
                    className="group cursor-pointer border-border/50 hover:border-accent/30 hover:shadow-lg transition-all duration-300"
                    data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300">
                          <Building2 className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors duration-300">
                            {category.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {category.count} brands
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - For Franchise Owners */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                  <Award className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">
                    For Franchise Owners
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight">
                  Share your
                  <br />
                  <span className="relative">
                    <span className="relative z-10">experience</span>
                    <span className="absolute bottom-2 left-0 w-full h-3 bg-accent/30 -z-0" />
                  </span>
                </h2>

                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Help future franchise investors make informed decisions by
                  sharing your authentic experience. Your review could make a
                  difference in someone's life.
                </p>

                <ul className="space-y-4">
                  {[
                    "Get verified as a legitimate franchisee",
                    "Share detailed ratings across multiple categories",
                    "Help others avoid pitfalls and find success",
                    "Build a community of informed franchise owners",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="h-6 w-6 rounded-full bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      </div>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  asChild
                  className="h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 btn-glow group"
                  data-testid="button-start-review"
                >
                  <Link href="/login">
                    Start Your Review
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              {/* Right - Info Cards */}
              <div className="grid gap-4">
                <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center shrink-0">
                      <Search className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-display text-xl font-semibold mb-2">Find Your Brand</h4>
                      <p className="text-muted-foreground">
                        Search our database of 4,000+ franchise brands to find yours
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-accent" />
                      </div>
                      <h4 className="font-semibold mb-2">Get Verified</h4>
                      <p className="text-sm text-muted-foreground">
                        Prove your franchise ownership
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center mb-4">
                        <Star className="h-6 w-6 text-accent" />
                      </div>
                      <h4 className="font-semibold mb-2">Leave Reviews</h4>
                      <p className="text-sm text-muted-foreground">
                        Rate and review your experience
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
          <div className="absolute inset-0 grain-overlay opacity-[0.02]" />

          {/* Decorative circles */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full border border-primary-foreground/10 -translate-y-1/2" />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full border border-primary-foreground/10 -translate-y-1/2" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-6">
              Ready to invest with confidence?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Join thousands of franchise investors who trust ZeeVerify to make
              informed, data-driven decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="h-14 px-8 text-base font-semibold shadow-xl"
                data-testid="button-get-started"
              >
                <Link href="/directory">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-14 px-8 text-base font-semibold bg-transparent border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
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
