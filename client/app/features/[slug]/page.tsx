import NavHeader from '@/app/onboarding/navsection';

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return (
    <>
      <NavHeader />
      <div>
        <h1>{title}</h1>
        <p>Content coming soon...</p>
      </div>
    </>
  );
}
