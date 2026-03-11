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
import { useLanguage } from "@/contexts/LanguageContext";

export default function DashboardSettings() {
  const { t } = useLanguage();
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

  const handleSave = () => toast.success(t("settings.saved"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("settings.title")}</h2>
        <p className="text-muted-foreground text-sm">{t("settings.subtitle")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile" className="gap-2"><User className="h-4 w-4" /> {t("settings.profile")}</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> {t("settings.notifications")}</TabsTrigger>
          <TabsTrigger value="security" className="gap-2"><Shield className="h-4 w-4" /> {t("settings.security")}</TabsTrigger>
          <TabsTrigger value="api" className="gap-2"><Globe className="h-4 w-4" /> {t("settings.api")}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">{t("settings.profile")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("settings.name")}</Label>
                  <Input value={profile.contactName} onChange={(e) => setProfile({ ...profile, contactName: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.email")}</Label>
                  <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.telegram")}</Label>
                  <Input value={profile.telegram} onChange={(e) => setProfile({ ...profile, telegram: e.target.value })} placeholder="@username" className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.timezone")}</Label>
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
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />{t("settings.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">{t("settings.notifications")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">{t("settings.emailNotifications")}</h4>
                {[
                  { key: "emailCampaign" as const, label: t("settings.campaignStatus") },
                  { key: "emailBalance" as const, label: t("settings.lowBalance") },
                  { key: "emailReport" as const, label: t("settings.weeklyReports") },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">{t("settings.pushNotifications")}</h4>
                {[
                  { key: "pushCampaign" as const, label: t("settings.pushCampaignStatus") },
                  { key: "pushBalance" as const, label: t("settings.pushBalance") },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch checked={notifications[item.key]} onCheckedChange={(c) => setNotifications({ ...notifications, [item.key]: c })} />
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2 max-w-xs">
                <Label>{t("settings.balanceThreshold")}</Label>
                <div className="relative">
                  <Input value={notifications.balanceThreshold} onChange={(e) => setNotifications({ ...notifications, balanceThreshold: e.target.value })} className="bg-background border-border pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                </div>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />{t("settings.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">{t("settings.security")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("settings.currentPassword")}</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.newPassword")}</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <div className="space-y-2">
                  <Label>{t("settings.repeatPassword")}</Label>
                  <Input type="password" placeholder="••••••••" className="bg-background border-border max-w-sm" />
                </div>
                <Button onClick={() => toast.success(t("settings.passwordUpdated"))} className="bg-primary hover:bg-primary/90">{t("settings.changePassword")}</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between max-w-sm">
                <div>
                  <Label>{t("settings.2fa")}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{t("settings.2faDesc")}</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">{t("settings.api")}</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>{t("settings.apiKey")}</Label>
                <div className="flex gap-2 max-w-lg">
                  <Input value="tb_live_a1b2c3d4e5f6g7h8i9j0..." readOnly className="bg-background border-border font-mono text-sm" />
                  <Button variant="outline" onClick={() => { navigator.clipboard.writeText("tb_live_a1b2c3d4e5f6g7h8i9j0"); toast.success(t("settings.copied")); }}>
                    {t("settings.copyBtn")}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t("settings.apiDesc")}</p>
              </div>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90"><Save className="h-4 w-4 mr-2" />{t("settings.save")}</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
