---
name: reference_apis
description: Where to find API keys, credentials, and external service access for Andarilho Digital stack
type: reference
originSessionId: 5932bc93-c644-4b73-9eea-f31574bfa3f3
---
## API Keys — Where They Live

| Service | Key Location | Status |
|---------|-------------|--------|
| Anthropic (Claude) | `C:\Users\viaje\Projeto 1\.env` → ANTHROPIC_API_KEY | ✅ Active |
| Cloudflare | `npx wrangler whoami` to check login | ✅ Active |
| GitHub | `gh auth status` to check | ✅ Active |
| Evolution API (WhatsApp) | Pets Go `.env.example` | ✅ In use |
| n8n | Cloud instance (Junior's account) | ✅ In use |
| Google Places | `C:\Users\viaje\Projeto 1\.env` → GOOGLE_PLACES_API_KEY | ⚠️ Stub only |
| Google Drive/Sheets | `andarilhodigital92@gmail.com` — needs email share fix | ⚠️ Blocked |
| OpenAI | Not yet configured | ❌ Pending |
| Perplexity | Not yet configured | ❌ Pending |

## Template
`.env.template` at `C:\Users\viaje\Projeto 1\.env.template` — full 30+ API slot structure

## Email Accounts
- Claude / personal: `braziliangui1992@gmail.com`
- GitHub / Cloudflare / Google Drive: `andarilhodigital92@gmail.com`
- Fix needed: share Drive from andarilhodigital92 → braziliangui1992 to enable Google MCP

## Deployment
- Cloudflare Pages project: `andarilho-digital`
- Production URL: `https://andarilho-digital.pages.dev`
- Deploy command: `npx wrangler pages deploy . --project-name=andarilho-digital --branch=main --commit-dirty=true`
- Verify: `curl -s -o /dev/null -w "%{http_code}" -L https://andarilho-digital.pages.dev/[file].html`

## GitHub Repos
- `andarilho1992/AI-AGency-files` — HTML deliverables (public)
- `andarilho1992/my-workspace` — operating workspace (private)
