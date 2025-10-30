"use client";
import { footerLinks } from "@/common";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-100 pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
        {footerLinks.map((section) => (
          <div key={section.title}>
            <h4 className="font-bold mb-4 text-lg text-white">{section.title}</h4>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="hover:text-blue-400 transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} HelpEdge. All rights reserved.
      </div>
    </footer>
  );
}