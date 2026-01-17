import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="relative max-w-4xl mx-auto">
          {/* Background Card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 gradient-accent opacity-90" />
            
            {/* Overlay Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Content */}
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm text-white/90">Начните уже сегодня</span>
              </div>

              {/* Heading */}
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Получи доступ к премиальному неограниченному трафику
              </h2>

              {/* Subheading */}
              <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                Присоединяйтесь к TwinBid и получите +25% на первый депозит. 
                Сотни тысяч сайтов уже ждут вашу рекламу.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto font-semibold shadow-lg"
                >
                  Зарегистрироваться
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 h-auto bg-transparent"
                >
                  Связаться с нами
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-white/60 text-sm">
                <span>✓ Минимальный депозит $100</span>
                <span>✓ +25% бонус</span>
                <span>✓ Мгновенный старт</span>
              </div>
            </div>
          </div>

          {/* Glow Effects */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/40 rounded-full blur-[80px]" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/40 rounded-full blur-[80px]" />
        </div>
      </div>
    </section>
  );
}
