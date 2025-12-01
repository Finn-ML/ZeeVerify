import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-semibold text-lg text-primary mb-4">ZeeVerify</h3>
            <p className="text-sm text-muted-foreground">
              Verified reviews powered by franchisees. Make informed franchise investment decisions.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/directory" className="hover:text-foreground transition-colors" data-testid="link-footer-directory">
                  Brand Directory
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors" data-testid="link-footer-compare">
                  Compare Brands
                </Link>
              </li>
              <li>
                <Link href="/directory?sort=top-rated" className="hover:text-foreground transition-colors">
                  Top Rated
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4">For Businesses</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/claim" className="hover:text-foreground transition-colors">
                  Claim Your Profile
                </Link>
              </li>
              <li>
                <Link href="/franchisor" className="hover:text-foreground transition-colors">
                  Franchisor Portal
                </Link>
              </li>
              <li>
                <Link href="/franchisee" className="hover:text-foreground transition-colors">
                  Franchisee Portal
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ZeeVerify. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Trusted by franchisees nationwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
