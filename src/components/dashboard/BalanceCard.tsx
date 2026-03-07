import { Wallet, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function BalanceCard() {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Wallet className="h-4 w-4" />
          Баланс
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          $4,523
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ≈ 14 дней показов
        </p>
        <Button
          onClick={() => navigate("/dashboard/balance")}
          className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Пополнить
        </Button>
      </CardContent>
    </Card>
  );
}
