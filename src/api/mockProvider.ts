import type {
  ApiUser, ApiCampaign, ApiCreative, ApiUserTransaction, ApiPromocode,
  ApiNotification, StatsQueryRequest, StatsQueryResponse, StatsSummary,
  AuthResponse, AuthTokens,
} from "./types";

// -- Persistence (so the mock survives page reloads) -----------------------
const STORAGE_KEY = "twinbid_mock_state_v1";
const SESSION_KEY = "twinbid_mock_session_v1";

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 10);

const defaultUser: ApiUser = {
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

interface MockState {
  user: ApiUser;
  campaigns: ApiCampaign[];
  creatives: ApiCreative[];
  topups: ApiUserTransaction[];
  notifications: ApiNotification[];
}

function loadState(): MockState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { user: { ...defaultUser }, campaigns: [], creatives: [], topups: [], notifications: [] };
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const state: MockState = loadState();

interface MockSession { user_id: string; email: string; full_name: string; }
function loadSession(): MockSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function saveSession(s: MockSession | null) {
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
}

function delay<T>(v: T, ms = 80): Promise<T> {
  return new Promise(r => setTimeout(() => r(v), ms));
}

// -- Promo fixtures (so the UI has something to validate against) ----------
const promoFixtures: Record<string, { id: string; bonus_percent: number }> = {
  TWINBID25:  { id: "promo-twinbid25",  bonus_percent: 25 },
  WELCOME10:  { id: "promo-welcome10",  bonus_percent: 10 },
};

export const mockProvider = {
  // -- auth ---------------------------------------------------------------
  async signup(body: { email: string; password: string; full_name?: string; manager_telegram: string }): Promise<AuthResponse> {
    state.user = {
      ...defaultUser,
      login: body.email,
      mail: body.email,
      name: body.full_name || "",
      manager_telegram: body.manager_telegram,
    };
    saveState();
    saveSession({ user_id: "mock-user", email: body.email, full_name: body.full_name || "" });
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh", user: state.user });
  },
  async login(body: { email: string; password: string }): Promise<AuthResponse> {
    state.user = { ...state.user, login: body.email, mail: body.email };
    saveState();
    saveSession({ user_id: "mock-user", email: body.email, full_name: state.user.name });
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh", user: state.user });
  },
  async refresh(_body: { refresh_token: string }): Promise<AuthTokens> {
    return delay({ access_token: "mock-access", refresh_token: "mock-refresh" });
  },
  async logout(): Promise<void> {
    saveSession(null);
    return delay(undefined);
  },
  /** Mock helper: returns the local "session" so AuthContext can hydrate on boot. */
  async getSession(): Promise<MockSession | null> {
    return delay(loadSession());
  },
  async changePassword(_body: { new_password: string }): Promise<void> {
    return delay(undefined);
  },

  // -- profile ------------------------------------------------------------
  async getProfile(): Promise<ApiUser> { return delay(state.user); },
  async patchProfile(patch: Partial<ApiUser>): Promise<ApiUser> {
    state.user = { ...state.user, ...patch };
    saveState();
    return delay(state.user);
  },

  // -- campaigns ----------------------------------------------------------
  async listCampaigns(): Promise<{ items: ApiCampaign[]; total: number }> {
    return delay({ items: state.campaigns, total: state.campaigns.length });
  },
  async getCampaign(id: string): Promise<ApiCampaign | undefined> {
    return delay(state.campaigns.find(c => c.campaing_id === id));
  },
  async createCampaign(body: Omit<ApiCampaign, "campaing_id" | "user_id" | "cum_done_dollars">): Promise<ApiCampaign> {
    const c: ApiCampaign = { ...body, campaing_id: uid(), user_id: "mock-user", cum_done_dollars: 0 };
    state.campaigns.unshift(c);
    saveState();
    return delay(c);
  },
  async patchCampaign(id: string, patch: Partial<ApiCampaign>): Promise<ApiCampaign> {
    const i = state.campaigns.findIndex(c => c.campaing_id === id);
    if (i >= 0) state.campaigns[i] = { ...state.campaigns[i], ...patch };
    saveState();
    return delay(state.campaigns[i]);
  },
  async deleteCampaign(id: string): Promise<void> {
    state.campaigns = state.campaigns.filter(c => c.campaing_id !== id);
    state.creatives = state.creatives.filter(cr => cr.campaign_id !== id);
    saveState();
    return delay(undefined);
  },

  // -- creatives ----------------------------------------------------------
  async listCreatives(campaignId: string): Promise<ApiCreative[]> {
    return delay(state.creatives.filter(c => c.campaign_id === campaignId));
  },
  async createCreative(campaignId: string, body: Omit<ApiCreative, "id" | "campaign_id">): Promise<ApiCreative> {
    const c = { ...body, id: uid(), campaign_id: campaignId } as ApiCreative;
    state.creatives.push(c);
    saveState();
    return delay(c);
  },
  async patchCreative(id: string, patch: Partial<ApiCreative>): Promise<ApiCreative> {
    const i = state.creatives.findIndex(c => c.id === id);
    if (i >= 0) state.creatives[i] = { ...state.creatives[i], ...patch } as ApiCreative;
    saveState();
    return delay(state.creatives[i]);
  },
  async deleteCreative(id: string): Promise<void> {
    state.creatives = state.creatives.filter(c => c.id !== id);
    saveState();
    return delay(undefined);
  },
  async getUploadUrl(body: { filename: string; content_type: string; size: number }) {
    return delay({
      upload_url: `https://mock-s3/upload/${body.filename}`,
      s3_file_path: `s3://twinbid/creatives/${uid()}-${body.filename}`,
      expires_in: 900,
    });
  },

  // -- topups -------------------------------------------------------------
  async listTopups(): Promise<{ items: ApiUserTransaction[]; total: number }> {
    return delay({ items: state.topups, total: state.topups.length });
  },
  async createTopup(body: { payment_method: string; deposit_amount: number; currency: string; promocode_id?: string | null; bonus_amount?: number; transaction_hash?: string | null; status?: ApiUserTransaction["status"] }): Promise<ApiUserTransaction> {
    const t: ApiUserTransaction = {
      id: uid(),
      user_id: "mock-user",
      transaction_time: now(),
      transaction_id: uid(),
      payment_method: body.payment_method,
      bonus_amount: body.bonus_amount ?? 0,
      promocode_id: body.promocode_id ?? null,
      transaction_hash: body.transaction_hash ?? null,
      deposit_amount: body.deposit_amount,
      total_balance_increase: body.deposit_amount * (1 + (body.bonus_amount ?? 0) / 100),
      status: body.status ?? "pending",
      currency: body.currency,
      created_at: now(),
      updated_at: now(),
    };
    state.topups.unshift(t);
    saveState();
    return delay(t);
  },
  async patchTopup(id: string, patch: Partial<ApiUserTransaction>): Promise<ApiUserTransaction> {
    const i = state.topups.findIndex(t => t.id === id);
    if (i >= 0) state.topups[i] = { ...state.topups[i], ...patch, updated_at: now() };
    saveState();
    return delay(state.topups[i]);
  },
  async cancelTopup(id: string): Promise<ApiUserTransaction> {
    return this.patchTopup(id, { status: "cancelled" });
  },

  // -- promo --------------------------------------------------------------
  async getPromocode(code: string): Promise<ApiPromocode> {
    const upper = code.trim().toUpperCase();
    const fix = promoFixtures[upper];
    if (!fix) throw new Error("Promocode not found");
    return delay({
      id: fix.id,
      promocode_text: upper,
      bonus_percent: fix.bonus_percent,
      usage_count: 0,
      usage_limit: null,
      valid_from: null,
      valid_to: null,
    });
  },

  // -- notifications ------------------------------------------------------
  async listNotifications(): Promise<ApiNotification[]> { return delay(state.notifications); },
  async createNotification(body: Omit<ApiNotification, "id" | "user_id" | "status">): Promise<ApiNotification> {
    const n: ApiNotification = { ...body, id: uid(), user_id: "mock-user", status: "active" };
    state.notifications.push(n);
    saveState();
    return delay(n);
  },
  async patchNotification(id: string, patch: Partial<ApiNotification>): Promise<ApiNotification> {
    const i = state.notifications.findIndex(n => n.id === id);
    if (i >= 0) state.notifications[i] = { ...state.notifications[i], ...patch };
    saveState();
    return delay(state.notifications[i]);
  },

  // -- ClickHouse stats ---------------------------------------------------
  async statsQuery(_req: StatsQueryRequest): Promise<StatsQueryResponse> {
    return delay({ rows: [], totals: { impressions: 0, clicks: 0, spent: 0, ctr: 0 } });
  },
  async statsCampaignSummary(_id: string): Promise<StatsSummary> {
    return delay({ impressions: 0, clicks: 0, spent: 0, ctr: 0 });
  },
  async statsOverview(): Promise<StatsSummary> {
    return delay({ impressions: 0, clicks: 0, spent: 0, ctr: 0 });
  },
};

export type ApiProvider = typeof mockProvider;
