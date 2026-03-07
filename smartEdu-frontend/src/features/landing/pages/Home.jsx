import React from "react";
import Header from "@/shared/components/layout/Header";
import Footer from "@/shared/components/layout/Footer";
import HeroSection from "@/features/landing/pages/sections/HeroSection";
import FeaturesSection from "@/features/landing/pages/sections/FeaturesSection";
import TestimonialsSection from "@/features/landing/pages/sections/TestimonialsSection";
import CTASection from "@/features/landing/pages/sections/CTASection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
