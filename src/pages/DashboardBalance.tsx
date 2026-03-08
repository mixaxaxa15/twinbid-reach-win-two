import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wallet, Plus, ArrowDownLeft, ArrowUpRight, Receipt, Copy, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const amounts = [100, 250, 500, 1000, 5000];

const usdtMethods = [
  { id: "usdt_trc20", label: "USDT (TRC-20)", desc: "Tether on Tron", address: "TXkRh4pKz7w9Yb2mN5vQx8Gp3jL6fD0eW" },
  { id: "usdt_erc20", label: "USDT (ERC-20)", desc: "Tether on Ethereum", address: "0x3F7a9c2B1d5E8f4A6C0b9D1e2F3a4B5c6D7e8F9a" },
];

const transactions = [
  { id: "1", type: "topup", amount: 500, date: "14.02.2026", method: "USDT (TRC-20)", status: "completed" },
  { id: "2", type: "spend", amount: -32, date: "14.02.2026", campaign: "Летняя распродажа", status: "completed" },
  { id: "3", type: "spend", amount: -18, date: "13.02.2026", campaign: "Новая коллекция", status: "completed" },
  { id: "4", type: "topup", amount: 250, date: "12.02.2026", method: "USDT (TRC-20)", status: "completed" },
  { id: "5", type: "spend", amount: -45, date: "12.02.2026", campaign: "Бренд-кампания", status: "completed" },
  { id: "6", type: "topup", amount: 1000, date: "10.02.2026", method: "USDT (ERC-20)", status: "completed" },
  { id: "7", type: "topup", amount: 100, date: "08.02.2026", method: "USDT (TRC-20)", status: "pending" },
];

export default function DashboardBalance() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("usdt_trc20");
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [pendingPayment, setPendingPayment] = useState<{ amount: number; method: string } | null>(null);

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleTopUp = () => {
    if (!finalAmount || finalAmount < 100) return;
    setPendingPayment({ amount: finalAmount, method: selectedMethod });
    setTxHash("");
    setShowTxDialog(true);
  };

  const handleSubmitTx = () => {
    if (!txHash.trim()) {
      toast.error("Введите хэш транзакции");
      return;
    }
    toast.success("Платёж отправлен на проверку. Средства появятся на балансе в ближайшее время.", { duration: 8000 });
    toast.info(
      "По вопросам оплаты обращайтесь: @GregTwinbid в Telegram или twinbid@twinbidex.com",
      { duration: 15000 }
    );
    setShowTxDialog(false);
    setPendingPayment(null);
    setTxHash("");
  };

  const handleCloseTxDialog = (open: boolean) => {
    if (!open && pendingPayment && !txHash.trim()) {
      // User closed without submitting hash
      setShowTxDialog(false);
      toast("Оплата не завершена", {
        description: "Вы не отправили хэш транзакции",
        duration: Infinity,
        action: {
          label: "Завершить",
          onClick: () => setShowTxDialog(true),
        },
      });
    } else {
      setShowTxDialog(open);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success("Адрес скопирован");
  };

  const currentMethod = usdtMethods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Баланс и платежи</h2>
        <p className="text-muted-foreground text-sm">Пополнение USDT</p>
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
                  $4,523
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Потрачено сегодня</span>
                <span>$32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Потрачено за неделю</span>
                <span>$184</span>
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
                  <button key={a} onClick={() => { setSelectedAmount(a); setCustomAmount(""); }}
                    className={cn("py-2 px-4 rounded-lg border text-sm font-medium transition-colors",
                      selectedAmount === a && !customAmount ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/50"
                    )}>
                    ${a.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative max-w-xs">
                <Input placeholder="Другая сумма" value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="bg-background border-border pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Сеть</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {usdtMethods.map((m) => (
                  <button key={m.id} onClick={() => setSelectedMethod(m.id)}
                    className={cn("flex flex-col items-start gap-1 p-4 rounded-lg border transition-colors text-left",
                      selectedMethod === m.id ? "border-primary bg-primary/10" : "border-border bg-background hover:border-primary/50"
                    )}>
                    <span className={cn("text-sm font-medium", selectedMethod === m.id ? "text-foreground" : "text-muted-foreground")}>{m.label}</span>
                    <span className="text-xs text-muted-foreground">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={handleTopUp} className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!finalAmount || finalAmount < 100}>
              Пополнить {finalAmount ? `$${finalAmount.toLocaleString()}` : ""}
            </Button>
            <p className="text-xs text-muted-foreground">Минимальная сумма — $100. Бонус +25% на первый депозит.</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Hash Dialog */}
      <Dialog open={showTxDialog} onOpenChange={handleCloseTxDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>Оплата {pendingPayment ? `$${pendingPayment.amount.toLocaleString()}` : ""}</DialogTitle>
            <DialogDescription>
              Переведите точную сумму на указанный адрес и вставьте хэш транзакции
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Адрес кошелька ({currentMethod?.label})</Label>
              <div className="flex gap-2">
                <Input value={currentMethod?.address || ""} readOnly className="bg-background border-border font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copyAddress(currentMethod?.address || "")} className="border-border shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Переведите точную сумму. Средства зачислятся после подтверждения сети.</p>
            </div>

            <div className="space-y-2">
              <Label>Хэш транзакции *</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..." className="bg-background border-border font-mono text-sm" />
            </div>

            <Button onClick={handleSubmitTx} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!txHash.trim()}>
              Отправить
            </Button>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                Вопросы по оплате: <a href="https://t.me/GregTwinbid" target="_blank" rel="noopener" className="text-primary hover:underline">@GregTwinbid</a> или{" "}
                <a href="mailto:twinbid@twinbidex.com" className="text-primary hover:underline">twinbid@twinbidex.com</a>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" /> История операций
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
                      {t.amount > 0 ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
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
