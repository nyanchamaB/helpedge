"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
//import Image from "next/image"; 

export default function NavHeader() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="bg-white py-4 shadow-md fixed w-full z-50">
      <div className="container mx-auto p-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <img src={siteConfig.logo} alt="Logo" className="h-8 cursor-pointer" />
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-6">
          <li>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-orange-500"
            >
              Features
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("resources")}
              className="hover:text-orange-500"
            >
              Resources
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection("support")}
              className="hover:text-orange-500"
            >
              Support
            </button>
          </li>
          <li>
            <Link href="/auth/login">
              <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
                Sign Up
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
