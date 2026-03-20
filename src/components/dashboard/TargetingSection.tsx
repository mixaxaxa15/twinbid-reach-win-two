import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { TargetingState, ListMode } from "@/contexts/CampaignContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const targetingOptions: Record<string, string[]> = {
  country: ["US","GB","DE","FR","IT","ES","BR","RU","IN","JP","KR","CN","AU","CA","MX","AR","CO","PL","NL","SE","NO","DK","FI","CZ","AT","CH","BE","PT","GR","TR","UA","RO","HU","BG","HR","SK","SI","LT","LV","EE","IE","IL","SA","AE","EG","ZA","NG","KE","TH","VN","PH","ID","MY","SG","TW","HK","NZ","CL","PE"],
  language: ["EN","ES","FR","DE","IT","PT","RU","ZH","JA","KO","AR","HI","TR","PL","NL","SV","NO","DA","FI","CS","RO","HU","BG","HR","SK","SL","LT","LV","ET","EL","HE","TH","VI","ID","MS","UK","SR","BS","MK","SQ","KA","HY","AZ","UZ","KK","TG","KY","MN","MY","KM","LO","BN","TA","TE","ML","KN","MR","GU","PA","SI","NE"],
  deviceType: ["Mobile","Desktop","Tablet","Smart TV","Console"],
  os: ["Android","iOS","Windows","macOS","Linux","ChromeOS","HarmonyOS"],
  browser: ["Chrome","Safari","Firefox","Edge","Opera","Samsung Internet","UC Browser","Brave","Vivaldi","Yandex Browser"],
  dayOfWeek: ["day.monday","day.tuesday","day.wednesday","day.thursday","day.friday","day.saturday","day.sunday"],
  hour: Array.from({ length: 24 }, (_, i) => String(i)),
  sites: [],
};

const targetingConfigKeys = [
  "country", "language", "deviceType", "os", "browser", "dayOfWeek", "hour", "sites",
];

export const targetingConfigs = targetingConfigKeys.map(key => ({ key, labelKey: `targeting.${key}` }));

interface TargetingSectionProps {
  lists: Record<string, TargetingState>;
  onUpdate: (key: string, updates: Partial<TargetingState>) => void;
}

function AutocompleteInput({
  options, value, onChange, onAdd, existingItems, placeholder, freeText, t,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  onAdd: (v: string) => void;
  existingItems: string[];
  placeholder: string;
  freeText: boolean;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const keepOpenRef = useRef(false);

  const getDisplayLabel = (option: string) => {
    if (option.startsWith("day.")) return t(option);
    return option;
  };

  const filtered = options.filter(o => {
    const display = getDisplayLabel(o);
    return display.toLowerCase().includes(value.toLowerCase()) && !existingItems.includes(o);
  }).slice(0, 20);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (keepOpenRef.current) { keepOpenRef.current = false; return; }
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdd = (item: string) => {
    keepOpenRef.current = true;
    onAdd(item);
    onChange("");
    setOpen(true);
    setTimeout(() => { inputRef.current?.focus(); setOpen(true); }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length > 0) handleAdd(filtered[0]);
      else if (freeText && value.trim()) handleAdd(value.trim());
    }
  };

  return (
    <div ref={ref} className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="bg-background border-border"
        onKeyDown={handleKeyDown}
      />
      {open && (filtered.length > 0 || (freeText && value.trim())) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-card border border-border rounded-md shadow-lg">
          {filtered.map(option => (
            <button key={option} type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(option); }}>
              {getDisplayLabel(option)}
            </button>
          ))}
          {freeText && value.trim() && !filtered.includes(value.trim()) && !existingItems.includes(value.trim()) && (
            <button type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
              onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleAdd(value.trim()); }}>
              {t("targeting.addCustom")} «{value.trim()}»
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Hour picker grid component
function HourPicker({ items, onUpdate, t }: { items: string[]; onUpdate: (items: string[]) => void; t: (key: string) => string }) {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [selectMode, setSelectMode] = useState(true); // true = selecting, false = deselecting

  const toggleHour = (h: string) => {
    if (items.includes(h)) {
      onUpdate(items.filter(i => i !== h));
    } else {
      onUpdate([...items, h]);
    }
  };

  const handleMouseDown = (h: string) => {
    setIsMouseDown(true);
    const newMode = !items.includes(h);
    setSelectMode(newMode);
    if (newMode) {
      if (!items.includes(h)) onUpdate([...items, h]);
    } else {
      onUpdate(items.filter(i => i !== h));
    }
  };

  const handleMouseEnter = (h: string) => {
    if (!isMouseDown) return;
    if (selectMode) {
      if (!items.includes(h)) onUpdate([...items, h]);
    } else {
      onUpdate(items.filter(i => i !== h));
    }
  };

  useEffect(() => {
    const up = () => setIsMouseDown(false);
    window.addEventListener("mouseup", up);
    return () => window.removeEventListener("mouseup", up);
  }, []);

  // Format selected hours as ranges
  const formatRanges = () => {
    if (items.length === 0) return "";
    const sorted = items.map(Number).sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) { end = sorted[i]; }
      else {
        ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);
        start = sorted[i]; end = sorted[i];
      }
    }
    ranges.push(start === end ? `${start}:00` : `${start}:00-${end}:00`);
    return ranges.join(", ");
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t("targeting.selectHours")}</p>
      <div className="grid grid-cols-12 gap-1 select-none">
        {Array.from({ length: 24 }, (_, i) => String(i)).map(h => (
          <button
            key={h}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); handleMouseDown(h); }}
            onMouseEnter={() => handleMouseEnter(h)}
            className={cn(
              "py-1.5 rounded text-xs font-medium transition-colors cursor-pointer",
              items.includes(h)
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
          >
            {h}
          </button>
        ))}
      </div>
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">{t("targeting.hourRange")} {formatRanges()}</p>
      )}
    </div>
  );
}

