# Project context

Background for anyone (human or agent) working on videogamebingo.com: what the product is for, decisions already made, and how the developer likes to work. CLAUDE.md holds the governance rules; this file is everything else that isn't obvious from the code.

**Keep it current.** When a decision changes or a new one is made, update this file in the same branch.

---

## The product

- **Video Game Bingo** (videogamebingo.com): make a prediction bingo card for a game showcase, share one link, and everyone marks off predictions as the show plays out.
- **Main audience: streamers and their chat.** A streamer makes a card when a show is announced and drops the link in chat; thousands of viewers may open the same card within seconds. Reads are designed for bursts (cached per card), writes are rare.
- **Events with landing pages:** Nintendo Direct, PlayStation State of Play, Xbox Games Showcase, The Game Awards. Summer Game Fest and Gamescom Opening Night Live are planned. Each is an entry in `src/app/lib/events.ts` with a theme in `src/app/lib/constants.ts`.
- **Card lifetime:** anonymous cards are deleted after 7 days without a visit. Events with an announced `eventDate` keep their cards until a week after the show, so people can make cards early. Shows usually come only days after they're announced, which is why 7 days is enough by default.

## Decisions already made

| Decision | Why |
|---|---|
| Sharing never requires an account | Accounts are an identity tool, not abuse protection, and a sign-up wall would kill sharing. Abuse is handled by validation, dedup, rate limits and an origin check |
| Short links are the only links new cards get (`/s/<id>`); old `/c/` and `/?s=` links work forever | Long links were awkward in chat. If saving fails, creation falls back to a `/c/` link so it never breaks |
| Supabase Postgres (free tier), not Redis | User accounts are planned and need relational data, cascades and auth; Supabase includes Auth |
| Cleanup runs on Vercel Cron, not `pg_cron` | The daily API call also keeps the free Supabase project from pausing |
| Card reads cached for 1 hour | Absorbs viewer bursts. Disabling a card takes up to an hour to show, which the developer accepted |
| No ads | Removed in October 2026. Vercel Hobby is for non-commercial use only |
| A Ko-fi link in the footer | The developer accepted the Vercel Hobby risk; they'll move to a paid plan if the site gets traction |
| Light and dark mode follow the system, with a toggle; cards also offer Soft colors and Stream mode in a Display menu | Easier on the eyes for long shows |

## User accounts (next feature)

Not built yet. The agreed rules and the design groundwork are in **`docs/proposals/short-card-urls.md`, section "Designing ahead for user profiles"**:

- Cards linked to a user are never deleted for inactivity.
- A user inactive for **one year** is deleted along with their cards. "Inactive" means no authenticated activity, not "hasn't logged in", since sessions can last months.
- Supabase Auth, with a `profiles` table keyed to `auth.users`; `cards.owner_id` already exists and is null for every card today.
- Twitch sign-in was suggested as a good fit for streamers. Not decided.

Write an implementation proposal in `docs/proposals/` before any code, as was done for short links and SEO.

## How the developer likes to work

- **Proposal first** for anything substantial, then build in numbered steps or parts.
- **Verify before moving on.** After each step or part: say what was done, give the developer exact checks to run, and wait for their results. When the developer says to work through a whole part, do so and summarize at the end.
- **Write every instruction out in full, every time.** Never "see step 3 above" or "do what we did last time". Number the steps, put exact text to paste in code blocks, and say what they should see.
- **Plain language.** No jargon without a short explanation.
- **Recommend, don't survey.** Give a recommendation with the trade-off, then let them decide.
- **Copy style for the site:** invite people to "share it with friends, chat, whoever, and play along live" rather than speaking only to streamers. No claims about show timing or length ("usually held in June", "runs about an hour"). No cringey "what usually happens at…" filler. Never reveal how cards are stored or deleted in user-facing text; for example, the missing-card page says it "may have been removed after a period of inactivity, or the link may be mistyped".

## Tools and environment (for agents)

- **The developer runs these, not you:** `git push`, `git pull`, `git fetch`, every `gh` command, and `npm run build`. The sandbox can't use their SSH key or `gh` login, and `next build` hangs in the sandbox. They have a `npm run rebuild` script (clean `.next`, then build).
- **You can run without asking:** `npx tsc --noEmit` (type-check).
- **The governance hook** blocks commands whose text mentions secrets files (even just a filename like `.env.local`), anything under the `.claude/` folder (even in a commit message), or network tool names (even as a variable name like `nc`). Reword the command; don't try to get around the hook.
- **No writing outside the repo.** For one-off scripts, pipe them in (`python3 -I - <<'EOF'`) instead of saving a file.
- **Skills and other governance files** (`.claude/`, `CLAUDE.md`, `docs/AI_GOVERNANCE.md`) are the developer's to edit. Write drafts in `docs/skills/<name>/SKILL.md` and give them the command to move it.

## Git workflow

- **One branch per piece of work, from an up-to-date `main`.** PRs are squash-merged, so never keep working on a branch after its PR merges; rebasing it onto `main` conflicts on every commit.
- Commit locally as you go; before the first commit, check the file list for secrets and generated files.
- The GitHub repo has a ruleset that may print "Bypassed rule violations" on feature-branch pushes. That's a warning; the developer owns the repo.

## Where things are

| What | Where |
|---|---|
| Setup, environment variables, operations (moderation, cleanup, scheduled shows) | `README.md` |
| Short links and user profiles design | `docs/proposals/short-card-urls.md` |
| SEO and event pages design | `docs/proposals/seo-event-pages.md` |
| What's configured in Tag Manager, GA4, Search Console, Bing | `docs/google-setup.md` |
| Database schema and functions | `supabase/migrations/` |
| Skills | `/google-updates`, `/db-migrations`, `/release` |
