// A simple keyword check that runs before the model is called. If it matches, the reply
// always starts with crisis resources, regardless of what the model says. This is a
// safety net on top of the system prompt, not a replacement for real moderation.

const CRISIS_PATTERNS: RegExp[] = [
  // English
  /\bkill (myself|me)\b/i,
  /\bsuicid/i,
  /\bend (my|it all|my life)\b/i,
  /\bself[- ]?harm/i,
  /\bhurt(ing)? myself\b/i,
  /\bdon'?t want to (live|be alive)\b/i,
  /\bwant to die\b/i,
  // Georgian
  /თავის\s*მოკვლ/,
  /თვითმკვლელ/,
  /სიკვდილი\s*მინდა/,
  /მინდა\s*მოვკვდე/,
  /ცხოვრება\s*აღარ\s*მინდა/,
  /თავს\s*ვიზიანებ/,
  /თავის\s*დაზიანებ/,
];

export function looksLikeCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}
