import type { ThemeKey } from "./constants";

// Each showcase gets a landing page at /<slug>, built from this list along with its
// sitemap entry, share image and links. Adding an event here (with a finished theme) adds its page.

export interface EventFaq {
  question: string;
  answer: string;
}

export interface ShowcaseEvent {
  slug: string;
  themeKey: ThemeKey;
  name: string;
  // Page <title>, before " | Video Game Bingo"; keep the whole title under ~60 characters
  title: string;
  // Meta description; keep under ~155 characters
  description: string;
  heading: string;
  intro: string;
  // Evergreen predictions, not tied to one show, so the page never looks stale
  starterPredictions: string[];
  // Shown in a collapsed "About" section with the FAQ; mostly there for search engines
  about: string[];
  faq: EventFaq[];
  // Bump when the page's content changes; feeds the sitemap
  updated: string;
  // Date of the next show (YYYY-MM-DD) when it's announced. Until a week after it, cards in
  // this event's theme aren't deleted for inactivity, so they can be made well ahead
  eventDate?: string;
}

export const EVENTS: ShowcaseEvent[] = [
  {
    slug: "nintendo-direct-bingo",
    themeKey: "nintendoDirect",
    name: "Nintendo Direct",
    title: "Nintendo Direct Bingo Card Maker",
    description:
      "Make a free Nintendo Direct bingo card in seconds. Use ready-made predictions or your own, share it with friends, chat, whoever, and play along live.",
    heading: "Nintendo Direct Bingo Card Maker",
    intro:
      "Fill a card with your Nintendo Direct predictions or start from ours. Share it with friends, chat, whoever, and play along live.",
    starterPredictions: [
      "Shadow drop during the show",
      "Ends with \"one more thing\"",
      "New Mario game announced",
      "Zelda remaster or remake",
      "Pokémon gets a segment",
      "Surprise third-party port",
      "Release date for an announced game",
      "Metroid shows up",
      "New Kirby game",
      "A Nintendo Switch 2 Edition upgrade",
      "Classic games added to Switch Online",
      "Free update for a recent game",
      "Paid DLC announced",
      "Indie game nobody saw coming",
      "\"Coming later this year\"",
      "Trailer with no gameplay",
      "Donkey Kong appears",
      "Fire Emblem news",
      "Monolith Soft reveal",
      "New amiibo shown",
      "Animal Crossing news",
      "Splatoon content",
      "GameCube game remastered",
      "Mario Kart content",
      "Demo available today",
      "Square Enix RPG port",
      "Long-dormant series returns",
      "Sequel to a recent hit",
      "Developer speaks on camera",
      "F-Zero returns",
    ],
    about: [
      "Nintendo Direct bingo is simple: before the show, fill a grid with what you think Nintendo will announce, then mark squares off as they happen. Get a full row, column or diagonal and you've got bingo.",
      "Create your card and you get one short link. Share it with friends, chat, whoever. Everyone who opens it plays the same predictions on their own screen, with nothing to install or sign up for. Hit Shuffle to rearrange your squares, or turn on Stream mode to hide the buttons while the card is on screen.",
    ],
    faq: [
      {
        question: "Is the Nintendo Direct bingo card maker free?",
        answer:
          "Yes. Making cards, sharing them and playing along are all free, and there's no account to create.",
      },
      {
        question: "How do other people play along?",
        answer:
          "Share your card's link with friends, chat, whoever. Everyone who opens it gets the same card in their browser and marks their own squares.",
      },
      {
        question: "How many predictions do I need?",
        answer:
          "8 for a 3 × 3 card with a free space, 24 for a 5 × 5 and 48 for a 7 × 7. Add a few extra and Shuffle mixes them in.",
      },
      {
        question: "Can I edit the starter predictions?",
        answer:
          "Yes. Use them as they are, remove the ones you don't like and add your own before you create the card.",
      },
      {
        question: "Is this site affiliated with Nintendo?",
        answer:
          "No. Video Game Bingo is a fan-made site and isn't affiliated with or endorsed by Nintendo.",
      },
    ],
    updated: "2026-10-13",
  },
  {
    slug: "state-of-play-bingo",
    themeKey: "playstationStateOfPlay",
    name: "State of Play",
    title: "State of Play Bingo Card Maker",
    description:
      "Make a free PlayStation State of Play bingo card in seconds. Use our predictions or your own, share it with friends, chat, whoever, and play along live.",
    heading: "PlayStation State of Play Bingo Card Maker",
    intro:
      "Build a State of Play bingo card from your own predictions or ours. Share it with friends, chat, whoever, and play along live.",
    starterPredictions: [
      "New PlayStation exclusive revealed",
      "Ends with a big final reveal",
      "Release date for a first-party game",
      "Remake of a PS1 or PS2 classic",
      "\"Available today\" on PS5",
      "New live-service game",
      "Indie spotlight",
      "Japanese RPG trailer",
      "Horror game reveal",
      "Soulslike action game",
      "PS VR2 game shown",
      "PlayStation game coming to PC",
      "Release window but no date",
      "CGI trailer with no gameplay",
      "Big third-party sequel",
      "Fighting game DLC character",
      "Racing game news",
      "Marvel game news",
      "Kojima Productions appears",
      "Developer interview",
      "PS5 Pro enhanced game",
      "Demo out today",
      "Classic games added to PS Plus",
      "Remaster collection",
      "\"Only on PlayStation\"",
      "Gameplay deep dive",
      "Delay announced",
      "Anime game trailer",
      "Studio teases its next game",
      "Sequel to a PS4 favorite",
    ],
    about: [
      "State of Play bingo turns PlayStation's showcase into a game: fill a grid with your predictions before the show, then mark each one off as it happens. Complete a row, column or diagonal to win.",
      "Once you create your card, you get a short link. Share it with friends, chat, whoever. Everyone plays the same predictions in their own browser, with no app or account needed. Shuffle rearranges your squares, and Stream mode hides the buttons for a clean board on screen.",
    ],
    faq: [
      {
        question: "Is the State of Play bingo card maker free?",
        answer:
          "Yes, it's completely free. There's no sign-up for you or anyone you share your card with.",
      },
      {
        question: "How do I share my card?",
        answer:
          "After you create your card, share its link with friends, chat, whoever. Anyone who opens it can play along and mark their own squares.",
      },
      {
        question: "What board size should I use?",
        answer:
          "5 × 5 is the classic and needs 24 predictions with the free space. A 3 × 3 card needs 8, and a 7 × 7 card needs 48.",
      },
      {
        question: "Does everyone get the same card?",
        answer:
          "Everyone gets the same predictions. Each person can press Shuffle to rearrange the squares on their own card.",
      },
      {
        question: "Is this site affiliated with PlayStation or Sony?",
        answer:
          "No. Video Game Bingo is fan-made and isn't affiliated with or endorsed by Sony Interactive Entertainment.",
      },
    ],
    updated: "2026-10-13",
  },
  {
    slug: "xbox-games-showcase-bingo",
    themeKey: "xbox",
    name: "Xbox Games Showcase",
    title: "Xbox Games Showcase Bingo Card Maker",
    description:
      "Make a free Xbox Games Showcase bingo card in seconds. Use our predictions or your own, share it with friends, chat, whoever, and play along live.",
    heading: "Xbox Games Showcase Bingo Card Maker",
    intro:
      "Make an Xbox Games Showcase bingo card with your predictions or ours. Share it with friends, chat, whoever, and play along live.",
    starterPredictions: [
      "\"Day one with Game Pass\"",
      "World premiere trailer",
      "Gears of War news",
      "Halo shows up",
      "New Bethesda game revealed",
      "Call of Duty segment",
      "The Elder Scrolls mentioned",
      "Fallout news",
      "Forza content",
      "id Software reveal",
      "Blizzard game news",
      "Release date for an announced game",
      "\"Available today\" shadow drop",
      "Also coming to PlayStation",
      "Japanese publisher partnership",
      "Indie montage",
      "Rare shows a game",
      "Double Fine reveal",
      "Obsidian RPG news",
      "An executive on stage",
      "Ends with \"one more thing\"",
      "Deep dive on one game",
      "Hardware tease",
      "PC and cloud play mentioned",
      "Sequel to a cult classic",
      "Delay announced",
      "CGI trailer, no gameplay",
      "Developer interview segment",
      "Brand-new Xbox IP",
      "Revival of a classic Xbox series",
    ],
    about: [
      "Xbox Games Showcase bingo turns your predictions into a game: fill a grid before the show and mark off each one as it's announced. Line up a row, column or diagonal for bingo.",
      "Create your card and share its short link with friends, chat, whoever. Everyone gets the same predictions to mark off on their own screen, and nobody needs to install anything or create an account. Shuffle rearranges your squares, and Stream mode hides the buttons when the card is on screen.",
    ],
    faq: [
      {
        question: "Is the Xbox Games Showcase bingo card maker free?",
        answer:
          "Yes. It's free to make and share cards, and there's nothing for anyone to sign up for.",
      },
      {
        question: "How do I share my card?",
        answer:
          "Create your card and share its link with friends, chat, whoever. Each person opens it in their browser and marks their own squares.",
      },
      {
        question: "How many predictions do I need?",
        answer:
          "With a free space: 8 for 3 × 3, 24 for 5 × 5 and 48 for 7 × 7. Extra predictions get mixed in when you shuffle.",
      },
      {
        question: "Can I change the starter predictions?",
        answer:
          "Yes. Keep the ones you like, remove the rest and add your own before creating the card.",
      },
      {
        question: "Is this site affiliated with Xbox or Microsoft?",
        answer:
          "No. Video Game Bingo is fan-made and isn't affiliated with or endorsed by Microsoft.",
      },
    ],
    updated: "2026-10-13",
  },
  {
    slug: "game-awards-bingo",
    themeKey: "gameAwards",
    name: "The Game Awards",
    title: "The Game Awards Bingo Card Maker",
    description:
      "Make a free Game Awards bingo card in seconds. Use our predictions or your own, share it with friends, chat, whoever, and play along live.",
    heading: "The Game Awards Bingo Card Maker",
    intro:
      "Fill a card with your Game Awards predictions, from winners to world premieres, or start from ours. Share it with friends, chat, whoever, and play along live.",
    starterPredictions: [
      "Favorite wins Game of the Year",
      "Surprise Game of the Year winner",
      "World premiere trailer",
      "Hideo Kojima appears",
      "Orchestra plays a medley",
      "Winner gets played off mid-speech",
      "Celebrity from film or TV presents",
      "Shadow drop during the show",
      "Sequel announced for a nominee",
      "Indie wins a major category",
      "Remake announced",
      "Release date for an announced game",
      "Live music performance",
      "Esports award presented",
      "Winner thanks their family",
      "A Nintendo reveal",
      "A PlayStation reveal",
      "An Xbox reveal",
      "Fighting game character reveal",
      "CGI trailer, no gameplay",
      "Developer gets emotional on stage",
      "Studio head on stage",
      "Crossover or collab announced",
      "Free-to-play game revealed",
      "Awards handed out in a quick montage",
      "A joke falls flat",
      "Sponsored segment",
      "Ends with a big final reveal",
      "Mobile game gets a trailer",
      "Movie or TV adaptation news",
    ],
    about: [
      "Game Awards bingo covers both halves of the night: who takes home the awards and what gets revealed between them. Fill a grid with your predictions before the show, then mark squares off as they happen. Get a full row, column or diagonal and you've got bingo.",
      "Create your card and you get one short link. Share it with friends, chat, whoever. Everyone who opens it plays the same predictions on their own screen, with nothing to install or sign up for. Hit Shuffle to rearrange your squares, or turn on Stream mode to hide the buttons while the card is on screen.",
    ],
    faq: [
      {
        question: "Is the Game Awards bingo card maker free?",
        answer:
          "Yes. Making cards, sharing them and playing along are all free, and there's no account to create.",
      },
      {
        question: "Can I mix award winners and game reveals on one card?",
        answer:
          "Yes, and it makes for a better card. Put your Game of the Year pick next to the world premieres you're hoping for.",
      },
      {
        question: "How do other people play along?",
        answer:
          "Share your card's link with friends, chat, whoever. Everyone who opens it gets the same card in their browser and marks their own squares.",
      },
      {
        question: "How many predictions do I need?",
        answer:
          "8 for a 3 × 3 card with a free space, 24 for a 5 × 5 and 48 for a 7 × 7. Add a few extra and Shuffle mixes them in.",
      },
      {
        question: "Is this site affiliated with The Game Awards?",
        answer:
          "No. Video Game Bingo is a fan-made site and isn't affiliated with or endorsed by The Game Awards.",
      },
    ],
    updated: "2026-10-13",
  },
];

export const getEvent = (slug: string) =>
  EVENTS.find((event) => event.slug === slug);

export const getEventForTheme = (themeKey: ThemeKey) =>
  EVENTS.find((event) => event.themeKey === themeKey);

// Announced show dates by theme, for the daily cleanup
export const scheduledEventDates = () =>
  Object.fromEntries(
    EVENTS.filter((event) => event.eventDate).map((event) => [
      event.themeKey,
      event.eventDate,
    ])
  );