// Sites input with validation
function SitesInput({ items, onAdd, t }: { items: string[]; onAdd: (items: string[]) => void; t: (key: string) => string }) {
  const [value, setValue] = useState("");

  const handleAdd = () => {
    const raw = value.trim();
    if (!raw) return;

    // Validate format: no spaces, no quotes
    if (/\s/.test(raw) || raw.includes('"') || raw.includes("'")) {
      toast.error(t("targeting.sitesFormatError"));
      return;
    }

    // Split by comma
    const sites = raw.split(",").filter(s => s.trim()).map(s => s.trim());
    const valid = sites.filter(s => !items.includes(s));
    if (valid.length > 0) {
      onAdd(valid);
    }
    setValue("");
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{t("targeting.sitesHint")}</p>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="'12345','abdjhx'"
          className="bg-background border-border flex-1"
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
        />
        <Button type="button" size="icon" variant="outline" onClick={handleAdd} className="border-border shrink-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ListItem({ config, list, onUpdate }: {
  config: typeof targetingConfigs[0];
  list: TargetingState;
  onUpdate: (updates: Partial<TargetingState>) => void;
}) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState("");
  const options = targetingOptions[config.key] || [];
  const isFreeText = config.key === "sites";
  const isHour = config.key === "hour";
  const isSites = config.key === "sites";

  const getDisplayLabel = (item: string) => {
    if (item.startsWith("day.")) return t(item);
    return item;
  };

  const addItem = (item: string) => {
    if (item && !list.items.includes(item)) {
      onUpdate({ items: [...list.items, item] });
    }
  };

  const removeItem = (item: string) => {
    onUpdate({ items: list.items.filter(i => i !== item) });
  };

  return (
    <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-border/50">
      <div className="flex items-center justify-between">
        <Label className="font-medium">{t(config.labelKey)}</Label>
        <div className="flex gap-1.5">
          {(["none", "white", "black"] as const).map((m) => (
            <Button key={m} type="button" size="sm" variant="outline"
              onClick={() => onUpdate({ mode: m })}
              className={
                list.mode === m
                  ? m === "white" ? "bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white"
                    : m === "black" ? "bg-red-600 text-white border-red-600 hover:bg-red-700 hover:text-white"
                    : "bg-primary text-primary-foreground border-primary"
                  : "border-border"
              }>
              {m === "none" ? t("targeting.off") : m === "white" ? "White" : "Black"}
            </Button>
          ))}
        </div>
      </div>
      {list.mode !== "none" && (
        <div className="space-y-2">
          {isHour ? (
            <HourPicker items={list.items} onUpdate={(items) => onUpdate({ items })} t={t} />
          ) : isSites ? (
            <SitesInput
              items={list.items}
              onAdd={(newItems) => onUpdate({ items: [...list.items, ...newItems] })}
              t={t}
            />
          ) : (
            <div className="flex gap-2">
              <AutocompleteInput
                options={options}
                value={inputValue}
                onChange={setInputValue}
                onAdd={addItem}
                existingItems={list.items}
                placeholder={t("targeting.autocompletePlaceholder")}
                freeText={false}
                t={t}
              />
              <Button type="button" size="icon" variant="outline"
                onClick={() => {
                  if (inputValue.trim()) { addItem(inputValue.trim()); setInputValue(""); }
                }}
                className="border-border shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          {list.items.length > 0 && !isHour && (
            <div className="flex flex-wrap gap-1.5">
              {list.items.map((item) => (
                <Badge key={item} variant="outline"
                  className={`gap-1 ${list.mode === "white" ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                  {getDisplayLabel(item)}<X className="h-3 w-3 cursor-pointer" onClick={() => removeItem(item)} />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function TargetingSection({ lists, onUpdate }: TargetingSectionProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t("targeting.description")}</p>
      {targetingConfigs.map((config) => (
        <ListItem
          key={config.key}
          config={config}
          list={lists[config.key] || { mode: "none", items: [] }}
          onUpdate={(updates) => onUpdate(config.key, updates)}
        />
      ))}
    </div>
  );
}
