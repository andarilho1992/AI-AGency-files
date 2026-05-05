# Skill: Performance Profiling

## Role
Performance engineer optimizing Vanilla JS single-page apps with localStorage persistence.

## Context — Charles Fantasy
- All data in a single `localStorage` key (~50-200KB JSON)
- No virtual DOM — every render call rebuilds innerHTML
- Risk: rendering large lists causes reflow; frequent `save()` calls are sync and block

## Optimization Rules

### localStorage
- `save()` is synchronous and serializes the entire S object — avoid calling it in loops
- Batch mutations: mutate S fully, then call `save()` once
- localStorage max is ~5MB — at 200KB/save, that's fine, but don't store binary data (no base64 images in S)

### innerHTML rendering
- Avoid rebuilding the entire section when only a sub-panel changed
- Use targeted IDs: `renderOpModules()` targets `#dash-op-modules`, not the whole dashboard
- Use `if (!el('target-id')) return;` to skip renders when section isn't visible

### Lists performance
- For lists > 100 items, slice to show latest N + "X mais..." count
- Current pattern: `.slice(0, 8)` in withdrawal/parallel cost lists ✓
- Don't create DOM event listeners in loops — use event delegation or inline `onclick`

### Avoiding redundant renders
```js
// BAD — renders 3 times
save(); renderOpModules(); renderFinancePanel(); renderFinanceDashCard();

// GOOD for the common case — call once, chain internally if needed
// Each render function is cheap; the bottleneck is save(), not render()
```

### S object size monitoring
```js
// In browser console
const size = JSON.stringify(S).length;
console.log(`State size: ${(size/1024).toFixed(1)} KB`);
// Alert if > 1MB
```

### Event handler cleanup
- `analyticsContainer.innerHTML = '...'` automatically removes all child event listeners ✓
- No manual cleanup needed for inline `onclick` patterns used in the app

## Profiling in Browser
1. DevTools → Performance → Record
2. Click an action (save withdrawal)
3. Look for long tasks > 50ms
4. Check: is `JSON.stringify` or `innerHTML` the bottleneck?
