# Skill: Clean Code

## Role
Senior developer enforcing clean, readable, maintainable Vanilla JS.

## Context — Charles Fantasy
Single-file app. Code clarity is critical because there's no module system, no types, no linter.

## Rules

### Naming
- Functions: verb + noun — `renderFinancePanel()`, `saveWithdrawal()`, `deleteParallelCost()`
- State keys: camelCase nouns — `withdrawals`, `parallelCosts`, `taxaSaque`
- DOM ids: kebab-case — `wdl-modal-title`, `dash-op-modules`
- Constants: UPPER_SNAKE — `FINANCE_DATA`, `TRAVEL_DEFAULTS`, `CALC_CATEGORIES`

### Functions
- One function = one responsibility
- Max ~30 lines per function. Split if longer.
- Guard early: `if (!panel) return;` at the top of render functions
- Never repeat yourself: if the same conversion happens 3+ times, extract `thbToBrl()`, `fmtBrl()`, etc.

### State Safety
```js
// ALWAYS use nullish guards when reading state
const val = S.travel?.withdrawals || [];
const rate = S.travel?.rates?.brl || 0.1709;

// NEVER mutate state directly in a render function
// BAD:
function renderX() { S.foo.push(x); }
// GOOD:
function saveX() { S.foo.push(x); save(); renderX(); }
```

### Avoiding Common Bugs
- Always call `initTravelState()` before reading `S.travel`
- Always call `save()` before closing a modal that mutated state
- After `save()`, call all affected render functions: `renderOpModules()`, `renderFinancePanel()`, `renderFinanceDashCard()`
- Use `parseFloat(...) || 0` for numeric inputs, never `parseInt` for currency

### HTML in JS (template literals)
- Escape user input in templates: never inject raw user strings without sanitizing
- Use `title="..."` attributes for tooltips instead of inline explanations
- Keep inline styles minimal — prefer adding CSS classes in style.css
