import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, MousePointer, Target, TrendingUp, ArrowUpRight, ArrowDownRight, ArrowUpDown, CalendarIcon, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parse, isWithinInterval, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { toast } from "sonner";
import { useCampaigns } from "@/contexts/CampaignContext";
import { useLanguage } from "@/contexts/LanguageContext";

type GroupBy = "dates" | "hours" | "browsers" | "siteid" | "devices";
type SortKey = "label" | "impressions" | "clicks" | "spent";
type SortDir = "asc" | "desc";

function seedRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(31, h) + seed.charCodeAt(i) | 0; }
  return () => { h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 13), 0x45d9f3b); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
}

function getCampaignData(campaignId: string, groupBy: GroupBy): { label: string; impressions: number; clicks: number; spent: number }[] {
  const rng = seedRandom(campaignId + groupBy);
  const r = (min: number, max: number) => Math.floor(rng() * (max - min)) + min;

  if (groupBy === "dates") {
    return Array.from({ length: 8 }, (_, i) => ({
      label: String(i + 1).padStart(2, "0") + ".03.2026",
      impressions: r(1000, 8000), clicks: r(50, 500), spent: r(500, 4000),
    }));
  }
  if (groupBy === "hours") {
    const days = Array.from({ length: 8 }, (_, i) => String(i + 1).padStart(2, "0") + ".03.2026");
    return days.flatMap(day =>
      Array.from({ length: 24 }, (_, h) => ({
        label: `${day} ${String(h).padStart(2, "0")}:00`,
        impressions: r(100, 1500), clicks: r(5, 120), spent: r(50, 800),
      }))
    );
  }
  if (groupBy === "browsers") {
    return ["Chrome", "Safari", "Firefox", "Edge", "Opera", "Samsung Internet", "Other"].map(b => ({
      label: b, impressions: r(2000, 50000), clicks: r(100, 3500), spent: r(800, 18000),
    }));
  }
  if (groupBy === "siteid") {
    return ["site_landing_1", "site_banner_top", "site_video_pre", "site_native_feed", "site_push_main", "site_pop_exit"].map(s => ({
      label: s, impressions: r(5000, 25000), clicks: r(300, 1500), spent: r(1500, 8000),
    }));
  }
  return ["Mobile (Android)", "Mobile (iOS)", "Desktop (Windows)", "Desktop (macOS)", "Tablet", "Smart TV"].map(d => ({
    label: d, impressions: r(1000, 40000), clicks: r(50, 2500), spent: r(400, 14000),
  }));
}

function mergeData(datasets: { label: string; impressions: number; clicks: number; spent: number }[][]) {
  const map = new Map<string, { label: string; impressions: number; clicks: number; spent: number }>();
  for (const ds of datasets) {
    for (const row of ds) {
      const existing = map.get(row.label);
      if (existing) { existing.impressions += row.impressions; existing.clicks += row.clicks; existing.spent += row.spent; }
      else { map.set(row.label, { ...row }); }
    }
  }
  return Array.from(map.values());
}

