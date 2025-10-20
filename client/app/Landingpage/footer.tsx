// Footer.tsx
import React from "react";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const { companyName, year, about, socialLinks } = siteConfig;

  return (
    <footer className="bg-gray-200 py-12">
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24">
        <div className="flex flex-wrap -mx-4">
          {/* About Section */}
          <div className="w-full md:w-1/2 xl:w-1/3 p-4 ">
            <h3 className="text-lg font-bold">About Us</h3>
            <p className="text-lg">{about}</p>
            <a href="/about" className="text-blue-600 hover:underline">
              View About Page
            </a>
          </div>

          {/* Social Links */}
          <div className="w-full md:w-1/3 p-4">
            <h3 className="text-lg font-bold">Follow Us</h3>
            <ul>
              <li>
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  className="text-lg hover:underline"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  className="text-lg hover:underline"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  className="text-lg hover:underline"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Copyright */}
          <div className="w-full md:w-1/3 p-4">
            <h3 className="text-lg font-bold">Copyright</h3>
            <p className="text-lg">
              &copy; {year} {companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
