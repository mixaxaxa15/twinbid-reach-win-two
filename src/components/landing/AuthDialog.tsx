import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface AuthDialogProps {
  trigger?: React.ReactNode;
  defaultTab?: "login" | "register";
}

export function AuthDialog({ trigger, defaultTab = "login" }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>{t("nav.login")}</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TwinBid</span>
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="login">{t("auth.login")}</TabsTrigger>
            <TabsTrigger value="register">{t("auth.register")}</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-login">{t("auth.email")}</Label>
                <Input id="email-login" type="email" placeholder="your@email.com" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-login">{t("auth.password")}</Label>
                <Input id="password-login" type="password" placeholder="••••••••" className="bg-background border-border" />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90">{t("auth.loginBtn")}</Button>
            </form>
          </TabsContent>
          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("auth.name")}</Label>
                <Input id="name" placeholder="John Doe" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-register">{t("auth.email")}</Label>
                <Input id="email-register" type="email" placeholder="your@email.com" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("auth.phone")}</Label>
                <Input id="phone" type="tel" placeholder="+7 (999) 999-99-99" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-register">{t("auth.password")}</Label>
                <Input id="password-register" type="password" placeholder="••••••••" className="bg-background border-border" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-confirm">{t("auth.confirmPassword")}</Label>
                <Input id="password-confirm" type="password" placeholder="••••••••" className="bg-background border-border" />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">{t("auth.registerBtn")}</Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
