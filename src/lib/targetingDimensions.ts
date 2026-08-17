import type { Lang } from "@/contexts/LanguageContext";
import { COUNTRIES, LANGUAGES } from "@/lib/dimensions";

type TargetingDimension = "country" | "city" | "language" | "osVersion";

export type TargetingDimensionOption = {
  value: string;
  label: string;
};

// Temporary dictionaries. They are intentionally kept in one shared place so
// the campaign editor and traffic calculator always send exactly the same values.
export const CITY_TARGETING_VALUES = [
  "Amsterdam", "Berlin", "Dubai", "Istanbul", "Lagos", "London", "Madrid",
  "Mexico City", "Moscow", "Mumbai", "Nairobi", "New York", "Paris",
  "São Paulo", "Singapore", "Sydney", "Toronto", "Warsaw",
];

export const OS_VERSION_TARGETING_VALUES = [
  "Android 10", "Android 11", "Android 12", "Android 13", "Android 14", "Android 15",
  "iOS 15", "iOS 16", "iOS 17", "iOS 18",
  "Windows 10", "Windows 11", "macOS 13", "macOS 14", "macOS 15",
];

const countryNames = Object.fromEntries(
  COUNTRIES.map((item) => [item.code, { ru: item.ru, en: item.en, es: item.es }]),
) as Record<string, Partial<Record<Lang, string>>>;

const languageNames = Object.fromEntries(
  LANGUAGES.map((item) => [item.code, { ru: item.ru, en: item.en, es: item.es }]),
) as Record<string, Partial<Record<Lang, string>>>;

const createFrenchDisplayNames = (type: "region" | "language") => {
  try {
    return typeof Intl.DisplayNames === "function"
      ? new Intl.DisplayNames(["fr"], { type })
      : null;
  } catch {
    return null;
  }
};

const frenchRegions = createFrenchDisplayNames("region");
const frenchLanguages = createFrenchDisplayNames("language");

export function formatTargetingDimensionLabel(value: string, lang: Lang): string {
  const isCountry = countryNames[value] !== undefined;
  const fallback = countryNames[value]?.en ?? languageNames[value]?.en;
  const name = lang === "fr"
    ? (isCountry ? frenchRegions?.of(value) : frenchLanguages?.of(value)) ?? fallback
    : countryNames[value]?.[lang] ?? languageNames[value]?.[lang] ?? fallback;
  return name ? `${name} (${value})` : value;
}

export function getTargetingDimensionOptions(
  dimension: TargetingDimension,
  lang: Lang,
): TargetingDimensionOption[] {
  if (dimension === "city") {
    return CITY_TARGETING_VALUES.map(value => ({ value, label: value }));
  }
  if (dimension === "osVersion") {
    return OS_VERSION_TARGETING_VALUES.map(value => ({ value, label: value }));
  }
  const entries = dimension === "country" ? COUNTRIES : LANGUAGES;

  return entries
    .map((item) => ({
      value: item.code,
      label: formatTargetingDimensionLabel(item.code, lang),
    }))
    .sort((left, right) => left.label.localeCompare(right.label, lang));
}
