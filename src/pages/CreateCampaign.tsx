import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

type ListMode = "none" | "white" | "black";
interface ListState { mode: ListMode; items: string[]; input: string; }
const defaultList = (): ListState => ({ mode: "none", items: [], input: "" });

const formatCreativeFields: Record<string, { label: string; fields: string[] }> = {
  banner: { label: "Баннер", fields: ["link", "imageUrl", "adText"] },
  popunder: { label: "Popunder", fields: ["link"] },
  native: { label: "Native", fields: ["link", "imageUrl", "adText", "title"] },
  push: { label: "In-page Push", fields: ["link", "imageUrl", "adText", "title"] },
  video: { label: "Видео (VAST)", fields: ["link", "vastUrl"] },
  ctv: { label: "CTV/OTT", fields: ["link", "vastUrl"] },
};

const fieldLabels: Record<string, { label: string; placeholder: string }> = {
  link: { label: "Ссылка (URL перехода)", placeholder: "https://example.com/landing" },
  imageUrl: { label: "URL изображения", placeholder: "https://example.com/banner.jpg" },
  adText: { label: "Текст объявления", placeholder: "Ваш рекламный текст..." },
  title: { label: "Заголовок", placeholder: "Привлекательный заголовок" },
  vastUrl: { label: "VAST Tag URL", placeholder: "https://example.com/vast.xml" },
};

const targetingConfigs = [
  { key: "country", label: "Страны", placeholder: "US, DE, BR..." },
  { key: "city", label: "Города", placeholder: "New York, Berlin..." },
  { key: "deviceType", label: "Тип устройства", placeholder: "Mobile, Desktop, Tablet..." },
  { key: "os", label: "ОС", placeholder: "Android, iOS, Windows..." },
  { key: "osVersion", label: "Версия ОС", placeholder: "Android 14, iOS 17..." },
  { key: "browser", label: "Браузер", placeholder: "Chrome, Safari, Firefox..." },
  { key: "dayOfWeek", label: "День недели", placeholder: "Mon, Tue, Wed..." },
  { key: "hour", label: "Час показа", placeholder: "0, 1, 2, ... 23" },
  { key: "subid", label: "SubID", placeholder: "sub_landing_1..." },
  { key: "sites", label: "Сайты", placeholder: "example.com, site.net..." },
];

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [adFormat, setAdFormat] = useState("");
  const [description, setDescription] = useState("");
  const [creativeFields, setCreativeFields] = useState<Record<string, string>>({});

  // Step 2 - Targeting & Lists
  const [lists, setLists] = useState<Record<string, ListState>>(
    Object.fromEntries(targetingConfigs.map(c => [c.key, defaultList()]))
  );

  // Step 3 - Budget
  const [totalBudget, setTotalBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [cpm, setCpm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const updateList = (key: string, updates: Partial<ListState>) => {
    setLists(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));
  };

  const addItem = (key: string) => {
    const list = lists[key];
    const t = list.input.trim();
    if (t && !list.items.includes(t)) {
      updateList(key, { items: [...list.items, t], input: "" });
    } else {
      updateList(key, { input: "" });
    }
  };

  const removeItem = (key: string, item: string) => {
    updateList(key, { items: lists[key].items.filter(i => i !== item) });
  };

  const currentFormatFields = adFormat ? formatCreativeFields[adFormat]?.fields || [] : [];

  const handleCreate = () => {
    toast.success("Кампания создана и отправлена на модерацию!");
    navigate("/dashboard/campaigns");
  };

  const ListSection = ({ config }: { config: typeof targetingConfigs[0] }) => {
    const list = lists[config.key];
    return (
      <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
        <div className="flex items-center justify-between">
          <Label className="font-medium">{config.label}</Label>
          <div className="flex gap-1.5">
            {(["none", "white", "black"] as const).map((m) => (
              <Button key={m} type="button" size="sm" variant="outline"
                onClick={() => updateList(config.key, { mode: m })}
                className={
                  list.mode === m
                    ? m === "white" ? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
                      : m === "black" ? "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white"
                      : "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                }>
                {m === "none" ? "Выкл" : m === "white" ? "White" : "Black"}
              </Button>
            ))}
          </div>
        </div>
        {list.mode !== "none" && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input value={list.input} onChange={(e) => updateList(config.key, { input: e.target.value })}
                placeholder={config.placeholder} className="bg-background border-border flex-1"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(config.key))} />
              <Button type="button" size="icon" variant="outline" onClick={() => addItem(config.key)} className="border-border">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {list.items.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {list.items.map((item) => (
                  <Badge key={item} variant="outline" className={`gap-1 ${list.mode === "white" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                    {item}<X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(config.key, item)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
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
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Летняя распродажа" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Формат рекламы *</Label>
                <Select value={adFormat} onValueChange={setAdFormat}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Выберите формат" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {Object.entries(formatCreativeFields).map(([val, cfg]) => (
                      <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                          <Textarea value={creativeFields[field] || ""} onChange={(e) => setCreativeFields(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={cfg.placeholder} className="bg-background border-border resize-none" rows={3} />
                        ) : (
                          <Input value={creativeFields[field] || ""} onChange={(e) => setCreativeFields(prev => ({ ...prev, [field]: e.target.value }))}
                            placeholder={cfg.placeholder} className="bg-background border-border" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2">
                <Label>Описание (опционально)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите цели кампании..." className="bg-background border-border resize-none" rows={2} />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Для каждого параметра выберите режим: Whitelist (только эти значения) или Blacklist (исключить эти значения)</p>
              {targetingConfigs.map((config) => (
                <ListSection key={config.key} config={config} />
              ))}
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Общий бюджет *</Label>
                <div className="relative max-w-xs">
                  <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="1000" className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
                <p className="text-xs text-muted-foreground">Обязательное поле. Минимум $100</p>
              </div>
              <div className="space-y-2">
                <Label>Дневной бюджет (опционально)</Label>
                <div className="relative max-w-xs">
                  <Input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} placeholder="Без ограничений" className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>CPM (стоимость за 1000 показов) *</Label>
                <div className="relative max-w-xs">
                  <Input type="number" step="0.01" value={cpm} onChange={(e) => setCpm(e.target.value)} placeholder="2.50" className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div className="space-y-2">
                  <Label>Дата начала</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Дата окончания</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background border-border" />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="border-border">Назад</Button>
        ) : <div />}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} className="bg-primary hover:bg-primary/90 text-primary-foreground">Далее</Button>
        ) : (
          <Button onClick={handleCreate} className="bg-accent hover:bg-accent/90 text-accent-foreground">Создать кампанию</Button>
        )}
      </div>
    </div>
  );
}
