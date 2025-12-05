import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, ChevronDown, Settings, LogOut, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/directory?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin";
      case "franchisor":
        return "/franchisor";
      case "franchisee":
        return "/franchisee";
      default:
        return "/directory";
    }
  };

  const isActiveRoute = (path: string) => location === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      {/* Subtle gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-3" data-testid="link-home">
            {/* Logo mark with gold accent */}
            <div className="relative h-10 w-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md group-hover:shadow-lg transition-shadow duration-300" />
              <span className="relative font-display text-xl font-bold text-primary-foreground">Z</span>
              <div className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent animate-pulse-glow" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                Zee<span className="text-accent">Verify</span>
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium -mt-0.5">
                Franchise Intelligence
              </p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
              <Link href="/directory">
                <Button
                  variant={isActiveRoute("/directory") ? "secondary" : "ghost"}
                  size="sm"
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActiveRoute("/directory")
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                  data-testid="link-directory"
                >
                  Directory
                </Button>
              </Link>
              <Link href="/compare">
                <Button
                  variant={isActiveRoute("/compare") ? "secondary" : "ghost"}
                  size="sm"
                  className={`text-sm font-medium transition-all duration-200 ${
                    isActiveRoute("/compare")
                      ? "bg-background shadow-sm"
                      : "hover:bg-background/50"
                  }`}
                  data-testid="link-compare"
                >
                  Compare
                </Button>
              </Link>
            </div>
          </nav>
        </div>

        {/* Search Bar - Editorial Style */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className={`relative w-full transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 ${
              searchFocused ? 'text-accent' : 'text-muted-foreground'
            }`} />
            <Input
              type="search"
              placeholder="Search 4,000+ franchise brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={`pl-11 pr-4 h-11 bg-muted/50 border-transparent rounded-xl text-sm placeholder:text-muted-foreground/70 transition-all duration-300 ${
                searchFocused
                  ? 'bg-background border-accent/50 shadow-md ring-2 ring-accent/20'
                  : 'hover:bg-muted/70'
              }`}
              data-testid="input-search"
            />
            {searchQuery && (
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                ↵
              </kbd>
            )}
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoading ? (
            <div className="h-9 w-24 bg-muted/50 animate-pulse rounded-lg" />
          ) : isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="gap-2 px-2 hover:bg-muted/50 transition-colors duration-200"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-8 w-8 ring-2 ring-border">
                    <AvatarImage src={user.profileImageUrl || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline-block text-sm font-medium">
                    {user.firstName || "User"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="px-2 py-3 mb-2 rounded-lg bg-muted/50">
                  <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Sparkles className="h-3 w-3 text-accent" />
                    <p className="text-xs text-accent font-medium capitalize">
                      {user.role === "browser" ? "Member" : user.role}
                    </p>
                  </div>
                </div>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                  <Link href={getDashboardLink()} data-testid="link-dashboard">
                    <LayoutDashboard className="mr-2.5 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg">
                  <Link href="/settings" data-testid="link-settings">
                    <Settings className="mr-2.5 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2" />
                <DropdownMenuItem asChild className="cursor-pointer py-2.5 rounded-lg text-destructive focus:text-destructive">
                  <a href="/api/logout" data-testid="link-logout">
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Log out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-medium hover:bg-muted/50"
                asChild
                data-testid="button-login"
              >
                <Link href="/login">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="text-sm font-medium bg-primary hover:bg-primary/90 shadow-sm btn-glow"
                asChild
                data-testid="button-signup"
              >
                <Link href="/login">
                  Get Started
                </Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-muted/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-4 animate-fade-in">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search franchise brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 h-12 bg-muted/50 border-transparent rounded-xl"
                data-testid="input-search-mobile"
              />
            </div>
          </form>
          <nav className="flex flex-col gap-1">
            <Link href="/directory" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActiveRoute("/directory") ? "secondary" : "ghost"}
                className="w-full justify-start h-12 text-base font-medium rounded-xl"
                data-testid="link-directory-mobile"
              >
                Directory
              </Button>
            </Link>
            <Link href="/compare" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant={isActiveRoute("/compare") ? "secondary" : "ghost"}
                className="w-full justify-start h-12 text-base font-medium rounded-xl"
                data-testid="link-compare-mobile"
              >
                Compare
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
