# Google setup: current state

What is configured today in Google Tag Manager, Google Analytics 4, Google Search Console and Bing Webmaster Tools for videogamebingo.com. The `google-updates` skill compares the code against this file to decide what needs updating.

**Keep this file current.** Whenever the developer confirms a change in one of these dashboards, update the matching section here in the same branch as the code change.

**Last confirmed:** 2026-10-13

---

## Google Tag Manager

- Container: the one whose ID is in the `NEXT_PUBLIC_GTM_ID` environment variable (set in Vercel).
- Loads only after a visitor accepts cookies (`src/app/components/CookieConsent/index.tsx`). Ad consent signals are always denied; analytics follows the visitor's choice (`src/app/lib/consent.ts`).
- Built-in variable **Event** is enabled.

**Tags**

| Tag | Type | Fires on |
|---|---|---|
| GA4 - Google Tag | Google Tag, the GA4 measurement ID | Initialization - All Pages |
| GA4 - Site events | Google Analytics: GA4 Event, Event Name `{{Event}}` | Trigger "Site events" |

**Trigger "Site events"** (Custom Event, "Use regex matching" on, All Custom Events):

```
^(generate_card|share_card|card_link_fallback|card_not_found|card_load_error|stream_mode_toggle|shuffle_board|support_click|use_starter_predictions|soft_colors_toggle|color_mode_change|bingo)$
```

**Data Layer Variables**, each also an Event Parameter on "GA4 - Site events" with the same name:

| Variable | Data Layer Variable Name |
|---|---|
| dlv - theme | `theme` |
| dlv - grid_size | `grid_size` |
| dlv - free_space | `free_space` |
| dlv - option_count | `option_count` |
| dlv - reason | `reason` |
| dlv - method | `method` |
| dlv - outcome | `outcome` |
| dlv - link_type | `link_type` |
| dlv - enabled | `enabled` |
| dlv - lines | `lines` |
| dlv - mode | `mode` |

## Events the code sends

| Event | Parameters | Sent from |
|---|---|---|
| `generate_card` | `theme`, `grid_size`, `free_space`, `option_count` | `src/app/components/CardMaker/index.tsx` |
| `card_link_fallback` | `reason` | `src/app/components/CardMaker/index.tsx` |
| `use_starter_predictions` | `theme` | `src/app/components/CardMaker/Options/index.tsx` |
| `support_click` | none | `src/app/components/CardMaker/index.tsx` |
| `share_card` | `method`, `outcome`, `link_type` | `src/app/components/Bingo/index.tsx` |
| `stream_mode_toggle` | `enabled` | `src/app/components/Bingo/index.tsx` |
| `soft_colors_toggle` | `enabled` | `src/app/components/Bingo/index.tsx` |
| `shuffle_board` | none | `src/app/components/Bingo/index.tsx` |
| `bingo` | `lines` | `src/app/components/Bingo/index.tsx` |
| `color_mode_change` | `mode` | `src/app/lib/colorMode.ts` |
| `card_not_found` | none | `src/app/s/[id]/not-found.tsx` (via `TrackEvent`) |
| `card_load_error` | none | `src/app/s/[id]/error.tsx` (via `TrackEvent`) |

## Google Analytics 4

- Property and web stream for `videogamebingo.com`. Enhanced measurement on, including "Page changes based on browser history events".
- **Event-scoped custom dimensions:** `theme`, `grid_size`, `free_space`, `option_count`, `reason`, `method`, `outcome`, `link_type`, `enabled`, `lines` ("Bingo lines"), `mode` ("Color mode").
- Linked to Search Console.

## Google Search Console

- **Domain property** `videogamebingo.com`, verified by DNS TXT record.
- **Sitemap** `https://videogamebingo.com/sitemap.xml` submitted. It's generated from `src/app/sitemap.ts` and `EVENTS` in `src/app/lib/events.ts`, so new event pages appear in it automatically; it never needs resubmitting.
- **Indexing requested** (2026-10-13):
  - `https://videogamebingo.com/`
  - `https://videogamebingo.com/game-awards-bingo`
  - `https://videogamebingo.com/nintendo-direct-bingo`
  - `https://videogamebingo.com/state-of-play-bingo`
  - `https://videogamebingo.com/xbox-games-showcase-bingo`
- Card pages (`/s/...`, `/c/...`) are `noindex` on purpose and are never submitted.

## Bing Webmaster Tools

- Imported from Google Search Console, including the sitemap.

## Share images

- Event and home page images: `src/app/[event]/opengraph-image.tsx` and `src/app/opengraph-image.tsx`, drawn by `src/app/lib/ogImage.tsx`.
- Shared cards use their event's image through `src/app/lib/cardMetadata.ts`.
- Next adds a hash to the image URL based only on the text of each `opengraph-image.tsx` file, not on `ogImage.tsx`. A design change in `ogImage.tsx` keeps the same URLs, so apps that cached the old image (Discord, Bluesky, X) may keep showing it for a while. On 2026-10-13 this cleared up quickly without extra work.

## Scheduled shows

Events with an `eventDate` in `src/app/lib/events.ts` keep their cards until a week after the show (`supabase/migrations/002_event_dates.sql`). Not a Google setting, but it's checked in the same review.

| Event | eventDate |
|---|---|
| The Game Awards | 2026-12-10 |
