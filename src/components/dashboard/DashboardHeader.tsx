import { useState } from "react";
import { Bell, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function DashboardHeader() {
  const { notifications, removeNotification } = useNotifications();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <LanguageSelector />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-accent rounded-full text-[10px] font-bold flex items-center justify-center text-accent-foreground">
                  {notifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="end">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium">{t("header.notifications")}</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {t("header.noNotifications")}
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", n.type === "warning" && "text-yellow-500", n.type === "error" && "text-destructive")}>
                          {n.title}
                        </p>
                        {n.description && <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>}
                        {n.action && (
                          <button
                            onClick={() => { n.action!.onClick(); setOpen(false); }}
                            className="text-xs text-primary hover:underline mt-1"
                          >
                            {n.action.label}
                          </button>
                        )}
                      </div>
                      <button onClick={() => removeNotification(n.id)} className="text-muted-foreground hover:text-foreground shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        <button
          onClick={() => navigate("/dashboard/settings")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium">user@example.com</p>
            <p className="text-xs text-muted-foreground">{t("header.advertiser")}</p>
          </div>
        </button>
      </div>
    </header>
  );
}
