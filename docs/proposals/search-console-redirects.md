# Plan: Search Console "not indexed" report

**Status:** Investigation plan, ready to work through
**Goal:** Confirm that the pages Google reports as "not indexed" are ones we never wanted indexed, fix anything that isn't, and stop the Search Console emails.

This plan is written for whoever picks it up next, agent or human. Work it in order. Each part says what to do, what you should see, and what to do if you see something else.

---

## 1. What we know so far

On 2026-10-22 the developer exported the **Pages** report from Google Search Console (Indexing → Pages → Export). The export has counts only, no URLs. This is everything it contained:

**Chart** (pages per day)

| Date | Not indexed | Indexed | Impressions |
|---|---|---|---|
| 2026-10-11 | 5 | 1 | 0 |
| 2026-10-12 | 6 | 6 | 0 |
| 2026-10-13 | 6 | 6 | 2 |
| 2026-10-14 | 6 | 6 | 2 |
| 2026-10-15 | 6 | 6 | 2 |

**Reasons pages aren't indexed**

| Reason | Source | Pages |
|---|---|---|
| Page with redirect | Website | 4 |
| Redirect error | Website | 2 |
| Crawled, currently not indexed | Google systems | 0 |

Non-critical issues: none.

**What this means**

- **Indexed: 6.** The sitemap (`src/app/sitemap.ts`) lists 5 URLs: the home page and the four event pages. So all five are most likely indexed, plus one URL we didn't submit. Part A finds out which.
- **Page with redirect: 4. Not an error.** This is Google's label for a URL that sends the visitor somewhere else. It is the correct outcome for every redirect the site makes on purpose (section 2). Nothing to fix unless one of the four is a page that should be indexed.
- **Redirect error: 2. A real error.** Google reports this when a redirect loops, has too many hops, or ends at a URL over roughly 2,000 characters. Whether it matters depends on which URLs they are. Parts A and B find out.

**Search Console property:** a Domain property for `videogamebingo.com`, so Google also tests `http://` and `www.` versions of every URL. Those must redirect to `https://videogamebingo.com/...`, and each one Google tests shows up as "Page with redirect".

## 2. Every redirect the site makes on purpose

Use this list to classify each URL Google reports.

| From | To | Where it's set | Expected label |
|---|---|---|---|
| `http://videogamebingo.com/...` | `https://videogamebingo.com/...` | Vercel, automatic | Page with redirect |
| `https://www.videogamebingo.com/...` | `https://videogamebingo.com/...` | Vercel domain settings (confirm in Part B) | Page with redirect |
| `/?s=<old card data>` | `/legacy?s=<old card data>` | `next.config.ts`, temporary (307) | Page with redirect |
| `/legacy?s=<old card data>` | `/c/<encoded card>`, or `/` if unreadable | `src/app/legacy/route.ts`, temporary (307) | Page with redirect |
| `/c/<unreadable card>` | `/` | `src/app/c/[card]/page.tsx` | Page with redirect |
| `/anything/` (trailing slash) | `/anything` | Next.js default, permanent (308) | Page with redirect |

Card pages (`/s/...` and `/c/...`) are `noindex` on purpose (`src/app/lib/cardMetadata.ts`). Google not indexing them, by whatever label, is what we want.

**Why old card links are the prime suspect for "Redirect error".** Links shared before the redesign look like `/?s=<base64>` and were long. Measured on 2026-10-22 with the Nintendo Direct starter predictions:

| Card | Old `/?s=` link | After first hop (`/legacy?s=`) | Final `/c/` link |
|---|---|---|---|
| 3 × 3, 8 predictions | 930 chars | 936 chars | 296 chars |
| 5 × 5, 24 predictions | 1,730 chars | 1,736 chars | 580 chars |
| 7 × 7, 48 predictions | 3,242 chars | 3,248 chars | 809 chars |

A 7 × 7 old link is over Google's limit before it even redirects, and Google's URL Inspection tool refuses anything over 2,048 characters. If someone posted one of those on Reddit, Discord or X, Google found it and can't follow it. That is harmless: the destination is a `noindex` card page.

## 3. Part A: get the URLs from Search Console (developer)

The export doesn't include URLs, so this part needs a browser signed in to Search Console.

1. Open https://search.google.com/search-console and pick the **videogamebingo.com** property (the Domain property, not a URL-prefix one).
2. In the left menu under **Indexing**, click **Pages**.
3. Scroll down to **Why pages aren't indexed**. Click the row **Redirect error**. You should see a table with 2 URLs. Copy both.
4. Click **Pages** in the left menu again, then click the row **Page with redirect**. You should see a table with 4 URLs. Copy all four.
5. Scroll back up and click **View data about indexed pages**. You should see 6 URLs. Copy all six.
6. Paste all 12 URLs into the chat, grouped by which table they came from.

**If a table shows "No data" or fewer rows than the count:** the report sometimes lags a day or two behind the summary. Note what you see and move on; the counts in section 1 are still valid.

## 4. Part B: check the live redirects (developer runs, agent reads)

The governance rules stop the agent from fetching the live site, and the governance hook blocks any command whose text names a network tool, so the developer runs these in their own terminal and pastes the output. Each command prints the status line and `location` header of every hop. (`-sIL` means: quiet, headers only, follow redirects.)

