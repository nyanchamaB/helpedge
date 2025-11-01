"use client";

import * as Icons from "@mui/icons-material";
import { navLinks } from "@/common";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function NavHeader() {
  const pathname = usePathname();
  const [showSearch, setShowSearch] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Icons.Public className="text-indigo-600 text-2xl" />
          <span className="font-bold text-xl text-gray-800">HelpEdge</span>
        </Link>

        {/* Middle Nav (Desktop) */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <div
              key={link.label}
              className="relative"
              ref={link.dropdown ? dropdownRef : undefined}
            >
              {/* Render a dropdown-toggle button only when dropdown exists.
                  Otherwise render a normal Link so navigation works. */}
              {link.dropdown && link.dropdown.length > 0 ? (
                <>
                  <button
                    type="button"
                    className="text-gray-700 hover:text-indigo-600 font-medium transition flex items-center"
                    onClick={() =>
                      setOpenDropdown(openDropdown === link.label ? null : link.label)
                    }
                  >
                    {link.label}
                    <svg
                      className="ml-1 w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute left-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 z-50">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                          onClick={() => setOpenDropdown(null)}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href ?? "#"}
                  className={`text-gray-700 hover:text-indigo-600 font-medium transition`}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Search */}
          <div className="relative">
            {!showSearch ? (
              <button
                onClick={() => setShowSearch(true)}
                className="text-gray-700 hover:text-indigo-600"
              >
                <Icons.Search />
              </button>
            ) : (
              <div className="flex items-center border rounded-lg px-2">
                <Icons.Search className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="ml-2 outline-none border-none"
                  autoFocus
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <Icons.Close />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {/* <button className="text-gray-700 hover:text-indigo-600">Login</button> */}
          <Link 
            href="/auth/login"
            className="text-gray-700 hover:text-indigo-600"
          >
            Login
          </Link>
          <button className="px-4 py-2 border border-indigo-400 text-indigo-600 rounded-lg hover:bg-indigo-50">
             <Link
            href = "/ContactTeam"
            >
            Reach out to Us
          </Link>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-indigo-700">
            <Link
            href = "/GetStarted"
            >
            Get Started
          </Link>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 hover:text-indigo-600"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <Icons.Close /> : <Icons.Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white">
          <nav className="flex flex-col space-y-4 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-gray-700 hover:text-indigo-600"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setMobileOpen(false)}
              className="flex items-center text-gray-700 hover:text-indigo-600"
            >
              <Icons.Search className="mr-2" /> Search
            </button>
           {/* <button className="text-gray-700 hover:text-indigo-600">Login</button> */}
            <Link 
            href="/auth/login"
            className="text-gray-700 hover:text-indigo-600"
          >
            Login
          </Link>
            <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50">
              Reach out for support
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}