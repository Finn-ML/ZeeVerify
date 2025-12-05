import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2, Shield } from "lucide-react";
import { registerSchema, type RegisterInput } from "@shared/schema";

function PasswordStrengthIndicator({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", valid: password.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(password) },
    { label: "Number", valid: /[0-9]/.test(password) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-2 text-sm">
          {check.valid ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-300" />
          )}
          <span className={check.valid ? "text-green-600" : "text-gray-500"}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "franchisee",
    },
  });

  const password = watch("password", "");

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      setLocation("/verify-email-sent");
    },
    onError: (error: Error) => {
      setServerError(error.message);
    },
  });

  const onSubmit = (data: RegisterInput) => {
    setServerError("");
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-navy">Create an Account</CardTitle>
            <CardDescription>
              Join ZeeVerify to access franchise reviews and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
                <PasswordStrengthIndicator password={password} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>I am a...</Label>
                <RadioGroup
                  defaultValue="franchisee"
                  onValueChange={(value) => {
                    const event = {
                      target: { name: "userType", value },
                    } as React.ChangeEvent<HTMLInputElement>;
                    register("userType").onChange(event);
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="franchisee" id="franchisee" />
                    <Label htmlFor="franchisee" className="font-normal cursor-pointer">
                      Franchisee / Investor
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="franchisor" id="franchisor" />
                    <Label htmlFor="franchisor" className="font-normal cursor-pointer">
                      Franchisor
                    </Label>
                  </div>
                </RadioGroup>
                {errors.userType && (
                  <p className="text-sm text-red-500">{errors.userType.message}</p>
                )}
              </div>

              <div className="rounded-lg bg-muted/50 border border-border/50 p-4 flex gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Your privacy is protected</p>
                  <p>All reviews are anonymous. Your name and email will never be displayed publicly.</p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-navy font-semibold"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-gold hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
