import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreHorizontal, Play, Pause, Pencil, Trash2, Eye, Search, Filter, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCampaigns, type Campaign } from "@/contexts/CampaignContext";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Активна", className: "bg-green-500/10 text-green-500 border-green-500/20" },
  paused: { label: "На паузе", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  draft: { label: "Черновик", className: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Завершена", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  moderation: { label: "На модерации", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
};

export default function DashboardCampaigns() {
  const navigate = useNavigate();
  const { campaigns, updateCampaign, deleteCampaign: ctxDelete, addCampaign } = useCampaigns();
  const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = campaigns.filter((c) => {
    const s = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.includes(searchQuery);
    const st = statusFilter === "all" || c.status === statusFilter;
    return s && st;
  });

  const allSelected = filtered.length > 0 && filtered.every(c => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleStatus = (id: string) => {
    const c = campaigns.find(x => x.id === id);
    if (!c) return;
    const ns = c.status === "active" ? "paused" : "active";
    updateCampaign(id, { status: ns as any });
    toast.success(ns === "active" ? "Кампания запущена" : "Кампания приостановлена");
  };

  const handleDelete = () => {
    if (deleteId) {
      ctxDelete(deleteId);
      toast.success("Кампания удалена");
      setDeleteId(null);
    }
  };

  const duplicateCampaign = (c: Campaign) => {
    const { addCampaign } = useCampaignsHook();
    addCampaign({ ...c, name: `${c.name} (копия)`, status: "draft", spent: 0, impressions: 0, clicks: 0, ctr: 0 });
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
          <Button onClick={() => navigate("/dashboard/campaigns/create")} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Создать кампанию
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Поиск по названию или ID..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-background border-border" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background border-border">
              <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Все статусы" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="paused">На паузе</SelectItem>
              <SelectItem value="draft">Черновики</SelectItem>
              <SelectItem value="moderation">На модерации</SelectItem>
              <SelectItem value="completed">Завершённые</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Всего</p><p className="text-2xl font-bold">{campaigns.length}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Активных</p><p className="text-2xl font-bold text-green-500">{campaigns.filter(c => c.status === "active").length}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Бюджет</p><p className="text-2xl font-bold">${campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()}</p></CardContent></Card>
          <Card className="bg-card border-border"><CardContent className="p-4"><p className="text-sm text-muted-foreground">Потрачено</p><p className="text-2xl font-bold">${campaigns.reduce((s, c) => s + c.spent, 0).toLocaleString()}</p></CardContent></Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left">
                      <Checkbox checked={allSelected} onCheckedChange={toggleSelectAll} />
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
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
                      <td className="py-4 px-4">
                        <Checkbox checked={selectedIds.has(campaign.id)} onCheckedChange={() => toggleSelect(campaign.id)} />
                      </td>
                      <td className="py-4 px-4 text-muted-foreground font-mono text-sm">{campaign.id}</td>
                      <td className="py-4 px-4 font-medium">{campaign.name}</td>
                      <td className="py-4 px-4"><Badge variant="outline" className={cn("font-normal", statusConfig[campaign.status]?.className)}>{statusConfig[campaign.status]?.label}</Badge></td>
                      <td className="py-4 px-4 text-muted-foreground">{campaign.format}</td>
                      <td className="py-4 px-4 text-right">${campaign.budget.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">${campaign.spent.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">{campaign.impressions.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">{campaign.ctr}%</td>
                      <td className="py-4 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="gap-2" onClick={() => setViewCampaign(campaign)}><Eye className="h-4 w-4" /> Просмотр</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2" onClick={() => navigate(`/dashboard/campaigns/${campaign.id}/edit`)}><Pencil className="h-4 w-4" /> Редактировать</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {campaign.status === "active" ? (
                              <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(campaign.id)}><Pause className="h-4 w-4" /> Приостановить</DropdownMenuItem>
                            ) : campaign.status !== "completed" && campaign.status !== "moderation" ? (
                              <DropdownMenuItem className="gap-2" onClick={() => toggleStatus(campaign.id)}><Play className="h-4 w-4" /> Запустить</DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteId(campaign.id)}><Trash2 className="h-4 w-4" /> Удалить</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">Кампании не найдены</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить кампанию?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Кампания будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Dialog */}
      <Dialog open={!!viewCampaign} onOpenChange={() => setViewCampaign(null)}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader><DialogTitle>{viewCampaign?.name}</DialogTitle><DialogDescription>ID: {viewCampaign?.id}</DialogDescription></DialogHeader>
          {viewCampaign && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                ["Статус", <Badge variant="outline" className={cn("font-normal", statusConfig[viewCampaign.status]?.className)}>{statusConfig[viewCampaign.status]?.label}</Badge>],
                ["Формат", viewCampaign.format],
                ["Бюджет", `$${viewCampaign.budget.toLocaleString()}`],
                ["Потрачено", `$${viewCampaign.spent.toLocaleString()}`],
                ["Показы", viewCampaign.impressions.toLocaleString()],
                ["Клики", viewCampaign.clicks.toLocaleString()],
                ["CTR", `${viewCampaign.ctr}%`],
                ["Ставка", `$${viewCampaign.priceValue} (${viewCampaign.pricingModel.toUpperCase()})`],
              ].map(([label, val], i) => (
                <div key={i} className="space-y-1"><p className="text-sm text-muted-foreground">{label as string}</p><div className="font-medium">{val}</div></div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function useCampaignsHook() {
  return useCampaigns();
}
