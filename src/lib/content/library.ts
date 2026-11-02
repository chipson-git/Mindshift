import type { Localized } from "@/lib/i18n/config";

// Pre-written ("library") sessions. In production these scripts are generated once with AI,
// reviewed, and turned into studio audio (`audioUrl`). Until audio exists, the player reads
// the script aloud with the browser's speech synthesis.

export type LibraryCategory = "sleep" | "calm" | "confidence" | "focus";

export interface LibraryItem {
  id: string;
  category: LibraryCategory;
  kind: "meditation" | "hypnosis";
  minutes: number;
  /** Available without a subscription (one taster session). */
  free?: boolean;
  title: Localized;
  summary: Localized;
  /** Paragraphs; the player pauses between them. */
  script: Localized<string[]>;
  audioUrl?: Localized<string | undefined>;
}

export const LIBRARY: LibraryItem[] = [
  {
    id: "three-breaths",
    category: "calm",
    kind: "meditation",
    minutes: 3,
    free: true,
    title: { ka: "სამი სუნთქვა", en: "Three breaths" },
    summary: {
      ka: "მოკლე პაუზა, რომელიც დღის ნებისმიერ მომენტში გამოგადგება.",
      en: "A short reset you can use at any moment of the day.",
    },
    script: {
      ka: [
        "მოკალათდი კომფორტულად. ზურგი გაასწორე, მხრები მოადუნე.",
        "თუ გინდა, თვალები დახუჭე, ან მზერა იატაკზე რბილად დაუშვი.",
        "ჩაისუნთქე ცხვირით, ნელა, ოთხამდე თვლით. შეაჩერე ერთი წამით. ამოისუნთქე პირით, ექვსამდე თვლით.",
        "კიდევ ერთხელ. ჩასუნთქვისას იგრძენი, როგორ ფართოვდება მკერდი. ამოსუნთქვისას გაუშვი დაძაბულობა.",
        "და მესამედ. ამოსუნთქვასთან ერთად თავს ჩუმად უთხარი: „ახლა აქ ვარ“.",
        "შეამჩნიე, როგორ გრძნობ თავს. ეს სიმშვიდე ყოველთვის შენთანაა, სამი სუნთქვის მოშორებით.",
      ],
      en: [
        "Settle into a comfortable position. Lengthen your spine and let your shoulders drop.",
        "Close your eyes if you like, or let your gaze rest softly on the floor.",
        "Breathe in through your nose, slowly, counting to four. Pause for a moment. Breathe out through your mouth, counting to six.",
        "Once more. As you breathe in, feel your chest widen. As you breathe out, let the tension go.",
        "And a third time. As you exhale, silently tell yourself: I am here now.",
        "Notice how you feel. This calm is always with you, three breaths away.",
      ],
    },
  },
  {
    id: "deep-sleep",
    category: "sleep",
    kind: "hypnosis",
    minutes: 12,
    title: { ka: "ღრმა ძილისკენ", en: "Into deep sleep" },
    summary: {
      ka: "სხეულის ეტაპობრივი მოდუნება და ჰიპნოზური ჩაძირვა ძილის წინ.",
      en: "Progressive relaxation and a gentle hypnotic descent before sleep.",
    },
    script: {
      ka: [
        "დაწექი კომფორტულად და მიეცი სხეულს უფლება, რომ საწოლში ჩაიძიროს.",
        "ყურადღება ფეხის თითებზე გადაიტანე. წარმოიდგინე, როგორ ავსებს მათ თბილი, მძიმე სიმშვიდე.",
        "ეს სითბო ნელა ადის კოჭებზე, წვივებზე, მუხლებზე. ყოველი ამოსუნთქვით ფეხები უფრო მძიმდება.",
        "სითბო ავსებს მუცელს, მკერდს, მხრებს. ხელები მძიმე და მოდუნებულია.",
        "ახლა წარმოიდგინე კიბე, ათი რბილი საფეხურით. ყოველი საფეხური ღრმა სიმშვიდისკენ მიგიყვანს.",
        "ათი… ცხრა… ყოველი რიცხვით ორჯერ უფრო მოდუნებული ხარ… რვა… შვიდი… ექვსი…",
        "ხუთი… ოთხი… დღის ფიქრები შორს რჩება, როგორც ღრუბლები… სამი… ორი… ერთი.",
        "აქ, ამ სიმშვიდეში, შენი გონება იმახსოვრებს: ძილი ჩემთვის ბუნებრივი და ადვილია.",
        "ყოველ ღამე, როცა თავს ბალიშზე დადებ, სხეული ამ სიმშვიდეს გაიხსენებს.",
        "ახლა უბრალოდ დაისვენე და მიეცი ძილს უფლება, რომ თავისით მოვიდეს.",
      ],
      en: [
        "Lie down comfortably and let your body sink into the bed.",
        "Bring your attention to your toes. Imagine a warm, heavy calm filling them.",
        "That warmth rises slowly through your ankles, your calves, your knees. With every exhale your legs grow heavier.",
        "The warmth fills your belly, your chest, your shoulders. Your arms are heavy and loose.",
        "Now picture a staircase with ten soft steps. Each step takes you deeper into calm.",
        "Ten… nine… with every number you are twice as relaxed… eight… seven… six…",
        "Five… four… the thoughts of the day drift far away like clouds… three… two… one.",
        "Here, in this calm, your mind remembers: sleep comes naturally and easily to me.",
        "Every night, when your head touches the pillow, your body will remember this calm.",
        "Now simply rest, and let sleep arrive on its own.",
      ],
    },
  },
  {
    id: "anxiety-release",
    category: "calm",
    kind: "meditation",
    minutes: 8,
    title: { ka: "შფოთვის გაშვება", en: "Letting go of anxiety" },
    summary: {
      ka: "ისწავლე შფოთვის შემჩნევა, მიღება და გაშვება ბრძოლის გარეშე.",
      en: "Learn to notice, allow and release anxiety without fighting it.",
    },
    script: {
      ka: [
        "მოკალათდი და რამდენიმე წამით უბრალოდ დააკვირდი სუნთქვას.",
        "თუ შფოთვას გრძნობ, ნუ ეცდები მის გაქრობას. უბრალოდ შეამჩნიე, სად ცხოვრობს ის სხეულში.",
        "შესაძლოა ეს მკერდში დაჭიმულობაა, ან მუცელში მღელვარება. დაარქვი სახელი: „აი, შფოთვა“.",
        "ჩაისუნთქე ამ ადგილისკენ, თითქოს მას სივრცეს უთმობდე.",
        "შეგრძნება ტალღასავითაა. ის მატულობს, აღწევს პიკს და შემდეგ აუცილებლად ნელდება.",
        "უთხარი საკუთარ თავს: „შემიძლია ეს ვიგრძნო და მაინც უსაფრთხოდ ვიყო“.",
        "ყოველი ამოსუნთქვით ტალღა ცოტათი პატარავდება.",
        "როცა მზად იქნები, შეამჩნიე ფეხები იატაკზე, ხმები ოთახში, და დაბრუნდი დღეში.",
      ],
      en: [
        "Settle in and simply watch your breath for a few moments.",
        "If you feel anxious, don't try to make it go away. Just notice where it lives in your body.",
        "Maybe it's tightness in your chest, or a flutter in your stomach. Name it: there is anxiety.",
        "Breathe toward that place, as if you were making room for it.",
        "A feeling is like a wave. It rises, peaks, and then always settles.",
        "Tell yourself: I can feel this and still be safe.",
        "With every exhale, the wave gets a little smaller.",
        "When you're ready, notice your feet on the floor, the sounds in the room, and return to your day.",
      ],
    },
  },
  {
    id: "inner-confidence",
    category: "confidence",
    kind: "hypnosis",
    minutes: 10,
    title: { ka: "შინაგანი თავდაჯერებულობა", en: "Inner confidence" },
    summary: {
      ka: "თვითჰიპნოზი, რომელიც წარსული წარმატების შეგრძნებას დღევანდელობაში მოგიტანს.",
      en: "Self-hypnosis that brings the feeling of past success into the present.",
    },
    script: {
      ka: [
        "დახუჭე თვალები და სამჯერ ღრმად ჩაისუნთქე. ყოველი ამოსუნთქვით უფრო ღრმად მოდუნდი.",
        "გაიხსენე მომენტი, როცა საკუთარი თავით ამაყობდი. დიდი ან პატარა, მნიშვნელობა არ აქვს.",
        "ნახე, რას ხედავდი მაშინ. გაიგონე ხმები. იგრძენი, როგორ იდექი, როგორ სუნთქავდი.",
        "ეს შეგრძნება გააძლიერე, თითქოს ხმას უწევდე. მიეცი უფლება, რომ მთელ სხეულში გავრცელდეს.",
        "ახლა ცერი და საჩვენებელი თითი ერთმანეთს შეახე. ეს შენი წამყვანი ჟესტია.",
        "ყოველ ჯერზე, როცა ამ თითებს შეაერთებ, ეს თავდაჯერებულობა დაბრუნდება.",
        "წარმოიდგინე მომავალი სიტუაცია, რომელიც ადრე გაღელვებდა. შეაერთე თითები და ნახე, როგორ შედიხარ მასში მშვიდად და მტკიცედ.",
        "შენ უკვე გაქვს ის, რაც გჭირდება. ახლა უბრალოდ მისკენ გზა იცი.",
        "სამ რიცხვზე გაახელ თვალებს, ფხიზლად და ენერგიით. ერთი… ორი… სამი.",
      ],
      en: [
        "Close your eyes and take three deep breaths. With every exhale, relax a little deeper.",
        "Remember a moment when you were proud of yourself. Big or small, it doesn't matter.",
        "See what you saw then. Hear the sounds. Feel how you stood, how you breathed.",
        "Turn that feeling up, as if you were raising the volume. Let it spread through your whole body.",
        "Now touch your thumb and index finger together. This is your anchor.",
        "Every time you join these fingers, this confidence comes back.",
        "Picture an upcoming situation that used to make you nervous. Join your fingers and see yourself stepping into it calm and steady.",
        "You already have what you need. Now you know the way back to it.",
        "On the count of three you'll open your eyes, alert and energised. One… two… three.",
      ],
    },
  },
  {
    id: "deep-focus",
    category: "focus",
    kind: "meditation",
    minutes: 6,
    title: { ka: "ღრმა ფოკუსი", en: "Deep focus" },
    summary: {
      ka: "მოამზადე გონება კონცენტრირებული სამუშაოსთვის.",
      en: "Prepare your mind for a block of concentrated work.",
    },
    script: {
      ka: [
        "დაჯექი სწორად, ფეხები იატაკზე. ერთხელ ღრმად ჩაისუნთქე და ამოისუნთქე.",
        "ჩამოთვალე გონებაში ყველაფერი, რაც ახლა გაწუხებს. თითოეულს უთხარი: „მოგვიანებით“.",
        "ახლა ყურადღება ერთ წერტილზე, სუნთქვაზე, ნესტოებთან გადაიტანე.",
        "როცა გონება გაიქცევა, და აუცილებლად გაიქცევა, ნაზად დააბრუნე. ეს დაბრუნება თავადაა ვარჯიში.",
        "დაისახე ერთი მკაფიო მიზანი მომდევნო ოცდახუთი წუთისთვის. თქვი ის ჩუმად.",
        "წარმოიდგინე, როგორ ასრულებ მას. იგრძენი დასრულების კმაყოფილება.",
        "გაახილე თვალები და დაიწყე. მხოლოდ ერთი ამოცანა, მხოლოდ ახლა.",
      ],
      en: [
        "Sit upright with your feet on the floor. Take one deep breath in and out.",
        "List in your mind everything that is pulling at you. To each one say: later.",
        "Now bring your attention to a single point: the breath at your nostrils.",
        "When your mind wanders, and it will, gently bring it back. Coming back is the practice itself.",
        "Set one clear goal for the next twenty-five minutes. Say it silently.",
        "Picture yourself finishing it. Feel the satisfaction of being done.",
        "Open your eyes and begin. One task, only now.",
      ],
    },
  },
  {
    id: "morning-intention",
    category: "confidence",
    kind: "meditation",
    minutes: 5,
    title: { ka: "დილის განზრახვა", en: "Morning intention" },
    summary: {
      ka: "დაიწყე დღე მკაფიო განზრახვით და მადლიერებით.",
      en: "Start the day with a clear intention and gratitude.",
    },
    script: {
      ka: [
        "სანამ ტელეფონს აიღებ, ერთი წუთი მხოლოდ შენთვის დაიტოვე.",
        "ჩაისუნთქე ღრმად და იგრძენი, როგორ იღვიძებს სხეული.",
        "გაიხსენე სამი რამ, რისთვისაც დღეს მადლიერი ხარ. თუნდაც უბრალო, როგორიცაა თბილი ჩაი.",
        "ახლა ჰკითხე საკუთარ თავს: როგორი ადამიანი მინდა ვიყო დღეს?",
        "აირჩიე ერთი სიტყვა: მშვიდი, გაბედული, კეთილი, ფოკუსირებული.",
        "წარმოიდგინე დღის ერთი მომენტი, სადაც ამ სიტყვით მოქმედებ.",
        "წაიღე ეს სიტყვა თან მთელი დღის განმავლობაში.",
      ],
      en: [
        "Before you reach for your phone, keep one minute just for yourself.",
        "Breathe in deeply and feel your body waking up.",
        "Recall three things you're grateful for today. Even simple ones, like a warm cup of tea.",
        "Now ask yourself: who do I want to be today?",
        "Choose one word: calm, brave, kind, focused.",
        "Picture one moment of your day where you act from that word.",
        "Carry this word with you throughout the day.",
      ],
    },
  },
];

export function getLibraryItem(id: string): LibraryItem | undefined {
  return LIBRARY.find((item) => item.id === id);
}
