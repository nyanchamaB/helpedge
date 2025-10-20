import NavHeader from "@/app/onboarding/navsection";
export default function Documents() {
    return (
        <>
            <NavHeader />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Documentation</h1>
            <p className="text-gray-600 mb-6">
                Explore our comprehensive guides and resources to get the most out of HelpEdge.
            </p>
            <section className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
                <ul className="list-disc list-inside text-gray-700">
                    <li>Installation Guide</li>
                    <li>User Manual</li>
                    <li>API Documentation</li>
                </ul>
            </section>
        </>
    );
}  
