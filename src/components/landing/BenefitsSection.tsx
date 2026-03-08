import { 
  LayoutDashboard, 
  TrendingUp, 
  Eye, 
  ShieldCheck, 
  Brain 
} from "lucide-react";

const benefits = [
  {
    icon: LayoutDashboard,
    title: "Единый кабинет вместо десятков площадок",
    description: "Одна интеграция, один баланс, общая статистика и логика управления кампаниями. Вы экономите время команды и быстрее масштабируете то, что приносит результат."
  },
  {
    icon: TrendingUp,
    title: "Максимальный инвентарь без потолков по CPM-модели",
    description: "Трафик сотни тысяч сайтов уже доступен на нашей площадке. Остается только зарегистрироваться в пару кликов!"
  },
  {
    icon: Eye,
    title: "Оплата только за реальный показ",
    description: "Мы засчитываем исключительно фактически показанную пользователю рекламу: учитываются только прогруженные страницы, а баннер/креатив должен находиться в зоне видимости пользователя определенное время. Меньше пустых расходов и больше отдачи от рекламы."
  },
  {
    icon: ShieldCheck,
    title: "Встроенная антифрод-система",
    description: "Система фильтрует подозрительные действия и снижает долю некачественного трафика, тем самым защищая бюджет от мусора."
  },
  {
    icon: Brain,
    title: "AI-оптимизация кампаний: больше эффективности при том же бюджете",
    description: "Алгоритмы оптимизации перераспределяют показы в пользу сегментов и источников с лучшей отдачей, чтобы реклама попадала к максимально релевантной аудитории."
  }
];

function BenefitCard({ benefit, index }: { benefit: typeof benefits[number]; index: number }) {
  return (
    <div className="group glass rounded-2xl p-6 hover-glow transition-all duration-300">
      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-shadow">
        <benefit.icon className="w-7 h-7 text-primary-foreground" />
      </div>
      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold text-muted-foreground mb-4">
        {index + 1}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Почему <span className="gradient-text">TwinBid</span> — это удобно?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Всё, что нужно для эффективной рекламы, в одном месте
          </p>
        </div>

        {/* Benefits - top row 3 cards, bottom row 2 centered */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.slice(0, 3).map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 lg:max-w-[calc(66.666%+0.75rem)] mx-auto">
          {benefits.slice(3).map((benefit, index) => (
            <BenefitCard key={index + 3} benefit={benefit} index={index + 3} />
          ))}
        </div>
      </div>
    </section>
  );
}
