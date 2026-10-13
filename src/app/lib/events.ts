import type { ThemeKey } from "./constants";

// Each showcase gets a landing page at /<slug>, built from this list along with its
// sitemap entry, share image and links. Adding an event here (with a finished theme) adds its page.

export interface EventSection {
  heading: string;
  paragraphs: string[];
}

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
  sections: EventSection[];
  faq: EventFaq[];
  // Bump when the page's content changes; feeds the sitemap
  updated: string;
}

export const EVENTS: ShowcaseEvent[] = [
  {
    slug: "nintendo-direct-bingo",
    themeKey: "nintendoDirect",
    name: "Nintendo Direct",
    title: "Nintendo Direct Bingo Card Maker",
    description:
      "Make a free Nintendo Direct bingo card in seconds. Start from ready-made predictions, share one short link with your chat, and play along live.",
    heading: "Nintendo Direct Bingo Card Maker",
    intro:
      "Fill a card with your Nintendo Direct predictions, or start from ours, then share one link so your friends or chat can play along while the show is live.",
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
      "Chat begs for F-Zero",
    ],
    sections: [
      {
        heading: "What is Nintendo Direct bingo?",
        paragraphs: [
          "Nintendo Directs are Nintendo's online presentations where it reveals new games, release dates and updates. Nintendo Direct bingo turns the guessing that happens before every show into a game: fill a grid with what you think Nintendo will announce, then mark squares off as they happen. Complete a row, column or diagonal and you've got bingo.",
          "It works just as well for a full Direct, a shorter Direct Mini or a Partner Showcase. The fun is in the predictions, from safe bets like a release date for a game already announced to long shots like the return of a series fans have been waiting on for years.",
        ],
      },
      {
        heading: "How to play Nintendo Direct bingo with your chat",
        paragraphs: [
          "Add your predictions, pick a board size and click Create my card. You get one short link to drop in chat, Discord or a group text. Everyone who opens it gets the same predictions and marks their own squares as the show plays out, with nothing to install or sign up for.",
          "Viewers can hit Shuffle to get their own layout, so not everyone gets bingo at the same moment. If you're streaming, switch on Stream mode to fade the buttons away so only the board is on screen.",
          "A 5 × 5 card is the classic choice for a full Direct. Try 3 × 3 for a quick Direct Mini, or 7 × 7 if you want a card that lasts the whole show.",
        ],
      },
      {
        heading: "What usually happens in a Nintendo Direct",
        paragraphs: [
          "Nintendo often announces a Direct only a day or so before it airs, so it helps to have a card ready fast. That's what the starter predictions are for: they cover the moments that show up again and again, and you can edit any of them.",
          "Some patterns are close to tradition. The biggest reveal is usually saved for the end, often introduced with a \"one more thing.\" Games sometimes release the moment the show ends, known as a shadow drop. Ports and remasters of older games are common, as are release dates for games announced in earlier Directs, paid DLC and free updates for recent hits. These make great squares because they're likely, but never guaranteed.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the Nintendo Direct bingo card maker free?",
        answer:
          "Yes. Making cards, sharing them and playing along are all free, and there's no account to create.",
      },
      {
        question: "How do my viewers play along?",
        answer:
          "Share your card's link. Each viewer opens the same card in their browser and marks their own squares as the Direct plays out.",
      },
      {
        question: "How many predictions do I need?",
        answer:
          "8 for a 3 × 3 card with a free space, 24 for a 5 × 5 and 48 for a 7 × 7. Add a few extra and Shuffle mixes them in for variety.",
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
      "Make a free PlayStation State of Play bingo card in seconds. Use ready-made predictions or your own, then share one link with your chat.",
    heading: "PlayStation State of Play Bingo Card Maker",
    intro:
      "Build a State of Play bingo card from your own predictions or ours, then share a single link so your chat can mark off squares during the show.",
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
      "Show runs over 30 minutes",
    ],
    sections: [
      {
        heading: "What is State of Play bingo?",
        paragraphs: [
          "State of Play is PlayStation's online showcase for new games, trailers and release dates across PS5 and PS VR2. State of Play bingo makes the wait more fun: fill a grid with your predictions before the show, then mark each one off as it happens. Get a full row, column or diagonal to win.",
          "Every State of Play is a little different. Some are short updates on a handful of games, others are long showcases full of first-party and third-party reveals, so a good card mixes safe bets with a few wild guesses.",
        ],
      },
      {
        heading: "How to play State of Play bingo with your chat",
        paragraphs: [
          "Add predictions, choose a board size and click Create my card. You'll get a short link that everyone can open, whether you post it in Twitch chat, Discord or a group chat. Each person marks their own card in the browser, with no app or account needed.",
          "Shuffle gives each viewer a different layout of the same predictions, so the race to bingo stays interesting. Streamers can turn on Stream mode to hide the controls and keep a clean board on screen.",
          "Go with 5 × 5 for a typical show, 3 × 3 for a short State of Play, or 7 × 7 for a long one.",
        ],
      },
      {
        heading: "What usually happens in a State of Play",
        paragraphs: [
          "Sony usually announces a State of Play a few days ahead, which gives you time to argue with chat about what to include. The starter predictions above cover the beats that show up across many shows, so you can start there and add your own.",
          "Recurring moments include a headline reveal held for the end of the show, games that are available to play the moment the show ends, new trailers and dates for PlayStation Studios games, and plenty of third-party trailers, from Japanese RPGs to horror. PS VR2 games, PC versions and remakes of older classics come up often too.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the State of Play bingo card maker free?",
        answer:
          "Yes, it's completely free. There's no sign-up, and your viewers don't need an account either.",
      },
      {
        question: "How does my chat get the card?",
        answer:
          "After you create your card, share its link. Anyone who opens it can play along and mark squares as the State of Play goes on.",
      },
      {
        question: "What board size should I use?",
        answer:
          "5 × 5 fits most shows and needs 24 predictions with the free space. A 3 × 3 card needs 8, and a 7 × 7 card needs 48.",
      },
      {
        question: "Does everyone get the same card?",
        answer:
          "Everyone gets the same predictions. Each viewer can press Shuffle to rearrange the squares on their own card.",
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
      "Make a free Xbox Games Showcase bingo card in seconds. Start from ready-made predictions, share one short link with your chat, and play live.",
    heading: "Xbox Games Showcase Bingo Card Maker",
    intro:
      "Make an Xbox Games Showcase bingo card with your predictions or ours, then share one link so everyone can play along during the show.",
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
      "Deep dive on one game after the show",
      "Hardware tease",
      "PC and cloud play mentioned",
      "Sequel to a cult classic",
      "Delay announced",
      "CGI trailer, no gameplay",
      "Developer interview segment",
      "Show runs over an hour",
      "Chat argues about exclusives",
    ],
    sections: [
      {
        heading: "What is Xbox Games Showcase bingo?",
        paragraphs: [
          "The Xbox Games Showcase is Microsoft's big yearly presentation, usually held in June, with new games from Xbox Game Studios, Bethesda, Activision and Blizzard alongside partners from around the world. Xbox Games Showcase bingo turns your predictions into a game: fill a grid before the show and mark off each one as it's announced.",
          "With so many studios under one roof, there's a lot to predict, from new entries in long-running series to surprise reveals from studios that have been quiet for years.",
        ],
      },
      {
        heading: "How to play Xbox Games Showcase bingo with your chat",
        paragraphs: [
          "Add your predictions, choose a board size and click Create my card. Share the short link in Twitch chat, Discord or anywhere else, and everyone gets the same predictions to mark off on their own screen. Nobody needs to install anything or create an account.",
          "Shuffle lets each viewer rearrange their squares so bingo doesn't land for everyone at once. Turn on Stream mode to hide the buttons when the card is on your stream.",
          "The showcase is usually a long show, so a 5 × 5 card works well and a 7 × 7 card is a good challenge.",
        ],
      },
      {
        heading: "What usually happens in an Xbox Games Showcase",
        paragraphs: [
          "The showcase tends to open with a major reveal and end with one too, and it's often followed by a longer deep dive into a single game. Expect plenty of games launching on Game Pass, release dates for games announced in previous years, and \"available today\" surprises.",
          "Because Xbox now publishes some of its games on other platforms too, which games come to PlayStation, PC and the cloud is part of the conversation. Big franchises like Halo, Gears of War, Forza, Call of Duty, Fallout and The Elder Scrolls are always good squares, whether or not they appear.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the Xbox Games Showcase bingo card maker free?",
        answer:
          "Yes. It's free to make and share cards, and there's nothing for you or your viewers to sign up for.",
      },
      {
        question: "How do I share my card with my stream?",
        answer:
          "Create your card and share its link in chat. Each viewer opens the card in their browser and marks their own squares.",
      },
      {
        question: "How many predictions do I need?",
        answer:
          "With a free space: 8 for 3 × 3, 24 for 5 × 5 and 48 for 7 × 7. Extra predictions get mixed in when you shuffle.",
      },
      {
        question: "Can I use the same card for the deep dive after the showcase?",
        answer:
          "Sure. Your card stays playable, so you can keep marking squares through any follow-up show.",
      },
      {
        question: "Is this site affiliated with Xbox or Microsoft?",
        answer:
          "No. Video Game Bingo is fan-made and isn't affiliated with or endorsed by Microsoft.",
      },
    ],
    updated: "2026-10-13",
  },
];

export const getEvent = (slug: string) =>
  EVENTS.find((event) => event.slug === slug);

export const getEventForTheme = (themeKey: ThemeKey) =>
  EVENTS.find((event) => event.themeKey === themeKey);
