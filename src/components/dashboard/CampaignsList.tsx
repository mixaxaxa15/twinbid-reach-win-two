import { Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CreateCampaignDialog } from "./CreateCampaignDialog";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  format: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Летняя распродажа 2024",
    status: "active",
    format: "Баннер",
    budget: 50000,
    spent: 23400,
    impressions: 45230,
    clicks: 2890,
  },
  {
    id: "2",
    name: "Новая коллекция",
    status: "active",
    format: "Видео",
    budget: 100000,
    spent: 67800,
    impressions: 89120,
    clicks: 5670,
  },
  {
    id: "3",
    name: "Бренд-кампания",
    status: "paused",
    format: "Баннер",
    budget: 30000,
    spent: 15200,
    impressions: 28900,
    clicks: 1240,
  },
  {
    id: "4",
    name: "Тестовая кампания",
    status: "draft",
    format: "CTV",
    budget: 25000,
    spent: 0,
    impressions: 0,
    clicks: 0,
  },
];

const statusConfig = {
  active: { label: "Активна", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  paused: { label: "На паузе", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground border-border" },
};

export function CampaignsList() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Рекламные кампании</CardTitle>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Создать кампанию
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Название</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Формат</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Бюджет</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Потрачено</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Показы</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Клики</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-medium">{campaign.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className={cn("font-normal", statusConfig[campaign.status].className)}>
                        {statusConfig[campaign.status].label}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">{campaign.format}</td>
                    <td className="py-4 px-4 text-right">{campaign.budget.toLocaleString()} ₽</td>
                    <td className="py-4 px-4 text-right">{campaign.spent.toLocaleString()} ₽</td>
                    <td className="py-4 px-4 text-right">{campaign.impressions.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">{campaign.clicks.toLocaleString()}</td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="gap-2">
                            <Eye className="h-4 w-4" /> Просмотр
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Pencil className="h-4 w-4" /> Редактировать
                          </DropdownMenuItem>
                          {campaign.status === "active" ? (
                            <DropdownMenuItem className="gap-2">
                              <Pause className="h-4 w-4" /> Приостановить
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2">
                              <Play className="h-4 w-4" /> Запустить
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <CreateCampaignDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
