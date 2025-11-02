"use client";
import React, { useState } from "react";
import { siteConfig } from "@/config/site";
import { ArrowLeft, ArrowRight} from "lucide-react"; 

export default function FeaturesSection() {
  const { features } = siteConfig;
  const [currentIndex, setCurrentIndex] = useState(0);
  const featuresPerPage = 3;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? features.length - featuresPerPage : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev + featuresPerPage >= features.length ? 0 : prev + 1
    );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleFeatures = features.slice(
    currentIndex,
    currentIndex + featuresPerPage
  );

  return (
    <section id="features" className="relative bg-white py-12">
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Features</h2>

        {/* Feature Cards */}
        <div className="flex justify-center gap-6">
          {visibleFeatures.map((feature, index) => (
            <div
              key={index}
              className="w-full sm:w-1/3 p-6 text-center rounded-2xl shadow-md hover:shadow-lg transition"
            >
              {feature.Image && (
                <img
                  src={feature.Image}
                  alt={feature.title}
                  className="mx-auto mb-4 h-50 w-60 object-contain"
                />
              )}
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {features.length > featuresPerPage && (
          <div className="flex justify-center mt-6 gap-6">
            <button
              onClick={handlePrev}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};


