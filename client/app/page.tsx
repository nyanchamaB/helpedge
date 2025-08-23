// LandingPage.tsx
import React from 'react';
import NavHeader from './Landingpage/navbar';
import HeroSection from './Landingpage/sections/hero';
import FeaturesSection from './Landingpage/sections/features';
import ResourcesSection from './Landingpage/sections/resources';
import SupportSection from './Landingpage/sections/support';
import Footer from './Landingpage/footer';

const LandingPage = () => {
  return (
    <div>
      <NavHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ResourcesSection />
        <SupportSection />
        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;