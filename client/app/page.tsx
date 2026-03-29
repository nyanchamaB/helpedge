import dynamic from 'next/dynamic';

// Lazy load heavy landing page components
const NavHeader = dynamic(() => import('./onboarding/navsection'), {
  ssr: true,
});

const HomePage = dynamic(() => import('./onboarding/home'), {
  ssr: true,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-lg">Loading...</div>
    </div>
  ),
});

export default function Page() {
  return (
    <>
      <NavHeader />
      <HomePage />
    </>
  );
}
