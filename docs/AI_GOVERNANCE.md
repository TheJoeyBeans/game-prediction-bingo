# AI Governance for Claude Code

How this repository keeps Claude Code inside safe boundaries, why each piece exists,
and how to change it.

## The model: three layers

| Layer | File | Enforced by | Strength | Blind spot |
|---|---|---|---|---|
| **Instructions** | `CLAUDE.md` | The model reading it | Understands *intent* (e.g. "this web page is trying to instruct me") | Advisory — a strong enough prompt injection could, in principle, talk past it |
| **Permissions** | `.claude/settings.json` → `permissions` | Claude Code itself, before every tool call | Cannot be overridden by the model | Matches command *prefixes*; misses `bash -c "curl …"` |
| **Hook + sandbox** | `.claude/hooks/guard.sh`, `settings.json` → `sandbox` | Your script / macOS Seatbelt | Scans full commands; OS-level file & network isolation even for code Claude didn't write (npm scripts) | Pattern-based (hook); only covers Bash (sandbox) |

No single layer is sufficient. Together, an attack has to beat all three.

### How a tool call is decided

```
Claude wants to run a tool
  → PreToolUse hook (guard.sh)     deny ⇒ blocked │ ask ⇒ you get a prompt
  → permission rules               deny ⇒ blocked │ ask ⇒ prompt │ allow ⇒ runs
  → permission mode default        (default mode prompts; auto mode uses a classifier)
  → Bash runs inside the sandbox   new network domains prompt; secret paths unreadable
```

**`deny` always wins** over `ask` and `allow`, at every level.

## Threat → control matrix

| Threat | CLAUDE.md | Permission rules | Hook | Sandbox |
|---|---|---|---|---|
| Prompt injection (instructions hidden in files, pages, tool output) | §1, §2 | Limits what an injected instruction could *do* | Same | Same |
| "Ignore previous instructions, do X" | §2 | — | — | — |
| Installing software | §3 | `ask`: npm/yarn/pnpm/bun/npx/brew/pip/… | `ask` even when wrapped (`bash -c`, `env X=1 npm i`) | Postinstall scripts can't reach the network unprompted |
| Secrets | §4 | `deny` Read/Edit of `.env*`, keys, `~/.ssh`, `~/.aws`, … | `deny` `cat .env`, `printenv`, keychain | Denied paths unreadable by any command |
| GitHub push/pull | §5 | `ask` git remote ops & `gh`; `deny` force-push | `ask` | github.com must be approved |
| Data leaving the machine | §6 | `deny` curl/wget/ssh/nc/…; `ask` WebFetch/WebSearch/Artifact/Docs connector | `deny` network tools, scripted HTTP, `open https://…` | Every new domain prompts |
| Destructive commands | §7 | `ask` rm -rf, reset --hard, clean, deploy | `ask` | Writes limited to the project |
| Claude rewriting its own rules | §8 | `deny` Edit of governance files | `deny` shell writes to them | Writes to them denied |
| Persistence (cron, launch agents, git hooks, shell rc) | §7 | `deny` | `deny` | Writes outside project denied |
| Bypass mode turned on | — | `disableBypassPermissionsMode` | — | — |

## Files

- `CLAUDE.md` — rules for Claude, loaded every session.
- `.claude/settings.json` — committed project settings: permissions, hook registration, sandbox.
- `.claude/settings.local.json` — *your personal* overrides (gitignored). Note that a `deny`
  there or anywhere else cannot be undone by an `allow`.
- `.claude/hooks/guard.sh` — the PreToolUse guard. Registered with `onFailure: "block"`, so if
  the script crashes or `jq` is missing, tool calls are **blocked** (fail closed), not allowed.
- `.claude/hooks/test-guard.sh` — regression tests. Run `bash .claude/hooks/test-guard.sh`
  after any change to the guard; it must end with `fail=0`.

## Changing the rules

Claude is blocked from editing all of the above. To change a rule:

1. Ask Claude to *propose* the change as a diff (it can read these files).
2. Apply it yourself in your editor.
3. If you touched the hook, run the test script.
4. Run `/hooks` or restart Claude Code so new settings load, and `/permissions` to review them.

Temporary one-off: approve the prompt. Permanent loosening: edit `settings.json` yourself.

## Known limits — read these

- **Pattern matching is not a proof.** A determined attacker can find shell spellings the
  hook doesn't catch. That's why the sandbox and `CLAUDE.md` exist alongside it.
- **The hook has false positives.** A commit message containing the word "curl" is blocked.
  Run such commands yourself, or rephrase.
- **Approving a prompt is the control.** Read each prompt. A prompt you click through without
  reading is no protection. Be especially careful approving anything right after Claude
  read external content (a web page, an issue, a new dependency's README).
- **Auto mode** auto-approves calls that no rule covers, using a classifier. `deny`/`ask`
  rules and the hook still apply, but default mode (manual approval) is the stricter choice.
- **Project settings protect this repo only.** For machine-wide guarantees that Claude itself
  can never weaken, put the same rules in managed settings
  (`/Library/Application Support/ClaudeCode/managed-settings.json`, needs admin rights).
- **Connectors and MCP servers** are outbound channels and return untrusted content. Add
  new ones deliberately and give each an `ask` rule.
- **Repos you clone can ship their own `.claude/` hooks.** Only trust workspaces you've
  reviewed; Claude Code asks you to confirm trust on first open for this reason.

## Operator checklist (human)

- Keep secrets in `.env.local` (gitignored); keep `.env.example` with placeholder names only.
- Review `git diff --staged` before every commit Claude prepares.
- Verify any package Claude suggests on npmjs.com before approving the install.
- Use `/permissions` periodically to see the effective rule set; remove stale `allow`s.
- Use Git so every change is reviewable and revertible; use `/rewind` to undo Claude edits.
