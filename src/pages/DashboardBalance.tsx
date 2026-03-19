import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Wallet, Plus, ArrowDownLeft, Receipt, Copy, ExternalLink, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationContext";
import { useLanguage } from "@/contexts/LanguageContext";

const amounts = [100, 250, 500, 1000, 5000];

const usdtMethods = [
  { id: "usdt_trc20", label: "USDT (TRC-20)", desc: "Tether on Tron", address: "TXkRh4pKz7w9Yb2mN5vQx8Gp3jL6fD0eW" },
  { id: "usdt_erc20", label: "USDT (ERC-20)", desc: "Tether on Ethereum", address: "0x3F7a9c2B1d5E8f4A6C0b9D1e2F3a4B5c6D7e8F9a" },
];

const PROMO_CODES: Record<string, { bonus: number; label: string }> = {
  WELCOME10: { bonus: 10, label: "Welcome 10%" },
  BOOST20: { bonus: 20, label: "Boost 20%" },
  VIP25: { bonus: 25, label: "VIP 25%" },
};

interface Transaction {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: "completed" | "pending";
}

const initialTransactions: Transaction[] = [
  { id: "1", amount: 500, date: "14.02.2026", method: "USDT (TRC-20)", status: "completed" },
  { id: "4", amount: 250, date: "12.02.2026", method: "USDT (TRC-20)", status: "completed" },
  { id: "6", amount: 1000, date: "10.02.2026", method: "USDT (ERC-20)", status: "completed" },
  { id: "7", amount: 100, date: "08.02.2026", method: "USDT (TRC-20)", status: "pending" },
];

const BALANCE = 4523;

