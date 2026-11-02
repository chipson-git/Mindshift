import type { Localized } from "@/lib/i18n/config";

// Statements for the Thought sort game. Unhelpful thoughts follow common thinking traps
// (all-or-nothing, mind reading, catastrophising, labelling…) and come with a kinder reframe.

export interface Thought {
  id: string;
  helpful: boolean;
  text: Localized;
  /** A balanced alternative, shown for unhelpful thoughts. */
  reframe?: Localized;
}

export const THOUGHTS: Thought[] = [
  {
    id: "always-fail",
    helpful: false,
    text: { ka: "ყოველთვის ყველაფერს ვაფუჭებ.", en: "I always mess everything up." },
    reframe: { ka: "ამჯერად ვერ გამომივიდა. სხვა დროს გამომსვლია და ამაზეც ვისწავლი.", en: "This time it didn't work. It has before, and I can learn from this." },
  },
  {
    id: "they-think",
    helpful: false,
    text: { ka: "დარწმუნებული ვარ, ყველა ფიქრობს, რომ სულელი ვარ.", en: "I'm sure everyone thinks I'm stupid." },
    reframe: { ka: "არ ვიცი, სხვები რას ფიქრობენ. ჩემი ვარაუდი ფაქტი არ არის.", en: "I don't know what others think. My guess isn't a fact." },
  },
  {
    id: "disaster",
    helpful: false,
    text: { ka: "თუ ეს არ გამომივიდა, ყველაფერი დამთავრდა.", en: "If this goes wrong, everything is over." },
    reframe: { ka: "თუ არ გამომივა, რთული იქნება, მაგრამ გამოსავალს ვიპოვი.", en: "If it goes wrong it will be hard, but I'll find a way forward." },
  },
  {
    id: "loser",
    helpful: false,
    text: { ka: "მე წარუმატებელი ადამიანი ვარ.", en: "I'm a failure." },
    reframe: { ka: "ერთი წარუმატებლობა არ განსაზღვრავს, ვინ ვარ.", en: "One setback doesn't define who I am." },
  },
  {
    id: "should-perfect",
    helpful: false,
    text: { ka: "ყველაფერი იდეალურად უნდა გავაკეთო, თორემ აზრი არ აქვს.", en: "I have to do it perfectly, or there's no point." },
    reframe: { ka: "საკმარისად კარგიც ბევრს ნიშნავს. პროგრესი სრულყოფილებაზე მნიშვნელოვანია.", en: "Good enough still counts. Progress matters more than perfection." },
  },
  {
    id: "never-change",
    helpful: false,
    text: { ka: "მე არასდროს შევიცვლები.", en: "I'll never change." },
    reframe: { ka: "ცვლილებას დრო სჭირდება. პატარა ნაბიჯები უკვე ცვლილებაა.", en: "Change takes time. Small steps are already change." },
  },
  {
    id: "my-fault",
    helpful: false,
    text: { ka: "მეგობარი გაბრაზებულია, ესე იგი მე დავაშავე რამე.", en: "My friend seems upset, so it must be my fault." },
    reframe: { ka: "შეიძლება სხვა მიზეზი აქვს. შემიძლია ვკითხო, როგორაა.", en: "There could be another reason. I can ask how they are." },
  },
  {
    id: "feel-anxious-danger",
    helpful: false,
    text: { ka: "ვღელავ, ესე იგი რაღაც ცუდი მოხდება.", en: "I feel anxious, so something bad is going to happen." },
    reframe: { ka: "მღელვარება გრძნობაა და არა წინასწარმეტყველება.", en: "Anxiety is a feeling, not a prediction." },
  },
  {
    id: "learn-mistakes",
    helpful: true,
    text: { ka: "შეცდომა დამეხმარება, შემდეგ ჯერზე უკეთ გავაკეთო.", en: "This mistake can help me do better next time." },
  },
  {
    id: "one-step",
    helpful: true,
    text: { ka: "ყველაფერს ერთად ვერ მოვაგვარებ, მაგრამ პირველი ნაბიჯის გადადგმა შემიძლია.", en: "I can't fix everything at once, but I can take the first step." },
  },
  {
    id: "hard-not-forever",
    helpful: true,
    text: { ka: "ახლა რთულია, მაგრამ ეს მდგომარეობა სამუდამო არ არის.", en: "This is hard right now, but it won't last forever." },
  },
  {
    id: "ask-help",
    helpful: true,
    text: { ka: "დახმარების თხოვნა ძალის ნიშანია.", en: "Asking for help is a sign of strength." },
  },
  {
    id: "did-my-best",
    helpful: true,
    text: { ka: "იმ მომენტში, რაც შემეძლო, გავაკეთე.", en: "I did what I could with what I had at the time." },
  },
  {
    id: "feelings-pass",
    helpful: true,
    text: { ka: "ეს გრძნობა გაივლის, როგორც ყოველთვის გაივლის.", en: "This feeling will pass, like it always does." },
  },
  {
    id: "kind-self",
    helpful: true,
    text: { ka: "შემიძლია საკუთარ თავს ისე მოვექცე, როგორც კარგ მეგობარს.", en: "I can treat myself the way I'd treat a good friend." },
  },
  {
    id: "progress-small",
    helpful: true,
    text: { ka: "დღეს პატარა ნაბიჯი გადავდგი და ეს ითვლება.", en: "I took a small step today, and that counts." },
  },
];
