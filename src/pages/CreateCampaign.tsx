import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns, type TargetingState, type PricingModel, type TrafficQuality, type ListMode } from "@/contexts/CampaignContext";
import { TargetingSection, targetingConfigs } from "@/components/dashboard/TargetingSection";
import { BudgetSection } from "@/components/dashboard/BudgetSection";

const formatCreativeFields: Record<string, { label: string; fields: string[] }> = {
  banner: { label: "Баннер", fields: ["link", "imageUrl", "adText"] },
  popunder: { label: "Popunder", fields: ["link"] },
  native: { label: "Native", fields: ["link", "imageUrl", "adText", "title"] },
  push: { label: "In-page Push", fields: ["link", "imageUrl", "adText", "title"] },
  video: { label: "Видео (VAST)", fields: ["link", "vastUrl"] },
  ctv: { label: "CTV/OTT", fields: ["link", "vastUrl"] },
};

const fieldLabels: Record<string, { label: string; placeholder: string }> = {
  link: { label: "Ссылка (URL перехода) *", placeholder: "https://example.com/landing" },
  imageUrl: { label: "URL изображения", placeholder: "https://example.com/banner.jpg" },
  adText: { label: "Текст объявления", placeholder: "Ваш рекламный текст..." },
  title: { label: "Заголовок", placeholder: "Привлекательный заголовок" },
  vastUrl: { label: "VAST Tag URL *", placeholder: "https://example.com/vast.xml" },
};

const defaultTargeting = (): Record<string, TargetingState> =>
  Object.fromEntries(targetingConfigs.map(c => [c.key, { mode: "none" as ListMode, items: [] }]));

export default function CreateCampaign() {
  const navigate = useNavigate();
  const { addCampaign } = useCampaigns();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [adFormat, setAdFormat] = useState("");
  const [description, setDescription] = useState("");
  const [creativeFields, setCreativeFields] = useState<Record<string, string>>({});

  const [lists, setLists] = useState<Record<string, TargetingState>>(defaultTargeting());

  const [totalBudget, setTotalBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [priceValue, setPriceValue] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("cpm");
  const [trafficQuality, setTrafficQuality] = useState<TrafficQuality>("common");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const updateList = (key: string, updates: Partial<TargetingState>) => {
    setLists(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const currentFormatFields = adFormat ? formatCreativeFields[adFormat]?.fields || [] : [];

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Обязательное поле";
    if (!adFormat) e.adFormat = "Выберите формат";
    if (adFormat && currentFormatFields.includes("link") && !creativeFields.link?.trim()) {
      e.link = "Обязательное поле";
    }
    if (adFormat && currentFormatFields.includes("vastUrl") && !creativeFields.vastUrl?.trim()) {
      e.vastUrl = "Обязательное поле";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const parseNum = (v: string) => parseFloat(v.replace(",", ".")) || 0;

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    const tb = parseNum(totalBudget);
    if (!totalBudget || isNaN(tb) || tb < 100) e.totalBudget = "Минимум $100";
    const pv = parseNum(priceValue);
    const { min } = getMinPrice();
    if (!priceValue || isNaN(pv) || pv < min) e.priceValue = `Минимальная ставка $${min}`;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getMinPrice = () => {
    const cpmLimits: Record<TrafficQuality, number> = { common: 0.3, high: 0.7, ultra: 0.9 };
    const minCpm = cpmLimits[trafficQuality];
    if (pricingModel === "cpc") return { min: +(minCpm * 1.7 / 1000).toFixed(5) };
    return { min: minCpm };
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 3) {
      if (!validateStep3()) return;
      handleCreate();
      return;
    }
    setStep(step + 1);
    setErrors({});
  };

  const handleCreate = () => {
    addCampaign({
      name: name.trim(),
      status: "moderation",
      format: formatCreativeFields[adFormat]?.label || adFormat,
      formatKey: adFormat,
      budget: parseNum(totalBudget),
      dailyBudget: dailyBudget ? parseNum(dailyBudget) : null,
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      pricingModel,
      priceValue: parseNum(priceValue),
      trafficQuality,
      startDate,
      endDate,
      creative: creativeFields,
      targeting: Object.fromEntries(
        Object.entries(lists).map(([k, v]) => [k, { mode: v.mode, items: v.items }])
      ),
      description,
    });
    toast.success("Кампания создана и отправлена на модерацию!");
    navigate("/dashboard/campaigns");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Создание кампании</h2>
          <p className="text-muted-foreground text-sm">Шаг {step} из 3</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Основная информация и креатив"}
            {step === 2 && "Таргетинг и списки"}
            {step === 3 && "Бюджет и расписание"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Название кампании *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Летняя распродажа"
                  className={`bg-background border-border ${errors.name ? "border-destructive" : ""}`} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>Формат рекламы *</Label>
                <Select value={adFormat} onValueChange={setAdFormat}>
                  <SelectTrigger className={`bg-background border-border ${errors.adFormat ? "border-destructive" : ""}`}>
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {Object.entries(formatCreativeFields).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.adFormat && <p className="text-xs text-destructive">{errors.adFormat}</p>}
              </div>
              {currentFormatFields.length > 0 && (
                <div className="space-y-4 p-4 rounded-lg border border-border bg-background/30">
                  <p className="text-sm font-medium text-muted-foreground">Креатив для формата «{formatCreativeFields[adFormat]?.label}»</p>
                  {currentFormatFields.map((field) => {
                    const cfg = fieldLabels[field];
                    return (
                      <div key={field} className="space-y-2">
                        <Label>{cfg.label}</Label>
                        {field === "adText" ? (
                          <Textarea value={creativeFields[field] || ""}
                            onChange={(e) => setCreativeFields(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={cfg.placeholder}
                            className={`bg-background border-border resize-none ${errors[field] ? "border-destructive" : ""}`} rows={3} />
                        ) : (
                          <Input value={creativeFields[field] || ""}
                            onChange={(e) => setCreativeFields(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={cfg.placeholder}
                            className={`bg-background border-border ${errors[field] ? "border-destructive" : ""}`} />
                        )}
                        {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="space-y-2">
                <Label>Описание (опционально)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Опишите цели кампании..." className="bg-background border-border resize-none" rows={2} />
              </div>
            </>
          )}

          {step === 2 && (
            <TargetingSection lists={lists} onUpdate={updateList} />
          )}

          {step === 3 && (
            <BudgetSection
              formatKey={adFormat}
              totalBudget={totalBudget} setTotalBudget={setTotalBudget}
              dailyBudget={dailyBudget} setDailyBudget={setDailyBudget}
              priceValue={priceValue} setPriceValue={setPriceValue}
              pricingModel={pricingModel} setPricingModel={setPricingModel}
              trafficQuality={trafficQuality} setTrafficQuality={setTrafficQuality}
              startDate={startDate} setStartDate={setStartDate}
              endDate={endDate} setEndDate={setEndDate}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => { setStep(step - 1); setErrors({}); }} className="border-border">Назад</Button>
        ) : <div />}
        <Button onClick={handleNext}
          className={step < 3 ? "bg-primary hover:bg-primary/90 text-primary-foreground" : "bg-accent hover:bg-accent/90 text-accent-foreground"}>
          {step < 3 ? "Далее" : "Создать кампанию"}
        </Button>
      </div>
    </div>
  );
}
