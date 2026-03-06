import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";
import { toast } from "sonner";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState("");
  const [adFormat, setAdFormat] = useState("");
  const [description, setDescription] = useState("");

  // Step 2
  const [geo, setGeo] = useState("");
  const [ageFrom, setAgeFrom] = useState("");
  const [ageTo, setAgeTo] = useState("");

  // Step 3
  const [dailyBudget, setDailyBudget] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Black/White lists
  const [geoListMode, setGeoListMode] = useState<"none" | "white" | "black">("none");
  const [geoListItems, setGeoListItems] = useState<string[]>([]);
  const [geoInput, setGeoInput] = useState("");

  const [subidListMode, setSubidListMode] = useState<"none" | "white" | "black">("none");
  const [subidListItems, setSubidListItems] = useState<string[]>([]);
  const [subidInput, setSubidInput] = useState("");

  const [deviceListMode, setDeviceListMode] = useState<"none" | "white" | "black">("none");
  const [deviceListItems, setDeviceListItems] = useState<string[]>([]);
  const [deviceInput, setDeviceInput] = useState("");

  const addToList = (
    input: string,
    setInput: (v: string) => void,
    items: string[],
    setItems: (v: string[]) => void
  ) => {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
    }
    setInput("");
  };

  const removeFromList = (item: string, items: string[], setItems: (v: string[]) => void) => {
    setItems(items.filter((i) => i !== item));
  };

  const handleCreate = () => {
    toast.success("Кампания создана!");
    navigate("/dashboard/campaigns");
  };

  const ListEditor = ({
    mode,
    setMode,
    items,
    setItems,
    input,
    setInput,
    label,
    placeholder,
  }: {
    mode: "none" | "white" | "black";
    setMode: (v: "none" | "white" | "black") => void;
    items: string[];
    setItems: (v: string[]) => void;
    input: string;
    setInput: (v: string) => void;
    label: string;
    placeholder: string;
  }) => (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Button type="button" variant={mode === "none" ? "default" : "outline"} size="sm" onClick={() => setMode("none")} className={mode === "none" ? "bg-primary text-primary-foreground" : "border-border"}>
          Нет
        </Button>
        <Button type="button" variant={mode === "white" ? "default" : "outline"} size="sm" onClick={() => setMode("white")} className={mode === "white" ? "bg-green-600 text-white" : "border-border"}>
          Whitelist
        </Button>
        <Button type="button" variant={mode === "black" ? "default" : "outline"} size="sm" onClick={() => setMode("black")} className={mode === "black" ? "bg-red-600 text-white" : "border-border"}>
          Blacklist
        </Button>
      </div>
      {mode !== "none" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="bg-background border-border flex-1"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addToList(input, setInput, items, setItems))}
            />
            <Button type="button" size="icon" variant="outline" onClick={() => addToList(input, setInput, items, setItems)} className="border-border">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {items.map((item) => (
                <Badge key={item} variant="outline" className="gap-1 border-border">
                  {item}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFromList(item, items, setItems)} />
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
          <h2 className="text-2xl font-bold">Создание кампании</h2>
          <p className="text-muted-foreground text-sm">Шаг {step} из 4</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Основная информация"}
            {step === 2 && "Таргетинг"}
            {step === 3 && "Списки (Black/White)"}
            {step === 4 && "Бюджет и расписание"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>Название кампании</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Летняя распродажа" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label>Формат рекламы</Label>
                <Select value={adFormat} onValueChange={setAdFormat}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Выберите формат" /></SelectTrigger>
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
                <Label>Описание (опционально)</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Опишите цели кампании..." className="bg-background border-border resize-none" rows={3} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>География</Label>
                <Select value={geo} onValueChange={setGeo}>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Выберите регион" /></SelectTrigger>
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
                      <SelectTrigger className="bg-background border-border"><SelectValue placeholder="18" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {[18, 25, 35, 45, 55].map((a) => <SelectItem key={a} value={a.toString()}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">До</Label>
                    <Select value={ageTo} onValueChange={setAgeTo}>
                      <SelectTrigger className="bg-background border-border"><SelectValue placeholder="65+" /></SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {[25, 35, 45, 55, 65].map((a) => <SelectItem key={a} value={a.toString()}>{a === 65 ? "65+" : String(a)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Устройства</Label>
                <Select>
                  <SelectTrigger className="bg-background border-border"><SelectValue placeholder="Все устройства" /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="mobile">Мобильные</SelectItem>
                    <SelectItem value="desktop">Десктоп</SelectItem>
                    <SelectItem value="tablet">Планшеты</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <ListEditor mode={geoListMode} setMode={setGeoListMode} items={geoListItems} setItems={setGeoListItems} input={geoInput} setInput={setGeoInput} label="Гео-листы" placeholder="Введите страну или код (RU, US...)" />
              <ListEditor mode={subidListMode} setMode={setSubidListMode} items={subidListItems} setItems={setSubidListItems} input={subidInput} setInput={setSubidInput} label="SubID-листы" placeholder="Введите SubID..." />
              <ListEditor mode={deviceListMode} setMode={setDeviceListMode} items={deviceListItems} setItems={setDeviceListItems} input={deviceInput} setInput={setDeviceInput} label="Устройства-листы" placeholder="Введите устройство (Android, iOS...)" />
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2">
                <Label>Дневной бюджет</Label>
                <div className="relative">
                  <Input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} placeholder="10000" className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
                </div>
                <p className="text-xs text-muted-foreground">Минимум 1 000 ₽ в день</p>
              </div>
              <div className="space-y-2">
                <Label>Общий бюджет (опционально)</Label>
                <div className="relative">
                  <Input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="Без ограничений" className="bg-background border-border pr-8" />
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
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="border-border">Назад</Button>
        ) : (
          <div />
        )}
        {step < 4 ? (
          <Button onClick={() => setStep(step + 1)} className="bg-primary hover:bg-primary/90 text-primary-foreground">Далее</Button>
        ) : (
          <Button onClick={handleCreate} className="bg-accent hover:bg-accent/90 text-accent-foreground">Создать кампанию</Button>
        )}
      </div>
    </div>
  );
}
