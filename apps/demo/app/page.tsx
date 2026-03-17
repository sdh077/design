import Header from "@/components/layout/Header";
import HeroSection from "@/components/sections/HeroSection";
import SummarySection from "@/components/sections/SummarySection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import WorkSection from "@/components/sections/WorkSection";
import TechStackSection from "@/components/sections/TechStackSection";
import CareerSection from "@/components/sections/CareerSection";
import ContactSection from "@/components/sections/ContactSection";

export default function Page() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />

      <main className="mx-auto max-w-6xl px-6 md:px-8 lg:px-10">
        <HeroSection />
        <SummarySection />
        <ProjectsSection />
        <WorkSection />
        <TechStackSection />
        <CareerSection />
        <ContactSection />
      </main>
    </div>
  );
}