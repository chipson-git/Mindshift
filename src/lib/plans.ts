// Subscription plans, prices and what each plan unlocks.
// This file is the single source of truth: pages, API routes and tests all read it.

export type PlanId = "basic" | "pro" | "vip";
export type BillingPeriod = "monthly" | "yearly";
/** `null` = signed in but not subscribed. */
export type Tier = PlanId | null;

export type Feature =
  | "library"
  | "exercises"
  | "courses"
  | "community"
  | "coach"
  | "customMeditations";

export interface Plan {
  id: PlanId;
  /** Price in GEL (₾). */
  price: Record<BillingPeriod, number>;
  features: Feature[];
  /** Monthly limits for AI features. 0 = not included. */
  limits: { coachMessages: number; customMeditations: number };
  highlighted?: boolean;
}

/** Yearly price = 12 months with a 20% discount. */
export const YEARLY_DISCOUNT = 0.2;
const yearly = (monthly: number) => Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));

export const PLANS: Record<PlanId, Plan> = {
  basic: {
    id: "basic",
    price: { monthly: 15, yearly: yearly(15) },
    features: ["library", "exercises"],
    limits: { coachMessages: 0, customMeditations: 0 },
  },
  pro: {
    id: "pro",
    price: { monthly: 35, yearly: yearly(35) },
    features: ["library", "exercises", "courses", "community", "coach", "customMeditations"],
    limits: { coachMessages: 60, customMeditations: 10 },
    highlighted: true,
  },
  vip: {
    id: "vip",
    price: { monthly: 90, yearly: yearly(90) },
    features: ["library", "exercises", "courses", "community", "coach", "customMeditations"],
    // "Unlimited" in the marketing copy, with a fair-use cap to keep AI costs bounded.
    limits: { coachMessages: 600, customMeditations: 100 },
  },
};

export const PLAN_ORDER: PlanId[] = ["basic", "pro", "vip"];

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

export function hasFeature(tier: Tier, feature: Feature): boolean {
  return tier !== null && PLANS[tier].features.includes(feature);
}

/** The cheapest plan that includes a feature, used for "upgrade to X" prompts. */
export function minimumPlanFor(feature: Feature): PlanId {
  return PLAN_ORDER.find((id) => PLANS[id].features.includes(feature)) ?? "vip";
}

export type UsageKind = "coachMessages" | "customMeditations";

export function usageLimit(tier: Tier, kind: UsageKind): number {
  return tier === null ? 0 : PLANS[tier].limits[kind];
}

export function remainingUsage(tier: Tier, kind: UsageKind, used: number): number {
  return Math.max(0, usageLimit(tier, kind) - used);
}

/** Monthly-equivalent price, for showing "≈ X ₾ / month" on yearly billing. */
export function monthlyEquivalent(plan: Plan, period: BillingPeriod): number {
  return period === "monthly" ? plan.price.monthly : Math.round((plan.price.yearly / 12) * 100) / 100;
}

/** Usage counters reset each calendar month (UTC). */
export function currentMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}
