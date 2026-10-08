#!/bin/bash
# PreToolUse guard — deterministic backstop for the rules in CLAUDE.md.
#
# Claude Code pipes every pending tool call to this script as JSON on stdin.
# The script answers with one of:
#   deny  -> the call is blocked and the reason is shown to Claude
#   ask   -> the human gets a permission prompt, even in auto mode
#   (no output) -> normal permission flow (settings.json rules) continues
#
# Permission rules in settings.json match command *prefixes*, so they miss
# wrapped forms like `bash -c "curl ..."` or `env FOO=1 npm install`.
# This script scans the whole command string to close those gaps.
# See docs/AI_GOVERNANCE.md for the full model.

set -u

input=$(cat)
tool=$(jq -r '.tool_name // ""' <<<"$input")

decide() { # $1 = deny|ask, $2 = reason
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $d, permissionDecisionReason: $r}}'
  exit 0
}

matches() { # $1 = text, $2 = extended regex (case-insensitive)
  grep -qiE -- "$2" <<<"$1"
}

# --- Patterns -----------------------------------------------------------------
# B = "start of a command word": line start, a shell separator, a quote, a
# backtick, whitespace or a slash. Quotes matter: `bash -c 'curl ...'` must match.
B='(^|[;&|(`"'"'"'[:space:]/])'
E='([[:space:]"'"'"';|&)]|$)'   # end of a word

# Files that hold secrets. `.env.example` is stripped before matching (it is a template).
SECRET_PATHS="${B}"'\.env('"${E}"'|\.[a-z]+)|\.(pem|key|p12|pfx|keystore)'"${E}"'|(^|/)\.ssh(/|$)|id_(rsa|dsa|ecdsa|ed25519)|(^|/)\.aws/|(^|/)\.npmrc|(^|/)\.netrc|\.git-credentials|(^|/)\.config/gh/|(^|/)\.docker/config\.json|Library/Keychains'

# Commands that dump secrets from the environment or the macOS keychain.
SECRET_CMDS="${B}"'(printenv|security[[:space:]]+(find|dump|export)-)|(^|[;&|][[:space:]]*)env[[:space:]]*($|[;&|>])|/proc/[^[:space:]]*/environ'

# Anything that can move data off this machine.
NETWORK_CMDS="${B}"'(curl|wget|nc|ncat|netcat|telnet|ssh|scp|sftp|rsync|ftp|socat)'"${E}"'|/dev/(tcp|udp)/|'"${B}"'open[[:space:]].*https?://'
SCRIPTED_NETWORK='(python3?|node|ruby|perl|php|deno|osascript)[[:space:]].*(https?://|urllib|requests\.|http\.client|socket|fetch\(|net/http|XMLHttpRequest)'

# Ways to hide what a command really does.
OBFUSCATION='\|[[:space:]]*(ba|z|da)?sh'"${E}"'|'"${B}"'eval[[:space:]]|base64[[:space:]]+(-d|-D|--decode)'

# Privilege escalation and persistence outside the project.
ESCALATION="${B}"'(sudo|su|crontab|launchctl)'"${E}"'|git[[:space:]]+config.*core\.hookspath|\.git/hooks/'

# Rewriting published history.
FORCE_PUSH='git[[:space:]]+push.*([[:space:]]--force|[[:space:]]-[a-z]*f'"${E}"'|[[:space:]]\+[^[:space:]])'

# Writes to the governance files themselves.
GOVERNANCE_FILES='(\.claude/|CLAUDE\.md|AI_GOVERNANCE\.md)'
WRITE_OPS='>|'"${B}"'(tee|mv|cp|rm|chmod|truncate|ln|touch)[[:space:]]|sed[[:space:]]+-i|perl[[:space:]]+-[a-z]*i'

