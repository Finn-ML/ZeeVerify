import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Directory from "@/pages/directory";
import BrandDetail from "@/pages/brand-detail";
import Compare from "@/pages/compare";
import Settings from "@/pages/settings";
import FranchiseePortal from "@/pages/franchisee";
import FranchisorPortal from "@/pages/franchisor";
import ClaimBrandPage from "@/pages/franchisor/claim-brand";
import ClaimSuccessPage from "@/pages/franchisor/claim-success";
import AdminDashboard from "@/pages/admin";
import Register from "@/pages/register";
import VerifyEmailSent from "@/pages/verify-email-sent";
import VerifyEmail from "@/pages/verify-email";
import VerifyNewEmail from "@/pages/verify-new-email";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/" component={isLoading || !isAuthenticated ? Landing : Directory} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/verify-email-sent" component={VerifyEmailSent} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/verify-new-email" component={VerifyNewEmail} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/directory" component={Directory} />
      <Route path="/brand/:slug" component={BrandDetail} />
      <Route path="/compare" component={Compare} />
      <Route path="/settings" component={Settings} />
      <Route path="/franchisee" component={FranchiseePortal} />
      <Route path="/franchisee/:rest*" component={FranchiseePortal} />
      <Route path="/franchisor" component={FranchisorPortal} />
      <Route path="/franchisor/claim/:brandId" component={ClaimBrandPage} />
      <Route path="/franchisor/claim-success" component={ClaimSuccessPage} />
      <Route path="/franchisor/:rest*" component={FranchisorPortal} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/:rest*" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="zeeverify-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
