// Date helpers for the daily-practice tracker. Days are "YYYY-MM-DD" strings in UTC.

export function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, delta: number): string {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return dayKey(d);
}

/**
 * Consecutive days with at least one completed practice, ending today.
 * If today has nothing yet, the streak still counts up to yesterday
 * (the user hasn't broken it until the day is over).
 */
export function currentStreak(days: Iterable<string>, today = dayKey()): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(days: Iterable<string>): number {
  const sorted = [...new Set(days)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev !== null && addDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

/** The last `count` days ending today, oldest first, for the activity grid. */
export function lastDays(count: number, today = dayKey()): string[] {
  return Array.from({ length: count }, (_, i) => addDays(today, i - count + 1));
}

/** Picks the exercise of the day deterministically, so everyone sees the same one. */
export function dailyIndex(length: number, today = dayKey()): number {
  const epochDays = Math.floor(new Date(`${today}T00:00:00Z`).getTime() / 86_400_000);
  return ((epochDays % length) + length) % length;
}
