"use client";
import NavHeader from "../onboarding/navsection";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Trial",
      price: "Free",
      description: "Start exploring with full access for small teams.",
      features: [
        "Up to 10 active users",
        "1:1 and group messaging",
        "Basic integrations (e.g., Google Drive)",
        "Community support",
      ],
      buttonText: "Get Started",
      highlight: false,
    },
    {
      name: "Business",
      price: "$29/mo",
      description: "Built for growing teams that need collaboration and scale.",
      features: [
        "Unlimited users & channels",
        "Threaded discussions & shared workspaces",
        "Advanced integrations (Zapier, Slack APIs)",
        "Priority email & chat support",
        "Real-time analytics & reporting",
      ],
      buttonText: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description:
        "Enterprise-grade security, customization, and dedicated onboarding.",
      features: [
        "Everything in Business",
        "Single sign-on (SSO/SAML)",
        "Custom data residency & compliance",
        "Dedicated account manager",
        "24/7 priority support",
      ],
      buttonText: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <>
      <NavHeader />

      {/* Clean background like Slack */}
      <div className="relative overflow-hidden min-h-screen bg-white">
        {/* Main content */}
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          {/* ========== Pricing Section ========== */}
          <div className="max-w-7xl mx-auto text-center mb-16">
            <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              Plans for Every Team
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that matches your workflow and scale confidently
              as your business grows.
            </p>
          </div>

          {/* Pricing Cards - Slack style */}
          <div className="max-w-7xl mx-auto grid gap-0 md:grid-cols-3 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`flex flex-col bg-white p-8 relative ${
                  index !== plans.length - 1 ? 'md:border-r border-gray-300' : ''
                } ${
                  plan.highlight
                    ? "md:-mt-4 md:mb-4 md:py-12 shadow-xl z-10 border-2 border-blue-600 rounded-lg"
                    : ""
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-8 min-h-[48px]">{plan.description}</p>

                  <Link
                    href="/GetStarted"
                    className={`block w-full py-3.5 rounded-md font-semibold text-center transition-all mb-8 ${
                      plan.highlight
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-md"
                        : "border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {plan.buttonText}
                  </Link>

                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start text-sm">
                        <svg
                          className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* ========== Feature Comparison Table ========== */}
          <div className="max-w-6xl mt-24 mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Compare Features Across Plans
            </h3>
            <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-300">
                    <th className="py-5 px-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th key={plan.name} className="py-5 px-6 text-center text-sm font-bold text-gray-900 uppercase tracking-wider">
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    "Users included",
                    "Messaging & channels",
                    "Integrations",
                    "Analytics & reporting",
                    "Support",
                  ].map((feature) => (
                    <tr key={feature} className="hover:bg-gray-50">
                      <td className="py-5 px-6 text-sm font-medium text-gray-900">
                        {feature}
                      </td>
                      {plans.map((plan) => (
                        <td key={plan.name} className="py-5 px-6 text-center">
                          {plan.features.some((f) =>
                            f.toLowerCase().includes(feature.toLowerCase())
                          ) ? (
                            <svg
                              className="w-6 h-6 mx-auto text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <span className="text-gray-300 text-xl">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========== Infrastructure Section ========== */}
          <div className="max-w-7xl mx-auto mt-24">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 md:p-16 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Content Left */}
                <div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    Infrastructure Efficiency & Security Guaranteed
                  </h3>
                  <p className="text-lg text-gray-700 mb-10">
                    We've engineered our infrastructure for reliability,
                    scalability, and enterprise-grade protection—so you can build and
                    grow with confidence.
                  </p>

                  <div className="grid gap-6">
                    {[
                      { title: "Multi-Region Resilience", desc: "Redundant deployments with automated failover for minimal downtime." },
                      { title: "Zero-Trust Security", desc: "Encrypted traffic (TLS 1.3), RBAC, and SSO/SAML integration." },
                      { title: "Continuous Observability", desc: "24/7 performance tracking and proactive incident detection." },
                      { title: "Compliance Ready", desc: "SOC 2 Type II, GDPR, and custom data residency options." }
                    ].map((item) => (
                      <div key={item.title} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Right */}
                <div className="order-first md:order-last">
                  <div className="bg-white rounded-xl shadow-lg p-8 aspect-square flex items-center justify-center">
                    <img
                      src="/images/infrastructure-illustration.png"
                      alt="Infrastructure illustration"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== Final CTA Section ========== */}
          <div className="max-w-5xl mx-auto mt-24">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-center text-white shadow-xl">
              <h4 className="text-4xl font-bold mb-4">
                Modern Infrastructure. Future-Proof Performance.
              </h4>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-10">
                With container orchestration, autoscaling, and intelligent
                routing, your operations stay fast, efficient, and secure—no
                matter your team size.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/GetStarted"
                  className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold transition-all text-lg shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  href="/ContactTeam"
                  className="inline-block px-10 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 font-bold transition-all text-lg"
                >
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}