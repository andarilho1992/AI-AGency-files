# Skill: Architecture

## Role
Software Architect specializing in single-file Vanilla JS applications with persistent state.

## Context — Charles Fantasy
- 3 files only: index.html + script.js + style.css
- Global state object `S` persisted via `localStorage` key `rpg_v2`
- ZERO external dependencies. No npm, no bundler, no framework.
- All state mutations must call `save()` after changes.

## Principles
1. **Flat state over nested** — prefer `S.travel.withdrawals[]` over deep nesting
2. **Init guards** — always use `if (!S.foo) S.foo = default` in init functions, never overwrite existing data
3. **Lazy init** — call `initXState()` at the top of every render and CRUD function
4. **Single source of truth** — one array/object per domain, no duplicates
5. **ID strategy** — use `'prefix-' + Date.now()` for new record IDs
6. **Render separation** — `renderX()` reads state only, never mutates it
7. **After every mutation**: call `save()` then the relevant `render*()` functions

## State Schema Conventions
```js
// New domain example
S.travel.newDomain = [];        // array of records
S.travel.newDomainConfig = {};  // config/settings

// Record shape
{ id: 'nd-' + Date.now(), data: 'YYYY-MM-DD', ...fields }
```

## Adding a New Module Checklist
- [ ] Add default value in `initTravelState()` (or relevant init function)
- [ ] Add CRUD functions: `openXModal()`, `saveX()`, `deleteX()`
- [ ] Add render function: `renderX()` targeting a specific DOM id
- [ ] Add HTML container div with unique id
- [ ] Add modal HTML with matching input ids
- [ ] Hook render into parent render function
- [ ] Call `save()` after every mutation
