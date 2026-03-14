import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";
import { useCampaigns, type TargetingState, type PricingModel, type TrafficQuality } from "@/contexts/CampaignContext";
import { TargetingSection } from "@/components/dashboard/TargetingSection";
import { BudgetSection } from "@/components/dashboard/BudgetSection";
import { useLanguage } from "@/contexts/LanguageContext";

const formatCreativeFields: Record<string, string[]> = {
  banner: ["link", "imageFile", "adText"], popunder: ["link"],
  native: ["link", "imageFile", "adText", "title"], push: ["link", "imageFile", "adText", "title"],
  video: ["link", "vastUrl"], ctv: ["link", "vastUrl"],
};

const fieldLabels: Record<string, { label: string; placeholder: string }> = {
  link: { label: "URL *", placeholder: "https://..." },
  imageFile: { label: "", placeholder: "" },
  adText: { label: "Ad text", placeholder: "Text..." }, title: { label: "Title", placeholder: "Title..." },
  vastUrl: { label: "VAST Tag URL", placeholder: "https://..." },
};

export default function EditCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "general";
  const { getCampaign, updateCampaign } = useCampaigns();
  const { t } = useLanguage();
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
  const [evenSpend, setEvenSpend] = useState(false);
  const [initialCreative, setInitialCreative] = useState<Record<string, string>>({});
  const [imageFileName, setImageFileName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name); setDescription(campaign.description);
      setCreative(campaign.creative); setInitialCreative({ ...campaign.creative });
      setLists(campaign.targeting); setTotalBudget(String(campaign.budget));
      setDailyBudget(campaign.dailyBudget ? String(campaign.dailyBudget) : "");
      setPriceValue(String(campaign.priceValue)); setPricingModel(campaign.pricingModel);
      setTrafficQuality(campaign.trafficQuality); setStartDate(campaign.startDate); setEndDate(campaign.endDate);
      setEvenSpend(campaign.evenSpend ?? false);
    }
  }, [campaign]);

  const creativeFields = campaign ? (formatCreativeFields[campaign.formatKey] || []) : [];
  const hasCreativeChanged = useMemo(() => creativeFields.some(f => {
    if (f === "imageFile") return (creative.imageUrl || "") !== (initialCreative.imageUrl || "");
    return (creative[f] || "") !== (initialCreative[f] || "");
  }), [creative, initialCreative, creativeFields]);

  // Determine if this is a restart (completed campaign)
  const isRestart = campaign?.status === "completed";

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t("edit.notFound")}</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/campaigns")} className="mt-4">{t("create.back")}</Button>
      </div>
    );
  }

  const updateList = (key: string, updates: Partial<TargetingState>) => {
    setLists(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const parseNum = (v: string) => parseFloat(v.replace(",", ".")) || 0;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCreative(prev => ({ ...prev, imageUrl: url }));
      setImageFileName(file.name);
      toast.success(t("create.imageUploaded"));
    }
  };

  const handleSave = () => {
    const e: Record<string, string> = {};
    const tb = parseNum(totalBudget);
    if (!totalBudget || isNaN(tb) || tb < 100) e.totalBudget = t("edit.errorBudgetMin");
    
    const cpmLimits: Record<TrafficQuality, number> = { common: 0.3, high: 0.7, ultra: 0.9 };
    const minCpm = cpmLimits[trafficQuality];
    const min = pricingModel === "cpc" ? +(minCpm * 1.7 / 1000).toFixed(5) : minCpm;
    const pv = parseNum(priceValue);
    if (!priceValue || isNaN(pv) || pv < min) e.priceValue = `${t("budget.belowMin")} ($${min})`;

    if (!startDate) e.startDate = t("create.required");
    if (!endDate) e.endDate = t("create.required");
    if (endDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      if (end < today) e.endDate = t("create.endDateError");
    }
    if (!name.trim()) e.name = t("create.required");
    if (creativeFields.includes("link") && !creative.link?.trim()) e.link = t("create.required");

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    // Determine new status
    let newStatus = campaign.status;
    if (isRestart) {
      // Restart: if content changed -> moderation, else -> active
      newStatus = hasCreativeChanged ? "moderation" : "active";
    } else if (hasCreativeChanged) {
      newStatus = "moderation";
    }

    updateCampaign(campaign.id, {
      name: name.trim(), description, creative,
      targeting: Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, { mode: v.mode, items: v.items }])),
      budget: tb, dailyBudget: dailyBudget ? parseNum(dailyBudget) : null,
      priceValue: pv, pricingModel, trafficQuality, startDate, endDate, status: newStatus,
    });
    
    if (isRestart) {
      toast.success(hasCreativeChanged ? t("edit.savedModeration") : t("edit.restartedActive"));
    } else {
      toast.success(hasCreativeChanged ? t("edit.savedModeration") : t("edit.saved"));
    }
    navigate("/dashboard/campaigns");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/campaigns")}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-2xl font-bold">{t("edit.title")}</h2>
          <p className="text-muted-foreground text-sm">ID: {id}</p>
        </div>
      </div>

      {hasCreativeChanged && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
          <p className="text-sm text-yellow-500">{t("edit.moderationWarning")}</p>
        </div>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general">{t("edit.general")}</TabsTrigger>
          <TabsTrigger value="targeting">{t("edit.targeting")}</TabsTrigger>
          <TabsTrigger value="budget">{t("edit.budget")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="bg-card border-border">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>{t("edit.name")} *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)}
                  className={`bg-background border-border ${errors.name ? "border-destructive" : ""}`} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label>{t("edit.formatLabel")}</Label>
                <Input value={campaign.format} disabled className="bg-muted border-border text-muted-foreground cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">{t("edit.formatLocked")}</p>
              </div>
              {creativeFields.map((field) => {
                if (field === "imageFile") {
                  return (
                    <div key={field} className="space-y-2">
                      <Label>{t("create.uploadImage")}</Label>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      <div className="flex items-center gap-3">
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="border-border gap-2">
                          <Upload className="h-4 w-4" /> {t("create.uploadImage")}
                        </Button>
                        {imageFileName && <span className="text-sm text-muted-foreground">{imageFileName}</span>}
                      </div>
                      {creative.imageUrl && (
                        <img src={creative.imageUrl} alt="Preview" className="mt-2 max-h-32 rounded border border-border" />
                      )}
                    </div>
                  );
                }
                const cfg = fieldLabels[field];
                if (!cfg || !cfg.label) return null;
                return (
                  <div key={field} className="space-y-2">
                    <Label>{cfg.label}</Label>
                    {field === "adText" ? (
                      <Textarea value={creative[field] || ""} onChange={(e) => setCreative(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={cfg.placeholder} className={`bg-background border-border resize-none ${errors[field] ? "border-destructive" : ""}`} rows={3} />
                    ) : (
                      <Input value={creative[field] || ""} onChange={(e) => setCreative(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={cfg.placeholder} className={`bg-background border-border ${errors[field] ? "border-destructive" : ""}`} />
                    )}
                    {errors[field] && <p className="text-xs text-destructive">{errors[field]}</p>}
                  </div>
                );
              })}
              <div className="space-y-2">
                <Label>{t("edit.description")}</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background border-border resize-none" rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">{t("edit.targeting")}</CardTitle></CardHeader>
            <CardContent><TargetingSection lists={lists} onUpdate={updateList} /></CardContent>
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
                errors={errors}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Save className="h-4 w-4 mr-2" /> {t("edit.save")}
      </Button>
    </div>
  );
}
