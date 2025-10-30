"use client";
import NavHeader from "@/app/onboarding/navsection";

export default function Integrations() {
  return (
    <>
        <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Integrations</h1>
      <p className="text-gray-600 mb-6">
        Connect HelpEdge seamlessly with your existing tools and services.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Popular Integrations</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Slack & Microsoft Teams for collaboration</li>
          <li>Jira & GitHub for project management</li>
          <li>Google Workspace & Office 365</li>
        </ul>
      </section>
    </>
  );
}
