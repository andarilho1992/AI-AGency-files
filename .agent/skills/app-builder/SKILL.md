# Skill: App Builder

## Role
Full-stack implementer building features end-to-end in the Charles Fantasy single-file app.

## Context
3-file Vanilla JS app. Every feature = state + UI + CRUD. No shortcuts.

## Implementation Template for Any New Module

### Step 1 — State
Add to `initTravelState()` (or relevant init):
```js
if (!S.travel.moduleName)       S.travel.moduleName       = [];
if (!S.travel.moduleNameConfig) S.travel.moduleNameConfig = { defaultSetting: value };
```

### Step 2 — Data shape
```js
const entry = {
  id:        'mod-' + Date.now(),
  data:      'YYYY-MM-DD',         // always store ISO date
  // ... module-specific fields
  createdAt: new Date().toISOString(),
};
```

### Step 3 — CRUD Functions
```js
function openModuleModal(id) {
  initTravelState();
  // Reset all fields
  el('mod-id').value = id || '';
  // Populate if editing
  if (id) {
    const item = S.travel.moduleName.find(x => x.id === id);
    if (!item) return;
    // el('mod-field').value = item.field;
  }
  openModal('module-modal');
}

function saveModule() {
  const field = el('mod-field')?.value.trim();
  if (!field) { toast('Campo obrigatório', 'error'); return; }
  initTravelState();
  const id = el('mod-id').value;
  const entry = { id: id || ('mod-' + Date.now()), field, data: todayISO() };
  if (id) {
    const idx = S.travel.moduleName.findIndex(x => x.id === id);
    if (idx !== -1) S.travel.moduleName[idx] = entry;
  } else {
    S.travel.moduleName.push(entry);
  }
  save(); closeModal('module-modal'); renderModule();
  toast('Salvo!', 'success');
}

function deleteModule(id) {
  if (!confirm('Excluir?')) return;
  initTravelState();
  S.travel.moduleName = S.travel.moduleName.filter(x => x.id !== id);
  save(); renderModule();
  toast('Removido', 'success');
}
```

### Step 4 — Render Function
```js
function renderModule() {
  const panel = el('module-panel');
  if (!panel) return;
  initTravelState();
  const items = S.travel.moduleName || [];
  panel.innerHTML = items.length === 0
    ? `<div style="color:var(--text-muted);text-align:center;padding:20px">Sem dados.</div>`
    : items.map(item => `<!-- item HTML -->`).join('');
}
```

### Step 5 — HTML (index.html)
```html
<!-- Container -->
<div id="module-panel"></div>

<!-- Modal -->
<div class="modal-overlay" id="module-modal">
  <div class="modal">
    <div class="modal-header">
      <h2 class="modal-title" id="mod-modal-title">Módulo</h2>
      <button class="modal-close" onclick="closeModal('module-modal')">✕</button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="mod-id">
      <!-- fields -->
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal('module-modal')">Cancelar</button>
      <button class="btn btn-primary" onclick="saveModule()">Salvar</button>
    </div>
  </div>
</div>
```

### Step 6 — Hook into parent render
```js
// In renderFinanceDashCard() or renderTravel():
renderModule();
```
