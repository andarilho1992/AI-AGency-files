---
name: feedback_git
description: Git workflow rules — commit frequency, deployment pattern, what not to do
type: feedback
originSessionId: 5932bc93-c644-4b73-9eea-f31574bfa3f3
---
## Git Workflow Rules

Commit after every meaningful file output — not at end of session. Small frequent commits protect work.

**Why:** VS Code crashes, context compresses, background agents time out. Without mid-session commits, work is lost. "If losing work since last commit would frustrate you, commit now."

**How to apply:** After any agent produces a file or any milestone is hit, commit immediately.

## Deploy Pipeline (non-negotiable order)
1. Build (Claude Code)
2. Commit + push to GitHub
3. Deploy: `npx wrangler pages deploy . --project-name=andarilho-digital --branch=main --commit-dirty=true`
4. Verify: `curl -s -o /dev/null -w "%{http_code}" -L https://andarilho-digital.pages.dev/[file]`
5. Only share link AFTER step 4 returns 200

**Why:** Sending a link before verifying = dead links to clients. Not done until curl returns 200.

## Parallel Work Rules
- Every parallel chat owns UNIQUE output files — no overlap
- Main Claude owns: MEMORY.md, CLAUDE.md, git commits, deliverables index
- Commit per chat, not per session batch
- If two tasks need same file, restructure before starting — not after conflict

## What NOT to Do
- Never `git add .` on files you haven't checked — use specific paths
- Never `--no-verify` on hooks unless explicitly asked
- Never force-push main branch
- Never amend published commits
- `.env` is gitignored — never add it manually with `-f`
