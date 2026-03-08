import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Globe, Save } from "lucide-react";
import { toast } from "sonner";

export default function DashboardSettings() {
  const [profile, setProfile] = useState({
    email: "user@example.com",
    contactName: "John Doe",
    telegram: "@gregtwinbid",
    timezone: "utc_0",
  });

  const [notifications, setNotifications] = useState({
    emailCampaign: true,
    emailBalance: true,
    emailReport: false,
    pushCampaign: true,
    pushBalance: true,
    balanceThreshold: "100",
  });

  const handleSave = () => toast.success("Настройки сохранены");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Настройки</h2>
        <p className="text-muted-foreground text-sm">Управление аккаунтом и предпочтениями</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> Профиль</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Уведомления</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> Безопасность</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Globe className="h-4 w-4" /> API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Профиль</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input value={profile.contactName} onChange={(e) => setProfile({ ...profile, contactName: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Telegram (опционально)</Label>
                  <Input value={profile.telegram} onChange={(e) => setProfile({ ...profile, telegram: e.target.value })} placeholder="@username" className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Часовой пояс</Label>
                  <Select value={profile.timezone} onValueChange={(v) => setProfile({ ...profile, timezone: v })}>
                    <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="utc_m5">UTC-5 (EST)</SelectItem>
                      <SelectItem value="utc_0">UTC+0 (GMT)</SelectItem>
                      <SelectItem value="utc_1">UTC+1 (CET)</SelectItem>
                      <SelectItem value="utc_2">UTC+2 (EET)</SelectItem>
                      <SelectItem value="utc_3">UTC+3 (MSK)</SelectItem>
                      <SelectItem value="utc_5_30">UTC+5:30 (IST)</SelectItem>
                      <SelectItem value="utc_8">UTC+8 (CST)</SelectItem>
                      <SelectItem value="utc_9">UTC+9 (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Настройки уведомлений</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Email-уведомления</h4>
                {[
                  { key: "emailCampaign" as const, label: "Изменения статуса кампаний" },
                  { key: "emailBalance" as const, label: "Низкий баланс" },
                  { key: "emailReport" as const, label: "Еженедельные отчёты" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Push-уведомления</h4>
                {[
                  { key: "pushCampaign" as const, label: "Статусы кампаний" },
                  { key: "pushBalance" as const, label: "Баланс ниже порога" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 max-w-xs">
                <Label>Порог баланса для уведомления</Label>
                <div className="relative">
                  <Input value={notifications.balanceThreshold} onChange={(e) => setNotifications({ ...notifications, balanceThreshold: e.target.value })} className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Безопасность</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Текущий пароль</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Новый пароль</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Label>Повторите пароль</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <Button onClick={() => toast.success("Пароль обновлён")} className="bg-primary hover:bg-primary/90">Сменить пароль</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <Label>Двухфакторная аутентификация</Label>
                  <p className="text-xs text-muted-foreground mt-1">Дополнительная защита аккаунта</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">API и интеграции</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>API-ключ</Label>
                <div className="flex gap-2 max-w-lg">
                  <Input value="tb_live_a1b2c3d4e5f6g7h8i9j0..." readOnly className="bg-background border-border font-mono text-sm" />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText("tb_live_a1b2c3d4e5f6g7h8i9j0"); toast.success("Скопировано"); }}>
                    Копировать
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Используйте этот ключ для интеграции через API</p>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
