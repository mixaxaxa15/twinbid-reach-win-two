import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type CampaignStatus = "active" | "paused" | "draft" | "completed" | "moderation";
export type PricingModel = "cpm" | "cpc";
export type TrafficQuality = "common" | "high" | "ultra";
export type ListMode = "none" | "white" | "black";

export interface TargetingState {
  mode: ListMode;
  items: string[];
}

export interface Campaign {
  id: string;
  name: string;
  status: CampaignStatus;
  format: string;
  formatKey: string;
  budget: number;
  dailyBudget: number | null;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  pricingModel: PricingModel;
  priceValue: number;
  trafficQuality: TrafficQuality;
  startDate: string;
  endDate: string;
  creative: Record<string, string>;
  targeting: Record<string, TargetingState>;
  description: string;
}

const defaultTargeting = (): Record<string, TargetingState> =>
  Object.fromEntries(
    ["country","city","deviceType","os","osVersion","browser","dayOfWeek","hour","subid","sites"]
      .map(k => [k, { mode: "none" as ListMode, items: [] }])
  );

const initialCampaigns: Campaign[] = [
  { id: "10001", name: "Летняя распродажа 2024", status: "active", format: "Баннер", formatKey: "banner", budget: 5000, dailyBudget: null, spent: 2340, impressions: 45230, clicks: 2890, ctr: 6.39, pricingModel: "cpm", priceValue: 2.5, trafficQuality: "common", startDate: "2024-06-01", endDate: "2024-08-31", creative: { link: "https://example.com/summer", imageUrl: "https://example.com/banner.jpg", adText: "Скидки до 50%!" }, targeting: defaultTargeting(), description: "" },
  { id: "10002", name: "Новая коллекция", status: "active", format: "Popunder", formatKey: "popunder", budget: 10000, dailyBudget: 500, spent: 6780, impressions: 89120, clicks: 5670, ctr: 6.36, pricingModel: "cpm", priceValue: 3.1, trafficQuality: "high", startDate: "2024-05-15", endDate: "2024-09-15", creative: { link: "https://example.com/new" }, targeting: defaultTargeting(), description: "" },
  { id: "10003", name: "Бренд-кампания", status: "paused", format: "Native", formatKey: "native", budget: 3000, dailyBudget: null, spent: 1520, impressions: 28900, clicks: 1240, ctr: 4.29, pricingModel: "cpm", priceValue: 2.0, trafficQuality: "common", startDate: "2024-04-01", endDate: "2024-07-01", creative: { link: "https://example.com/brand", imageUrl: "https://example.com/native.jpg", adText: "Откройте для себя", title: "Бренд" }, targeting: defaultTargeting(), description: "" },
  { id: "10004", name: "Тестовая кампания", status: "draft", format: "In-page Push", formatKey: "push", budget: 2500, dailyBudget: null, spent: 0, impressions: 0, clicks: 0, ctr: 0, pricingModel: "cpc", priceValue: 0.005, trafficQuality: "common", startDate: "", endDate: "", creative: { link: "https://example.com/test", imageUrl: "", adText: "", title: "" }, targeting: defaultTargeting(), description: "" },
  { id: "10005", name: "Осенний запуск", status: "completed", format: "Баннер", formatKey: "banner", budget: 7500, dailyBudget: 300, spent: 7420, impressions: 152000, clicks: 9120, ctr: 6.0, pricingModel: "cpm", priceValue: 2.2, trafficQuality: "ultra", startDate: "2024-09-01", endDate: "2024-11-30", creative: { link: "https://example.com/autumn", imageUrl: "https://example.com/autumn.jpg", adText: "Осенние скидки" }, targeting: defaultTargeting(), description: "" },
  { id: "10006", name: "Ретаргетинг Q1", status: "moderation", format: "Native", formatKey: "native", budget: 4000, dailyBudget: null, spent: 0, impressions: 0, clicks: 0, ctr: 0, pricingModel: "cpm", priceValue: 2.8, trafficQuality: "high", startDate: "2025-01-01", endDate: "2025-03-31", creative: { link: "https://example.com/retarget", imageUrl: "", adText: "", title: "" }, targeting: defaultTargeting(), description: "" },
];

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (c: Omit<Campaign, "id">) => void;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  getCampaign: (id: string) => Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | null>(null);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    try {
      const stored = localStorage.getItem("twinbid_campaigns");
      if (stored) return JSON.parse(stored);
    } catch {}
    return initialCampaigns;
  });

  const persist = (updated: Campaign[]) => {
    setCampaigns(updated);
    localStorage.setItem("twinbid_campaigns", JSON.stringify(updated));
  };

  const addCampaign = useCallback((c: Omit<Campaign, "id">) => {
    const id = String(Date.now()).slice(-5);
    persist([...campaigns, { ...c, id }]);
  }, [campaigns]);

  const updateCampaign = useCallback((id: string, updates: Partial<Campaign>) => {
    persist(campaigns.map(c => c.id === id ? { ...c, ...updates } : c));
  }, [campaigns]);

  const deleteCampaign = useCallback((id: string) => {
    persist(campaigns.filter(c => c.id !== id));
  }, [campaigns]);

  const getCampaign = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  return (
    <CampaignContext.Provider value={{ campaigns, addCampaign, updateCampaign, deleteCampaign, getCampaign }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaigns() {
  const ctx = useContext(CampaignContext);
  if (!ctx) throw new Error("useCampaigns must be used within CampaignProvider");
  return ctx;
}
