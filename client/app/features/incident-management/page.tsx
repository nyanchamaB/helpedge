"use client";
import NavHeader from "@/app/onboarding/navsection";

export default function IncidentManagement() {
    return (
        <>
        <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Incident Management</h1>
      <p className="text-gray-600 mb-6">
        Streamline your incident response with HelpEdge's powerful management tools.
      </p>
        <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Key Features</h2>
            <ul className="list-disc list-inside text-gray-700">
                <li>Automated ticket creation and categorization</li>
                <li>Intelligent routing to the right teams</li>
                <li>Real-time collaboration and communication</li>
                <li>Comprehensive reporting and analytics</li>
            </ul>
        </section>
        </>
    );
}