1. Protocol and www redirects:

   ```
   curl -sIL http://videogamebingo.com/ | grep -i -E '^(HTTP|location)'
   curl -sIL https://www.videogamebingo.com/ | grep -i -E '^(HTTP|location)'
   curl -sIL http://www.videogamebingo.com/ | grep -i -E '^(HTTP|location)'
   ```

   **Expected:** each prints one or two redirect lines (`HTTP/2 301`, `307` or `308`, each followed by a `location:` line) and ends with `HTTP/2 200`. The last `location:` should be `https://videogamebingo.com/`.

   **If `www` prints a DNS or connection error:** `www` isn't set up at all. Google would then report it as a server error, not a redirect error, so it isn't the cause of this report, but it should still be fixed: in the Vercel dashboard, open the project → Settings → Domains, add `www.videogamebingo.com`, and choose "Redirect to videogamebingo.com". Vercel shows which DNS record to add at the registrar.

   **If `www` prints more than two redirect lines or the same `location` twice:** that is a redirect loop, and it is the "Redirect error". Usual cause: the registrar has a "forward www to apex" rule and Vercel has "redirect apex to www", or the other way round. Pick one place for the redirect (Vercel is simpler) and remove the other.

2. An old-style card link. This one encodes an 8-prediction 3 × 3 Nintendo Direct card the old way:

   ```
   curl -sI 'https://videogamebingo.com/?s=JTdCJTIyZ3JpZFNpemUlMjIlM0EzJTJDJTIyb3B0aW9ucyUyMiUzQSU1QiUyMmElMjIlMkMlMjJiJTIyJTJDJTIyYyUyMiUyQyUyMmQlMjIlMkMlMjJlJTIyJTJDJTIyZiUyMiUyQyUyMmclMjIlMkMlMjJoJTIyJTVEJTJDJTIyaW5jbHVkZUZyZWVTcGFjZSUyMiUzQXRydWUlMkMlMjJib2FyZFRoZW1lJTIyJTNBJTdCJTIydGhlbWVOYW1lJTIyJTNBJTIyTmludGVuZG8lMjBEaXJlY3QlMjIlN0QlN0Q=' | grep -i -E '^(HTTP|location)'
   ```

   **Expected:** `HTTP/2 307` and a `location:` line pointing at `/legacy?s=...`. Then run the same `curl -sI '<that location>'` on the `/legacy` URL; expected `HTTP/2 307` with a `location:` of `https://videogamebingo.com/c/<short encoded string>`. Finally `curl -s '<the /c/ URL>' | grep -o 'noindex'` should print `noindex`.

3. For each URL from Part A, run `curl -sIL '<url>' | grep -i -E '^(HTTP|location)'` and match the chain against the table in section 2.

## 5. Part C: decide what to fix (agent, from the pasted results)

Classify each "Redirect error" URL:

| What it is | Action |
|---|---|
| Old `/?s=` card link, or a `/legacy` or `/c/` URL | **No fix needed.** It leads to a `noindex` card page. Note it in this file and move on. |
| `www.` or `http://` variant with a loop or a DNS problem | Fix in Vercel or at the registrar as described in Part B. No code change. |
| Any home or event page URL | Something is wrong with the deployment. Stop and show the developer the full output from Part B before changing anything. |

Classify each "Page with redirect" URL the same way. Every one should match a row in the section 2 table. If one doesn't, it's a redirect we don't know about: find where it comes from before doing anything else.

**For the 6th indexed URL:** if it's a card page (`/s/` or `/c/`), it was indexed before `noindex` existed and will drop out on its next crawl. In Search Console, paste it into the URL Inspection box at the top and click **Request indexing** to speed that up. If it's `/sitemap.xml`, `/robots.txt` or an image, ignore it. Anything else, note it here and ask.

## 6. Part D: one small code change (agent), recommended either way

The two old-link redirects are temporary (307), so Google keeps re-crawling the old URLs and keeps listing them. Making them permanent (308) tells Google to drop the old URLs over time. It is safe because each old link always maps to the same destination, so a browser caching the redirect can never be wrong.

1. In `next.config.ts`, change `permanent: false` to `permanent: true` on the `/` → `/legacy` redirect.
2. In `src/app/legacy/route.ts`, change the last line to pass a 308 status:

   ```ts
   return NextResponse.redirect(new URL(target, request.url), 308);
   ```

3. Run `npx tsc --noEmit`. Expected: no output.
4. Developer runs `npm run rebuild`. Expected: the build finishes with `/` shown as static (○).
5. After deploy, the developer re-runs the old-link command from Part B step 2. Expected: `HTTP/2 308` on both hops instead of `307`, same `location` values.

Leave the `/c/<unreadable>` → `/` redirect alone. It uses Next's `redirect()`, which is 307, and that is right for a fallback.

**Not recommended:** blocking `/c/`, `/s/`, `/legacy` or `/?s=` in `robots.ts`. A blocked URL can still be indexed from outside links as "Indexed, though blocked by robots.txt", and Google can't see the `noindex` on a page it isn't allowed to fetch. The current `noindex` approach is the right one.

## 7. Part E: close out

1. Update `docs/google-setup.md`, section "Google Search Console": add a short "Known not-indexed URLs" note listing what the redirect reports contain and why they're expected. Update **Last confirmed** to the date.
2. Add the outcome to the end of this file under a "Result" heading: which URLs were which, and what was changed.
3. If a Vercel or DNS change was made, record it in `docs/google-setup.md` too, since it affects how Google reaches the site.
4. In Search Console, open an issue row and click **Validate fix** only if something was actually changed for it. For old card links, don't validate; Google reclassifies them on its own.

**About the emails:** Search Console emails arrive when it detects a *new* reason, not on a schedule. Once the URLs are confirmed as expected redirects, no further emails come unless something new breaks.
