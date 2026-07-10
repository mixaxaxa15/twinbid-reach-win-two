import { Layers, FileText, LayoutGrid, Bell, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { WordsReveal, LineReveal } from "./CinematicReveal";

const formatIcons = [Layers, FileText, LayoutGrid, Bell];
const formatNames = ["Popunder", "Native", "Banner", "In-page Push"];
const formatDescKeys = ["formats.popunder.desc", "formats.native.desc", "formats.banner.desc", "formats.push.desc"];

function MockFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-lg border border-border/70 bg-background/40 overflow-hidden mb-10">
      {children}
    </div>
  );
}

function PopunderMock() {
  return (
    <MockFrame>
      {/* fake browser window in top-left */}
      <div className="absolute top-3 left-3 w-[55%] h-[62%] rounded-md border border-border/70 bg-background/80 p-2">
        <div className="flex items-center gap-1.5 mb-2">
          <X className="w-2.5 h-2.5 text-muted-foreground/70" strokeWidth={1.5} />
          <div className="h-[3px] flex-1 rounded-full bg-muted-foreground/25" />
        </div>
        <div className="space-y-1.5">
          <div className="h-[3px] w-[70%] rounded-full bg-muted-foreground/25" />
          <div className="h-[3px] w-[45%] rounded-full bg-muted-foreground/20" />
        </div>
      </div>
      {/* popunder rising underneath */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60%] rounded-t-md border-t border-l border-r border-primary/30"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--primary) / 0.28) 0%, hsl(var(--primary) / 0.08) 60%, transparent 100%)",
        }}
      />
    </MockFrame>
  );
}

function NativeMock() {
  return (
    <MockFrame>
      <div className="absolute inset-0 p-4 flex flex-col justify-center gap-2.5">
        {/* sponsored row */}
        <div className="flex items-center gap-2.5 rounded-md border border-primary/25 bg-primary/[0.04] p-2">
          <div className="w-6 h-6 rounded-sm bg-primary/30" />
          <div className="flex-1 flex items-center gap-2">
            <span className="font-mono-eyebrow text-[8px] tracking-[0.2em] text-primary">SPONSORED</span>
            <div className="h-[3px] flex-1 rounded-full bg-muted-foreground/25" />
          </div>
        </div>
        {/* two neutral rows */}
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2.5 p-2">
            <div className="w-6 h-6 rounded-sm bg-muted-foreground/20" />
            <div className="h-[3px] flex-1 rounded-full bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    </MockFrame>
  );
}

function BannerMock() {
  return (
    <MockFrame>
      {/* top leaderboard */}
      <div
        className="absolute top-3 left-3 right-3 h-8 rounded-md border border-primary/30 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--primary) / 0.28), hsl(var(--primary) / 0.1))",
        }}
      >
        <span className="font-mono-eyebrow text-[9px] tracking-[0.25em] text-foreground/80">
          728 × 90 · BANNER
        </span>
      </div>
      {/* article lines */}
      <div className="absolute left-3 top-14 w-[52%] space-y-1.5">
        <div className="h-[3px] w-[90%] rounded-full bg-muted-foreground/25" />
        <div className="h-[3px] w-[75%] rounded-full bg-muted-foreground/20" />
        <div className="h-[3px] w-[60%] rounded-full bg-muted-foreground/20" />
      </div>
      {/* sidebar 300x250 */}
      <div
        className="absolute bottom-3 right-3 w-[36%] aspect-[6/5] rounded-md border border-primary/30 flex items-center justify-center"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--primary) / 0.28), hsl(var(--primary) / 0.08))",
        }}
      >
        <span className="font-mono-eyebrow text-[8px] tracking-[0.22em] text-foreground/70">300 × 250</span>
      </div>
    </MockFrame>
  );
}

function PushMock() {
  return (
    <MockFrame>
      {/* page content */}
      <div className="absolute inset-0 p-4 space-y-2">
        <div className="h-[3px] w-[70%] rounded-full bg-muted-foreground/20" />
        <div className="h-[3px] w-[55%] rounded-full bg-muted-foreground/15" />
        <div className="h-[3px] w-[65%] rounded-full bg-muted-foreground/15" />
      </div>
      {/* push toast */}
      <div className="absolute bottom-3 right-3 w-[62%] h-9 rounded-md border border-border/80 bg-background/95 flex items-center gap-2 pl-1.5 pr-2">
        <div className="w-6 h-6 rounded-sm bg-primary/40 flex-shrink-0" />
        <div className="h-[3px] flex-1 rounded-full bg-muted-foreground/30" />
        <X className="w-2.5 h-2.5 text-muted-foreground/60" strokeWidth={1.5} />
      </div>
    </MockFrame>
  );
}

const mockups = [PopunderMock, NativeMock, BannerMock, PushMock];

export function FormatsSection() {
  const { t } = useLanguage();

  return (
    <section id="formats" className="relative py-[140px] frame-immersive">
      <div className="container mx-auto px-8">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-24">
            <LineReveal>
              <div className="eyebrow mb-8 inline-block">— 04 / AD INVENTORY</div>
            </LineReveal>
            <WordsReveal
              as="h2"
              text={`${t("formats.title").trim()} ${t("formats.title2").trim()}`}
              className="text-display block text-foreground"
              brandWord={t("formats.title2").trim()}
              brandClass="gradient-text"
              stagger={0.06}
            />
            <LineReveal delay={0.5} className="mt-8 max-w-xl mx-auto">
              <p className="text-muted-foreground text-lg">{t("formats.subtitle")}</p>
            </LineReveal>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-border">
            {formatIcons.map((Icon, index) => {
              const Mock = mockups[index];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-background p-10 md:p-14 group relative overflow-hidden hover:bg-secondary/30 transition-colors duration-500"
                >
                  <div className="flex items-start justify-between mb-8">
                    <span className="font-mono-eyebrow text-[11px] tracking-[0.22em] text-muted-foreground">
                      Format · 0{index + 1}
                    </span>
                    <Icon className="w-5 h-5 text-primary opacity-70 group-hover:opacity-100 transition-opacity" strokeWidth={1.3} />
                  </div>
                  <Mock />
                  <h3 className="font-display text-4xl md:text-5xl font-light text-foreground mb-5 tracking-tight leading-[1.05]">
                    {formatNames[index]}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md">
                    {t(formatDescKeys[index])}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
