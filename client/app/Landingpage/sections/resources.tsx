import React from "react";

// mock data for resources
import { siteConfig } from "@/config/site";
const resources = [
  {
    title: "Knowledge Base",
    description: "Access guides, troubleshooting steps, and best practices.",
    link: "/knowledge-base"
  },
  {
    title: "Documentation",
    description: "Read detailed technical documentation for the platform.",
    link: "/docs"
  },
  {
    title: "Video Tutorials",
    description: "Watch step-by-step tutorials to get started quickly.",
    link: "/videos"
  },
  {
    title: "Community Forum",
    description: "Engage with other users and our support team.",
    link: "/community"
  }
];

export default function ResourcesSection() {
  return (
    <section id="resources" className="resources-section bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.link}
              className="block bg-gray-100 p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <h3 className="text-xl font-semibold mb-3">{resource.title}</h3>
              <p className="text-gray-700">{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
