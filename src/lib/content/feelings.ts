import type { Localized } from "@/lib/i18n/config";

// Short situations for the Feeling match game. Each has one most-likely emotion.

export const EMOTIONS = [
  "joy",
  "sadness",
  "anger",
  "fear",
  "surprise",
  "pride",
  "gratitude",
  "disappointment",
  "relief",
  "loneliness",
  "jealousy",
  "anxiety",
] as const;
export type Emotion = (typeof EMOTIONS)[number];

export interface Situation {
  id: string;
  emotion: Emotion;
  text: Localized;
}

export const SITUATIONS: Situation[] = [
  { id: "exam-pass", emotion: "relief", text: { ka: "ანა დიდხანს ელოდა გამოცდის შედეგს და ახლახან გაიგო, რომ ჩააბარა.", en: "Ana waited a long time for her exam result and just found out she passed." } },
  { id: "gift", emotion: "gratitude", text: { ka: "მეზობელმა გიორგის ავადმყოფობის დროს წვნიანი მოუტანა.", en: "A neighbour brought Giorgi soup while he was ill." } },
  { id: "marathon", emotion: "pride", text: { ka: "ნიკამ თვეების ვარჯიშის შემდეგ პირველი მარათონი დაასრულა.", en: "Nika finished his first marathon after months of training." } },
  { id: "cancelled", emotion: "disappointment", text: { ka: "მარიამი მთელი კვირა ელოდა მეგობრებთან შეხვედრას, მაგრამ ბოლო წუთს გააუქმეს.", en: "Mariam looked forward to meeting friends all week, but they cancelled at the last minute." } },
  { id: "new-city", emotion: "loneliness", text: { ka: "დათო ახალ ქალაქში გადავიდა და შაბათ-კვირას სალაპარაკო არავინ ჰყავს.", en: "Dato moved to a new city and has no one to talk to at the weekend." } },
  { id: "promotion-other", emotion: "jealousy", text: { ka: "ლიკას კოლეგამ ის დაწინაურება მიიღო, რომელზეც ლიკა ოცნებობდა.", en: "Lika's colleague got the promotion Lika had been hoping for." } },
  { id: "interview", emotion: "anxiety", text: { ka: "ხვალ ლევანს მნიშვნელოვანი გასაუბრება აქვს და ვერ იძინებს.", en: "Levan has an important interview tomorrow and can't fall asleep." } },
  { id: "dog", emotion: "fear", text: { ka: "ქუჩაში ნინოს უცნობი ძაღლი ყეფით გამოეკიდა.", en: "A strange dog started chasing Nino down the street, barking." } },
  { id: "party", emotion: "surprise", text: { ka: "სახლში შესვლისას თამარს მეგობრები დახვდნენ, რომლებმაც მოულოდნელი წვეულება მოუწყვეს.", en: "When Tamar walked in, her friends were waiting with a surprise party." } },
  { id: "broken", emotion: "anger", text: { ka: "ვიღაცამ საბას ახალი ველოსიპედი უნებართვოდ აიღო და გაუფუჭა.", en: "Someone took Saba's new bike without asking and broke it." } },
  { id: "pet", emotion: "sadness", text: { ka: "ეკას ძაღლი, რომელიც 12 წელი ჰყავდა, გარდაიცვალა.", en: "Eka's dog, who had been with her for 12 years, died." } },
  { id: "reunion", emotion: "joy", text: { ka: "ირაკლი წლების შემდეგ თავის საუკეთესო მეგობარს შეხვდა.", en: "Irakli met his best friend again after many years." } },
  { id: "lost-keys", emotion: "relief", text: { ka: "სალომემ ეგონა, გასაღები დაკარგა, მაგრამ ჩანთის ჯიბეში იპოვა.", en: "Salome thought she had lost her keys, then found them in her bag pocket." } },
  { id: "help-move", emotion: "gratitude", text: { ka: "მეგობრები მთელი დღე ეხმარებოდნენ ბექას ბინის გადატანაში.", en: "Friends spent the whole day helping Beka move flat." } },
  { id: "speech", emotion: "anxiety", text: { ka: "ქეთის ხუთ წუთში დიდი აუდიტორიის წინ სიტყვით უნდა გამოვიდეს.", en: "In five minutes Keti has to give a speech to a large audience." } },
  { id: "kid-drawing", emotion: "pride", text: { ka: "მამამ ნახა, რომ შვილის ნახატმა სკოლის კონკურსში გაიმარჯვა.", en: "A father sees that his child's drawing won the school competition." } },
];
