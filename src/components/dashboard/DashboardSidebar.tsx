import { LayoutDashboard, Megaphone, Wallet, Settings, LogOut, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Обзор", active: true },
  { icon: Megaphone, label: "Кампании", active: false },
  { icon: BarChart3, label: "Статистика", active: false },
  { icon: Wallet, label: "Баланс", active: false },
  { icon: Settings, label: "Настройки", active: false },
];

export function DashboardSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 
          className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent cursor-pointer"
          onClick={() => navigate("/")}
        >
          TwinBid
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <button 
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
