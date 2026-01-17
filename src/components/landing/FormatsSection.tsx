import { 
  Layers, 
  FileText, 
  LayoutGrid, 
  Bell 
} from "lucide-react";

const formats = [
  {
    icon: Layers,
    name: "Popunder",
    description: "Полноэкранная реклама, открывающаяся в новой вкладке. Максимальная видимость и высокий CTR."
  },
  {
    icon: FileText,
    name: "Native",
    description: "Органично интегрированная реклама, которая соответствует стилю площадки. Высокое доверие пользователей."
  },
  {
    icon: LayoutGrid,
    name: "Banner",
    description: "Классические баннеры различных размеров. Узнаваемость бренда и широкий охват аудитории."
  },
  {
    icon: Bell,
    name: "In-page Push",
    description: "Push-уведомления прямо на странице без подписки. Мгновенное привлечение внимания."
  }
];

export function FormatsSection() {
  return (
    <section id="formats" className="py-20 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Форматы <span className="gradient-text">рекламы</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Выбирайте оптимальный формат для вашей кампании
          </p>
        </div>

        {/* Formats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {formats.map((format, index) => (
            <div
              key={index}
              className="group relative glass rounded-2xl p-6 text-center hover-glow transition-all duration-300"
            >
              {/* Gradient Border Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl gradient-primary opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              
              {/* Icon */}
              <div className="relative w-16 h-16 mx-auto rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <format.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3 relative">
                {format.name}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed relative">
                {format.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
