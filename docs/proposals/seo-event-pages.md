# Proposal: SEO and event landing pages

**Status:** Draft for review
**Goal:** When a streamer searches "Nintendo Direct bingo card" (or the same for any showcase) shortly before a show, videogamebingo.com is one of the first results, and they have a card ready to share with chat within seconds of landing.

---

## 1. Where we are today

**On the site**

- **One page targets every event.** The home page's title ("Video Game Prediction Bingo"), heading ("Prediction bingo for every showcase") and description cover every event, so no page is a strong match for any single search.
- **The `keywords` meta tag** in `layout.tsx` lists about 30 phrases. Google has ignored this tag for years, so it does nothing.
- **Every page inherits `canonical: "/"`** from the root layout. That's harmless for `/c/` and `/s/` card pages, which are `noindex`. But any new page that doesn't override it would tell Google "I'm a duplicate of the home page" and never rank.
- **The sitemap lists only the home page.**
- **The share image is a placeholder.** `openGraph.images` points at `favicon.ico`, and the code has a `TODO`. Links shared on Discord, X and in Google results show no real preview.
- **The home page renders on the server for every request.** It reads `?s=` to redirect very old links, which forces it to render per request instead of being built once as a static page. That makes it slower than it needs to be, and speed is a ranking signal.

**In search results** (sampled 2026-10-13 with US results from a search API)

| Search | What ranks |
|---|---|
| nintendo direct bingo card | One-off cards in old news posts (Nintendo Life 2021, Nintendo Wire 2019/2021, Final Weapon 2023), spammy template pages, generic bingo generators |
| state of play bingo card maker | Nothing gaming-related. Generic generators (Adobe Express, Canva) and a "State of the Union" bingo |
| game awards prediction bingo card generator | Generic generators, a university watch-party event page |
| xbox games showcase bingo card | A 2024 Pure Xbox article pointing to fan cards on Reddit and X, plus unrelated "Microsoft Bingo" app pages |

**What that means:** no one has a dedicated, current, working tool page per event. The competition is old articles and generic generators, which is beatable with pages built for exactly these searches. The publications that post a card every event (Nintendo Life, Nintendo Wire, Pure Xbox, Final Weapon) are also the best candidates for links to this site.

## 2. Events in scope

| Event | Theme today | Page in this phase? |
|---|---|---|
| Nintendo Direct | Ready (logo, picker) | **Yes** |
| PlayStation State of Play | Ready | **Yes** |
| Xbox Games Showcase | Ready | **Yes** |
| The Game Awards | Exists, hidden from the picker | **Yes**, with its board finished in the same branch (logo, black-and-gold colors) |
| Summer Game Fest | Exists, hidden from the picker | When its board is finished |
| Gamescom Opening Night Live | Doesn't exist | When its board is finished |

All six go into one event list now (section 4). Each has a `ready` flag, so finishing a board automatically adds its page, sitemap entry and links, with no SEO rework.

## 3. URLs

| Event | URL |
|---|---|
| Nintendo Direct | `/nintendo-direct-bingo` |
| PlayStation State of Play | `/state-of-play-bingo` |
| Xbox Games Showcase | `/xbox-games-showcase-bingo` |
| The Game Awards | `/game-awards-bingo` |
| Summer Game Fest | `/summer-game-fest-bingo` |
| Gamescom Opening Night Live | `/gamescom-opening-night-live-bingo` |

These are short, readable, and contain the exact words people search. Dates stay out of URLs, so each page keeps its ranking from one show to the next instead of starting over.

## 4. The event list (one source of truth)

New file: `src/app/lib/events.ts`. Each event has:

| Field | Example (Nintendo Direct) | Used for |
|---|---|---|
| `slug` | `nintendo-direct-bingo` | URL |
| `themeKey` | `nintendoDirect` | Preselected theme |
| `ready` | `true` | Whether the page exists |
| `name` | "Nintendo Direct" | Headings, links |
| `title` | "Nintendo Direct Bingo Card Maker" | `<title>`, ≤ 60 characters with the site name |
| `description` | "Make a free Nintendo Direct bingo card in seconds…" | Meta description, ≤ 155 characters |
| `heading` | "Nintendo Direct Bingo Card Maker" | The page's `<h1>` |
| `intro` | 1–2 sentences | Under the heading |
| `starterPredictions` | ~30 predictions | "Use these predictions" button (section 5.2) |
| `content` | ~400–700 words | Text below the card maker (section 5.3) |
| `faq` | 4–6 questions and answers | FAQ section and structured data |

