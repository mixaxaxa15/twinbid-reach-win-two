import { StatsCards } from "@/components/dashboard/StatsCards";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const recentCampaigns = [
  { id: "10001", name: "Летняя распродажа 2024", status: "active", impressions: 45230, spent: 2340 },
  { id: "10002", name: "Новая коллекция", status: "active", impressions: 89120, spent: 6780 },
  { id: "10003", name: "Бренд-кампания", status: "paused", impressions: 28900, spent: 1520 },
  { id: "10006", name: "Ретаргетинг Q1", status: "moderation", impressions: 0, spent: 0 },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Активна", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  paused: { label: "На паузе", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  moderation: { label: "На модерации", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

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

      {/* Info-only campaigns list — no actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Последние кампании</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Название</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Показы</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Расход</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border/50">
                    <td className="py-3 px-4 text-muted-foreground font-mono text-sm">{c.id}</td>
                    <td className="py-3 px-4 font-medium">{c.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={cn("font-normal", statusConfig[c.status]?.className)}>
                        {statusConfig[c.status]?.label}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">{c.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">${c.spent.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
