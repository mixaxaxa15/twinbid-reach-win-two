const PARTNER_STORAGE_KEY = "twinbid_partner";
const PARTNER_CODE_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

/**
 * Build a stable, non-sequential public referral code from the authenticated
 * user's identity. It deliberately exposes neither a database id nor email.
 */
export function createPartnerCode(identity: string): string {
  const source = identity.trim().toLowerCase() || "twinbid-partner";
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;

  for (let index = 0; index < source.length; index += 1) {
    const code = source.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193) >>> 0;
    second = Math.imul(second ^ (code + index), 0x85ebca6b) >>> 0;
  }

  return `TB${first.toString(36).padStart(7, "0")}${second.toString(36).padStart(7, "0")}`.toUpperCase();
}

export function createPartnerLink(identity: string, origin?: string): string {
  return createPartnerLinkFromCode(createPartnerCode(identity), origin);
}

export function createPartnerLinkFromCode(code: string, origin?: string): string {
  const base = (origin || (typeof window !== "undefined" ? window.location.origin : "https://twinbid.io")).replace(/\/$/, "");
  const normalized = normalizePartnerCode(code);
  return `${base}/?partner=${encodeURIComponent(normalized ?? code)}`;
}

export function normalizePartnerCode(code: string): string | null {
  const normalized = code.trim();
  if (!PARTNER_CODE_PATTERN.test(normalized)) return null;
  return normalized;
}

/** Capture `?partner=CODE` independently from marketing UTM parameters. */
export function capturePartnerCodeFromUrl(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = new URLSearchParams(window.location.search).get("partner");
    if (!raw) return;
    const partner = normalizePartnerCode(raw);
    if (partner) localStorage.setItem(PARTNER_STORAGE_KEY, partner);
  } catch { /* localStorage can be unavailable */ }
}

export function getStoredPartnerCode(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(PARTNER_STORAGE_KEY);
  } catch {
    return null;
  }
}
