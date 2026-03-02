import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, CreditCard, Building2, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const amounts = [5000, 10000, 25000, 50000, 100000];

const paymentMethods = [
  { id: "card", label: "Банковская карта", icon: CreditCard, desc: "Visa, Mastercard, МИР" },
  { id: "invoice", label: "Счёт для юрлица", icon: Building2, desc: "Безналичный расчёт" },
  { id: "wallet", label: "Электронный кошелёк", icon: Wallet, desc: "USDT, Bitcoin, другие" },
];

const transactions = [
  { id: "1", type: "topup", amount: 50000, date: "14.02.2026", method: "Банковская карта", status: "completed" },
  { id: "2", type: "spend", amount: -3200, date: "14.02.2026", campaign: "Летняя распродажа", status: "completed" },
  { id: "3", type: "spend", amount: -1800, date: "13.02.2026", campaign: "Новая коллекция", status: "completed" },
  { id: "4", type: "topup", amount: 25000, date: "12.02.2026", method: "Счёт для юрлица", status: "completed" },
  { id: "5", type: "spend", amount: -4500, date: "12.02.2026", campaign: "Бренд-кампания", status: "completed" },
  { id: "6", type: "topup", amount: 100000, date: "10.02.2026", method: "USDT", status: "completed" },
  { id: "7", type: "spend", amount: -2100, date: "10.02.2026", campaign: "Летняя распродажа", status: "completed" },
  { id: "8", type: "topup", amount: 10000, date: "08.02.2026", method: "Банковская карта", status: "pending" },
];

export default function DashboardBalance() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25000);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("card");

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleTopUp = () => {
    if (!finalAmount || finalAmount < 1000) return;
    toast.success(`Заявка на пополнение ${finalAmount.toLocaleString()} ₽ создана`);
    setCustomAmount("");
    setSelectedAmount(25000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Баланс и платежи</h2>
        <p className="text-muted-foreground text-sm">Управление финансами аккаунта</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Balance Info */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Текущий баланс</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  45,230 ₽
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Потрачено сегодня</span>
                <span>3,200 ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Потрачено за неделю</span>
                <span>18,400 ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Хватит примерно на</span>
                <span className="text-primary font-medium">~14 дней</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Up Form */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Пополнить баланс
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Сумма</Label>
              <div className="flex flex-wrap gap-2">
                {amounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => { setSelectedAmount(a); setCustomAmount(""); }}
                    className={cn(
                      "py-2 px-4 rounded-lg border text-sm font-medium transition-colors",
                      selectedAmount === a && !customAmount
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    {a.toLocaleString()} ₽
                  </button>
                ))}
              </div>
              <div className="relative max-w-xs">
                <Input
                  placeholder="Другая сумма"
                  value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="bg-background border-border pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Способ оплаты</Label>
              <div className="grid sm:grid-cols-3 gap-3">
                {paymentMethods.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border transition-colors text-center",
                      selectedMethod === m.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <m.icon className={cn("h-6 w-6", selectedMethod === m.id ? "text-primary" : "text-muted-foreground")} />
                    <span className={cn("text-sm font-medium", selectedMethod === m.id ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleTopUp}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!finalAmount || finalAmount < 1000}
            >
              Пополнить {finalAmount ? `${finalAmount.toLocaleString()} ₽` : ""}
            </Button>
            <p className="text-xs text-muted-foreground">Минимальная сумма — 1 000 ₽. Бонус +25% на первый депозит от $100.</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            История операций
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Дата</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Тип</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Описание</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Сумма</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Статус</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm">{t.date}</td>
                    <td className="py-3 px-4">
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", t.type === "topup" ? "bg-green-500/10" : "bg-accent/10")}>
                        {t.type === "topup" ? <ArrowDownLeft className="h-4 w-4 text-green-500" /> : <ArrowUpRight className="h-4 w-4 text-accent" />}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {t.type === "topup" ? `Пополнение · ${t.method}` : `Списание · ${t.campaign}`}
                    </td>
                    <td className={cn("py-3 px-4 text-sm text-right font-medium", t.amount > 0 ? "text-green-500" : "text-accent")}>
                      {t.amount > 0 ? "+" : ""}{t.amount.toLocaleString()} ₽
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge variant="outline" className={cn("font-normal", t.status === "completed" ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20")}>
                        {t.status === "completed" ? "Проведено" : "В обработке"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
