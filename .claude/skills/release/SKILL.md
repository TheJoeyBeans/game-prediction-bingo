---
name: release
description: Ship a finished branch of videogamebingo.com to production and walk the developer through every check, from the local build through the preview deployment, merge, production checks and Google updates. Use when a branch is ready to deploy, or when the developer asks how to ship, push, open a PR or go live.
---

# Releasing videogamebingo.com

The site is a Next.js app on Vercel (Hobby plan) with Supabase. Pushing a branch creates a Vercel **Preview** deployment (which uses the **dev** Supabase project); merging to `main` deploys **Production**.

**The developer runs** every `git push`, `git pull`, `gh` command and `npm run build`: the sandbox can't use their GitHub credentials, and `next build` hangs in it. You prepare the exact commands and checks. Write every step out in full, numbered, with commands in code blocks and what they should see after each one.

Before starting, confirm:
- The branch is committed and clean (`git status`), and `npx tsc --noEmit` passes.
- Any database migration the branch depends on has been run on dev, and on production if it must come before the deploy (see the `db-migrations` skill).
- Any new environment variable is set in Vercel for both Production and Preview.

## A. Local checks

**A1. Clean build**
```
npm run rebuild
```
It should finish without errors. Tell them which routes to look for in the route list, and that `/` must be **○ (static)**. If it fails, they paste the error.

**A2. No secrets in browser code**
```
grep -rlE "sb_secret_|SUPABASE_SECRET_KEY|IP_HASH_SALT|CRON_SECRET|supabase\.co" .next/static
```
It should print nothing. If it lists files, stop and investigate.

## B. Push and open the PR

**B1.**
```
git push -u origin <branch>
```
A "Bypassed rule violations" message from GitHub is a warning from the repo's ruleset; the push still went through if it ends with `<old>..<new>  <branch> -> <branch>`.

**B2.** Write the full `gh pr create` command for them, with a title and a body summarizing the changes, setup steps (migrations, environment variables) and testing, ending with:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```
Use `--base main --head <branch>`.

## C. Test the preview

In Vercel → **Deployments**, open the branch's preview once it's **Ready**. Preview URLs require their Vercel login, which they have.

Write a checklist specific to what the branch changed: each page to open, each action to take and what they should see. Always include:
- **Logs:** Vercel → the preview deployment → **Logs**. No errors.
- **Lighthouse** if pages or performance changed: Chrome incognito → dev tools → **Lighthouse** → Navigation, Mobile, Performance and SEO → Analyze. Aim for 90+. Vercel marks previews `noindex`, so "Page is blocked from indexing" on a preview is expected.
- **Share images** if `ogImage.tsx` or the `opengraph-image.tsx` files changed: open `/opengraph-image` and `/<event-slug>/opengraph-image` and check them by eye. They're only generated during a real build, so the preview is the first place to see them.

Fix anything that fails on the same branch, then they push again (B1) and re-check.

## D. Merge and check production

**D1.** They merge the PR on GitHub. PRs are **squash-merged**, so this branch is finished: anything else goes on a new branch from an updated `main`.

**D2.** Check the live site at `https://videogamebingo.com` with a checklist specific to the changes: the main pages, making a card (should land on `/s/<id>`), and anything the branch added.

**D3.** If share images or page titles changed: post a link Discord hasn't seen before (add `?x=1` to the end) and check the preview. Discord and similar apps cache previews; old messages keep their old preview.

**D4.** If the cleanup job or anything it calls changed: Vercel → **Settings → Cron Jobs** → `/api/cron/cleanup` → **Run**. It should return status **200**.

## E. Google and tidy-up

**E1.** Run the **`google-updates`** skill to work out whether Tag Manager, GA4, Search Console or Bing need changes for this release, and walk through any that do.

**E2.** Tidy the local repo:
```
git switch main && git pull
```
Optionally delete the merged branch locally:
```
git branch -D <branch>
```
