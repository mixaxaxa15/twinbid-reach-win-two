import { describe, expect, it } from "vitest";
import { COUNTRIES, LANGUAGES } from "@/lib/dimensions";
import {
  CARRIER_TARGETING_VALUES,
  CITY_TARGETING_VALUES,
  formatTargetingDimensionLabel,
  getTargetingDimensionOptions,
  OS_VERSION_TARGETING_VALUES,
} from "@/lib/targetingDimensions";

describe("shared campaign and calculator targeting dimensions", () => {
  it("includes every country with a localized name and code", () => {
    const options = getTargetingDimensionOptions("country", "ru");

    expect(options).toHaveLength(COUNTRIES.length);
    expect(options).toContainEqual({
      value: "GB",
      label: "Великобритания (GB)",
    });
  });

  it("includes every language with a localized name and code", () => {
    const options = getTargetingDimensionOptions("language", "ru");

    expect(options).toHaveLength(LANGUAGES.length);
    expect(options).toContainEqual({
      value: "en",
      label: "Английский (en)",
    });
  });

  it("uses the same formatter for campaign and calculator labels", () => {
    expect(formatTargetingDimensionLabel("GB", "en")).toBe("United Kingdom (GB)");
    expect(formatTargetingDimensionLabel("en", "es")).toBe("Inglés (en)");
    expect(formatTargetingDimensionLabel("FR", "fr")).toBe("France (FR)");
    expect(formatTargetingDimensionLabel("fr", "fr")).toBe("français (fr)");
  });

  it("provides shared temporary lists for the new targeting dimensions", () => {
    expect(getTargetingDimensionOptions("city", "en").map(option => option.value)).toEqual(CITY_TARGETING_VALUES);
    expect(getTargetingDimensionOptions("osVersion", "en").map(option => option.value)).toEqual(OS_VERSION_TARGETING_VALUES);
    expect(getTargetingDimensionOptions("carrier", "en").map(option => option.value)).toEqual(CARRIER_TARGETING_VALUES);
  });
});