export default function DashboardStatistics() {
  const { campaigns } = useCampaigns();
  const { t } = useLanguage();
  const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set(["all"]));
  const [groupBy, setGroupBy] = useState<GroupBy>("dates");
  const [sortKey, setSortKey] = useState<SortKey>("label");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [clickCount, setClickCount] = useState(0);

  const groupLabels: Record<GroupBy, string> = {
    dates: t("stats.byDates"), hours: t("stats.byHours"), browsers: t("stats.byBrowsers"), siteid: t("stats.bySiteId"), devices: t("stats.byDevices"),
  };

  const activeCampaigns = useMemo(() =>
    campaigns.filter(c => c.status === "active" || c.status === "completed" || c.status === "paused"),
    [campaigns]
  );

  const data = useMemo(() => {
    const ids = selectedCampaignIds.has("all") ? activeCampaigns.map(c => c.id) : Array.from(selectedCampaignIds);
    const campaignIds = ids.length > 0 ? ids : ["_default"];
    const datasets = campaignIds.map(id => getCampaignData(id, groupBy));
    let merged = mergeData(datasets);
    if ((groupBy === "dates" || groupBy === "hours") && dateRange?.from) {
      const from = startOfDay(dateRange.from);
      const to = dateRange.to ? startOfDay(dateRange.to) : from;
      merged = merged.filter(row => {
        const dateStr = groupBy === "hours" ? row.label.split(" ")[0] : row.label;
        const d = parse(dateStr, "dd.MM.yyyy", new Date());
        return isWithinInterval(d, { start: from, end: to });
      });
    }
    return merged;
  }, [selectedCampaignIds, activeCampaigns, groupBy, dateRange]);

  const metricCards = useMemo(() => {
    const totalImpressions = data.reduce((s, r) => s + r.impressions, 0);
    const totalClicks = data.reduce((s, r) => s + r.clicks, 0);
    const totalSpent = data.reduce((s, r) => s + r.spent, 0);
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
    return [
      { label: t("stats.impressions"), value: totalImpressions.toLocaleString(), change: "+12.5%", up: true, icon: Eye },
      { label: t("stats.clicks"), value: totalClicks.toLocaleString(), change: "+8.2%", up: true, icon: MousePointer },
      { label: t("stats.ctr"), value: `${ctr}%`, change: "+2.1%", up: true, icon: Target },
      { label: t("stats.spent"), value: `$${totalSpent.toLocaleString()}`, change: "-3.4%", up: false, icon: TrendingUp },
    ];
  }, [data, t]);

  useEffect(() => {
    if (groupBy === "dates") { setSortKey("label"); setSortDir("desc"); }
    else if (groupBy === "hours") { setSortKey("label"); setSortDir("asc"); }
    else { setSortKey("impressions"); setSortDir("desc"); }
  }, [groupBy]);

  const handleRefresh = useCallback(() => { toast.success(t("stats.refreshed")); }, [t]);

  const handleCampaignChange = (id: string) => {
    setSelectedCampaignIds(prev => {
      const next = new Set(prev);
      if (id === "all") {
        if (next.has("all")) { next.clear(); } else { next.clear(); next.add("all"); }
      } else {
        next.delete("all");
        if (next.has(id)) next.delete(id); else next.add(id);
        if (next.size === 0) next.add("all");
      }
      return next;
    });
  };

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) return;
    if (clickCount === 0) { setDateRange({ from: range.from, to: undefined }); setClickCount(1); }
    else if (clickCount === 1) {
      if (range.from && range.to) { setDateRange(range); } else if (range.from) { setDateRange({ from: dateRange?.from, to: range.from }); }
      setClickCount(2);
    } else { setDateRange({ from: range.from || range.to, to: undefined }); setClickCount(1); }
  };

  const chartData = useMemo(() => {
    if (groupBy !== "dates") return [];
    return [...data].sort((a, b) => a.label.localeCompare(b.label));
  }, [data, groupBy]);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (sortKey === "label") return sortDir === "asc" ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      return sortDir === "desc" ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey];
    });
  }, [data, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <ArrowUpDown className={cn("h-3 w-3 ml-1 inline shrink-0", sortKey === col ? "text-primary" : "text-muted-foreground")} />
  );

  const totals = useMemo(() => ({
    impressions: sortedData.reduce((s, r) => s + r.impressions, 0),
    clicks: sortedData.reduce((s, r) => s + r.clicks, 0),
    spent: sortedData.reduce((s, r) => s + r.spent, 0),
  }), [sortedData]);

  const labelHeader = groupBy === "dates" ? t("stats.date") : groupBy === "hours" ? t("stats.dateAndHour") : groupBy === "browsers" ? t("stats.browser") : groupBy === "siteid" ? "SiteID" : t("stats.device");
  const canSortByLabel = groupBy === "dates" || groupBy === "hours";

  const campaignOptions = [{ id: "all", name: t("stats.allCampaigns") }, ...activeCampaigns];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("stats.title")}</h2>
        <p className="text-muted-foreground text-sm">{t("stats.subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-base text-muted-foreground font-medium mb-1">{t("stats.campaigns")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] justify-start bg-background border-border text-left font-normal">
                {selectedCampaignIds.has("all") ? t("stats.allCampaigns") : `${t("stats.selected")} ${selectedCampaignIds.size}`}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-2" align="start">
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {campaignOptions.map(c => (
                  <label key={c.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm">
                    <Checkbox checked={selectedCampaignIds.has(c.id)} onCheckedChange={() => handleCampaignChange(c.id)} />
                    {c.name}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base text-muted-foreground font-medium mb-1">{t("stats.period")}</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[260px] justify-start bg-background border-border text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to && dateRange.from.getTime() !== dateRange.to.getTime() ? (
                    <>{format(dateRange.from, "dd.MM.yy")} — {format(dateRange.to, "dd.MM.yy")}</>
                  ) : format(dateRange.from, "dd.MM.yy")
                ) : t("stats.selectPeriod")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="range" selected={dateRange} onSelect={handleDateChange} numberOfMonths={2} className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleRefresh} className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <RefreshCw className="h-4 w-4" /> {t("stats.refresh")}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((m) => (
          <Card key={m.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{m.label}</p>
                <m.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
              <p className="text-2xl font-bold">{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.up ? <ArrowUpRight className="h-3 w-3 text-green-500 shrink-0" /> : <ArrowDownRight className="h-3 w-3 text-accent shrink-0" />}
                <span className={`text-xs ${m.up ? "text-green-500" : "text-accent"}`}>{m.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {groupBy === "dates" && chartData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">{t("stats.chartTitle")}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
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

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(groupLabels) as GroupBy[]).map((g) => (
              <Button key={g} variant={groupBy === g ? "default" : "outline"} size="sm"
                onClick={() => setGroupBy(g)}
                className={cn("min-w-[100px]", groupBy === g ? "bg-primary text-primary-foreground" : "border-border")}>
                {groupLabels[g]}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground"><p>{t("stats.noData")}</p></div>
          ) : (
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-border">
                    <th className={cn("text-left py-3 px-4 text-sm font-medium text-muted-foreground w-[200px]", canSortByLabel && "cursor-pointer select-none")}
                      onClick={() => canSortByLabel && toggleSort("label")}>
                      {labelHeader} {canSortByLabel && <SortIcon col="label" />}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none w-[140px]" onClick={() => toggleSort("impressions")}>
                      {t("stats.impressions")} <SortIcon col="impressions" />
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none w-[120px]" onClick={() => toggleSort("clicks")}>
                      {t("stats.clicks")} <SortIcon col="clicks" />
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground w-[100px]">{t("stats.ctr")}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground cursor-pointer select-none w-[140px]" onClick={() => toggleSort("spent")}>
                      {t("stats.spent")} <SortIcon col="spent" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map((row) => (
                    <tr key={row.label} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 font-medium truncate">{row.label}</td>
                      <td className="py-3 px-4 text-right">{row.impressions.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{row.clicks.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right">{((row.clicks / row.impressions) * 100).toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right">${row.spent.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-muted/30 font-semibold">
                    <td className="py-3 px-4">{t("stats.total")}</td>
                    <td className="py-3 px-4 text-right">{totals.impressions.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{totals.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{totals.impressions > 0 ? ((totals.clicks / totals.impressions) * 100).toFixed(2) : "0.00"}%</td>
                    <td className="py-3 px-4 text-right">${totals.spent.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
