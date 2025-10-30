
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      console.log("Attempting login with:", { email: formData.email });
      
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", {
        status: response.status,
        ok: response.ok,
        data
      });

      if (response.ok) {
        console.log("Login successful, cookie should be set");
        
        // Wait a moment for the cookie to be processed
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Use window.location for a full page reload to ensure middleware runs
        console.log("Redirecting to dashboard...");
        window.location.href = "/dashboard";
      } else {
        console.error("Login failed:", data);
        setErrors({ 
          general: data.error || data.message || "Login failed. Please try again." 
        });
      }
    } catch (error) {
      console.error("Network error during login:", error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold text-blue-600">
            HelpEdge
          </CardTitle>
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
              Don&apos;t have an account?{" "}
              <a
                href="/auth/register"
                className="text-blue-600 hover:underline"
              >
                Sign up
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}