import { useState } from "react";
import { Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, Eye, Search, Filter, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CreateCampaignDialog } from "@/components/dashboard/CreateCampaignDialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft" | "completed";
  format: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  startDate: string;
  endDate: string;
}

const initialCampaigns: Campaign[] = [
  {
    id: "1", name: "Летняя распродажа 2024", status: "active", format: "Баннер",
    budget: 50000, spent: 23400, impressions: 45230, clicks: 2890, ctr: 6.39, cpm: 517,
    startDate: "2024-06-01", endDate: "2024-08-31",
  },
  {
    id: "2", name: "Новая коллекция", status: "active", format: "Popunder",
    budget: 100000, spent: 67800, impressions: 89120, clicks: 5670, ctr: 6.36, cpm: 761,
    startDate: "2024-05-15", endDate: "2024-09-15",
  },
  {
    id: "3", name: "Бренд-кампания", status: "paused", format: "Native",
    budget: 30000, spent: 15200, impressions: 28900, clicks: 1240, ctr: 4.29, cpm: 526,
    startDate: "2024-04-01", endDate: "2024-07-01",
  },
  {
    id: "4", name: "Тестовая кампания", status: "draft", format: "In-page Push",
    budget: 25000, spent: 0, impressions: 0, clicks: 0, ctr: 0, cpm: 0,
    startDate: "", endDate: "",
  },
  {
    id: "5", name: "Осенний запуск", status: "completed", format: "Баннер",
    budget: 75000, spent: 74200, impressions: 152000, clicks: 9120, ctr: 6.0, cpm: 488,
    startDate: "2024-09-01", endDate: "2024-11-30",
  },
];

const statusConfig = {
  active: { label: "Активна", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  paused: { label: "На паузе", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Завершена", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
};

export default function DashboardCampaigns() {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = campaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newStatus = c.status === "active" ? "paused" : "active";
        toast.success(newStatus === "active" ? "Кампания запущена" : "Кампания приостановлена");
        return { ...c, status: newStatus };
      })
    );
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success("Кампания удалена");
  };

  const duplicateCampaign = (campaign: Campaign) => {
    const newCampaign: Campaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (копия)`,
      status: "draft",
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      cpm: 0,
    };
    setCampaigns((prev) => [...prev, newCampaign]);
    toast.success("Кампания скопирована");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Кампании</h2>
            <p className="text-muted-foreground text-sm">Управляйте вашими рекламными кампаниями</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Создать кампанию
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background border-border">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="paused">На паузе</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
              <SelectItem value="completed">Завершённые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Всего кампаний</p>
              <p className="text-2xl font-bold">{campaigns.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Активных</p>
              <p className="text-2xl font-bold text-green-500">{campaigns.filter((c) => c.status === "active").length}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Общий бюджет</p>
              <p className="text-2xl font-bold">{campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()} ₽</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Потрачено</p>
              <p className="text-2xl font-bold">{campaigns.reduce((s, c) => s + c.spent, 0).toLocaleString()} ₽</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
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
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4 font-medium">{campaign.name}</td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={cn("font-normal", statusConfig[campaign.status].className)}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground">{campaign.format}</td>
                      <td className="py-4 px-4 text-right">{campaign.budget.toLocaleString()} ₽</td>
                      <td className="py-4 px-4 text-right">{campaign.spent.toLocaleString()} ₽</td>
                      <td className="py-4 px-4 text-right">{campaign.impressions.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">{campaign.ctr}%</td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="gap-2" onClick={() => setViewCampaign(campaign)}>
                              <Eye className="h-4 w-4" /> Просмотр
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => duplicateCampaign(campaign)}>
                              <Copy className="h-4 w-4" /> Дублировать
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {campaign.status === "active" ? (
                              <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(campaign.id)}>
                                <Pause className="h-4 w-4" /> Приостановить
                              </DropdownMenuItem>
                            ) : campaign.status !== "completed" ? (
                              <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(campaign.id)}>
                                <Play className="h-4 w-4" /> Запустить
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => deleteCampaign(campaign.id)}>
                              <Trash2 className="h-4 w-4" /> Удалить
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        Кампании не найдены
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Campaign Dialog */}
      <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>{viewCampaign?.name}</DialogTitle>
            <DialogDescription>Детали кампании</DialogDescription>
          </DialogHeader>
          {viewCampaign && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Статус</p>
                  <Badge variant="outline" className={cn("font-normal", statusConfig[viewCampaign.status].className)}>
                    {statusConfig[viewCampaign.status].label}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Формат</p>
                  <p className="font-medium">{viewCampaign.format}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Бюджет</p>
                  <p className="font-medium">{viewCampaign.budget.toLocaleString()} ₽</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Потрачено</p>
                  <p className="font-medium">{viewCampaign.spent.toLocaleString()} ₽</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Показы</p>
                  <p className="font-medium">{viewCampaign.impressions.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Клики</p>
                  <p className="font-medium">{viewCampaign.clicks.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CTR</p>
                  <p className="font-medium">{viewCampaign.ctr}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">CPM</p>
                  <p className="font-medium">{viewCampaign.cpm} ₽</p>
                </div>
              </div>
              {viewCampaign.startDate && (
                <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Начало</p>
                    <p className="font-medium">{viewCampaign.startDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Окончание</p>
                    <p className="font-medium">{viewCampaign.endDate}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <CreateCampaignDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </>
  );
}
