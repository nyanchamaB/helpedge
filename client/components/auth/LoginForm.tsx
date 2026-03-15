"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getRedirectUrl } from "@/lib/utils/redirect";
import { siteConfig } from "@/config/site";
import { Loader2, Sparkles } from "lucide-react";
import Image from "next/image";

export default function LoginForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  /* Page loader */
  useEffect(() => {
    const t = setTimeout(() => setIsPageLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  /* Animated background */
  useEffect(() => {
    if (!canvasRef.current || isPageLoading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let time = 0;
    const waves = [
      { amp: 18, freq: 0.01, speed: 0.015, color: "rgba(59,130,246,0.08)" },
      { amp: 25, freq: 0.015, speed: 0.01, color: "rgba(99,102,241,0.06)" },
    ];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      waves.forEach((w, i) => {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);

        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin(x * w.freq + time * w.speed + i) * w.amp;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, w.color);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fill();
      });

      time += 0.5;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPageLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const redirectTo = getRedirectUrl(searchParams);
      const result = await login(formData, redirectTo);

      if (result.success) {
        router.push(result.redirectUrl || "/dashboard");
      } else {
        setErrors({ general: result.error });
      }
    } catch {
      setErrors({ general: "Unexpected error. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Main Card */}
      <Card className="relative z-10 w-full max-w-5xl overflow-hidden shadow-2xl border-0 backdrop-blur-md bg-card/80">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

          {/* LEFT — LOGIN */}
          <div className="flex items-center justify-center bg-card px-8 py-12">
            <div className="w-full max-w-sm space-y-6">
              <div className="text-center space-y-2">
                <img src={siteConfig.logo} alt="HelpEdge" className="h-12 mx-auto" />
                <h1 className="text-2xl font-semibold text-foreground">
                  Welcome back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to continue
                </p>
              </div>

              {errors.general && (
                <div className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm px-4 py-3 rounded-md">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Need help?{" "}
                <a
                  href="/auth/contact-support"
                  className="text-blue-600 hover:underline"
                >
                  Contact support
                </a>
              </p>
            </div>
          </div>

          {/* RIGHT — VISUAL PANEL */}
          <div className="relative bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-12 flex flex-col justify-between overflow-hidden">

            {/* Abstract shapes */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-pink-400/30 rounded-full blur-3xl" />
            <div className="absolute bottom-10 -left-24 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-4">
              <h2 className="text-3xl font-semibold leading-tight">
                Manage your work <br /> in one place
              </h2>
              <p className="text-sm text-white/80 max-w-sm">
                Track progress, manage requests, and stay organized effortlessly.
              </p>
            </div>

            <div className="relative z-10 mt-8">
              <div className="bg-white/15 backdrop-blur-md rounded-xl p-4 shadow-xl">
                <div className="h-40 rounded-lg bg-white/20 flex items-center justify-center text-white/70 text-sm">
                  Dashboard preview
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between text-sm text-white/80">
              <span>Trusted by teams worldwide</span>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => window.open("/demo", "_blank")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                View demo
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
