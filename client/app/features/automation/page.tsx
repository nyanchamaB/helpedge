"use client";
import NavHeader from "@/app/onboarding/navsection";

export default function Automation() {
  return (
    <>
        <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Automation</h1>
      <p className="text-gray-600 mb-6">
        Automate repetitive IT processes and streamline workflows with HelpEdge Automation.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Key Benefits</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Save time on routine tasks</li>
          <li>Reduce human errors in workflows</li>
          <li>Boost IT team productivity</li>
        </ul>
      </section>
    </>
  );
}
