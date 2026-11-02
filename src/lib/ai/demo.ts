import type { Locale } from "@/lib/i18n/config";

// Sample answers used when no Claude API key is configured.

const COACH_REPLIES: Record<Locale, string[]> = {
  ka: [
    "მადლობა, რომ გამიზიარე. როგორც მესმის, ეს სიტუაცია ბევრ ენერგიას გართმევს. რა იქნებოდა ერთი პატარა ნიშანი, რომ დღეს ცოტათი უკეთ ხარ?",
    "კარგი დაკვირვებაა. ვცადოთ ასე: ჩაიწერე ეს ფიქრი ფორმულით „მე ვამჩნევ, რომ ვფიქრობ, რომ…“ და მითხარი, როგორ შეიცვალა შეგრძნება.",
    "ეს ჩვეულებრივი რეაქციაა და შენ მარტო არ ხარ. სანამ შემდეგ ნაბიჯზე ვიფიქრებთ, გავაკეთოთ ოთხი ციკლი კვადრატული სუნთქვა. მზად ხარ?",
  ],
  en: [
    "Thank you for sharing that. It sounds like this is taking a lot of your energy. What would be one small sign that today went a little better?",
    "That's a useful observation. Let's try this: write the thought down as \"I notice I'm having the thought that…\" and tell me how the feeling changes.",
    "That's a very human reaction, and you're not alone in it. Before we plan the next step, let's do four rounds of box breathing together. Ready?",
  ],
};

export function demoCoachReply(locale: Locale, turn: number): string {
  const replies = COACH_REPLIES[locale];
  return replies[turn % replies.length];
}

const MEDITATION: Record<Locale, string> = {
  ka: `მოკალათდი კომფორტულად და მიეცი სხეულს უფლება, რომ დამძიმდეს…

ჩაისუნთქე ნელა… და ამოისუნთქე კიდევ უფრო ნელა.

ახლა გაიხსენე შენი მიზანი. ნუ ეცდები მის ანალიზს, უბრალოდ შეამჩნიე, რას გრძნობ, როცა მასზე ფიქრობ…

წარმოიდგინე, რომ ეს ცვლილება უკვე მოხდა. ნახე, როგორ დგახარ, როგორ სუნთქავ, როგორ ლაპარაკობ…

ყოველი ამოსუნთქვით ეს სურათი უფრო ნათელი და ბუნებრივი ხდება.

უთხარი საკუთარ თავს ჩუმად: „მე ნაბიჯ-ნაბიჯ ვიცვლები და ეს ჩემთვის უსაფრთხოა“.

კიდევ ერთხელ ღრმად ჩაისუნთქე… და როცა მზად იქნები, ნელა გაახილე თვალები.

(ეს ნიმუშია. AI გასაღების დაყენების შემდეგ სესია შენს მიზანზე იქნება მორგებული.)`,
  en: `Settle in comfortably and let your body grow heavy…

Breathe in slowly… and breathe out even more slowly.

Now bring your goal to mind. Don't analyse it, just notice how you feel when you think about it…

Imagine that this change has already happened. See how you stand, how you breathe, how you speak…

With every exhale, this picture becomes clearer and more natural.

Silently tell yourself: I am changing step by step, and it is safe for me.

Take one more deep breath… and when you're ready, slowly open your eyes.

(This is a sample. Once an AI key is configured, the session will be written for your goal.)`,
};

export function demoMeditation(locale: Locale): string {
  return MEDITATION[locale];
}
