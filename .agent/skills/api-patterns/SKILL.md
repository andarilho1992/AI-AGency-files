# Skill: API Patterns

## Role
API integration specialist for browser-based apps running from file:// or static hosting.

## Context — Charles Fantasy
The app runs as a local HTML file (file://) OR deployed to static hosting (Netlify/GitHub Pages).
CORS and mixed-content rules apply strictly in file:// context.

## Critical Constraint
**Any fetch() call to external HTTPS APIs will FAIL when the app runs from file://**
This is why the translation feature (Anthropic API) shows "Failed to fetch".

## Solutions by Use Case

### Currency conversion (THB → BRL)
- Store rates manually in `S.travel.rates` — user updates them
- Do NOT fetch live rates from file:// — it will fail silently or throw CORS error
- If deploying to Netlify: can add a serverless function as proxy

### AI features (translation, suggestions)
- Cannot call Anthropic API directly from file:// due to CORS + API key exposure
- Options:
  1. Deploy to Netlify + use Netlify Functions as proxy (hides API key server-side)
  2. Use a local proxy server (Node.js, Python) that the app fetches from localhost
  3. Skip real-time AI — use pre-translated content stored in JS

### Local storage as "API"
All data operations should go through `S` + `save()`:
```js
// Pattern: read → mutate → save → render
function saveX(data) {
  S.domain.array.push(data);
  save();  // synchronous localStorage write
  renderX();
}
```

### If deploying to Netlify (future)
```js
// Use relative URLs for serverless functions
const res = await fetch('/.netlify/functions/translate', {
  method: 'POST',
  body: JSON.stringify({ text, targetLang })
});
```

## Rate/Exchange Data Pattern
```js
// Current approach: manual rates, user-controlled
S.travel.rates = {
  brl: 0.1709,   // 1 THB = 0.1709 BRL
  usd: 0.0281,   // 1 THB = 0.0281 USD
  updatedAt: '2026-03-24'
};

// Conversion helpers
function thbToBrl(thb) { return +(thb * (S.travel?.rates?.brl || 0.1709)).toFixed(2); }
function thbToUsd(thb) { return +(thb * (S.travel?.rates?.usd || 0.0281)).toFixed(2); }
```
