import { StatsCards } from "@/components/dashboard/StatsCards";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CampaignsList } from "@/components/dashboard/CampaignsList";

export default function DashboardOverview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <StatsCards />
        </div>
        <div className="lg:col-span-1">
          <BalanceCard />
        </div>
      </div>
      <CampaignsList />
    </div>
  );
}
