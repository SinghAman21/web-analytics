import Image from "next/image";
import Header from "@/components/dashboard/Header";
import HeroSection from "@/components/dashboard/HeroSection";
import StatsRow from "@/components/dashboard/StatsRow";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import AppFooter from "@/components/shared/AppFooter";

export default function Home() {
  return (
<>
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection />

      <StatsRow />

      {/* Main Content - Tabbed Dashboard */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <DashboardTabs />
      </main>

      <AppFooter />
    </div>
</>
  );
}
