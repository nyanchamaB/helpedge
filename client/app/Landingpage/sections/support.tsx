import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function SupportSection() {
  const { contact, faqsLink, options } = siteConfig.support;

  return (
    <section id="support" className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center">Support</h2>

        {/* Contact Info */}
        <div className="mb-6">
          <p className="text-lg">
            Email:{" "}
            <a
              href={`mailto:${contact.email}`}
              className="text-blue-600 underline"
            >
              {contact.email}
            </a>
          </p>
          <p className="text-lg">Phone: {contact.phone}</p>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-2">{option.title}</h3>
              <p className="mb-4">{option.description}</p>
              {option.title === "FAQs" && (
                <Link
                  href={faqsLink}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Visit FAQs →
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
