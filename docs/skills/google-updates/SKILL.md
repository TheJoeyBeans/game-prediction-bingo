---
name: google-updates
description: Decide whether recent changes to videogamebingo.com need updates in Google Tag Manager, Google Analytics 4, Google Search Console or Bing Webmaster Tools, then walk the developer through each one step by step. Use after adding or renaming pages, adding or changing analytics events or their parameters, changing share images, announcing a show date, before or after a deploy, or whenever the developer asks whether Google needs updating.
---

# Google updates for videogamebingo.com

You check what changed in the code, compare it with what's configured in Google's tools, and give the developer a complete, ordered to-do list with every click spelled out. You never touch the dashboards yourself: the developer does all of that. Your job is to work out exactly what's needed and make it easy.

The current configuration is recorded in **`docs/google-setup.md`**. Read it first, every time.

## How the developer likes to work

- **Write every step out in full, every time.** Never say "do the same as before" or "see step 3 above". If a step repeats an earlier one, repeat its instructions. The developer works down the list without scrolling back.
- **Number everything and order it**: parts, then steps. Put the exact text to paste (regexes, URLs, variable names) in code blocks.
- **Say what they should see** after each step, so they can confirm it worked.
- **Only list what's actually needed.** If nothing needs updating, say so plainly and stop.
- After they confirm a step, **update `docs/google-setup.md`** to match, in the same branch.

## Step 1: Find what changed

Work out the comparison point: usually `main`, or the commit the developer says is live in production. Then run:

```
git log --oneline <base>..HEAD
git diff --stat <base>..HEAD
```

Collect the current facts from the code:

```
# Analytics events and their parameters
git grep -n -A6 "sendGTMEvent(" -- src
git grep -h -o '<TrackEvent event="[a-z_]*"' -- src

# Public landing pages
git grep -h -o 'slug: "[a-z-]*"' -- src/app/lib/events.ts

# Share image files
git diff --stat <base>..HEAD -- src/app/opengraph-image.tsx "src/app/[event]/opengraph-image.tsx" src/app/lib/ogImage.tsx src/app/lib/cardMetadata.ts

# Show dates
git grep -n "eventDate:" -- src/app/lib/events.ts
```

Compare these with the tables in `docs/google-setup.md`.

## Step 2: Decide what each change needs

| What changed in the code | What needs updating |
|---|---|
| A **new event name** in `sendGTMEvent` or `TrackEvent` | Tag Manager: add it to the "Site events" trigger regex, test in Preview, publish (Walkthrough A). Also add it to the event list in `README.md` |
| A **new parameter** on any event | Tag Manager: new Data Layer Variable and a new parameter on "GA4 - Site events", publish (Walkthrough B). GA4: new custom dimension (Walkthrough C) |
| An event **renamed or removed** | Tag Manager: update the regex, remove unused variables and parameters, publish. Mention that GA4 history keeps the old name |
| A **new landing page** (new entry in `EVENTS`, or any new public page) | Search Console: request indexing for the new URL (Walkthrough D). The sitemap updates itself; don't resubmit it |
| A landing page's **URL changed or removed** | Add a redirect in `next.config.ts` from the old URL first. Then request indexing for the new URL (Walkthrough D) |
| **Big content change** on an existing landing page (title, heading, description, predictions) | Bump that event's `updated` date in `events.ts`. Optionally request indexing for it (Walkthrough D) |
| **Share image design changed** (`ogImage.tsx`) | Usually nothing; cached previews refresh on their own. If a stale preview matters, see Walkthrough F |
| A **show date announced** | Add `eventDate: "YYYY-MM-DD"` to that event in `events.ts` and deploy. Not a Google step, but confirm it in the same review |
| **Domain or site URL changed** | Stop and talk it through with the developer: new Search Console property, GA4 stream URL, sitemap, Bing |
| Styling, layout, copy outside landing pages, server logic | Nothing |

Card pages (`/s/...` and `/c/...`) are deliberately `noindex`. Never suggest submitting them.

## Step 3: Give the to-do list

Present only the walkthroughs that apply, in this order: Tag Manager, GA4, Search Console, Bing, then checks. Fill in the real values (event names, parameters, URLs) and paste the **full, current** regex built from the code, not just the new piece.

