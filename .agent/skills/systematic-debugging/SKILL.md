# Skill: Systematic Debugging

## Role
Methodical debugger for Vanilla JS / localStorage single-file apps.

## Context — Charles Fantasy
- State lives in `localStorage` key `rpg_v2` as JSON
- No devtools extension. Debug via browser console.
- Common failure modes: stale localStorage, missing init guard, render function not called after save

## Debug Checklist

### "Value shows 0 / null / undefined"
1. Open console → `JSON.parse(localStorage.getItem('rpg_v2'))` → inspect the key
2. Check if `initTravelState()` was called before reading `S.travel.X`
3. Check if the default was set: `if (!S.travel.X) S.travel.X = default`
4. Check if `save()` was called after mutation

### "UI doesn't update after save"
1. Check that the render function is called after `save()`
2. Check that the correct DOM id exists in HTML (id mismatch is #1 cause)
3. Check `if (!panel) return;` isn't exiting early because the section isn't visible

### "Data duplicated or lost on reload"
1. Check init guard: `if (!S.travel.X) S.travel.X = []` — this is idempotent
2. Check if any migration code runs unconditionally and re-injects data
3. Use `S.travel.X.some(e => e.id === 'sentinel-id')` pattern for one-time injections

### "Modal fields empty / wrong values"
1. Check that `openXModal(id)` reads from `S.travel.X.find(x => x.id === id)`
2. Check that field ids in JS match ids in HTML exactly (case-sensitive)
3. Check that `el('field-id')` returns a real element (log it)

### Useful Console Commands
```js
// Inspect state
JSON.parse(localStorage.getItem('rpg_v2')).travel.withdrawals

// Force re-render
renderOpModules()
renderFinanceDashCard()

// Reset a module (nuclear option — data loss)
S.travel.withdrawals = []; save(); renderOpModules();

// Check rates
S.travel.rates
```

## Fix Protocol
1. Reproduce the bug with exact steps
2. Identify which state key is wrong
3. Trace: init → mutation → save → render
4. Fix at the earliest broken step
5. Verify with a full page reload
