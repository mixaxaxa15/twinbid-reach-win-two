import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, X, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type ListMode = "none" | "white" | "black";

interface ListState {
  mode: ListMode;
  items: string[];
  input: string;
}

const defaultList = (): ListState => ({ mode: "none", items: [], input: "" });

export default function EditCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();

  // General — format is read-only
  const [name, setName] = useState("Летняя распродажа 2024");
  const adFormat = "banner";
  const formatLabel = "Баннер";
  const [description, setDescription] = useState("Кампания для продвижения летней коллекции");
  const [link, setLink] = useState("https://example.com/landing");
  const [imageUrl, setImageUrl] = useState("https://example.com/banner.jpg");
  const [adText, setAdText] = useState("Скидки до 50% на всё!");

  // Budget
  const [totalBudget, setTotalBudget] = useState("5000");
  const [dailyBudget, setDailyBudget] = useState("");
  const [cpm, setCpm] = useState("2.50");
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2024-08-31");

  // Targeting & Lists (unified)
  const [lists, setLists] = useState<Record<string, ListState>>({
    country: defaultList(),
    city: defaultList(),
    deviceType: defaultList(),
    os: defaultList(),
    osVersion: defaultList(),
    browser: defaultList(),
    dayOfWeek: defaultList(),
    hour: defaultList(),
    subid: defaultList(),
    sites: defaultList(),
  });

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

  const handleSave = () => {
    toast.success("Кампания сохранена и отправлена на модерацию");
    navigate("/dashboard/campaigns");
  };

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

      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
        <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />
        <p className="text-sm text-yellow-500">После сохранения изменений кампания будет отправлена на модерацию</p>
      </div>

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
              <div className="space-y-2">
                <Label>Ссылка</Label>
                <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>URL изображения</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Текст объявления</Label>
                <Textarea value={adText} onChange={(e) => setAdText(e.target.value)} className="bg-background border-border resize-none" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Описание (опционально)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background border-border resize-none" rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Таргетинг и списки</CardTitle>
              <p className="text-sm text-muted-foreground">Для каждого параметра выберите режим: Whitelist (только эти значения) или Blacklist (исключить эти значения)</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {targetingConfigs.map((config) => (
                <ListSection key={config.key} config={config} />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card className="bg-card border-border">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Общий бюджет *</Label>
                <div className="relative max-w-xs">
                  <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
                <p className="text-xs text-muted-foreground">Обязательное поле</p>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Save className="h-4 w-4 mr-2" /> Сохранить и отправить на модерацию
      </Button>
    </div>
  );
}