The pages, sitemap, navigation links and share images are all generated from this list.

## 5. Event landing pages

### 5.1 Route and rendering

New route: `src/app/[event]/page.tsx`.

- `generateStaticParams()` returns the slugs of `ready` events, so each page is **built once at deploy time** and served as static HTML. That's the fastest possible page and costs no server work per visit.
- `dynamicParams = false`, so any other slug at the top level returns 404 instead of rendering.
- The page renders the existing `CardMaker` with the event's theme preselected. The tool comes first, then the written content below it. Streamers can make a card without scrolling, and Google still sees substantial text.

### 5.2 Starter predictions

A **"Use these predictions"** button fills the card with the event's ~30 starter predictions, which people can then edit, remove or add to. A streamer arriving an hour before a show can have a card in about 10 seconds.

- **The predictions are evergreen, not tied to one show.** For example: "A new 3D Mario is announced", "Shadow drop during the show", "A remaster nobody asked for". Specific rumors go stale, and a page full of last show's rumors looks abandoned.
- I'll draft them. **You should edit them**, because you know what your audience finds funny.
- Analytics: a `use_starter_predictions` event with the event name.

### 5.3 Written content (below the card maker)

Unique for each event, never one template with the name swapped in, because Google treats near-duplicate pages as low quality. Roughly:

1. **What [event] bingo is.** A short explanation, and why it's fun during the stream.
2. **How to play with your chat.** Make a card, share the short link, turn on stream mode. This targets streamers directly.
3. **What usually happens at [event].** Recurring patterns that make good squares. This is the part that makes each page genuinely different.
4. **FAQ.** For example: "Is it free?", "Can my chat play along?", "How long do cards last?", "Can I make a 3×3 or 7×7 card?"
5. **Links to the other event pages.**

### 5.4 Metadata for each page

- `title`: e.g. "Nintendo Direct Bingo Card Maker | Video Game Bingo"
- `description`: from the event list
- `alternates.canonical`: **the page's own URL**. This overrides the inherited `/`.
- `openGraph` and `twitter`: the event's title, description and share image (section 7), with `summary_large_image` for X.

## 6. Structured data

Added to each event page as JSON-LD:

- **`WebApplication`:** name, URL, description, `applicationCategory: "GameApplication"`, and `offers` with price 0 (free).
- **`FAQPage`:** the FAQ from section 5.3. **Google has shown FAQ rich results only for government and health sites since 2023**, so this won't produce expandable FAQs in Google results. It still helps search engines and AI answer features understand the page, and it costs nothing.
- **`BreadcrumbList`:** Home → Nintendo Direct Bingo.

The home page keeps its existing `WebApplication` data.

## 7. Share images

Generated by Next.js at build time with `ImageResponse` from `next/og`, which is built in, so no new dependency:

- **One 1200×630 image per event**: event name, "Prediction Bingo", the event's colors, and a stylized bingo grid. It's used on the event page and in Google, Discord and X previews.
- **A site-wide image for the home page**, replacing the `favicon.ico` placeholder.
- **Shared cards (`/s/` and `/c/`) use their event's image.** Every link a streamer drops in Discord then shows a branded preview, which is free advertising. It's chosen by the card's theme, so there's no per-card image generation and no extra server cost.

## 8. Technical changes

| Change | Why |
|---|---|
| Sitemap generated from the event list, with a fixed `lastModified` per page that's updated when content changes | Google discovers every page, and dates only change when something did |
| Remove the inherited `canonical: "/"` from the root layout; set it per page | Prevents event pages from being treated as duplicates of the home page |
| Remove the `keywords` meta tag and the `KEYWORDS` list | Unused by Google |
| Move the old `/?s=` link redirect out of the home page: a `next.config.ts` redirect sends `/?s=…` to a small `/legacy` route that converts and redirects as before | The home page becomes static and much faster, and old links still work |
| Home page becomes a hub: keeps the general card maker, adds a section linking to each event page | Links the event pages from the strongest page on the site |
| Event links in the footer of the home page and event pages | Every page links to every event page |
| Check page speed with Lighthouse after the changes | Confirms the pages are fast on phones, which is what Google measures |

## 9. Off-site work (yours)

These matter as much as anything on the site.

