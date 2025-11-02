"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";

export default function NavHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    {
      label: "Product",
      id: "features",
      hasDropdown: true,
      dropdownItems: [
        { label: "Features", action: () => scrollToSection("features") },
        { label: "Integrations", action: () => scrollToSection("integrations") },
        { label: "Analytics", action: () => scrollToSection("analytics") }
      ]
    },
    {
      label: "Resources",
      id: "resources",
      hasDropdown: true,
      dropdownItems: [
        { label: "Documentation", action: () => scrollToSection("resources") },
        { label: "Blog", action: () => scrollToSection("blog") },
        { label: "Case Studies", action: () => scrollToSection("case-studies") }
      ]
    },
    {
      label: "Support",
      id: "support",
      hasDropdown: false
    }
  ];

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100" 
          : "bg-white"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <img 
                src={siteConfig.logo} 
                alt="Logo" 
                className="h-8 lg:h-9 transition-transform duration-200 group-hover:scale-105" 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <div 
                key={item.label}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.hasDropdown ? (
                  <button className="flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50">
                    {item.label}
                    <ChevronDown 
                      className={`ml-1 w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.label ? "rotate-180" : ""
                      }`} 
                    />
                  </button>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  >
                    {item.label}
                  </button>
                )}
                
                {/* Dropdown Menu */}
                {item.hasDropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-in fade-in-0 zoom-in-95 duration-200">
                    {item.dropdownItems?.map((dropdownItem, index) => (
                      <button
                        key={index}
                        onClick={dropdownItem.action}
                        className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        <span className="font-medium">{dropdownItem.label}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/auth/login">
              <button className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50">
                Log In
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="flex items-center justify-between w-full px-3 py-3 text-left text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  >
                    {item.label}
                    {item.hasDropdown && <ChevronDown className="w-4 h-4" />}
                  </button>
                  
                  {item.hasDropdown && (
                    <div className="pl-4 space-y-1">
                      {item.dropdownItems?.map((dropdownItem, index) => (
                        <button
                          key={index}
                          onClick={dropdownItem.action}
                          className="block w-full px-3 py-2 text-left text-gray-600 hover:text-blue-600 transition-colors duration-200 rounded-md hover:bg-gray-50"
                        >
                          {dropdownItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link href="/auth/login" className="block">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full px-4 py-3 text-center text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-50"
                  >
                    Log In
                  </button>
                </Link>
                <Link href="/auth/login" className="block">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 shadow-lg"
                  >
                    Get Started Free
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}