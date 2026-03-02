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
    company: "ООО «Компания»",
    email: "info@company.ru",
    phone: "+7 (999) 123-45-67",
    website: "https://company.ru",
    contactName: "Иван Иванов",
    inn: "7712345678",
    timezone: "europe_moscow",
  });

  const [notifications, setNotifications] = useState({
    emailCampaign: true,
    emailBalance: true,
    emailReport: false,
    pushCampaign: true,
    pushBalance: true,
    balanceThreshold: "5000",
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
            <CardHeader><CardTitle className="text-lg">Информация о компании</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название компании</Label>
                  <Input value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>ИНН</Label>
                  <Input value={profile.inn} onChange={(e) => setProfile({ ...profile, inn: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Контактное лицо</Label>
                  <Input value={profile.contactName} onChange={(e) => setProfile({ ...profile, contactName: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Телефон</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>Сайт</Label>
                  <Input value={profile.website} onChange={(e) => setProfile({ ...profile, website: e.target.value })} className="bg-background border-border" />
                </div>
              </div>
              <div className="space-y-2 max-w-xs">
                <Label>Часовой пояс</Label>
                <Select value={profile.timezone} onValueChange={(v) => setProfile({ ...profile, timezone: v })}>
                  <SelectTrigger className="bg-background border-border"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="europe_moscow">Москва (UTC+3)</SelectItem>
                    <SelectItem value="europe_samara">Самара (UTC+4)</SelectItem>
                    <SelectItem value="asia_yekaterinburg">Екатеринбург (UTC+5)</SelectItem>
                    <SelectItem value="asia_novosibirsk">Новосибирск (UTC+7)</SelectItem>
                    <SelectItem value="asia_vladivostok">Владивосток (UTC+10)</SelectItem>
                  </SelectContent>
                </Select>
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
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })}
                    />
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
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })}
                    />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 max-w-xs">
                <Label>Порог баланса для уведомления</Label>
                <div className="relative">
                  <Input
                    value={notifications.balanceThreshold}
                    onChange={(e) => setNotifications({ ...notifications, balanceThreshold: e.target.value })}
                    className="bg-background border-border pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
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
              <Separator />
              <div className="space-y-2">
                <Label>Postback URL</Label>
                <Input placeholder="https://your-tracker.com/postback?click_id={click_id}" className="bg-background border-border max-w-lg" />
                <p className="text-xs text-muted-foreground">URL для отправки конверсий в вашу трекинг-систему</p>
              </div>
              <div className="space-y-2">
                <Label>S2S Tracking</Label>
                <Input placeholder="https://your-tracker.com/impression?campaign_id={campaign_id}" className="bg-background border-border max-w-lg" />
                <p className="text-xs text-muted-foreground">Server-to-server трекинг показов</p>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />Сохранить</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
