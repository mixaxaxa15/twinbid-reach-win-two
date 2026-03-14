import { TrendingUp, Eye, MousePointer, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

export function StatsCards() {
  const { t } = useLanguage();

  const stats = [
    { label: t("statsCards.impressions"), value: "124,892", change: "+12.5%", icon: Eye, color: "text-primary" },
    { label: t("statsCards.clicks"), value: "8,234", change: "+8.2%", icon: MousePointer, color: "text-primary" },
    { label: t("statsCards.ctr"), value: "6.59%", change: "+2.1%", icon: Target, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-xs text-primary">{stat.change}</span>
                </div>
              </div>
              <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
