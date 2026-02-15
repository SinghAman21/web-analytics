import Image from "next/image";
import Header from "@/components/dashboard/Header";
import HeroSection from "@/components/dashboard/HeroSection";
import StatsRow from "@/components/dashboard/StatsRow";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

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

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-serif text-xl italic">Pulse</span>
            <p className="text-sm text-muted-foreground mt-1">Analytics for the modern web</p>
          </div>
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <span className="font-mono">v2.4.0</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>
    </div>
</>
  );
}
