import { describe, expect, it } from "vitest";
import {
  hasFeature,
  minimumPlanFor,
  monthlyEquivalent,
  PLANS,
  remainingUsage,
  usageLimit,
} from "@/lib/plans";

describe("plans", () => {
  it("prices yearly billing at 12 months minus 20%", () => {
    expect(PLANS.basic.price).toEqual({ monthly: 15, yearly: 144 });
    expect(PLANS.pro.price).toEqual({ monthly: 35, yearly: 336 });
    expect(PLANS.vip.price).toEqual({ monthly: 90, yearly: 864 });
    expect(monthlyEquivalent(PLANS.pro, "yearly")).toBe(28);
  });

  it("gates features by tier", () => {
    expect(hasFeature(null, "library")).toBe(false);
    expect(hasFeature("basic", "library")).toBe(true);
    expect(hasFeature("basic", "courses")).toBe(false);
    expect(hasFeature("basic", "coach")).toBe(false);
    expect(hasFeature("pro", "coach")).toBe(true);
    expect(hasFeature("vip", "community")).toBe(true);
  });

  it("each higher plan includes everything from the lower ones", () => {
    for (const f of PLANS.basic.features) expect(PLANS.pro.features).toContain(f);
    for (const f of PLANS.pro.features) expect(PLANS.vip.features).toContain(f);
    expect(PLANS.vip.limits.coachMessages).toBeGreaterThan(PLANS.pro.limits.coachMessages);
  });

  it("names the cheapest plan that unlocks a feature", () => {
    expect(minimumPlanFor("library")).toBe("basic");
    expect(minimumPlanFor("coach")).toBe("pro");
  });

  it("computes remaining AI usage", () => {
    expect(usageLimit(null, "coachMessages")).toBe(0);
    expect(usageLimit("basic", "customMeditations")).toBe(0);
    expect(remainingUsage("pro", "customMeditations", 3)).toBe(7);
    expect(remainingUsage("pro", "customMeditations", 99)).toBe(0);
  });
});
