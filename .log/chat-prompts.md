# Sub-Chat Prompts — Astro Redesign

## RULES FOR ALL CHATS
- Read .log/multi-chat.md FIRST for current state
- Only write to YOUR assigned output path — never touch other chats' files
- Append your update to .log/multi-chat.md when done
- Commit your output when done (git commit with descriptive message)

---

## CHAT 1 — Sonnet — Agency Site

```
Read C:\Users\viaje\Projeto 1\.log\multi-chat.md for context.

Your task: Build the Andarilho Digital agency site in Astro.
Output paths (ONLY these — nothing else):
  - astro-sites/src/pages/index.astro  (replace placeholder)
  - astro-sites/src/components/Nav.astro  (new)
  - astro-sites/src/components/Footer.astro  (new)
  - astro-sites/src/components/Hero.astro  (new)

Brand: dark theme, --rust: #ae330a, --gold: #e7c9a3, --bg: #0d0d0e
Reference: C:\Users\viaje\Projeto 1\lp-andarilho.html (existing site — port its sections to Astro)
Layout: import from '../layouts/Base.astro' (already exists)
Stack: Astro .astro files only — zero client JS, zero npm UI frameworks

After building, run: cd astro-sites && npm run build
If it passes, append to .log/multi-chat.md:
## Chat 1 — [timestamp]
STATUS: done
COMPLETED: agency index page + Nav + Footer + Hero components
OUTPUT: astro-sites/src/pages/index.astro, astro-sites/src/components/
NEXT: Chats 3,4,5 can now use Base.astro + shared components
```

---

## CHAT 2 — Haiku — Lead Automation Script

```
Read C:\Users\viaje\Projeto 1\.log\multi-chat.md for context.

Your task: Build the lead automation script.
Output path (ONLY this): astro-sites/scripts/generate-lead-site.js

The script receives a URL as argument: node generate-lead-site.js https://example.com
It must:
1. Fetch the target URL (use node-fetch or built-in fetch in Node 25)
2. Extract: company name, primary hex color, tagline/description, any image URLs found
3. Generate a slug from the company name (lowercase, hyphens)
4. Write a new file: astro-sites/src/pages/leads/[slug-value].astro
   - Use this template structure: import Base from '../../layouts/Base.astro'
   - Inject: company name, color, tagline, 3 generic benefit bullets (based on what the site does)
   - Hero section with full-width color block using extracted primary color
   - CTA button linking to a WhatsApp number (placeholder: +5511999999999)
5. Log the output path and URL to console

Keep it under 150 lines. No external npm packages beyond what's in astro-sites/node_modules.
Check astro-sites/package.json to see what's available.

After writing, test with: node astro-sites/scripts/generate-lead-site.js https://simples.vet
If a file is created in astro-sites/src/pages/leads/, it works.

Append to .log/multi-chat.md:
## Chat 2 — [timestamp]
STATUS: done
COMPLETED: generate-lead-site.js — scrapes URL, extracts brand data, generates .astro lead page
OUTPUT: astro-sites/scripts/generate-lead-site.js
NEXT: Test with a real URL; Master chat to integrate into quick-lead-site skill
```

---

## CHAT 3 — Sonnet — Pets Go LP

```
Read C:\Users\viaje\Projeto 1\.log\multi-chat.md for context.
Wait until Chat 1 is STATUS: done before starting (it creates shared components).

Your task: Port the Pets Go sales LP to Astro.
Output path (ONLY this): astro-sites/src/pages/petsgo.astro

Reference: C:\Users\viaje\Projeto 1\petsgo-lp.html (full production LP — port ALL sections)
Layout: import from '../layouts/Base.astro'
Use components from src/components/ if Chat 1 created them (Nav, Footer, Hero)
Keep all copy in Portuguese. Pricing: R$297/mês (solo) e R$697/mês (rede)
All CTAs → WhatsApp link (href="https://wa.me/5511999999999")
Zero client JS. Pure Astro + CSS.

After writing, run: cd astro-sites && npm run build
Append to .log/multi-chat.md:
## Chat 3 — [timestamp]
STATUS: done / blocked
COMPLETED: Pets Go LP ported to Astro
OUTPUT: astro-sites/src/pages/petsgo.astro
NEXT: —
```

---

## CHAT 4 — Haiku — Dashboard

```
Read C:\Users\viaje\Projeto 1\.log\multi-chat.md for context.
Wait until Chat 1 is STATUS: done before starting.

Your task: Port the Andarilho dashboard to Astro.
Output path (ONLY this): astro-sites/src/pages/dashboard.astro

Reference: C:\Users\viaje\Projeto 1\painel-andarilho.html
Layout: import from '../layouts/Base.astro'
This is an internal tool — keep full functionality but convert inline CSS to scoped <style> blocks.
Minimal JS is OK here (dashboard needs interactivity) — use <script> tags inside .astro.

After writing, run: cd astro-sites && npm run build
Append to .log/multi-chat.md:
## Chat 4 — [timestamp]
STATUS: done / blocked
COMPLETED: Dashboard ported to Astro
OUTPUT: astro-sites/src/pages/dashboard.astro
NEXT: —
```

---

## CHAT 5 — Sonnet — Lead Template

```
Read C:\Users\viaje\Projeto 1\.log\multi-chat.md for context.
Wait until Chat 1 AND Chat 2 are both STATUS: done.

Your task: Build the production lead template that generate-lead-site.js outputs.
Output path (ONLY this): astro-sites/src/pages/leads/[slug].astro (replace placeholder)

The template receives props from getStaticPaths() — for now hardcode 1 example:
  { params: { slug: 'demo' }, props: { name: 'Demo Company', color: '#ae330a', tagline: 'Your tagline here', services: ['Service 1', 'Service 2', 'Service 3'] } }

Sections required:
1. Hero — company name, tagline, CTA button (WhatsApp)
2. Features — 3 service cards  
3. About blurb — generic "Sobre a [name]" copy
4. Final CTA — WhatsApp button

Design: match Andarilho brand (dark bg, inject company's primary color as accent)
Layout: import from '../../layouts/Base.astro'

After writing, run: cd astro-sites && npm run build
Append to .log/multi-chat.md:
## Chat 5 — [timestamp]
STATUS: done / blocked
COMPLETED: Lead template [slug].astro with example props
OUTPUT: astro-sites/src/pages/leads/[slug].astro
NEXT: Master chat to wire generate-lead-site.js output to this template format
```
