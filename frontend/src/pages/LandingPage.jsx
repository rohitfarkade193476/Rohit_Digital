import React from "react";

import LandingNavbar from "../components/landing/LandingNavbar.jsx";
import HeroSection from "../components/landing/HeroSection.jsx";
import FeaturesSection from "../components/landing/FeaturesSection.jsx";
import HowItWorksSection from "../components/landing/HowItWorksSection.jsx";
import RoleSolutionsSection from "../components/landing/RoleSolutionsSection.jsx";
import ProductPreviewSection from "../components/landing/ProductPreviewSection.jsx";
import TrustValueSection from "../components/landing/TrustValueSection.jsx";
import FinalCTA from "../components/landing/FinalCTA.jsx";
import LandingFooter from "../components/landing/LandingFooter.jsx";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <LandingNavbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RoleSolutionsSection />
        <ProductPreviewSection />
        <TrustValueSection />
        <FinalCTA />
      </main>

      <LandingFooter />
    </div>
  );
}