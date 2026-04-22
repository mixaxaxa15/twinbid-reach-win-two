import type {
  ApiUser, ApiCampaign, ApiCreative, ApiUserTransaction, ApiPromocode,
  ApiNotification, StatsQueryRequest, StatsQueryResponse, StatsSummary,
  AuthResponse, AuthTokens,
} from "./types";

// -- Mock data -------------------------------------------------------------
const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

const mockUser: ApiUser = {
  login: "demo@twinbid.com",
  mail: "demo@twinbid.com",
  name: "Demo User",
  telegram: null,
  manager_telegram: "GregTwinbid",
  balance: 0,
  timezone: "utc_3",
  email_notifications: true,
  campaign_status_notifications: true,
  low_balance_notifications: true,
  campaign_balanse_notifications: true,
  balance_treshold: 100,
};

const state = {
  user: { ...mockUser },
  campaigns: [] as ApiCampaign[],
  creatives: [] as ApiCreative[],
  topups: [] as ApiUserTransaction[],
  notifications: [] as ApiNotification[],
};

function delay<T>(v: T, ms = 120): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), ms));
}

// -- Auth ------------------------------------------------------------------
export const mockProvider = {
  // auth
  async signup(_body: { email: string; password: string; full_name?: string; manager_telegram: string }): Promise<AuthResponse> {
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh", user: state.user });
  },
  async login(_body: { email: string; password: string }): Promise<AuthResponse> {
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh", user: state.user });
  },
  async refresh(_body: { refresh_token: string }): Promise<AuthTokens> {
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh" });
  },
  async logout(): Promise<void> { return delay(undefined); },

  // profile
  async getProfile(): Promise<ApiUser> { return delay(state.user); },
  async patchProfile(patch: Partial<ApiUser>): Promise<ApiUser> {
    state.user = { ...state.user, ...patch };
    return delay(state.user);
  },

  // campaigns
  async listCampaigns(): Promise<{ items: ApiCampaign[]; total: number }> {
    return delay({ items: state.campaigns, total: state.campaigns.length });
  },
  async getCampaign(id: string): Promise<ApiCampaign | undefined> {
    return delay(state.campaigns.find(c => c.campaing_id === id));
  },
  async createCampaign(body: Omit<ApiCampaign, "campaing_id" | "user_id" | "cum_done_dollars">): Promise<ApiCampaign> {
    const c: ApiCampaign = { ...body, campaing_id: uid(), user_id: "mock-user", cum_done_dollars: 0 };
    state.campaigns.unshift(c);
    return delay(c);
  },
  async patchCampaign(id: string, patch: Partial<ApiCampaign>): Promise<ApiCampaign> {
    const i = state.campaigns.findIndex(c => c.campaing_id === id);
    if (i >= 0) state.campaigns[i] = { ...state.campaigns[i], ...patch };
    return delay(state.campaigns[i]);
  },
  async deleteCampaign(id: string): Promise<void> {
    state.campaigns = state.campaigns.filter(c => c.campaing_id !== id);
    state.creatives = state.creatives.filter(cr => cr.campaign_id !== id);
    return delay(undefined);
  },

  // creatives
  async listCreatives(campaignId: string): Promise<ApiCreative[]> {
    return delay(state.creatives.filter(c => c.campaign_id === campaignId));
  },
  async createCreative(campaignId: string, body: Omit<ApiCreative, "id" | "campaign_id">): Promise<ApiCreative> {
    const c = { ...body, id: uid(), campaign_id: campaignId } as ApiCreative;
    state.creatives.push(c);
    return delay(c);
  },
  async patchCreative(id: string, patch: Partial<ApiCreative>): Promise<ApiCreative> {
    const i = state.creatives.findIndex(c => c.id === id);
    if (i >= 0) state.creatives[i] = { ...state.creatives[i], ...patch } as ApiCreative;
    return delay(state.creatives[i]);
  },
  async deleteCreative(id: string): Promise<void> {
    state.creatives = state.creatives.filter(c => c.id !== id);
    return delay(undefined);
  },
  async getUploadUrl(body: { filename: string; content_type: string; size: number }) {
    return delay({
      upload_url: `https://mock-s3/upload/${body.filename}`,
      s3_file_path: `s3://twinbid/creatives/${uid()}-${body.filename}`,
      expires_in: 900,
    });
  },

  // topups
  async listTopups(): Promise<{ items: ApiUserTransaction[]; total: number }> {
    return delay({ items: state.topups, total: state.topups.length });
  },
  async createTopup(body: { payment_method: string; deposit_amount: number; currency: string; promocode_id?: string | null; bonus_amount?: number }): Promise<ApiUserTransaction> {
    const t: ApiUserTransaction = {
      id: uid(),
      user_id: "mock-user",
      transaction_time: now(),
      transaction_id: uid(),
      payment_method: body.payment_method,
      bonus_amount: body.bonus_amount ?? 0,
      promocode_id: body.promocode_id ?? null,
      transaction_hash: null,
      deposit_amount: body.deposit_amount,
      total_balance_increase: body.deposit_amount * (1 + (body.bonus_amount ?? 0) / 100),
      status: "draft",
      currency: body.currency,
      created_at: now(),
      updated_at: now(),
    };
    state.topups.unshift(t);
    return delay(t);
  },
  async patchTopup(id: string, patch: Partial<ApiUserTransaction>): Promise<ApiUserTransaction> {
    const i = state.topups.findIndex(t => t.id === id);
    if (i >= 0) state.topups[i] = { ...state.topups[i], ...patch, updated_at: now() };
    return delay(state.topups[i]);
  },
  async cancelTopup(id: string): Promise<ApiUserTransaction> {
    return this.patchTopup(id, { status: "cancelled" });
  },

  // promo
  async getPromocode(code: string): Promise<ApiPromocode> {
    return delay({
      id: uid(), promocode_text: code, bonus_percent: 25,
      usage_count: 0, usage_limit: null, valid_from: null, valid_to: null,
    });
  },

  // notifications
  async listNotifications(): Promise<ApiNotification[]> { return delay(state.notifications); },
  async createNotification(body: Omit<ApiNotification, "id" | "user_id" | "status">): Promise<ApiNotification> {
    const n: ApiNotification = { ...body, id: uid(), user_id: "mock-user", status: "active" };
    state.notifications.push(n);
    return delay(n);
  },
  async patchNotification(id: string, patch: Partial<ApiNotification>): Promise<ApiNotification> {
    const i = state.notifications.findIndex(n => n.id === id);
    if (i >= 0) state.notifications[i] = { ...state.notifications[i], ...patch };
    return delay(state.notifications[i]);
  },

  // ClickHouse stats
  async statsQuery(_req: StatsQueryRequest): Promise<StatsQueryResponse> {
    return delay({
      rows: [],
      totals: { impressions: 0, clicks: 0, spent: 0, ctr: 0 },
    });
  },
  async statsCampaignSummary(_id: string): Promise<StatsSummary> {
    return delay({ impressions: 0, clicks: 0, spent: 0, ctr: 0 });
  },
  async statsOverview(): Promise<StatsSummary> {
    return delay({ impressions: 0, clicks: 0, spent: 0, ctr: 0 });
  },
};

export type ApiProvider = typeof mockProvider;
