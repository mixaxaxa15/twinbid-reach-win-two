import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { TargetingState, ListMode } from "@/contexts/CampaignContext";
import { useLanguage } from "@/contexts/LanguageContext";

const targetingOptions: Record<string, string[]> = {
  country: ["US","GB","DE","FR","IT","ES","BR","RU","IN","JP","KR","CN","AU","CA","MX","AR","CO","PL","NL","SE","NO","DK","FI","CZ","AT","CH","BE","PT","GR","TR","UA","RO","HU","BG","HR","SK","SI","LT","LV","EE","IE","IL","SA","AE","EG","ZA","NG","KE","TH","VN","PH","ID","MY","SG","TW","HK","NZ","CL","PE"],
  city: ["New York","London","Berlin","Paris","Tokyo","Moscow","Mumbai","São Paulo","Istanbul","Dubai","Singapore","Hong Kong","Sydney","Toronto","Los Angeles","Chicago","Madrid","Rome","Amsterdam","Stockholm","Vienna","Prague","Warsaw","Budapest","Bucharest","Bangkok","Seoul","Shanghai","Beijing","Jakarta","Manila","Ho Chi Minh City","Kuala Lumpur","Mexico City","Buenos Aires","Lima","Bogotá","Lagos","Cairo","Johannesburg","Miami","San Francisco","Seattle","Denver","Dallas","Houston","Atlanta","Boston","Philadelphia","Detroit"],
  deviceType: ["Mobile","Desktop","Tablet","Smart TV","Console"],
  os: ["Android","iOS","Windows","macOS","Linux","ChromeOS","HarmonyOS"],
  osVersion: ["Android 14","Android 13","Android 12","Android 11","Android 10","Android 9","iOS 18","iOS 17","iOS 16","iOS 15","iOS 14","Windows 11","Windows 10","Windows 8.1","macOS 15","macOS 14","macOS 13","macOS 12","Linux"],
  browser: ["Chrome","Safari","Firefox","Edge","Opera","Samsung Internet","UC Browser","Brave","Vivaldi","Yandex Browser"],
  dayOfWeek: ["day.monday","day.tuesday","day.wednesday","day.thursday","day.friday","day.saturday","day.sunday"],
  hour: Array.from({ length: 24 }, (_, i) => String(i)),
  subid: [],
  sites: [],
};

const targetingConfigKeys = [
  "country", "city", "deviceType", "os", "osVersion", "browser", "dayOfWeek", "hour", "subid", "sites",
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

  // For day of week, show translated labels but filter by translated text
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
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAdd = (item: string) => {
    onAdd(item);
    onChange("");
    inputRef.current?.focus();
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
              onMouseDown={(e) => { e.preventDefault(); handleAdd(option); }}>
              {getDisplayLabel(option)}
            </button>
          ))}
          {freeText && value.trim() && !filtered.includes(value.trim()) && !existingItems.includes(value.trim()) && (
            <button type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors text-muted-foreground"
              onMouseDown={(e) => { e.preventDefault(); handleAdd(value.trim()); }}>
              {t("targeting.addCustom")} «{value.trim()}»
            </button>
          )}
        </div>
      )}
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
  const isFreeText = config.key === "subid" || config.key === "sites";

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
          <div className="flex gap-2">
            <AutocompleteInput
              options={options}
              value={inputValue}
              onChange={setInputValue}
              onAdd={addItem}
              existingItems={list.items}
              placeholder={isFreeText ? t("targeting.freeTextPlaceholder") : t("targeting.autocompletePlaceholder")}
              freeText={isFreeText}
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
          {list.items.length > 0 && (
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
