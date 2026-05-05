---
name: brief-to-website
description: Showcase 2 — One paragraph brief → full HTML site → deployed live URL → verified HTTP 200. Under 10 minutes.
model: claude-sonnet-4-6
---

# Brief to Website — Full Pipeline

## Trigger
`/brief-to-website [client name]` — when a client needs a site fast.

## Pattern
Brief → scrape existing presence → generate site → deploy → verify 200 → share link.

## Step 1 — Extract Brief
Ask for or read:
- Business name
- What they do (1-2 sentences)
- Target customer
- Main offer / CTA
- Any existing URLs (Instagram, WhatsApp, Google Maps)
- Color preferences or "use your judgment"

## Step 2 — Scrape Existing Presence
If they have a website or Instagram:
- Use WebFetch to pull homepage content
- Extract: headline language, key services, tone of voice, any social proof
- Use this as raw material — don't invent, use their own words back at them

## Step 3 — Generate HTML
One file: `[client-name].html`

Stack:
- Dark or light theme based on business type
- Bebas Neue for headers, Inter for body (Google Fonts CDN)
- Sections: Hero → What We Do → Why Us → CTA → Contact
- Mobile responsive
- WhatsApp click-to-chat button if they have WhatsApp number
- Google Maps embed if they have physical location

Andarilho palette (use for agency clients):
- Dark: `#0d0d0e` bg, `#e7c9a3` gold, `#C13D14` rust
- Light: white bg, dark text, rust accent

## Step 4 — Deploy
Run: `./deploy.sh "[client] site launch" [client-name].html`

Script handles: commit → push → wrangler deploy → curl verify.

## Step 5 — Verify
Not done until script outputs `✅ LIVE — HTTP 200`.

Live URL format: `https://andarilho-digital.pages.dev/[client-name].html`

## Step 6 — Deliver to Client
WhatsApp message template:
```
Olá [name]! Aqui está o seu site:
https://andarilho-digital.pages.dev/[client-name].html

Funciona em qualquer celular. Me diz o que quer ajustar.
```

## Rules
- No external JS frameworks — vanilla HTML only
- No placeholder text in final output (grep for "Lorem" before deploy)
- Mobile first — test on 375px viewport mentally
- One clear CTA per page — not three
- Not done until HTTP 200 confirmed