# Installing software (needs the human's explicit OK).
INSTALL_CMDS="${B}"'(npm|pnpm|yarn|bun)[[:space:]]+(i|install|add|ci|update|up|upgrade|dlx|create|init|exec|x)'"${E}"'|'"${B}"'(npx|pnpx|bunx|brew|pip3?|pipx|uv|gem|corepack|nvm|asdf|mise|softwareupdate)'"${E}"'|(cargo|go)[[:space:]]+install|xcode-select[[:space:]]+--install|claude[[:space:]]+(mcp|plugin)|--install-extension'

# Talking to GitHub or any git remote (needs the human's explicit OK).
REMOTE_CMDS='git[[:space:]]+(push|pull|fetch|clone|remote|ls-remote|submodule)'"${E}"'|'"${B}"'gh'"${E}"

# Destructive, deploying or publishing operations (needs the human's explicit OK).
DESTRUCTIVE='rm[[:space:]]+-[a-z]*(rf|fr)|git[[:space:]]+(reset[[:space:]]+--hard|clean[[:space:]]+-[a-z]*f|checkout[[:space:]]+--[[:space:]]|restore[[:space:]]|branch[[:space:]]+-D|stash[[:space:]]+(drop|clear))|'"${B}"'(vercel|netlify)'"${E}"'|npm[[:space:]]+publish'

# --- File tools (Read / Edit / Write / Grep / NotebookEdit) -------------------

if [[ "$tool" =~ ^(Read|Edit|Write|MultiEdit|NotebookEdit|Grep)$ ]]; then
  path=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // .tool_input.path // ""' <<<"$input")
  clean=${path//.env.example/}
  if matches "$clean" "$SECRET_PATHS"; then
    decide deny "Blocked by governance: '$path' looks like a secrets file. Secrets are handled by the human developer only. Ask the user to handle this themselves."
  fi
  if [[ "$tool" != "Read" && "$tool" != "Grep" ]] && matches "$path" "$GOVERNANCE_FILES"; then
    decide deny "Blocked by governance: Claude may not modify governance files ($path). The human developer edits these by hand."
  fi
  exit 0
fi

# --- Bash ---------------------------------------------------------------------

if [[ "$tool" == "Bash" ]]; then
  cmd=$(jq -r '.tool_input.command // ""' <<<"$input")
  clean=${cmd//.env.example/}

  # Hard blocks first: these never run, even with approval. The human runs them.
  matches "$clean" "$SECRET_PATHS"    && decide deny "Blocked by governance: command touches a secrets file. Secrets are handled by the human developer only."
  matches "$cmd" "$SECRET_CMDS"       && decide deny "Blocked by governance: command would expose environment variables or keychain contents."
  matches "$cmd" "$NETWORK_CMDS"      && decide deny "Blocked by governance: direct network tools (curl, wget, ssh, nc, ...) are not allowed. Ask the human to run this themselves."
  matches "$cmd" "$SCRIPTED_NETWORK"  && decide deny "Blocked by governance: inline script appears to make network requests."
  matches "$cmd" "$OBFUSCATION"       && decide deny "Blocked by governance: piping into a shell, eval, and base64-decoding are not allowed because they hide what runs."
  matches "$cmd" "$ESCALATION"        && decide deny "Blocked by governance: sudo, scheduled jobs, launch agents and git hooks are not allowed."
  matches "$cmd" "$FORCE_PUSH"        && decide deny "Blocked by governance: force-pushing rewrites published history. The human developer does this themselves if ever needed."
  if matches "$cmd" "$GOVERNANCE_FILES" && matches "$cmd" "$WRITE_OPS"; then
    decide deny "Blocked by governance: Claude may not modify governance files. The human developer edits these by hand."
  fi

  # Soft gates: allowed only after the human approves this exact command.
  matches "$cmd" "$INSTALL_CMDS" && decide ask "Governance: this installs or executes downloaded software. Approve only if you asked for it."
  matches "$cmd" "$REMOTE_CMDS"  && decide ask "Governance: this talks to GitHub or a git remote. Approve only if you asked for it."
  matches "$cmd" "$DESTRUCTIVE"  && decide ask "Governance: this is destructive or deploys/publishes. Approve only if you asked for it."
fi

exit 0
