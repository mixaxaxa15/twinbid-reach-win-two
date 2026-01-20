import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const [step, setStep] = useState(1);

  const handleCreate = () => {
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) setStep(1);
    }}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Создание кампании</DialogTitle>
          <DialogDescription>
            Шаг {step} из 3: {step === 1 ? "Основная информация" : step === 2 ? "Таргетинг" : "Бюджет и расписание"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Название кампании</Label>
              <Input
                id="name"
                placeholder="Например: Летняя распродажа"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Формат рекламы</Label>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Выберите формат" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="banner">Баннер</SelectItem>
                  <SelectItem value="video">Видео</SelectItem>
                  <SelectItem value="ctv">CTV/OTT</SelectItem>
                  <SelectItem value="audio">Аудио</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Описание (опционально)</Label>
              <Textarea
                id="description"
                placeholder="Опишите цели кампании..."
                className="bg-background border-border resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>География</Label>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Выберите регион" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="russia">Россия</SelectItem>
                  <SelectItem value="moscow">Москва</SelectItem>
                  <SelectItem value="spb">Санкт-Петербург</SelectItem>
                  <SelectItem value="regions">Регионы</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Возраст аудитории</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">От</Label>
                  <Select>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="18" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {[18, 25, 35, 45, 55].map((age) => (
                        <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">До</Label>
                  <Select>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="65+" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {[25, 35, 45, 55, 65].map((age) => (
                        <SelectItem key={age} value={age.toString()}>{age === 65 ? "65+" : age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Интересы</Label>
              <Select>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Выберите категории" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="tech">Технологии</SelectItem>
                  <SelectItem value="fashion">Мода</SelectItem>
                  <SelectItem value="auto">Авто</SelectItem>
                  <SelectItem value="travel">Путешествия</SelectItem>
                  <SelectItem value="finance">Финансы</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Дневной бюджет</Label>
              <div className="relative">
                <Input
                  id="budget"
                  type="number"
                  placeholder="10000"
                  className="bg-background border-border pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
              </div>
              <p className="text-xs text-muted-foreground">Минимум 1 000 ₽ в день</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="total-budget">Общий бюджет (опционально)</Label>
              <div className="relative">
                <Input
                  id="total-budget"
                  type="number"
                  placeholder="Без ограничений"
                  className="bg-background border-border pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">₽</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Дата начала</Label>
                <Input
                  type="date"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Дата окончания</Label>
                <Input
                  type="date"
                  className="bg-background border-border"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Назад
            </Button>
          ) : (
            <div />
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} className="bg-primary hover:bg-primary/90">
              Далее
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Создать кампанию
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
