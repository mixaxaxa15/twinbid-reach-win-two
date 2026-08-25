import { beforeEach, describe, expect, it } from "vitest";
import {
  capturePartnerCodeFromUrl,
  createPartnerCode,
  createPartnerLink,
  getStoredPartnerCode,
  normalizePartnerCode,
} from "@/lib/partners";
import { captureUtmSourceFromUrl, getStoredUtmSource } from "@/lib/utmSource";

describe("TwinBid Partners attribution", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("creates a stable non-sequential public code without exposing the identity", () => {
    const code = createPartnerCode("advertiser@example.com");

    expect(code).toBe(createPartnerCode("advertiser@example.com"));
    expect(code).toMatch(/^TB[A-Z0-9]{14}$/);
    expect(code).not.toContain("ADVERTISER");
    expect(code).not.toContain("EXAMPLE");
  });

  it("builds a partner URL for the supplied origin", () => {
    expect(createPartnerLink("advertiser@example.com", "https://twinbid.io/"))
      .toBe(`https://twinbid.io/?partner=${createPartnerCode("advertiser@example.com")}`);
  });

  it("captures partner independently from the marketing source", () => {
    window.history.replaceState({}, "", "/?partner=TBABC123XYZ&utm_source=telegram_campaign");
    capturePartnerCodeFromUrl();
    captureUtmSourceFromUrl();

    expect(getStoredPartnerCode()).toBe("TBABC123XYZ");
    expect(getStoredUtmSource()).toBe("telegram_campaign");
  });

  it("rejects malformed partner codes", () => {
    expect(normalizePartnerCode("bad code<script>")).toBeNull();
  });
});