1. **Google Search Console.** Verify `videogamebingo.com` (the DNS method covers the whole domain), submit `https://videogamebingo.com/sitemap.xml`, and link it to GA4 (in GA4: Admin → Product links → Search Console). That shows exactly which searches bring visitors in.
2. **Bing Webmaster Tools.** Import the site straight from Search Console in a couple of clicks. Bing also supplies results to DuckDuckGo, Yahoo, and ChatGPT's search.
3. **Before each show:** in Search Console, use **URL Inspection → Request indexing** on that event's page a week or two ahead, so Google has the latest version.
4. **Links from where streamers already are:**
   - **Publications** that post a bingo card each event (Nintendo Life, Nintendo Wire, Pure Xbox, Final Weapon): offer the tool as a way for their readers to make their own cards.
   - **Reddit:** event megathreads on r/NintendoSwitch, r/PS5, r/XboxSeriesX and r/Games. Check each subreddit's self-promotion rules first.
   - **Streamers:** a few small streamers using it on stream can create a steady stream of new links in chat.

## 10. Implementation steps

Each step ends with a check we do together, like before.

| # | Step | Who | How we verify |
|---|---|---|---|
| 1 | Event list with the 3 ready events and drafted copy (titles, descriptions, starter predictions, content, FAQ) | Claude drafts, **you edit** | You review the copy in the file |
| 2 | Canonical fix, remove `keywords`, move the old `/?s=` redirect so the home page is static | Claude | Build shows `/` as static (○), and an old `/?s=` link still redirects correctly |
| 3 | `/[event]` pages with the card maker, "Use these predictions" button, content and FAQ | Claude | Visit each page; the button fills the card; `/not-an-event` returns 404 |
| 4 | Metadata and structured data for each page | Claude | View source for title, description, canonical and JSON-LD; check with Google's Rich Results Test |
| 5 | Share images: site-wide, per event, and on shared cards | Claude | Open each image URL; paste a page into Discord or a share-preview checker |
| 6 | Sitemap from the event list; home page links to events; footer links | Claude | `/sitemap.xml` lists all ready pages; every page links to every event page |
| 7 | Lighthouse check and fixes | You run it, Claude fixes | Performance and SEO scores in the 90s on mobile |
| 8 | Deploy: push, preview, PR, merge (asking before each GitHub step) | Both | Pages live on videogamebingo.com |
| 9 | Search Console, Bing, request indexing | **You** | Sitemap shows "Success" in Search Console |
| Later | Boards for The Game Awards (before December), Summer Game Fest and Gamescom ONL; each one's page switches on by setting `ready: true` | Both | Same checks as steps 3–5 for that event |

## 11. Measuring it

- **Search Console → Performance:** which searches show the site, its average position, and click-through rate per page. This is the main measure. Expect the first data 2–4 weeks after the pages go live.
- **GA4 → Reports → Engagement → Landing page:** visits arriving on each event page, and how many go on to `generate_card`.
- **Before and after a show:** search impressions for that event's page should spike in the days before it airs.

**Realistic timeline:** new pages usually take a few weeks to be indexed and a few months to reach a stable ranking. Pages that exist well before a show do much better than pages that appear the day before.

## 12. Open decisions

1. **URLs:** are the slugs in section 3 good? `-bingo` versus `-bingo-card` is a toss-up. I picked the shorter one.
2. **Starter predictions:** I'll draft ~30 per event for you to edit. Do you want to write any yourself?
3. **Home page heading:** keep "Prediction bingo for every showcase", or make it more searchable, such as "Video Game Bingo Card Maker"?
4. **Order after this phase:** I'd do The Game Awards board first, because it's in December. Then Summer Game Fest and Gamescom ONL before next summer.

## 13. Implementation notes

Changes from the plan above, made while building:

- **No `ready` flag.** An event joins `EVENTS` in `src/app/lib/events.ts` only once its theme and copy are finished, and that alone adds its page, sitemap entry, share image and links. Summer Game Fest and Gamescom ONL get entries when their boards are made.
- **No footer links.** The home page has a "Bingo for every showcase" section and each event page has "More showcase bingo", so every page already links to every event page. The footer stays short.
- **New analytics event:** `use_starter_predictions` (parameter `theme`, the event's name). It needs adding to the "Site events" trigger in Tag Manager.
- **Site-wide 404 page** (`src/app/not-found.tsx`), because unknown top-level paths now return 404 through the event route.
