"use client";
import NavHeader from "@/app/onboarding/navsection";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { FcGoogle } from "react-icons/fc" ;       
import { FaMicrosoft } from "react-icons/fa";
import { useRouter } from "next/navigation";
export default function GetStartedPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    }
  }, []);

  const handleContinue = () => {
    if (!email || !email.includes("@")) return;
    sessionStorage.setItem("register_email", email);
    router.push("/auth/register");
  };

  return (
    <>
      <NavHeader />
      <Card className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 px-6 py-16 relative overflow-hidden">
        {/* Floating Card - made larger */}
        <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-md p-12 md:p-16 rounded-3xl shadow-2xl border border-blue-100 transition-transform hover:scale-[1.01]">
          
          {/* Logo */}
          <div className="mb-8 text-center flex justify-center">
            <img
              src={siteConfig.logo}
              alt="HelpEdge Logo"
              className="h-16 w-auto"
            />
          </div>

          {/* Title & description */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
            Enter your email to Sign up
          </h2>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Or choose another option below.
          </p>
          {/* Email input and button */}
           <div className="space-y-4 flex flex-col items-center">
            <Input
              type="email"
              placeholder="name@work-email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-center sm:w-80 px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              onClick={handleContinue}
              className="sm:w-80 px-4 py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition"
            >
              Continue
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 mt-4">
            <p>
              By signing up, you agree to our{" "}
              <Link href="/terms" className="text-blue-600 font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-600 font-medium hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            </div>
            <div className="text-center text-sm text-gray-600 mt-4">
              <p className="font-medium text-gray-700">OTHER OPTIONS</p>
              </div>
          {/* Divider */}
          <div className="my-8 border-t border-gray-200" />
          {/* Other options */}
          <div className="text-center text-sm text-gray-600">
            <div className="flex justify-center space-x-3 mt-4">
              <Button variant="outline">
                <FcGoogle className="mr-2 h-5 w-5" />
                  Continue with Google
              </Button>
              <Button variant="outline">
                <FaMicrosoft className="mr-2 h-5 w-5" />
                  Continue with Microsoft
              </Button>
            </div>
            <div className="">
                <p className="mt-4 text-gray-600">
              Already using HelpEdge?{" "}
              <Link href="/auth/login" className="text-blue-600 font-medium hover:underline">
                Sign in to an existing account
              </Link>
            </p>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
