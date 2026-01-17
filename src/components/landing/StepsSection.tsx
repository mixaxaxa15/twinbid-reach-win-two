import { 
  UserPlus, 
  Target, 
  Wallet, 
  Rocket 
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Зарегистрируйте кабинет",
    description: "Зарегистрируйте кабинет пользователя — это займёт всего пару минут."
  },
  {
    icon: Target,
    number: "02",
    title: "Создайте кампанию",
    description: "Создайте свою первую кампанию, используя десятки точных таргетингов."
  },
  {
    icon: Wallet,
    number: "03",
    title: "Пополните баланс",
    description: "Напишите менеджеру и пополните баланс. Получите +25% от суммы пополнения бонусом на первый депозит. Минимум — $100."
  },
  {
    icon: Rocket,
    number: "04",
    title: "Масштабируйте",
    description: "Масштабируйте свои кампании с защитой от фрода и AI-оптимизацией."
  }
];

export function StepsSection() {
  return (
    <section id="steps" className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Как <span className="gradient-text">начать?</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Получи доступ к премиальному неограниченному трафику с сотен тысяч сайтов уже сегодня
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-primary/30 hidden sm:block" />

            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative flex flex-col sm:flex-row items-start gap-6 mb-12 last:mb-0 ${
                  index % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Content Card */}
                <div className={`flex-1 ${index % 2 === 0 ? 'sm:text-right' : 'sm:text-left'}`}>
                  <div className={`glass rounded-2xl p-6 hover-glow transition-all inline-block ${
                    index % 2 === 0 ? 'sm:ml-auto' : 'sm:mr-auto'
                  }`}>
                    <div className={`flex items-center gap-3 mb-3 ${
                      index % 2 === 0 ? 'sm:flex-row-reverse' : ''
                    }`}>
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-3xl font-bold gradient-text">{step.number}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Timeline Dot */}
                <div className="hidden sm:flex absolute left-8 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full gradient-primary glow-primary" />

                {/* Spacer for alternating layout */}
                <div className="flex-1 hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
