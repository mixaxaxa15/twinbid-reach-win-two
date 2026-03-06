import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Eye, MousePointer, Target, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowUpDown, CalendarIcon } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type GroupBy = "dates" | "hours" | "browsers" | "subid" | "devices";
type SortKey = "impressions" | "clicks" | "spent";
type SortDir = "asc" | "desc";

const campaigns = [
  { id: "all", name: "Все кампании" },
  { id: "1", name: "Летняя распродажа 2024" },
  { id: "2", name: "Новая коллекция" },
  { id: "3", name: "Бренд-кампания" },
  { id: "5", name: "Осенний запуск" },
];

const generateDateData = () => [
  { label: "01.03.2026", impressions: 4200, clicks: 280, spent: 2100 },
  { label: "02.03.2026", impressions: 5100, clicks: 340, spent: 2550 },
  { label: "03.03.2026", impressions: 3800, clicks: 250, spent: 1900 },
  { label: "04.03.2026", impressions: 6200, clicks: 410, spent: 3100 },
  { label: "05.03.2026", impressions: 5800, clicks: 380, spent: 2900 },
  { label: "06.03.2026", impressions: 7100, clicks: 470, spent: 3550 },
];

const generateHourData = () =>
  Array.from({ length: 24 }, (_, i) => ({
    label: `${String(i).padStart(2, "0")}:00`,
    impressions: Math.floor(Math.random() * 5000) + 1000,
    clicks: Math.floor(Math.random() * 400) + 50,
    spent: Math.floor(Math.random() * 3000) + 500,
  }));

const generateBrowserData = () => [
  { label: "Chrome", impressions: 52000, clicks: 3400, spent: 18200 },
  { label: "Safari", impressions: 28000, clicks: 1800, spent: 9800 },
  { label: "Firefox", impressions: 15000, clicks: 980, spent: 5200 },
  { label: "Edge", impressions: 12000, clicks: 750, spent: 4100 },
  { label: "Opera", impressions: 8500, clicks: 520, spent: 2900 },
  { label: "Samsung Internet", impressions: 5200, clicks: 310, spent: 1800 },
  { label: "Другие", impressions: 3100, clicks: 174, spent: 1230 },
];

const generateSubIdData = () => [
  { label: "sub_landing_1", impressions: 18000, clicks: 1200, spent: 6300 },
  { label: "sub_banner_top", impressions: 14500, clicks: 950, spent: 5100 },
  { label: "sub_video_pre", impressions: 22000, clicks: 1400, spent: 7700 },
  { label: "sub_native_feed", impressions: 11200, clicks: 680, spent: 3900 },
  { label: "sub_push_main", impressions: 9800, clicks: 620, spent: 3400 },
  { label: "sub_pop_exit", impressions: 15800, clicks: 890, spent: 5500 },
  { label: "sub_inpage_sidebar", impressions: 7500, clicks: 410, spent: 2600 },
  { label: "sub_social_ref", impressions: 6200, clicks: 380, spent: 2200 },
];

const generateDeviceData = () => [
  { label: "Mobile (Android)", impressions: 38000, clicks: 2500, spent: 13300 },
  { label: "Mobile (iOS)", impressions: 29000, clicks: 1900, spent: 10200 },
  { label: "Desktop (Windows)", impressions: 25000, clicks: 1700, spent: 8800 },
  { label: "Desktop (macOS)", impressions: 14000, clicks: 920, spent: 4900 },
  { label: "Tablet", impressions: 8500, clicks: 520, spent: 2900 },
  { label: "Smart TV", impressions: 2300, clicks: 94, spent: 810 },
];

const dataGenerators: Record<GroupBy, () => { label: string; impressions: number; clicks: number; spent: number }[]> = {
  dates: generateDateData,
  hours: generateHourData,
  browsers: generateBrowserData,
  subid: generateSubIdData,
  devices: generateDeviceData,
};

const groupLabels: Record<GroupBy, string> = {
  dates: "По датам",
  hours: "По часам",
  browsers: "По браузерам",
  subid: "По SubID",
  devices: "По устройствам",
};

const metrics = [
  { label: "Показы", value: "124,892", change: "+12.5%", up: true, icon: Eye },
  { label: "Клики", value: "8,234", change: "+8.2%", up: true, icon: MousePointer },
  { label: "CTR", value: "6.59%", change: "+2.1%", up: true, icon: Target },
  { label: "Расход", value: "48,230 ₽", change: "-3.4%", up: false, icon: TrendingUp },
];

export default function DashboardStatistics() {
  const [campaignId, setCampaignId] = useState("all");
  const [groupBy, setGroupBy] = useState<GroupBy>("dates");
  const [sortKey, setSortKey] = useState<SortKey>("impressions");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(new Date(2026, 2, 1));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date(2026, 2, 6));

  const rawData = useMemo(() => dataGenerators[groupBy](), [groupBy]);

  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) =>
      sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey]
    );
  }, [rawData, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown className={cn("h-3 w-3 ml-1 inline", sortKey === col ? "text-primary" : "text-muted-foreground")} />
  );

  const totals = useMemo(() => ({
    impressions: sortedData.reduce((s, r) => s + r.impressions, 0),
    clicks: sortedData.reduce((s, r) => s + r.clicks, 0),
    spent: sortedData.reduce((s, r) => s + r.spent, 0),
  }), [sortedData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Статистика</h2>
        <p className="text-muted-foreground text-sm">Подробная аналитика по вашим кампаниям</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        <Select value={campaignId} onValueChange={setCampaignId}>
          <SelectTrigger className="w-[220px] bg-background border-border">
            <SelectValue placeholder="Кампания" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {campaigns.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-start bg-background border-border text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFrom ? format(dateFrom, "dd.MM.yy") : "От"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[160px] justify-start bg-background border-border text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateTo ? format(dateTo, "dd.MM.yy") : "До"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <m.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.up ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : <ArrowDownRight className="h-3 w-3 text-accent" />}
                <span className={`text-xs ${m.up ? "text-green-500" : "text-accent"}`}>{m.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      {groupBy === "dates" && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Динамика показов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rawData}>
                  <defs>
                    <linearGradient id="grad-imp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Area type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" fill="url(#grad-imp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grouping Tabs + Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(groupLabels) as GroupBy[]).map((g) => (
              <Button
                key={g}
                variant={groupBy === g ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy(g)}
                className={groupBy === g ? "bg-primary text-primary-foreground" : "border-border"}
              >
                {groupLabels[g]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    {groupBy === "dates" ? "Дата" : groupBy === "hours" ? "Час" : groupBy === "browsers" ? "Браузер" : groupBy === "subid" ? "SubID" : "Устройство"}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("impressions")}>
                    Показы <SortIcon col="impressions" />
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("clicks")}>
                    Клики <SortIcon col="clicks" />
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort("spent")}>
                    Расход <SortIcon col="spent" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row) => (
                  <tr key={row.label} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{row.label}</td>
                    <td className="py-3 px-4 text-right">{row.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{row.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{((row.clicks / row.impressions) * 100).toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right">{row.spent.toLocaleString()} ₽</td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-semibold">
                  <td className="py-3 px-4">Итого</td>
                  <td className="py-3 px-4 text-right">{totals.impressions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{totals.clicks.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{((totals.clicks / totals.impressions) * 100).toFixed(2)}%</td>
                  <td className="py-3 px-4 text-right">{totals.spent.toLocaleString()} ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
