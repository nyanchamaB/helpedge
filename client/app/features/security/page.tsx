"use client";
import NavHeader from "@/app/onboarding/navsection";

export default function Security() {
  return (
    <>
        <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Security</h1>
      <p className="text-gray-600 mb-6">
        Keep your IT environment safe with enterprise-grade security.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Security Highlights</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>End-to-end encryption</li>
          <li>Role-based access control</li>
          <li>Regular compliance audits</li>
        </ul>
      </section>
    </>
  );
}
