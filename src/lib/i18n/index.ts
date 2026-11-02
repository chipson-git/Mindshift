import { en, type Dictionary } from "./en";
import { ka } from "./ka";
import type { Locale } from "./config";

export * from "./config";
export type { Dictionary };

const DICTIONARIES: Record<Locale, Dictionary> = { ka, en };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Fills `{name}` placeholders: fmt("Hello, {name}", { name: "Gio" }). */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
