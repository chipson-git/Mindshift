import { describe, expect, it } from "vitest";
import { en } from "@/lib/i18n/en";
import { ka } from "@/lib/i18n/ka";
import { fmt } from "@/lib/i18n";
import { COURSES } from "@/lib/content/courses";
import { LIBRARY } from "@/lib/content/library";
import { EXERCISES } from "@/lib/content/exercises";
import { looksLikeCrisis } from "@/lib/ai/safety";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  }
  return typeof value;
}

function placeholders(value: unknown, path = ""): Record<string, string[]> {
  if (typeof value === "string") return { [path]: (value.match(/\{\w+\}/g) ?? []).sort() };
  if (value && typeof value === "object") {
    return Object.assign({}, ...Object.entries(value).map(([k, v]) => placeholders(v, `${path}.${k}`)));
  }
  return {};
}

describe("i18n", () => {
  it("Georgian and English dictionaries have the same keys and array lengths", () => {
    expect(shape(ka)).toEqual(shape(en));
  });

  it("uses the same placeholders in both languages", () => {
    expect(placeholders(ka)).toEqual(placeholders(en));
  });

  it("fills placeholders", () => {
    expect(fmt("Hello, {name}! {n}", { name: "Gio", n: 3 })).toBe("Hello, Gio! 3");
    expect(fmt("{missing}", {})).toBe("{missing}");
  });

  it("content exists in both languages with matching paragraph counts", () => {
    for (const item of LIBRARY) expect(item.script.ka.length).toBe(item.script.en.length);
    for (const ex of EXERCISES) expect(ex.steps.ka.length).toBe(ex.steps.en.length);
    for (const course of COURSES) {
      for (const lesson of course.lessons) {
        expect(lesson.body.ka.length).toBe(lesson.body.en.length);
        if (lesson.librarySessionId) expect(LIBRARY.some((i) => i.id === lesson.librarySessionId)).toBe(true);
      }
    }
  });
});

describe("crisis detection", () => {
  it("flags crisis language in both languages", () => {
    expect(looksLikeCrisis("Sometimes I want to die")).toBe(true);
    expect(looksLikeCrisis("ვფიქრობ თავის მოკვლაზე")).toBe(true);
  });

  it("does not flag ordinary messages", () => {
    expect(looksLikeCrisis("I'm nervous about my interview")).toBe(false);
    expect(looksLikeCrisis("გასაუბრებამდე ვღელავ")).toBe(false);
  });
});
