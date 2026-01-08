"use client";
import FeatureSection from "./feature-section";
import EditorPreview from "./editor-preview";
import HeroSection from "./hero-section";

const Home = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <main className="flex-1 h-auto md:min-h-screen bg-gray-50 dark:bg-[#1a1f2c] overflow-hidden">
        {/* Hero Section*/}
        <HeroSection />

        {/* Features Section */}
        <FeatureSection />

        {/* Editor Preview Section */}
        <EditorPreview />
      </main>
    </div>
  );
};

export default Home;
