import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, AlertTriangle, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { PricingModel, TrafficQuality } from "@/contexts/CampaignContext";

const trafficInfo: Record<TrafficQuality, { label: string; desc: string }> = {
  common: {
    label: "Common",
    desc: "Трафик, очищенный от ботов нашей внутренней системой",
  },
  high: {
    label: "High Quality",
    desc: "Трафик с самыми жёсткими фильтрами на стороне поставщиков + наши жёсткие фильтры",
  },
  ultra: {
    label: "Ultra High Quality",
    desc: "Самый высококонвертящий сегмент с лучшими результатами у других рекламодателей, отфильтрованный поставщиками, нами и проверенный независимыми чекерами",
  },
};

const cpmLimits: Record<TrafficQuality, { min: number; rec: number }> = {
  common: { min: 0.3, rec: 0.7 },
  high: { min: 0.7, rec: 1.1 },
  ultra: { min: 0.9, rec: 1.7 },
};

const CPC_MULTIPLIER = 1.7 / 1000;

function getPriceLimits(quality: TrafficQuality, model: PricingModel) {
  const cpm = cpmLimits[quality];
  if (model === "cpm") return cpm;
  return { min: +(cpm.min * CPC_MULTIPLIER).toFixed(5), rec: +(cpm.rec * CPC_MULTIPLIER).toFixed(5) };
}

function getAvailableModels(formatKey: string): PricingModel[] {
  if (formatKey === "popunder") return ["cpm", "cpc"];
  if (formatKey === "push") return ["cpc"];
  return ["cpm"];
}

interface BudgetSectionProps {
  formatKey: string;
  totalBudget: string;
  setTotalBudget: (v: string) => void;
  dailyBudget: string;
  setDailyBudget: (v: string) => void;
  priceValue: string;
  setPriceValue: (v: string) => void;
  pricingModel: PricingModel;
  setPricingModel: (v: PricingModel) => void;
  trafficQuality: TrafficQuality;
  setTrafficQuality: (v: TrafficQuality) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  errors?: Record<string, string>;
}

export function BudgetSection({
  formatKey, totalBudget, setTotalBudget, dailyBudget, setDailyBudget,
  priceValue, setPriceValue, pricingModel, setPricingModel,
  trafficQuality, setTrafficQuality, startDate, setStartDate, endDate, setEndDate,
  errors = {},
}: BudgetSectionProps) {
  const availableModels = getAvailableModels(formatKey);
  const limits = getPriceLimits(trafficQuality, pricingModel);
  const priceNum = parseFloat(priceValue) || 0;
  const isBelowMin = priceValue !== "" && priceNum < limits.min;
  const isBelowRec = priceValue !== "" && priceNum >= limits.min && priceNum < limits.rec;

  // Auto-set pricing model if format only supports one
  if (availableModels.length === 1 && pricingModel !== availableModels[0]) {
    setPricingModel(availableModels[0]);
  }

  return (
    <div className="space-y-5">
      {/* Total Budget */}
      <div className="space-y-2">
        <Label>Общий бюджет *</Label>
        <div className="relative max-w-xs">
          <Input value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)}
            placeholder="1000" className={cn("bg-background border-border pr-8", errors.totalBudget && "border-destructive")} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        </div>
        {errors.totalBudget && <p className="text-xs text-destructive">{errors.totalBudget}</p>}
        <p className="text-xs text-muted-foreground">Обязательное поле. Минимум $100</p>
      </div>

      {/* Daily Budget */}
      <div className="space-y-2">
        <Label>Дневной бюджет (опционально)</Label>
        <div className="relative max-w-xs">
          <Input value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)}
            placeholder="Без ограничений" className="bg-background border-border pr-8" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        </div>
      </div>

      {/* Traffic Quality */}
      <div className="space-y-2">
        <Label>Тип трафика *</Label>
        <div className="flex flex-wrap gap-2">
          {(["common", "high", "ultra"] as const).map((q) => (
            <div key={q} className="flex items-center gap-1">
              <Button type="button" variant="outline" size="sm"
                onClick={() => setTrafficQuality(q)}
                className={cn(
                  trafficQuality === q
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                )}>
                {trafficInfo[q].label}
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{trafficInfo[q].desc}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Model */}
      {availableModels.length > 1 && (
        <div className="space-y-2">
          <Label>Модель оплаты *</Label>
          <div className="flex gap-2">
            {availableModels.map((m) => (
              <Button key={m} type="button" variant="outline" size="sm"
                onClick={() => setPricingModel(m)}
                className={cn(
                  pricingModel === m
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border"
                )}>
                {m.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Price Value */}
      <div className="space-y-2">
        <Label>{pricingModel === "cpm" ? "CPM (стоимость за 1000 показов)" : "CPC (стоимость за клик)"} *</Label>
        <div className="relative max-w-xs">
          <Input value={priceValue} onChange={(e) => setPriceValue(e.target.value)}
            placeholder={String(limits.rec)}
            className={cn("bg-background border-border pr-8", isBelowMin && "border-destructive", errors.priceValue && "border-destructive")} />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Мин: ${limits.min} · Рекомендованная: ${limits.rec}
          </p>
          {isBelowMin && (
            <div className="flex items-center gap-1 text-destructive">
              <AlertTriangle className="h-3 w-3" />
              <p className="text-xs">Ставка ниже минимальной (${limits.min})</p>
            </div>
          )}
          {isBelowRec && (
            <div className="flex items-center gap-1 text-yellow-500">
              <Info className="h-3 w-3" />
              <p className="text-xs">Ставка ниже рекомендованной — может быть мало показов</p>
            </div>
          )}
        </div>
        {errors.priceValue && <p className="text-xs text-destructive">{errors.priceValue}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <div className="space-y-2">
          <Label>Дата начала</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-background border-border" />
        </div>
        <div className="space-y-2">
          <Label>Дата окончания</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-background border-border" />
        </div>
      </div>
    </div>
  );
}
