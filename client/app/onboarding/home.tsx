"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ComputerIcon from "@mui/icons-material/Computer";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import EmailIcon from "@mui/icons-material/Email";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import PhoneIcon from "@mui/icons-material/Phone";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import SecurityIcon from "@mui/icons-material/Security";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import GroupIcon from "@mui/icons-material/Group";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useState, useEffect } from "react";

const heroPhrases = [
  "HelpEdge – Powering Modern ITSM",
  "Streamline service delivery",
  "Empower your IT teams",
  "Transform how technology supports your business",
  "AI-driven ITSM solutions",
];

export default function HomePage() {
  const [isVideoHovered, setIsVideoHovered] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % heroPhrases.length);
    }, 2500); 
    return () => clearInterval(interval);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  return (
    <main className="flex flex-col w-full bg-white">
      {/* Hero Section */}
      <section
        id="/"
        className="relative bg-gradient-to-br from-blue-700 via-blue-200 to-black text-white px-6 text-center overflow-hidden min-h-[75vh] md:min-h-[75vh] flex flex-col justify-center"
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <motion.h2
            key={currentPhrase}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight min-h-[4rem]"
          >
            {heroPhrases[currentPhrase]}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-blue-100 leading-relaxed"
          >
            Let's revolutionize your IT service management with HelpEdge.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-6 mb-16 flex-wrap"
          >
            <button className="px-10 py-4 bg-white text-blue-900 font-bold rounded-lg shadow-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
              Start Free Trial
            </button>
            <button className="px-10 py-4 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-900 transition-all duration-300 font-bold transform hover:scale-105">
              Request Demo
            </button>
          </motion.div>

          {/* Animated Dashboard Video/Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex justify-center"
          >
            <motion.div
              className="relative w-full max-w-4xl cursor-pointer"
              onHoverStart={() => setIsVideoHovered(true)}
              onHoverEnd={() => setIsVideoHovered(false)}
              animate={{
                y: isVideoHovered ? [-5, 5, -5] : 0,
              }}
              transition={{
                duration: 3,
                repeat: isVideoHovered ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <motion.div
                animate={{
                  scale: isVideoHovered ? 1.02 : 1,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="relative"
              >
                <Image
                  src="/dashboard.PNG"
                  alt="ITSM Dashboard preview"
                  width={1400}
                  height={700}
                  className="rounded-2xl shadow-2xl border-4 border-white/20"
                />
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                >
                  <PlayCircleIcon className="text-white w-24 h-24 opacity-90 drop-shadow-2xl" />
                </motion.div>

                {/* Video Play Overlay */}
                {isVideoHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white text-center"
                    >
                      <div className="text-2xl font-bold mb-2">Watch Demo</div>
                      <div className="text-lg">See HelpEdge ITSM in action</div>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>

              {/* Floating elements when hovered */}
              {isVideoHovered && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                  >
                    Live Demo
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold"
                  >
                    AI-Powered
                  </motion.div>
                </>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-32 px-6 bg-gradient-to-b from-white to-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-blue-900">
            Comprehensive ITSM Solutions
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            End-to-end IT Service Management platform designed to optimize
            workflows, reduce costs, and enhance service quality across your
            organization.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
        >
          {[
            {
              icon: <ComputerIcon fontSize="large" className="text-blue-600" />,
              title: "Service Desk",
              desc: "Unified platform for incident, problem, and change management with AI-powered ticket routing.",
              features: [
                "Incident Management",
                "Problem Resolution",
                "Change Control",
              ],
            },
            {
              icon: <SettingsIcon fontSize="large" className="text-green-600" />,
              title: "Process Automation",
              desc: "Automate repetitive IT processes and workflows to increase efficiency and reduce human error.",
              features: [
                "Workflow Automation",
                "Self-Service Portal",
                "AI Chatbots",
              ],
            },
            {
              icon: <BarChartIcon fontSize="large" className="text-purple-600" />,
              title: "Advanced Analytics",
              desc: "Real-time dashboards and predictive analytics for data-driven decision making.",
              features: ["KPI Tracking", "Predictive Insights", "Custom Reports"],
            },
            {
              icon: <SecurityIcon fontSize="large" className="text-red-600" />,
              title: "Security & Compliance",
              desc: "Enterprise-grade security with compliance frameworks for ITIL, ISO 20000, and more.",
              features: ["ITIL Compliance", "Audit Trails", "Risk Management"],
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="p-8 rounded-2xl shadow-xl border border-gray-100 bg-white hover:shadow-2xl transition-all duration-300"
            >
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-blue-50 rounded-2xl">{feature.icon}</div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{feature.desc}</p>
              <ul className="space-y-2">
                {feature.features.map((item, i) => (
                  <li key={i} className="flex items-center text-sm text-gray-500">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ITSM Benefits Section */}
      <section className="py-32 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-blue-900">
            Transform Your IT Service Delivery
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Organizations using HelpEdge ITSM experience significant improvements in
            service quality and operational efficiency.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            {
              value: "95%",
              label: "Faster Incident Resolution",
              icon: <TrendingUpIcon className="w-8 h-8" />,
            },
            {
              value: "80%",
              label: "Reduced Downtime",
              icon: <CloudQueueIcon className="w-8 h-8" />,
            },
            {
              value: "70%",
              label: "Improved Team Efficiency",
              icon: <GroupIcon className="w-8 h-8" />,
            },
            {
              value: "60%",
              label: "Cost Reduction",
              icon: <BarChartIcon className="w-8 h-8" />,
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl text-white text-center"
            >
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-white/20 rounded-full">{stat.icon}</div>
              </div>
              <h3 className="text-5xl font-bold mb-2">{stat.value}</h3>
              <p className="text-blue-100 text-lg">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Customer Success Stories */}
      <section className="py-32 px-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
            Trusted by Leading Organizations
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            See how enterprises are transforming their IT service management with
            HelpEdge.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {[
            {
              quote: "HelpEdge reduced our mean time to resolution by 95% and transformed our IT support operations.",
              company: "TechCorp Global",
              role: "CIO",
              metrics: ["95% Faster Resolution", "40% Cost Reduction"],
            },
            {
              quote: "The automation capabilities helped us scale our IT services across 15 countries seamlessly.",
              company: "FinServe International",
              role: "CTO",
              metrics: ["Scaled to 15 Countries", "80% Automation Rate"],
            },
            {
              quote: "Implementation was smooth and the ROI was evident within the first quarter of use.",
              company: "HealthCare Plus",
              role: "IT Director",
              metrics: ["ROI in 3 Months", "99.9% Uptime"],
            },
          ].map((story, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              whileHover={{ y: -10 }}
              className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="text-4xl text-blue-500 mb-4"></div>
              <p className="italic text-lg text-gray-700 mb-6 leading-relaxed">
                {story.quote}
              </p>
              <div className="border-t pt-4">
                <span className="block font-semibold text-blue-900 text-lg">
                  {story.company}
                </span>
                <span className="block text-gray-600">{story.role}</span>
                <div className="flex flex-wrap gap-2 mt-3">
                  {story.metrics.map((metric, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ITSM Evolution Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-blue-900">
              The Evolution of ITSM
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From traditional IT support to modern AI-driven service management -
              understand the journey.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h3 className="text-3xl font-bold mb-6 text-gray-800">
                From Reactive to Proactive ITSM
              </h3>
              <div className="space-y-6">
                {[
                  {
                    era: "1990s",
                    title: "Reactive Support",
                    desc: "Break-fix model with manual processes",
                  },
                  {
                    era: "2000s",
                    title: "ITIL Framework",
                    desc: "Standardized processes and best practices",
                  },
                  {
                    era: "2010s",
                    title: "Cloud & Mobile",
                    desc: "Remote support and cloud-based solutions",
                  },
                  {
                    era: "2020s",
                    title: "AI-Driven ITSM",
                    desc: "Predictive analytics and automation",
                  },
                ].map((period, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 10 }}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold min-w-[80px] text-center">
                      {period.era}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{period.title}</h4>
                      <p className="text-gray-600">{period.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex justify-center"
            >
              <Image
                src="/report.PNG"
                alt="ITSM Evolution Timeline"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Curved CTA Section */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        {/* Curved Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-700"></div>

        {/* Curved SVG at the bottom */}
        <svg
          className="absolute left-0 bottom-0 w-full h-32"
          viewBox="0 0 1440 150"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C480,150 960,0 1440,150 L1440,150 L0,150 Z"
            fill="white"
            fillOpacity="1"
          />
        </svg>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your ITSM Strategy?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Join thousands of organizations using HelpEdge to modernize their IT
            service management.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-white text-blue-900 font-bold rounded-lg shadow-2xl hover:bg-blue-50 transition-all duration-300"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 border-2 border-white rounded-lg text-white hover:bg-white hover:text-blue-900 transition-all duration-300 font-bold"
            >
              Schedule Demo
            </motion.button>
          </div>

          {/* Floating elements */}
          <motion.div
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-10 -left-10 text-white/10"
          >
            <SettingsIcon className="w-32 h-32" />
          </motion.div>

          <motion.div
            animate={{
              y: [0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute -bottom-10 -right-10 text-white/10"
          >
            <ComputerIcon className="w-32 h-32" />
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}