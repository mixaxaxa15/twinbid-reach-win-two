import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns, type TargetingState, type PricingModel, type TrafficQuality } from "@/contexts/CampaignContext";
import { TargetingSection } from "@/components/dashboard/TargetingSection";
import { BudgetSection } from "@/components/dashboard/BudgetSection";

const formatCreativeFields: Record<string, string[]> = {
  banner: ["link", "imageUrl", "adText"],
  popunder: ["link"],
  native: ["link", "imageUrl", "adText", "title"],
  push: ["link", "imageUrl", "adText", "title"],
  video: ["link", "vastUrl"],
  ctv: ["link", "vastUrl"],
};

const fieldLabels: Record<string, { label: string; placeholder: string }> = {
  link: { label: "Ссылка (URL перехода)", placeholder: "https://..." },
  imageUrl: { label: "URL изображения", placeholder: "https://..." },
  adText: { label: "Текст объявления", placeholder: "Текст..." },
  title: { label: "Заголовок", placeholder: "Заголовок..." },
  vastUrl: { label: "VAST Tag URL", placeholder: "https://..." },
};

export default function EditCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCampaign, updateCampaign } = useCampaigns();
  const campaign = getCampaign(id || "");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creative, setCreative] = useState<Record<string, string>>({});
  const [lists, setLists] = useState<Record<string, TargetingState>>({});
  const [totalBudget, setTotalBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("cpm");
  const [trafficQuality, setTrafficQuality] = useState<TrafficQuality>("common");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Store initial creative for comparison
  const [initialCreative, setInitialCreative] = useState<Record<string, string>>({});

  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setDescription(campaign.description);
      setCreative(campaign.creative);
      setInitialCreative({ ...campaign.creative });
      setLists(campaign.targeting);
      setTotalBudget(String(campaign.budget));
      setDailyBudget(campaign.dailyBudget ? String(campaign.dailyBudget) : "");
      setPriceValue(String(campaign.priceValue));
      setPricingModel(campaign.pricingModel);
      setTrafficQuality(campaign.trafficQuality);
      setStartDate(campaign.startDate);
      setEndDate(campaign.endDate);
    }
  }, [campaign]);

  const creativeFields = campaign ? (formatCreativeFields[campaign.formatKey] || []) : [];

  const hasCreativeChanged = useMemo(() => {
    return creativeFields.some(f => (creative[f] || "") !== (initialCreative[f] || ""));
  }, [creative, initialCreative, creativeFields]);

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Кампания не найдена</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/campaigns")} className="mt-4">Назад</Button>
      </div>
    );
  }

  const updateList = (key: string, updates: Partial<TargetingState>) => {
    setLists(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const parseNum = (v: string) => parseFloat(v.replace(",", ".")) || 0;

  const handleSave = () => {
    const tb = parseNum(totalBudget);
    if (!totalBudget || isNaN(tb) || tb < 100) {
      toast.error("Общий бюджет должен быть не менее $100");
      return;
    }
    const cpmLimits: Record<TrafficQuality, number> = { common: 0.3, high: 0.7, ultra: 0.9 };
    const minCpm = cpmLimits[trafficQuality];
    const min = pricingModel === "cpc" ? +(minCpm * 1.7 / 1000).toFixed(5) : minCpm;
    const pv = parseNum(priceValue);
    if (!priceValue || isNaN(pv) || pv < min) {
      toast.error(`Минимальная ставка $${min}`);
      return;
    }

    const newStatus = hasCreativeChanged ? "moderation" as const : campaign.status;

    updateCampaign(campaign.id, {
      name: name.trim(),
      description,
      creative,
      targeting: Object.fromEntries(
        Object.entries(lists).map(([k, v]) => [k, { mode: v.mode, items: v.items }])
      ),
      budget: tb,
      dailyBudget: dailyBudget ? parseNum(dailyBudget) : null,
      priceValue: pv,
      pricingModel,
      trafficQuality,
      startDate,
      endDate,
      status: newStatus,
    });

    if (hasCreativeChanged) {
      toast.success("Кампания сохранена и отправлена на модерацию");
    } else {
      toast.success("Кампания сохранена");
    }
    navigate("/dashboard/campaigns");
  };

  const formatLabel = campaign.format;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Редактирование кампании</h2>
          <p className="text-muted-foreground text-sm">ID: {id}</p>
        </div>
      </div>

      {hasCreativeChanged && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-500">Изменён контент кампании — после сохранения она будет отправлена на модерацию</p>
        </div>
      )}

      <Tabs defaultValue="general">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general">Основное</TabsTrigger>
          <TabsTrigger value="targeting">Таргетинг и списки</TabsTrigger>
          <TabsTrigger value="budget">Бюджет</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Название</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Формат рекламы</Label>
                <Input value={formatLabel} disabled className="bg-muted border-border text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Формат нельзя изменить после создания</p>
              </div>
              {creativeFields.map((field) => {
                const cfg = fieldLabels[field];
                if (!cfg) return null;
                return (
                  <div key={field} className="space-y-2">
                    <Label>{cfg.label}</Label>
                    {field === "adText" ? (
                      <Textarea value={creative[field] || ""}
                        onChange={(e) => setCreative(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={cfg.placeholder} className="bg-background border-border resize-none" rows={3} />
                    ) : (
                      <Input value={creative[field] || ""}
                        onChange={(e) => setCreative(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={cfg.placeholder} className="bg-background border-border" />
                    )}
                  </div>
                );
              })}
              <div className="space-y-2">
                <Label>Описание (опционально)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  className="bg-background border-border resize-none" rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Таргетинг и списки</CardTitle>
            </CardHeader>
            <CardContent>
              <TargetingSection lists={lists} onUpdate={updateList} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <BudgetSection
                formatKey={campaign.formatKey}
                totalBudget={totalBudget} setTotalBudget={setTotalBudget}
                dailyBudget={dailyBudget} setDailyBudget={setDailyBudget}
                priceValue={priceValue} setPriceValue={setPriceValue}
                pricingModel={pricingModel} setPricingModel={setPricingModel}
                trafficQuality={trafficQuality} setTrafficQuality={setTrafficQuality}
                startDate={startDate} setStartDate={setStartDate}
                endDate={endDate} setEndDate={setEndDate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Save className="h-4 w-4 mr-2" /> Сохранить
      </Button>
    </div>
  );
}
