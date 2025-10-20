import NavHeader from "@/app/onboarding/navsection";
export default function Analytics() {
  return (
    <>
        <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Analytics</h1>
      <p className="text-gray-600 mb-6">
        Get insights from your IT service data with real-time analytics dashboards.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-2">What You Can Do</h2>
        <ul className="list-disc list-inside text-gray-700">
          <li>Track incident resolution times</li>
          <li>Measure SLA compliance</li>
          <li>Identify bottlenecks in service workflows</li>
        </ul>
      </section>
    </>
  );
}
