import { Wallet, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TopUpDialog } from "./TopUpDialog";

export function BalanceCard() {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  return (
    <>
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Баланс
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            45,230 ₽
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            ≈ 15 дней показов
          </p>
          <Button 
            onClick={() => setIsTopUpOpen(true)}
            className="w-full mt-4 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Plus className="h-4 w-4 mr-2" />
            Пополнить
          </Button>
        </CardContent>
      </Card>
      <TopUpDialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen} />
    </>
  );
}
