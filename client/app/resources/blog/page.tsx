import NavHeader from "@/app/onboarding/navsection";
export default function Blog() {
  return (
    <>
      <NavHeader />
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Blog</h1>
      <p className="text-gray-600 mb-6">
        Stay updated with the latest news, tips, and best practices in IT service management.
      </p>
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Recent Posts</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Best Practices for IT Service Management</li>
            <li>How to Improve Customer Satisfaction with IT Services</li>
            <li>Best Practices for IT Service Management</li>
          </ul>
        </section>  
    </>
  );
}