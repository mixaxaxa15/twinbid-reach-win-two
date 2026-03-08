import { Gift, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "./AuthDialog";

export function StartConditions() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 gradient-accent opacity-10" />
            <div className="absolute inset-0 bg-card/80" />
            
            {/* Content */}
            <div className="relative p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left: Minimum Deposit */}
                <div className="text-center md:text-left">
                  <div className="inline-flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
                      <DollarSign className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Условия старта</div>
                      <div className="text-2xl font-bold text-foreground">Минимальный депозит</div>
                    </div>
                  </div>
                  <div className="text-5xl md:text-6xl font-bold gradient-text mb-2">$100</div>
                  <p className="text-muted-foreground">Начните с небольшого бюджета и масштабируйтесь</p>
                </div>

                {/* Right: Bonus */}
                <div className="relative">
                  <div className="glass rounded-2xl p-6 border border-primary/30 hover-glow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Gift className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-primary">Бонус новым пользователям</span>
                    </div>
                    <div className="text-4xl md:text-5xl font-bold text-foreground mb-3">
                      +25%
                    </div>
                    <p className="text-muted-foreground mb-6">
                      бюджета на первое пополнение — зарегистрируйтесь и получите уже сегодня дополнительные средства на тесты.
                    </p>
                    <AuthDialog
                      defaultTab="register"
                      trigger={
                        <Button className="w-full gradient-primary text-primary-foreground hover:opacity-90 glow-primary">
                          Получить бонус
                        </Button>
                      }
                    />
                  </div>
                  
                  {/* Decorative Glow */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/30 rounded-full blur-[60px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
