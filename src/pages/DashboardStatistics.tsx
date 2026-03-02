import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, MousePointer, Target, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const dailyData = [
  { date: "01.02", impressions: 4200, clicks: 280, spent: 2100 },
  { date: "02.02", impressions: 5100, clicks: 340, spent: 2550 },
  { date: "03.02", impressions: 3800, clicks: 250, spent: 1900 },
  { date: "04.02", impressions: 6200, clicks: 410, spent: 3100 },
  { date: "05.02", impressions: 5800, clicks: 380, spent: 2900 },
  { date: "06.02", impressions: 7100, clicks: 470, spent: 3550 },
  { date: "07.02", impressions: 6500, clicks: 430, spent: 3250 },
  { date: "08.02", impressions: 5900, clicks: 390, spent: 2950 },
  { date: "09.02", impressions: 7800, clicks: 520, spent: 3900 },
  { date: "10.02", impressions: 8200, clicks: 550, spent: 4100 },
  { date: "11.02", impressions: 7500, clicks: 500, spent: 3750 },
  { date: "12.02", impressions: 9100, clicks: 610, spent: 4550 },
  { date: "13.02", impressions: 8800, clicks: 590, spent: 4400 },
  { date: "14.02", impressions: 10200, clicks: 680, spent: 5100 },
];

const geoData = [
  { name: "Россия", value: 45 },
  { name: "Украина", value: 18 },
  { name: "Казахстан", value: 12 },
  { name: "Беларусь", value: 10 },
  { name: "Другие", value: 15 },
];

const deviceData = [
  { name: "Mobile", impressions: 68000, clicks: 4500 },
  { name: "Desktop", impressions: 42000, clicks: 3200 },
  { name: "Tablet", impressions: 14000, clicks: 900 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(168, 60%, 50%)", "hsl(200, 60%, 50%)", "hsl(var(--muted-foreground))"];

const metrics = [
  { label: "Показы", value: "124,892", change: "+12.5%", up: true, icon: Eye },
  { label: "Клики", value: "8,234", change: "+8.2%", up: true, icon: MousePointer },
  { label: "CTR", value: "6.59%", change: "+2.1%", up: true, icon: Target },
  { label: "Расход", value: "48,230 ₽", change: "-3.4%", up: false, icon: TrendingUp },
];

export default function DashboardStatistics() {
  const [period, setPeriod] = useState("14d");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Статистика</h2>
          <p className="text-muted-foreground text-sm">Подробная аналитика по вашим кампаниям</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px] bg-background border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="7d">Последние 7 дней</SelectItem>
            <SelectItem value="14d">Последние 14 дней</SelectItem>
            <SelectItem value="30d">Последние 30 дней</SelectItem>
            <SelectItem value="90d">Последние 90 дней</SelectItem>
          </SelectContent>
        </Select>
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
                {m.up ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-accent" />
                )}
                <span className={`text-xs ${m.up ? "text-green-500" : "text-accent"}`}>{m.change}</span>
                <span className="text-xs text-muted-foreground">vs прошлый период</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="impressions" className="space-y-4">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="impressions">Показы</TabsTrigger>
          <TabsTrigger value="clicks">Клики</TabsTrigger>
          <TabsTrigger value="spent">Расход</TabsTrigger>
        </TabsList>

        {["impressions", "clicks", "spent"].map((key) => (
          <TabsContent key={key} value={key}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  {key === "impressions" ? "Показы" : key === "clicks" ? "Клики" : "Расход"} по дням
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyData}>
                      <defs>
                        <linearGradient id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          color: "hsl(var(--foreground))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey={key}
                        stroke="hsl(var(--primary))"
                        fill={`url(#gradient-${key})`}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Geo Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">География</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={geoData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {geoData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Устройства</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="impressions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="clicks" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