The developer pushes and opens PRs themselves; the sandbox can't reach GitHub. Dashboard changes for **new** events only start receiving data once the code that sends them is live, but they're harmless to add first.

---

## Walkthrough A: Add or change events in Tag Manager

1. Go to **tagmanager.google.com** and open the container.
2. Open **Triggers → "Site events"**.
3. Replace the **Event name** with the full regex, listing every event the code sends:
   ```
   ^(<event_one>|<event_two>|...)$
   ```
4. Check **"Use regex matching"** is still ticked, then **Save**.
5. Test in Preview (Walkthrough E).
6. **Submit → Publish** with a version name describing the change. Until it's published, real visitors send nothing new.

## Walkthrough B: Add a parameter in Tag Manager

For each new parameter:

1. **Variables → User-Defined Variables → New → Variable Configuration → Data Layer Variable.**
2. **Data Layer Variable Name:** the parameter's exact name, e.g. `lines`.
3. Name the variable **`dlv - <name>`**, e.g. `dlv - lines`, then **Save**.

Then add them to the event tag:

4. **Tags → "GA4 - Site events" → Event Parameters → Add parameter.**
5. For each one: parameter name `<name>`, value `{{dlv - <name>}}`. Pick the value with the variable picker rather than typing it.
6. **Save**, test in Preview (Walkthrough E), then **Submit → Publish**.

## Walkthrough C: Add a custom dimension in GA4

Without this, the parameter is recorded but doesn't appear in standard reports.

1. Go to **analytics.google.com → Admin → Custom definitions → Create custom dimension.**
2. **Dimension name:** a readable label, e.g. "Bingo lines".
3. **Scope:** Event.
4. **Event parameter:** the exact name, e.g. `lines`.
5. **Save.** Data shows in reports within 24–48 hours; Realtime shows it sooner.

## Walkthrough D: Request indexing in Search Console

1. Go to **search.google.com/search-console** and select **videogamebingo.com**.
2. Paste the full URL into the **"Inspect any URL"** bar at the top, e.g.
   ```
   https://videogamebingo.com/<slug>
   ```
3. Wait for the check. If it says **"URL is not on Google"** (or the page changed a lot), click **Request indexing** and wait a minute or two.
4. To confirm Google can reach it, click **Test live URL**: it should say the page is available.
5. Repeat for each URL, soonest show first.

Indexing usually takes a few days to two weeks. The **Performance** report shows searches for the page after 2–4 weeks.

If Sitemaps ever shows **"Couldn't fetch"**: it's common right after submitting and usually clears within a day. If it lasts longer, check that `https://videogamebingo.com/sitemap.xml` and `https://videogamebingo.com/robots.txt` load in a private window, then remove the sitemap (⋮ menu) and submit `sitemap.xml` again.

## Walkthrough E: Test in Tag Manager Preview

1. In Tag Manager, click **Preview**, enter `https://videogamebingo.com` and **Connect**. Use a browser profile **without an ad blocker**.
2. In the window that opens, click **Accept** on the cookie banner.
3. Do the actions that send the new or changed events. Name them specifically, e.g. "Mark squares until you get a bingo".
4. In Tag Assistant, click each event in the left timeline. **"GA4 - Site events"** should be under *Tags Fired*, and under **Variables** each `dlv - …` for that event should have a value.
5. Optional: GA4 → **Reports → Realtime** should show the events within about a minute.

## Walkthrough F: Force fresh share image previews (only if needed)

Apps like Discord cache preview images by URL, and Next only changes the URL when the text of an `opengraph-image.tsx` file changes, not when `src/app/lib/ogImage.tsx` changes. Only do this if a stale preview is actually a problem. Waiting usually works.

1. Edit one comment line in **both** `src/app/opengraph-image.tsx` and `src/app/[event]/opengraph-image.tsx`, e.g. `// Share image design v3`. This gives event and home page images new URLs.
2. In `src/app/lib/cardMetadata.ts`, add `?v=<n>` to the image URL so shared cards get new URLs too.
3. Deploy. To test in Discord without its page cache, post the link with something harmless on the end, e.g. `?x=1`.

Messages already posted keep their old preview; that can't be refreshed.

## Bing Webmaster Tools

The site was imported from Search Console, so Bing picks up new pages from the sitemap. It only needs attention if the domain changes or the developer wants to request indexing there too (Bing → **URL Inspection → Request indexing**).
