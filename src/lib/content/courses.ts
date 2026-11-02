import type { Localized } from "@/lib/i18n/config";

export interface Lesson {
  /** Globally unique: `${courseSlug}-${n}`. */
  id: string;
  title: Localized;
  body: Localized<string[]>;
  practice: Localized;
  /** Optional library session to do as part of the lesson. */
  librarySessionId?: string;
}

export interface Course {
  slug: string;
  days: number;
  title: Localized;
  summary: Localized;
  lessons: Lesson[];
}

export const COURSES: Course[] = [
  {
    slug: "calm-mind",
    days: 4,
    title: { ka: "მშვიდი გონება", en: "Calm mind" },
    summary: {
      ka: "ოთხდღიანი შესავალი: როგორ შეამჩნიო სტრესი და დაუბრუნდე სიმშვიდეს.",
      en: "A four-day introduction to noticing stress and returning to calm.",
    },
    lessons: [
      {
        id: "calm-mind-1",
        title: { ka: "სტრესის სიგნალები", en: "Stress signals" },
        body: {
          ka: [
            "სტრესი ჯერ სხეულში ჩნდება და მერე აზრებში. დაჭიმული მხრები, სწრაფი სუნთქვა, მოკუმული ყბა: ეს ადრეული სიგნალებია.",
            "დღეს ერთადერთი მიზანია შეამჩნიო. არ არის საჭირო რამის შეცვლა.",
          ],
          en: [
            "Stress shows up in the body before it shows up in thoughts. Tight shoulders, fast breathing, a clenched jaw: these are early signals.",
            "Today your only goal is to notice. You don't need to change anything.",
          ],
        },
        practice: {
          ka: "დღის განმავლობაში სამჯერ შეჩერდი და ჰკითხე: „სად ვგრძნობ დაძაბულობას ახლა?“",
          en: "Three times today, pause and ask: where do I feel tension right now?",
        },
        librarySessionId: "three-breaths",
      },
      {
        id: "calm-mind-2",
        title: { ka: "სუნთქვა, როგორც სამართავი პულტი", en: "Breath as a remote control" },
        body: {
          ka: [
            "ამოსუნთქვის გახანგრძლივება ნერვულ სისტემას ანიშნებს, რომ საფრთხე არ არის.",
            "როცა ამოსუნთქვა ჩასუნთქვაზე გრძელია, სხეული ბუნებრივად მშვიდდება.",
          ],
          en: [
            "Lengthening your exhale signals to your nervous system that there is no danger.",
            "When the out-breath is longer than the in-breath, the body naturally calms down.",
          ],
        },
        practice: {
          ka: "ორჯერ დღეში გააკეთე 2 წუთი სუნთქვა: 4 წამი ჩასუნთქვა, 6 წამი ამოსუნთქვა.",
          en: "Twice today, breathe for 2 minutes: in for 4 seconds, out for 6.",
        },
      },
      {
        id: "calm-mind-3",
        title: { ka: "ფიქრები არ არის ფაქტები", en: "Thoughts are not facts" },
        body: {
          ka: [
            "შფოთვიანი გონება ყველაზე ცუდ სცენარს გვთავაზობს. ეს მისი სამუშაოა: დაგვიცვას.",
            "როცა ფიქრს ამჩნევ, როგორც ფიქრს, მას ძალა ეკარგება: „მე ვამჩნევ, რომ ვფიქრობ, რომ…“",
          ],
          en: [
            "An anxious mind offers us the worst-case scenario. That's its job: to protect us.",
            "When you notice a thought as a thought, it loses power: I notice I'm having the thought that…",
          ],
        },
        practice: {
          ka: "დღეს ერთი შემაწუხებელი ფიქრი ჩაიწერე ფორმულით „მე ვამჩნევ, რომ ვფიქრობ, რომ…“",
          en: "Today, write one troubling thought using the formula: I notice I'm having the thought that…",
        },
        librarySessionId: "anxiety-release",
      },
      {
        id: "calm-mind-4",
        title: { ka: "სიმშვიდის რიტუალი", en: "Your calm ritual" },
        body: {
          ka: [
            "ჩვევა მყარდება, როცა ის კონკრეტულ დროსა და ადგილს უკავშირდება.",
            "შეარჩიე შენი ყოველდღიური 5-წუთიანი რიტუალი წინა დღეებში ნასწავლიდან.",
          ],
          en: [
            "A habit sticks when it's tied to a specific time and place.",
            "Choose your own daily 5-minute ritual from what you've learned in the previous days.",
          ],
        },
        practice: {
          ka: "ჩაიწერე: „ყოველდღე [დრო], [ადგილი], გავაკეთებ [პრაქტიკა]“. დღეს პირველად შეასრულე.",
          en: "Write: every day at [time], in [place], I will do [practice]. Do it for the first time today.",
        },
      },
    ],
  },
  {
    slug: "unshakeable-confidence",
    days: 4,
    title: { ka: "ურყევი თავდაჯერებულობა", en: "Unshakeable confidence" },
    summary: {
      ka: "შეცვალე შინაგანი დიალოგი და ააგე თავდაჯერებულობა პატარა გამარჯვებებით.",
      en: "Change your inner dialogue and build confidence through small wins.",
    },
    lessons: [
      {
        id: "unshakeable-confidence-1",
        title: { ka: "შინაგანი კრიტიკოსი", en: "The inner critic" },
        body: {
          ka: [
            "ყველას გვყავს შინაგანი ხმა, რომელიც გვაკრიტიკებს. ის ხშირად ძველი გამოცდილებიდან მოდის.",
            "პირველი ნაბიჯია, ამ ხმას სახელი დაარქვა და მისგან დისტანცია დაიჭირო.",
          ],
          en: [
            "We all have an inner voice that criticises us. It often comes from old experiences.",
            "The first step is to give this voice a name and put some distance between you and it.",
          ],
        },
        practice: {
          ka: "დაარქვი შენს კრიტიკოსს სახელი. როცა დღეს გამოჩნდება, უთხარი: „გმადლობ, [სახელი], მე გავუმკლავდები“.",
          en: "Give your critic a name. When it shows up today, say: thanks, [name], I've got this.",
        },
      },
      {
        id: "unshakeable-confidence-2",
        title: { ka: "მტკიცებულებების საქაღალდე", en: "The evidence file" },
        body: {
          ka: [
            "თავდაჯერებულობა გრძნობა არ არის, ის მტკიცებულებებზე დაფუძნებული რწმენაა.",
            "გონებას ცუდის დამახსოვრება უფრო უადვილდება, ამიტომ კარგი შეგნებულად უნდა შევაგროვოთ.",
          ],
          en: [
            "Confidence isn't a feeling; it's a belief built on evidence.",
            "The mind remembers bad things more easily, so the good has to be collected on purpose.",
          ],
        },
        practice: {
          ka: "ჩამოწერე 10 რამ, რაც ცხოვრებაში კარგად გამოგივიდა, თუნდაც პატარა.",
          en: "Write down 10 things you've done well in your life, however small.",
        },
      },
      {
        id: "unshakeable-confidence-3",
        title: { ka: "ანკერი", en: "Anchoring" },
        body: {
          ka: [
            "ჰიპნოზური ანკერი ფიზიკურ ჟესტს ემოციურ მდგომარეობასთან აკავშირებს.",
            "რაც უფრო ხშირად ავარჯიშებ, მით უფრო სწრაფად მუშაობს.",
          ],
          en: [
            "A hypnotic anchor links a physical gesture to an emotional state.",
            "The more often you practise it, the faster it works.",
          ],
        },
        practice: {
          ka: "მოუსმინე სესიას „შინაგანი თავდაჯერებულობა“ და დღეში სამჯერ გამოიყენე შენი ანკერი.",
          en: "Listen to the Inner confidence session and use your anchor three times today.",
        },
        librarySessionId: "inner-confidence",
      },
      {
        id: "unshakeable-confidence-4",
        title: { ka: "კომფორტის ზონის კიდე", en: "The edge of comfort" },
        body: {
          ka: [
            "თავდაჯერებულობა იზრდება, როცა ცოტათი მეტს აკეთებ, ვიდრე კომფორტულია.",
            "არა დიდი ნახტომი, არამედ პატარა, განმეორებადი ნაბიჯი.",
          ],
          en: [
            "Confidence grows when you do slightly more than is comfortable.",
            "Not a giant leap, but a small, repeatable step.",
          ],
        },
        practice: {
          ka: "გააკეთე დღეს ერთი რამ, რაც ოდნავ გაშინებს (მაგ. შეხვედრაზე აზრის გამოთქმა). შემდეგ ჩაიწერე, როგორ ჩაიარა.",
          en: "Do one thing today that scares you slightly (e.g. share an idea in a meeting). Then write down how it went.",
        },
      },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}
