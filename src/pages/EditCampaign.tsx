import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function EditCampaign() {
  const navigate = useNavigate();
  const { id } = useParams();

  // General
  const [name, setName] = useState("Летняя распродажа 2024");
  const [adFormat, setAdFormat] = useState("banner");
  const [description, setDescription] = useState("Кампания для продвижения летней коллекции");

  // Targeting
  const [geo, setGeo] = useState("russia");
  const [ageFrom, setAgeFrom] = useState("18");
  const [ageTo, setAgeTo] = useState("45");
  const [device, setDevice] = useState("all");

  // Budget
  const [dailyBudget, setDailyBudget] = useState("5000");
  const [totalBudget, setTotalBudget] = useState("150000");
  const [startDate, setStartDate] = useState("2024-06-01");
  const [endDate, setEndDate] = useState("2024-08-31");

  // Black/White lists
  const [geoMode, setGeoMode] = useState<"none" | "white" | "black">("none");
  const [geoItems, setGeoItems] = useState<string[]>([]);
  const [geoInput, setGeoInput] = useState("");

  const [subidMode, setSubidMode] = useState<"none" | "white" | "black">("none");
  const [subidItems, setSubidItems] = useState<string[]>([]);
  const [subidInput, setSubidInput] = useState("");

  const [deviceMode, setDeviceMode] = useState<"none" | "white" | "black">("none");
  const [deviceItems, setDeviceItems] = useState<string[]>([]);
  const [deviceInput, setDeviceInput] = useState("");

  const addItem = (input: string, setInput: (v: string) => void, items: string[], setItems: (v: string[]) => void) => {
    const t = input.trim();
    if (t && !items.includes(t)) setItems([...items, t]);
    setInput("");
  };

  const ListSection = ({
    label, mode, setMode, items, setItems, input, setInput, placeholder
  }: {
    label: string; mode: "none" | "white" | "black"; setMode: (v: any) => void;
    items: string[]; setItems: (v: string[]) => void;
    input: string; setInput: (v: string) => void; placeholder: string;
  }) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {(["none", "white", "black"] as const).map((m) => (
          <Button key={m} type="button" size="sm"
            variant={mode === m ? "default" : "outline"}
            onClick={() => setMode(m)}
            className={mode === m ? (m === "white" ? "bg-green-600 text-white" : m === "black" ? "bg-red-600 text-white" : "bg-primary text-primary-foreground") : "border-border"}>
            {m === "none" ? "Нет" : m === "white" ? "Whitelist" : "Blacklist"}
          </Button>
        ))}
      </div>
      {mode !== "none" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={placeholder} className="bg-background border-border flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addItem(input, setInput, items, setItems))} />
            <Button type="button" size="icon" variant="outline" onClick={() => addItem(input, setInput, items, setItems)} className="border-border"><Plus className="h-4 w-4" /></Button>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <Badge key={item} variant="outline" className="gap-1 border-border">
                  {item}<X className="h-3 w-3 cursor-pointer" onClick={() => setItems(items.filter((i) => i !== item))} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

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

      <Tabs defaultValue="general">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="general">Основное</TabsTrigger>
          <TabsTrigger value="targeting">Таргетинг</TabsTrigger>
          <TabsTrigger value="lists">Списки</TabsTrigger>
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
                <Select value={adFormat} onValueChange={setAdFormat}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="banner">Баннер</SelectItem>
                    <SelectItem value="popunder">Popunder</SelectItem>
                    <SelectItem value="native">Native</SelectItem>
                    <SelectItem value="push">In-page Push</SelectItem>
                    <SelectItem value="video">Видео (VAST)</SelectItem>
                    <SelectItem value="ctv">CTV/OTT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Описание</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background border-border resize-none" rows={3} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting">
          <Card className="bg-card border-border">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>География</Label>
                <Select value={geo} onValueChange={setGeo}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="russia">Россия</SelectItem>
                    <SelectItem value="cis">СНГ</SelectItem>
                    <SelectItem value="europe">Европа</SelectItem>
                    <SelectItem value="usa">США</SelectItem>
                    <SelectItem value="worldwide">Весь мир</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Возраст аудитории</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">От</Label>
                    <Select value={ageFrom} onValueChange={setAgeFrom}>
                      <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {[18, 25, 35, 45, 55].map((a) => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">До</Label>
                    <Select value={ageTo} onValueChange={setAgeTo}>
                      <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {[25, 35, 45, 55, 65].map((a) => <SelectItem key={a} value={a.toString()}>{a === 65 ? "65+" : String(a)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Устройства</Label>
                <Select value={device} onValueChange={setDevice}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="mobile">Мобильные</SelectItem>
                    <SelectItem value="desktop">Десктоп</SelectItem>
                    <SelectItem value="tablet">Планшеты</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <Card className="bg-card border-border">
            <CardContent className="space-y-6 pt-6">
              <ListSection label="Гео" mode={geoMode} setMode={setGeoMode} items={geoItems} setItems={setGeoItems} input={geoInput} setInput={setGeoInput} placeholder="RU, US, DE..." />
              <ListSection label="SubID" mode={subidMode} setMode={setSubidMode} items={subidItems} setItems={setSubidItems} input={subidInput} setInput={setSubidInput} placeholder="sub_landing_1..." />
              <ListSection label="Устройства" mode={deviceMode} setMode={setDeviceMode} items={deviceItems} setItems={setDeviceItems} input={deviceInput} setInput={setDeviceInput} placeholder="Android, iOS, Windows..." />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card className="bg-card border-border">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label>Дневной бюджет</Label>
                <div className="relative">
                  <Input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Общий бюджет</Label>
                <div className="relative">
                  <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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

      <Button onClick={() => { toast.success("Кампания сохранена"); navigate("/dashboard/campaigns"); }} className="bg-primary hover:bg-primary/90 text-primary-foreground">
        <Save className="h-4 w-4 mr-2" /> Сохранить
      </Button>
    </div>
  );
}
