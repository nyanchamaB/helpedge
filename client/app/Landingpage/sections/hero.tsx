"use client";
import React from 'react';
import { siteConfig } from '@/config/site';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative bg-hero h-screen flex justify-center items-center text-center"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 bg-opacity-40 z-0" /> {/* Overlay */}
      <div className="container mx-auto p-4 pt-6 md:p-6 lg:p-12 xl:p-24 relative z-10">
        
        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {siteConfig.name}
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 "
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {siteConfig.description}
        </motion.p>

        <motion.a
          href="#features"
          className="inline-block bg-orange-500 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Learn More
        </motion.a>
      </div>
    </section>
  );
};

 