"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrl } from "@/lib/utils/redirect";
import { siteConfig } from "@/config/site";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      console.log("LoginForm: Submitting login...");

      // Get any custom redirect from URL params
      const customRedirect = getRedirectUrl(searchParams);
      // Only use custom redirect if it's not the default dashboard
      const redirectTo =
        customRedirect !== "/dashboard" ? customRedirect : undefined;

      const result = await login(formData, redirectTo);
      console.log("LoginForm: Login result:", result);

      if (result.success) {
        // Use role-based redirect URL from AuthContext, or custom redirect
        const redirectUrl = result.redirectUrl || "/dashboard";
        console.log("LoginForm: Redirecting to:", redirectUrl);

        // Use router.push for client-side navigation
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          router.push(redirectUrl);
        }, 100);
      } else {
        console.error("LoginForm: Login failed:", result.error);
        setErrors({
          general:
            result.error || "Login failed. Please check your credentials.",
        });
      }
    } catch (error) {
      console.error("LoginForm: Login error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
      console.log("LoginForm: Loading set to false");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear errors when user starts typing
    if (errors.general) {
      setErrors({});
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src={siteConfig.logo}
              alt="HelpEdge Logo"
              className="h-16 w-auto"
            />
          </div>
          <p className="text-gray-600">Sign in to your account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Have an issue accessing account?{" "}
              <a
                href="/auth/contact-support"
                className="text-blue-600 hover:underline"
              >
                Contact Support
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
