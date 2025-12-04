import { Link } from "wouter";
import { Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explore: [
      { label: "Brand Directory", href: "/directory", testId: "link-footer-directory" },
      { label: "Compare Brands", href: "/compare", testId: "link-footer-compare" },
      { label: "Top Rated", href: "/directory?sort=top-rated" },
      { label: "Categories", href: "/directory" },
    ],
    business: [
      { label: "Claim Your Profile", href: "/claim" },
      { label: "Franchisor Portal", href: "/franchisor" },
      { label: "Franchisee Portal", href: "/franchisee" },
      { label: "Advertise", href: "/advertise" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="relative border-t border-border/50 bg-muted/20">
      {/* Grain overlay */}
      <div className="absolute inset-0 grain-overlay pointer-events-none opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative h-10 w-10 flex items-center justify-center">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary to-primary/80" />
                <span className="relative font-display text-lg font-bold text-primary-foreground">Z</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight text-foreground">
                Zee<span className="text-accent">Verify</span>
              </span>
            </Link>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
              The premier franchise intelligence platform. Verified reviews from real owners,
              AI-powered analysis, and data-driven insights.
            </p>

            {/* Trust badge */}
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">
                Trusted by 50,000+ investors
              </span>
            </div>
          </div>

          {/* Explore Column */}
          <div className="col-span-1 md:col-span-2">
            <h4 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                    data-testid={link.testId}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Column */}
          <div className="col-span-1 md:col-span-3">
            <h4 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              For Business
            </h4>
            <ul className="space-y-3">
              {footerLinks.business.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div className="col-span-1 md:col-span-3 lg:col-span-2">
            <h4 className="font-semibold text-sm text-foreground mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} ZeeVerify. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
