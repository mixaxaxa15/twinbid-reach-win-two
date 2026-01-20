import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CampaignsList } from "@/components/dashboard/CampaignsList";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { StatsCards } from "@/components/dashboard/StatsCards";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <StatsCards />
            </div>
            <div className="lg:col-span-1">
              <BalanceCard />
            </div>
          </div>
          <CampaignsList />
        </main>
      </div>
    </div>
  );
}
