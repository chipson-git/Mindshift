import type { Localized } from "@/lib/i18n/config";

// Daily exercises. One is shown per day (see `dailyIndex` in streak.ts).

export interface Exercise {
  id: string;
  minutes: number;
  title: Localized;
  steps: Localized<string[]>;
}

export const EXERCISES: Exercise[] = [
  {
    id: "thought-reframe",
    minutes: 5,
    title: { ka: "აზრის გადაფორმულირება", en: "Reframe a thought" },
    steps: {
      ka: [
        "ჩაიწერე ერთი უარყოფითი აზრი, რომელიც დღეს გქონდა.",
        "ჰკითხე თავს: ეს ფაქტია თუ ინტერპრეტაცია?",
        "ჩაწერე უფრო დაბალანსებული, მაგრამ სანდო ვერსია.",
        "წაიკითხე ახალი ვერსია ხმამაღლა სამჯერ.",
      ],
      en: [
        "Write down one negative thought you had today.",
        "Ask yourself: is this a fact or an interpretation?",
        "Write a more balanced version that you can still believe.",
        "Read the new version out loud three times.",
      ],
    },
  },
  {
    id: "gratitude-three",
    minutes: 3,
    title: { ka: "სამი მადლიერება", en: "Three gratitudes" },
    steps: {
      ka: [
        "ჩაიწერე სამი რამ, რისთვისაც დღეს მადლიერი ხარ.",
        "თითოეულთან დაამატე, რატომ არის ის შენთვის მნიშვნელოვანი.",
        "ერთ მათგანზე 20 წამით შეჩერდი და ის შეგრძნება კიდევ ერთხელ განიცადე.",
      ],
      en: [
        "Write down three things you're grateful for today.",
        "Next to each, add why it matters to you.",
        "Stay with one of them for 20 seconds and feel it again.",
      ],
    },
  },
  {
    id: "box-breathing",
    minutes: 4,
    title: { ka: "კვადრატული სუნთქვა", en: "Box breathing" },
    steps: {
      ka: [
        "ჩაისუნთქე 4 წამი.",
        "შეიკავე სუნთქვა 4 წამი.",
        "ამოისუნთქე 4 წამი.",
        "დაელოდე 4 წამი. გაიმეორე 6 ციკლი.",
      ],
      en: [
        "Breathe in for 4 seconds.",
        "Hold for 4 seconds.",
        "Breathe out for 4 seconds.",
        "Hold for 4 seconds. Repeat for 6 rounds.",
      ],
    },
  },
  {
    id: "future-self",
    minutes: 6,
    title: { ka: "მომავალი მე", en: "Future self" },
    steps: {
      ka: [
        "წარმოიდგინე საკუთარი თავი ერთი წლის შემდეგ, როცა უკვე მიაღწიე მიზანს.",
        "როგორ დგახარ? როგორ ლაპარაკობ? რას აკეთებ დილით?",
        "დაწერე მოკლე წერილი ამ ადამიანისგან დღევანდელ შენთვის.",
        "აირჩიე ერთი პატარა ქმედება, რომელსაც „მომავალი მე“ დღეს გააკეთებდა, და გააკეთე.",
      ],
      en: [
        "Picture yourself one year from now, having reached your goal.",
        "How do you stand? How do you speak? What do you do in the morning?",
        "Write a short letter from that person to the you of today.",
        "Pick one small action your future self would take today, and do it.",
      ],
    },
  },
  {
    id: "body-scan-mini",
    minutes: 5,
    title: { ka: "მინი სხეულის სკანირება", en: "Mini body scan" },
    steps: {
      ka: [
        "დახუჭე თვალები და ყურადღება თავის კანზე გადაიტანე.",
        "ნელა ჩაიყვანე ყურადღება სახეზე, კისერზე, მხრებზე, ხელებზე.",
        "გააგრძელე მკერდზე, მუცელზე, ფეხებზე, ტერფებზე.",
        "სადაც დაძაბულობას შეამჩნევ, ამოსუნთქვით გაუშვი.",
      ],
      en: [
        "Close your eyes and bring attention to the top of your head.",
        "Slowly move it down to your face, neck, shoulders and arms.",
        "Continue to your chest, belly, legs and feet.",
        "Wherever you notice tension, let it go with an exhale.",
      ],
    },
  },
  {
    id: "habit-stack",
    minutes: 3,
    title: { ka: "ჩვევების დაწყვილება", en: "Habit stacking" },
    steps: {
      ka: [
        "აირჩიე ახალი პატარა ჩვევა (მაგ. ერთი აფირმაცია).",
        "აირჩიე არსებული ჩვევა, რომელსაც ყოველდღე აკეთებ (მაგ. ყავის მომზადება).",
        "ჩამოაყალიბე წესი: „როცა [არსებული ჩვევა], მაშინ [ახალი ჩვევა]“.",
        "დღეს ერთხელ შეასრულე ეს წესი.",
      ],
      en: [
        "Pick a tiny new habit (e.g. one affirmation).",
        "Pick an existing habit you do every day (e.g. making coffee).",
        "Write the rule: after I [existing habit], I will [new habit].",
        "Do it once today.",
      ],
    },
  },
  {
    id: "worry-window",
    minutes: 10,
    title: { ka: "საფიქრალის ფანჯარა", en: "Worry window" },
    steps: {
      ka: [
        "დანიშნე 10 წუთი, როცა მხოლოდ საფიქრალზე იფიქრებ.",
        "ჩამოწერე ყველა საზრუნავი ცენზურის გარეშე.",
        "თითოეულთან მონიშნე: შემიძლია რამე გავაკეთო? თუ კი, ჩაწერე პირველი ნაბიჯი.",
        "ფანჯრის გარეთ საფიქრალი რომ მოვა, უთხარი: „ამაზე ხვალ ფანჯარაში ვიფიქრებ“.",
      ],
      en: [
        "Set aside 10 minutes for worrying, and only then.",
        "Write down every worry without filtering.",
        "Next to each, mark: can I do something about it? If yes, write the first step.",
        "When a worry shows up outside the window, tell it: I'll think about you tomorrow, in the window.",
      ],
    },
  },
];