export default function DashboardBalance() {
  const { t } = useLanguage();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(250);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("usdt_trc20");
  const [showTxDialog, setShowTxDialog] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; bonus: number } | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ amount: number; method: string; promo?: string; bonus?: number } | null>(null);
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null);
  const { addNotification, removeNotification } = useNotifications();
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const stored = localStorage.getItem("twinbid_transactions");
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialTransactions;
  });

  const persistTransactions = (txs: Transaction[]) => {
    setTransactions(txs);
    localStorage.setItem("twinbid_transactions", JSON.stringify(txs));
  };

  useEffect(() => {
    if (BALANCE < 10) {
      addNotification({
        title: t("balance.notif.lowBalance"),
        description: `${t("balance.notif.lowBalanceDesc")} $${BALANCE}. ${t("balance.notif.recommend")}`,
        type: "warning",
        persistent: true,
        action: { label: t("balance.notif.topUp"), onClick: () => window.location.hash = "" },
      });
    }
  }, []);

  const finalAmount = customAmount ? parseInt(customAmount) : selectedAmount;

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    const promo = PROMO_CODES[code];
    if (promo) {
      setAppliedPromo({ code, bonus: promo.bonus });
      toast.success(t("balance.promo.applied").replace("{percent}", `${promo.bonus}`));
    } else {
      setAppliedPromo(null);
      toast.error(t("balance.promo.invalid"));
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  const handleTopUp = () => {
    if (!finalAmount || finalAmount < 100) return;
    if (pendingPayment) {
      toast.error(t("balance.toast.pendingExists"));
      return;
    }
    setPendingPayment({ amount: finalAmount, method: selectedMethod, promo: appliedPromo?.code, bonus: appliedPromo?.bonus });
    setTxHash("");
    setShowTxDialog(true);
    if (pendingNotificationId) {
      removeNotification(pendingNotificationId);
      setPendingNotificationId(null);
    }
  };

  const handleSubmitTx = () => {
    if (!txHash.trim()) {
      toast.error(t("balance.toast.enterHash"));
      return;
    }
    const methodLabel = usdtMethods.find(m => m.id === pendingPayment?.method)?.label || pendingPayment?.method || "";
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}.${now.getFullYear()}`;
    const newTx: Transaction = {
      id: Date.now().toString(),
      amount: pendingPayment?.amount || 0,
      date: dateStr,
      method: methodLabel,
      status: "pending",
    };
    persistTransactions([newTx, ...transactions]);

    toast.success(t("balance.toast.paymentSent"), {
      duration: 8000,
      description: t("balance.toast.paymentSupport"),
      action: {
        label: "@GregTwinbid",
        onClick: () => window.open("https://t.me/GregTwinbid", "_blank"),
      },
    });

    // Add notification about successful payment submission
    addNotification({
      title: t("balance.notif.paymentSuccess"),
      description: t("balance.notif.paymentSuccessDesc").replace("${amount}", `$${pendingPayment?.amount.toLocaleString()}`),
      type: "info",
      persistent: false,
      action: {
        label: "@GregTwinbid",
        onClick: () => window.open("https://t.me/GregTwinbid", "_blank"),
      },
    });

    setShowTxDialog(false);
    setPendingPayment(null);
    setTxHash("");
    if (pendingNotificationId) {
      removeNotification(pendingNotificationId);
      setPendingNotificationId(null);
    }
  };

  const handleCancelPayment = () => {
    setShowTxDialog(false);
    setPendingPayment(null);
    setTxHash("");
    if (pendingNotificationId) {
      removeNotification(pendingNotificationId);
      setPendingNotificationId(null);
    }
    toast.info(t("balance.toast.paymentCanceled"));
  };

  const handleCloseTxDialog = (open: boolean) => {
    if (!open && pendingPayment && !txHash.trim()) {
      setShowTxDialog(false);
      const nId = addNotification({
        title: t("balance.notif.notCompleted"),
        description: `${t("balance.notif.noHash")} $${pendingPayment.amount}`,
        type: "warning",
        persistent: true,
        action: { label: t("balance.notif.completePayment"), onClick: () => setShowTxDialog(true) },
        onDismiss: () => {
          // Cancel the pending payment when notification is dismissed
          setPendingPayment(null);
          setTxHash("");
          setPendingNotificationId(null);
          toast.info(t("balance.toast.paymentCanceled"));
        },
      });
      setPendingNotificationId(nId);
      toast(t("balance.toast.notCompleted"), { duration: 5000 });
    } else {
      setShowTxDialog(open);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success(t("balance.toast.addressCopied"));
  };

  const currentMethod = usdtMethods.find(m => m.id === selectedMethod);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("balance.title")}</h2>
        <p className="text-muted-foreground text-sm">{t("balance.subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("balance.current")}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  ${BALANCE.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balance.spentToday")}</span>
                <span>$32</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balance.spentWeek")}</span>
                <span>$184</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("balance.estimatedDays")}</span>
                <span className="text-primary font-medium">~14 {t("balance.days")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {t("balance.topUp")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>{t("balance.amount")}</Label>
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
                <Input placeholder={t("balance.otherAmount")} value={customAmount}
                  onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
                  className="bg-background border-border pr-8" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("balance.network")}</Label>
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t("balance.promo.label")}
              </Label>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder={t("balance.promo.placeholder")}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-background border-border uppercase"
                  disabled={!!appliedPromo}
                />
                {appliedPromo ? (
                  <Button variant="outline" onClick={handleRemovePromo} className="border-border shrink-0">
                    {t("balance.promo.remove")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleApplyPromo} className="border-border shrink-0" disabled={!promoCode.trim()}>
                    {t("balance.promo.apply")}
                  </Button>
                )}
              </div>
              {appliedPromo && (
                <p className="text-sm text-primary font-medium">
                  ✓ {t("balance.promo.active").replace("{code}", appliedPromo.code).replace("{percent}", `${appliedPromo.bonus}`)}
                </p>
              )}
            </div>

            <Button onClick={handleTopUp} className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!finalAmount || finalAmount < 100}>
              {t("balance.topUpBtn")} {finalAmount ? `$${finalAmount.toLocaleString()}` : ""}
              {appliedPromo && finalAmount ? ` (+${Math.floor(finalAmount * appliedPromo.bonus / 100)}$ ${t("balance.promo.bonusShort")})` : ""}
            </Button>
            <p className="text-xs text-muted-foreground">{t("balance.minAmount")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Hash Dialog */}
      <Dialog open={showTxDialog} onOpenChange={handleCloseTxDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border">
          <DialogHeader>
            <DialogTitle>{t("balance.paymentTitle")} {pendingPayment ? `$${pendingPayment.amount.toLocaleString()}` : ""}</DialogTitle>
            <DialogDescription>{t("balance.paymentDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium">{t("balance.topUpAmount")} <span className="text-primary">${pendingPayment?.amount.toLocaleString()}</span></p>
            </div>

            <div className="space-y-2">
              <Label>{t("balance.walletAddress")} ({currentMethod?.label})</Label>
              <div className="flex gap-2">
                <Input value={currentMethod?.address || ""} readOnly className="bg-background border-border font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={() => copyAddress(currentMethod?.address || "")} className="border-border shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t("balance.transferNote")}</p>
            </div>

            <div className="space-y-2">
              <Label>{t("balance.txHash")}</Label>
              <Input value={txHash} onChange={(e) => setTxHash(e.target.value)}
                placeholder="0x..." className="bg-background border-border font-mono text-sm" />
            </div>

            <Button onClick={handleSubmitTx} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!txHash.trim()}>
              {t("balance.submit")}
            </Button>

            <Button variant="outline" className="w-full border-border" onClick={handleCancelPayment}>
              {t("balance.cancelPayment")}
            </Button>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t("balance.supportText")}{" "}
                <a href="https://t.me/GregTwinbid" target="_blank" rel="noopener" className="text-primary hover:underline">@GregTwinbid</a>{" "}
                {t("balance.inTelegram")}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" /> {t("balance.history")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">{t("balance.noTransactions")}</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("balance.date")}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("balance.description")}</th>
                     <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("balance.amountCol")}</th>
                     <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">{t("balance.statusCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm">{tx.date}</td>
                      <td className="py-3 px-4 text-sm">{t("balance.topUpVia")} · {tx.method}</td>
                      <td className="py-3 px-4 text-sm text-left font-medium text-green-500">
                        +${tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-left">
                        <Badge variant="outline" className={cn("font-normal", tx.status === "completed" ? "text-green-500 border-green-500/20" : "text-yellow-500 border-yellow-500/20")}>
                          {tx.status === "completed" ? t("balance.completed") : t("balance.pending")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
