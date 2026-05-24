// app.jsx — Pantry Meal Planner (all components)

// ── Nav ───────────────────────────────────────────────────────
function Nav({ view, setView, onAddRecipe }) {
  return (
    <nav className="app-nav">
      <div className="brand">
        <span className="brand-mark" />
        Pantry
      </div>
      <div className="nav-tabs">
        {[['plan','Plan'],['recipes','Recipes'],['grocery','Grocery List']].map(([id, label]) => (
          <button key={id} className={`nav-tab${view === id ? ' active' : ''}`} onClick={() => setView(id)}>
            {label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }} />
      <button className="btn btn-clay btn-sm" onClick={onAddRecipe}>＋ Recipe</button>
    </nav>
  );
}

// ── DateRangePicker ───────────────────────────────────────────
function DateRangePicker({ onStart, existingPlan }) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = React.useState(existingPlan ? existingPlan.start_date : today);
  const [end, setEnd]     = React.useState(existingPlan ? existingPlan.end_date : '');
  const [error, setError] = React.useState('');
  const [showConfirm, setShowConfirm] = React.useState(false);

  function setQuick(days) {
    const s = new Date(today + 'T00:00:00');
    const e = new Date(s);
    e.setDate(s.getDate() + days - 1);
    setStart(s.toISOString().slice(0, 10));
    setEnd(e.toISOString().slice(0, 10));
    setError('');
  }

  const numDays = React.useMemo(() => {
    if (!start || !end || end < start) return null;
    return daysBetween(start, end);
  }, [start, end]);

  function tryStart() {
    if (!start || !end) { setError('Please select a start and end date.'); return; }
    if (end < start)    { setError('End date must be after start date.'); return; }
    setError('');
    if (existingPlan) { setShowConfirm(true); } else { onStart(start, end); }
  }

  return (
    <div className="page" style={{ maxWidth: 500, paddingTop: 44 }}>
      <div className="eyebrow">Start here</div>
      <div className="h1 underline-sketch" style={{ display: 'inline-block', fontSize: 34, marginTop: 6, marginBottom: 10 }}>
        Plan some meals.
      </div>
      <div className="h-hand" style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.35 }}>
        Pick a range. Fill in meals. Get your grocery list.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 26 }}>
        <div className="field">
          <span className="field-label">Start date</span>
          <input type="date" className="text-input" value={start}
            onChange={e => { setStart(e.target.value); setError(''); }} />
        </div>
        <div className="field">
          <span className="field-label">End date</span>
          <input type="date" className="text-input" value={end} min={start}
            onChange={e => { setEnd(e.target.value); setError(''); }} />
        </div>
      </div>

      <div className="row" style={{ gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
        {[[3,'3 days'],[7,'1 week'],[14,'2 weeks']].map(([d, label]) => (
          <button key={d} className="chip" style={{ cursor: 'pointer' }} onClick={() => setQuick(d)}>
            {label}
          </button>
        ))}
      </div>

      {error && <div className="field-error" style={{ marginTop: 8 }}>{error}</div>}

      {numDays && (
        <div className="note" style={{ marginTop: 10 }}>
          {numDays} day{numDays !== 1 ? 's' : ''} · {numDays * 3} meal slots
        </div>
      )}

      <button className="btn btn-olive btn-lg" style={{ marginTop: 22, width: '100%' }} onClick={tryStart}>
        Let's go →
      </button>

      {existingPlan && (
        <button className="btn btn-ghost" style={{ marginTop: 10, width: '100%' }}
          onClick={() => onStart(null, null, true)}>
          ← Back to current plan
        </button>
      )}

      {showConfirm && (
        <div className="modal-backdrop" onClick={() => setShowConfirm(false)}>
          <div className="modal-sheet" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="h3" style={{ marginBottom: 8 }}>Replace current plan?</div>
            <div style={{ color: 'var(--ink-soft)', marginBottom: 20, lineHeight: 1.4, fontSize: 14 }}>
              Your current plan will be cleared. Your saved recipes stay.
            </div>
            <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-terracotta" onClick={() => { setShowConfirm(false); onStart(start, end); }}>
                Yes, start fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SlotSheet ─────────────────────────────────────────────────
function SlotSheet({ slot, recipes, onAssign, onClose }) {
  const [mode, setMode] = React.useState('menu');
  const [search, setSearch] = React.useState('');
  const searchRef = React.useRef(null);

  React.useEffect(() => {
    if (mode === 'pick-recipe' && searchRef.current) searchRef.current.focus();
  }, [mode]);

  const filtered = recipes.filter(r =>
    r.main_dish_name.toLowerCase().includes(search.toLowerCase())
  );

  const MEAL_FULL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

  function assign(status, recipe_id = null) {
    onAssign(slot.id, status, recipe_id);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 4 }}>
          <span className="eyebrow">{formatDate(slot.date)} · {MEAL_FULL[slot.meal_type]}</span>
          <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ padding: '0 8px', fontSize: 16 }}>✕</button>
        </div>

        {mode === 'menu' && (
          <>
            <div className="h2 underline-sketch" style={{ display: 'inline-block', marginBottom: 16 }}>
              Fill this slot
            </div>

            <div className="col" style={{ gap: 8 }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => {
                  if (recipes.length === 0) alert('No recipes yet — add one from the Recipes tab first.');
                  else setMode('pick-recipe');
                }}>
                <span style={{ fontSize: 22 }}>🍲</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15 }}>Pick a recipe</div>
                  <div className="note">from your library · {recipes.length} saved</div>
                </div>
              </button>

              <button className="btn btn-terracotta"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => assign('eat_out')}>
                <span style={{ fontSize: 22 }}>🥡</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15, color: 'inherit' }}>Eat out</div>
                  <div className="note" style={{ color: 'rgba(253,246,236,0.75)' }}>skip groceries for this slot</div>
                </div>
              </button>

              <button className="btn btn-olive"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => assign('ad_hoc')}>
                <span style={{ fontSize: 22 }}>🤷</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15, color: 'inherit' }}>Ad hoc</div>
                  <div className="note" style={{ color: 'rgba(247,245,230,0.8)' }}>winging it · no groceries</div>
                </div>
              </button>
            </div>

            {slot.status !== 'empty' && (
              <button className="btn btn-sm btn-ghost" style={{ marginTop: 14, width: '100%' }}
                onClick={() => assign('empty')}>
                Clear this slot
              </button>
            )}
          </>
        )}

        {mode === 'pick-recipe' && (
          <>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => { setMode('menu'); setSearch(''); }}>← back</button>
              <div className="h3">Choose a recipe</div>
            </div>

            <input ref={searchRef} type="text" className="text-input" placeholder="Search…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 10 }} />

            <div className="col" style={{ gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="note" style={{ textAlign: 'center', padding: '24px 0' }}>No recipes match.</div>
              )}
              {filtered.map(r => (
                <button key={r.id} className="btn"
                  style={{ justifyContent: 'flex-start', gap: 10, textAlign: 'left', padding: '10px 12px' }}
                  onClick={() => assign('recipe', r.id)}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.main_dish_name}</div>
                    {r.side_dishes.length > 0 && (
                      <div className="note" style={{ marginTop: 2 }}>{r.side_dishes.join(' · ')}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── PlanCalendar ──────────────────────────────────────────────
function PlanCalendar({ plan, recipes, onUpdatePlan, onNewPlan, onNavigate }) {
  const [activeSlot,      setActiveSlot]      = React.useState(null);
  const [confirmNewPlan,  setConfirmNewPlan]   = React.useState(false);

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));

  const days = React.useMemo(() => {
    const map = {};
    for (const slot of plan.slots) {
      if (!map[slot.date]) map[slot.date] = {};
      map[slot.date][slot.meal_type] = slot;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [plan.slots]);

  const total       = plan.slots.length;
  const filledCount = plan.slots.filter(s => s.status !== 'empty').length;
  const recipeCount = plan.slots.filter(s => s.status === 'recipe').length;
  const numDays     = daysBetween(plan.start_date, plan.end_date);

  function handleAssign(slotId, status, recipe_id) {
    onUpdatePlan({
      ...plan,
      slots: plan.slots.map(s => s.id === slotId ? { ...s, status, recipe_id: recipe_id || null } : s),
    });
  }

  function cellContent(slot) {
    if (!slot || slot.status === 'empty') return { kind: 'empty' };
    if (slot.status === 'eat_out') return { kind: 'eatout', name: 'Eating out 🥡' };
    if (slot.status === 'ad_hoc') return { kind: 'adhoc', name: 'Ad hoc 🤷' };
    if (slot.status === 'recipe') {
      const r = recipeMap[slot.recipe_id];
      if (!r) return { kind: 'missing', name: '⚠ Recipe removed' };
      return { kind: 'recipe', name: r.main_dish_name, sides: r.side_dishes };
    }
    return { kind: 'empty' };
  }

  const BG = {
    empty:   'transparent',
    eatout:  'rgba(168,117,77,0.1)',
    adhoc:   'rgba(107,122,74,0.1)',
    recipe:  'rgba(255,255,255,0.7)',
    missing: 'rgba(168,117,77,0.07)',
  };

  return (
    <div className="page">
      {/* Header bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="h2">{formatDate(plan.start_date)} – {formatDate(plan.end_date)}</div>
          <div className="note" style={{ marginTop: 3 }}>
            {numDays} day{numDays !== 1 ? 's' : ''} · {filledCount}/{total} slots filled · {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-sm btn-olive" onClick={() => setConfirmNewPlan(true)}>Start new plan</button>
          <button className="btn btn-sm btn-brown" onClick={() => onNavigate('grocery')}>
            Grocery list →
          </button>
        </div>
      </div>

      {/* Day rows */}
      {days.map(([date, slotsByType]) => {
        const slots = ['breakfast','lunch','dinner'].map(mt => slotsByType[mt]);
        const filledHere = slots.filter(s => s && s.status !== 'empty').length;
        return (
          <div key={date} className="day-row">
            <div className="day-header">
              <span className="h3" style={{ fontSize: 15 }}>{formatDate(date)}</span>
              <span className="note">{filledHere}/3</span>
            </div>
            <div className="day-slots">
              {['breakfast','lunch','dinner'].map(mt => {
                const slot = slotsByType[mt];
                const c = cellContent(slot);
                return (
                  <div key={mt} className="day-slot-cell"
                    style={{ background: BG[c.kind] }}
                    onClick={() => slot && setActiveSlot(slot)}>
                    <div className="slot-label">{mt}</div>
                    {c.kind === 'empty'   && <div className="slot-add">+ add</div>}
                    {c.kind === 'missing' && <div className="slot-warning">{c.name}</div>}
                    {c.kind !== 'empty' && c.kind !== 'missing' && (
                      <>
                        <div className="slot-name">{c.name}</div>
                        {c.sides && c.sides.length > 0 && (
                          <div className="slot-sides">{c.sides.join(' · ')}</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {activeSlot && (
        <SlotSheet slot={activeSlot} recipes={recipes}
          onAssign={handleAssign} onClose={() => setActiveSlot(null)} />
      )}

      {confirmNewPlan && (
        <div className="modal-backdrop" onClick={() => setConfirmNewPlan(false)}>
          <div className="modal-sheet" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="h3" style={{ marginBottom: 8 }}>Start a new plan?</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
              Your current plan will be cleared.<br />
              <strong style={{ color: 'var(--ink)' }}>Your saved recipes are safe</strong> — only the calendar is reset.
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn fill" onClick={() => setConfirmNewPlan(false)}>Cancel</button>
              <button className="btn btn-olive fill" onClick={() => { setConfirmNewPlan(false); onNewPlan(); }}>
                Yes, start fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RecipeForm ────────────────────────────────────────────────
function RecipeForm({ recipe, onSave, onClose }) {
  const isEdit = !!recipe;
  const [step, setStep]               = React.useState(1);
  const [mainDish, setMainDish]       = React.useState(recipe?.main_dish_name ?? '');
  const [sides, setSides]             = React.useState(recipe?.side_dishes ?? []);
  const [sideInput, setSideInput]     = React.useState('');
  const [ingText, setIngText]         = React.useState((recipe?.ingredients ?? []).join('\n'));
  const [errors, setErrors]           = React.useState({});
  const mainRef = React.useRef(null);

  React.useEffect(() => { mainRef.current?.focus(); }, []);

  function addSide() {
    const v = sideInput.trim();
    if (!v) return;
    if (!sides.includes(v)) setSides(s => [...s, v]);
    setSideInput('');
  }

  function goStep2() {
    if (!mainDish.trim()) { setErrors({ main: 'Main dish name is required.' }); return; }
    setErrors({});
    setStep(2);
  }

  function handleSave() {
    const ingredients = ingText.split('\n').map(l => l.trim()).filter(Boolean);
    if (ingredients.length === 0) {
      setErrors({ ing: 'Add at least one ingredient so the grocery list works.' });
      return;
    }
    onSave({
      id:            recipe?.id ?? generateId(),
      main_dish_name: mainDish.trim(),
      side_dishes:   sides,
      ingredients,
      created_at:    recipe?.created_at ?? new Date().toISOString(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="eyebrow">{isEdit ? 'Edit recipe' : 'New recipe · meal bundle'}</div>
          <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ padding: '0 8px', fontSize: 16 }}>✕</button>
        </div>

        {/* Step indicator */}
        <div className="row" style={{ gap: 6, marginBottom: 18 }}>
          <div className={`step-dot${step === 1 ? ' active' : ' done'}`}>1</div>
          <div className="step-line" />
          <div className={`step-dot${step === 2 ? ' active' : ''}`}>2</div>
        </div>

        {step === 1 && (
          <>
            <div className="h2 underline-sketch" style={{ display: 'inline-block', marginBottom: 16 }}>Name the meal</div>

            <div className="field" style={{ marginBottom: 14 }}>
              <span className="field-label">Main dish *</span>
              <input ref={mainRef} type="text" className="text-input"
                value={mainDish} placeholder="e.g. Grilled Chicken Bowl"
                onChange={e => { setMainDish(e.target.value); setErrors({}); }}
                onKeyDown={e => e.key === 'Enter' && goStep2()} />
              {errors.main && <div className="field-error">{errors.main}</div>}
            </div>

            <div className="field" style={{ marginBottom: 18 }}>
              <span className="field-label">Sides <span className="note">(optional)</span></span>
              <div className="row" style={{ flexWrap: 'wrap', gap: 5, marginBottom: 6, minHeight: 24 }}>
                {sides.map(s => (
                  <span key={s} className="chip chip-olive">
                    {s}
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 0 4px', color: 'inherit', fontSize: 11, lineHeight: 1 }}
                      onClick={() => setSides(ss => ss.filter(x => x !== s))}>✕</button>
                  </span>
                ))}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <input type="text" className="text-input" value={sideInput}
                  placeholder="e.g. Rice"
                  style={{ flex: 1 }}
                  onChange={e => setSideInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSide(); } }} />
                <button className="btn btn-sm" onClick={addSide} style={{ flexShrink: 0 }}>Add</button>
              </div>
            </div>

            <div className="row" style={{ gap: 8 }}>
              <button className="btn fill" onClick={onClose}>Cancel</button>
              <button className="btn btn-brown fill" onClick={goStep2}>Next →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 10 }}>
              <div className="eyebrow" style={{ marginBottom: 2 }}>{mainDish}</div>
              <div className="h2 underline-sketch" style={{ display: 'inline-block' }}>Ingredients</div>
              <div className="note" style={{ marginTop: 4 }}>one per line — just the name</div>
            </div>

            <textarea className="ingredient-textarea"
              value={ingText}
              onChange={e => { setIngText(e.target.value); setErrors({}); }}
              placeholder={"chicken breast\nrice\nbroccoli\ngarlic\nolive oil"} />
            {errors.ing && <div className="field-error" style={{ marginTop: 4 }}>{errors.ing}</div>}

            <div className="row" style={{ gap: 8, marginTop: 14 }}>
              <button className="btn" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-brown fill" onClick={handleSave}>
                {isEdit ? 'Save changes' : 'Save recipe'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── RecipeList ────────────────────────────────────────────────
function RecipeList({ recipes, onAdd, onEdit, onDelete, onImport }) {
  const [confirmId,     setConfirmId]     = React.useState(null);
  const [importPreview, setImportPreview] = React.useState(null); // {recipes, mode}
  const fileInputRef = React.useRef();

  function exportToCSV() {
    const header = 'name,sides,ingredients';
    const rows = recipes.map(r => {
      const name        = (r.main_dish_name || '').replace(/,/g, ' ');
      const sides       = (r.side_dishes  || []).join('; ');
      const ingredients = (r.ingredients  || []).join('; ');
      return `${name},${sides},${ingredients}`;
    });
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'pantry-recipes.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-imported
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
      const dataLines = lines[0].toLowerCase().startsWith('name') ? lines.slice(1) : lines;
      const imported = dataLines.map(line => {
        const [name, sides, ingredients] = line.split(',');
        return {
          id:             generateId(),
          main_dish_name: (name        || '').trim(),
          side_dishes:    (sides       || '').split(';').map(s => s.trim()).filter(Boolean),
          ingredients:    (ingredients || '').split(';').map(i => i.trim()).filter(Boolean),
        };
      }).filter(r => r.main_dish_name);
      setImportPreview(imported);
    };
    reader.readAsText(file);
  }

  function confirmImport(mode) {
    const merged = mode === 'add'
      ? [...recipes, ...importPreview]
      : importPreview;
    onImport(merged);
    setImportPreview(null);
  }

  return (
    <div className="page">
      <div className="spread" style={{ marginBottom: 6 }}>
        <div>
          <div className="h2">Recipes</div>
          {recipes.length > 0 && <div className="note">{recipes.length} saved</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {recipes.length > 0 && (
            <button className="btn btn-sm" onClick={exportToCSV}>↓ Export</button>
          )}
          <button className="btn btn-sm" onClick={() => fileInputRef.current.click()}>↑ Import</button>
          <button className="btn btn-brown" onClick={onAdd}>＋ Add recipe</button>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)', fontFamily: 'var(--mono)', marginBottom: 16 }}>
        Export your recipes to a CSV file you can open in Excel — import to restore or move between devices.
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Import preview modal */}
      {importPreview && (
        <div className="modal-backdrop" onClick={() => setImportPreview(null)}>
          <div className="modal-sheet" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="h3" style={{ marginBottom: 6 }}>Import {importPreview.length} recipe{importPreview.length !== 1 ? 's' : ''}</div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>
              {importPreview.slice(0, 5).map(r => r.main_dish_name).join(', ')}{importPreview.length > 5 ? `… +${importPreview.length - 5} more` : ''}
            </div>
            <div style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 20 }}>
              Add to your {recipes.length} existing recipe{recipes.length !== 1 ? 's' : ''}, or replace them all?
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn fill" onClick={() => setImportPreview(null)}>Cancel</button>
              {recipes.length > 0 && (
                <button className="btn fill" onClick={() => confirmImport('add')}>Add to existing</button>
              )}
              <button className="btn btn-brown fill" onClick={() => confirmImport('replace')}>
                {recipes.length > 0 ? 'Replace all' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}


      {recipes.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 14 }}>🍲</div>
          <div className="h3" style={{ marginBottom: 8 }}>No recipes yet</div>
          <div style={{ color: 'var(--ink-soft)', marginBottom: 24, lineHeight: 1.4 }}>
            Add your first recipe — main dish, optional sides,<br />and the ingredients you'll need.
          </div>
          <button className="btn btn-brown btn-lg" onClick={onAdd}>＋ Add your first recipe</button>
        </div>
      )}

      {recipes.map(r => (
        <div key={r.id} className="recipe-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="h3" style={{ fontSize: 17 }}>{r.main_dish_name}</div>
              {r.side_dishes.length > 0 && (
                <div className="row" style={{ gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                  {r.side_dishes.map(s => <span key={s} className="chip" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
              )}
              <div className="note" style={{ marginTop: 6 }}>
                {r.ingredients.length} ingredient{r.ingredients.length !== 1 ? 's' : ''}
                {r.ingredients.length > 0 && (
                  <> · {r.ingredients.slice(0, 4).join(', ')}{r.ingredients.length > 4 ? '…' : ''}</>
                )}
              </div>
            </div>
            <div className="row" style={{ gap: 6, flexShrink: 0 }}>
              <button className="btn btn-sm" onClick={() => onEdit(r)}>Edit</button>
              <button className="btn btn-sm"
                style={{ color: 'var(--terracotta)', borderColor: 'var(--terracotta)' }}
                onClick={() => setConfirmId(r.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}

      {confirmId && (
        <div className="modal-backdrop" onClick={() => setConfirmId(null)}>
          <div className="modal-sheet" style={{ maxWidth: 360 }} onClick={e => e.stopPropagation()}>
            <div className="h3" style={{ marginBottom: 8 }}>Delete this recipe?</div>
            <div style={{ color: 'var(--ink-soft)', marginBottom: 20, fontSize: 14, lineHeight: 1.4 }}>
              Any plan slots using it will show a warning until reassigned.
            </div>
            <div className="row" style={{ gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setConfirmId(null)}>Cancel</button>
              <button className="btn btn-terracotta"
                onClick={() => { onDelete(confirmId); setConfirmId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── GroceryList ───────────────────────────────────────────────
function GroceryList({ plan, recipes }) {
  const [checked,   setChecked]  = React.useState({});
  const [copyLabel, setCopyLabel] = React.useState('Prepare list');

  const items = React.useMemo(() => generateGroceryList(plan, recipes), [plan, recipes]);

  function toggle(name) { setChecked(p => ({ ...p, [name]: !p[name] })); }

  function listText(itemList) {
    return itemList.map(i => i.name).join('\n');
  }

  async function copyToClipboard() {
    const remaining = items.filter(i => !checked[i.name]);
    if (!remaining.length) return;
    const text = listText(remaining);

    // Give feedback immediately — don't wait on clipboard permission
    setCopyLabel('📋 Ready to paste!');
    setTimeout(() => setCopyLabel('Prepare list'), 2500);

    // Try modern clipboard API first, fall back to execCommand
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch { /* silent — label already updated */ }
    }
  }

  if (!plan) {
    return (
      <div className="page">
        <div className="h2" style={{ marginBottom: 20 }}>Grocery List</div>
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 14 }}>📋</div>
          <div className="h3" style={{ marginBottom: 8 }}>No plan yet</div>
          <div style={{ color: 'var(--ink-soft)' }}>Start a meal plan first, then come back here.</div>
        </div>
      </div>
    );
  }

  const recipeSlots = plan.slots.filter(s => s.status === 'recipe').length;

  if (recipeSlots === 0) {
    return (
      <div className="page">
        <div className="h2" style={{ marginBottom: 20 }}>Grocery List</div>
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 14 }}>🤷</div>
          <div className="h3" style={{ marginBottom: 8 }}>Nothing to buy</div>
          <div style={{ color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            Your plan has no recipe slots — all meals are eat out or ad hoc.<br />
            Assign a recipe to at least one slot to generate a list.
          </div>
        </div>
      </div>
    );
  }

  const unchecked    = items.filter(i => !checked[i.name]);
  const checkedItems = items.filter(i =>  checked[i.name]);
  const numDays      = daysBetween(plan.start_date, plan.end_date);

  return (
    <div className="page">
      <div className="spread" style={{ marginBottom: 4 }}>
        <div>
          <div className="h2">Grocery List</div>
          <div className="note">
            {formatDate(plan.start_date)} – {formatDate(plan.end_date)} · {numDays} day{numDays !== 1 ? 's' : ''} · {items.length} item{items.length !== 1 ? 's' : ''} · from {recipeSlots} recipe slot{recipeSlots !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn btn-sm" onClick={copyToClipboard}>{copyLabel}</button>
      </div>
      <div style={{ fontSize: 12, color: 'var(--brown)', fontFamily: 'var(--mono)', marginBottom: 6 }}>
        Check off what you already have — copy the rest to your shopping app.
      </div>

      <div className="divider-wavy" style={{ margin: '8px 0 16px' }} />

      {/* Unchecked items */}
      {unchecked.map(item => (
        <div key={item.name} className="grocery-item" onClick={() => toggle(item.name)}>
          <span className="check" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 15 }}>{item.name}</div>
            {item.usedIn.length > 0 && (
              <div className="note" style={{ marginTop: 1 }}>used in: {item.usedIn.join(', ')}</div>
            )}
          </div>
        </div>
      ))}

      {/* Checked / got-it items */}
      {checkedItems.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="eyebrow" style={{ marginBottom: 10 }}>Already have ✓</div>
          {checkedItems.map(item => (
            <div key={item.name} className="grocery-item" style={{ opacity: 0.45 }} onClick={() => toggle(item.name)}>
              <span className="check checked" style={{ flexShrink: 0, marginTop: 2 }} />
              <span className="scribble" style={{ fontSize: 15 }}>{item.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────
function App() {
  const [view, setView]               = React.useState('plan');
  const [recipes, setRecipes]         = React.useState(() => getRecipes());
  const [plan, setPlan]               = React.useState(() => getPlan());
  const [newPlanMode, setNewPlanMode] = React.useState(false);
  const [recipeFormOpen, setRecipeFormOpen] = React.useState(false);
  const [editingRecipe, setEditingRecipe]   = React.useState(null);

  function updateRecipes(updated) { saveRecipes(updated); setRecipes(updated); }
  function updatePlan(updated)    { if (updated) savePlan(updated); else clearPlan(); setPlan(updated); }

  function openRecipeForm(r = null) { setEditingRecipe(r); setRecipeFormOpen(true); }

  function handleSaveRecipe(r) {
    updateRecipes(editingRecipe ? recipes.map(x => x.id === r.id ? r : x) : [...recipes, r]);
    setRecipeFormOpen(false);
  }

  function handleStartPlan(start, end, cancel = false) {
    if (cancel) { setNewPlanMode(false); return; }
    updatePlan({ start_date: start, end_date: end, slots: buildSlots(start, end) });
    setNewPlanMode(false);
    setView('plan');
  }

  const showDatePicker = view === 'plan' && (!plan || newPlanMode);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', fontFamily: 'var(--pen)', color: 'var(--ink)' }}>
      <Nav view={view} setView={v => { setView(v); setNewPlanMode(false); }} onAddRecipe={() => openRecipeForm(null)} />

      {showDatePicker && (
        <DateRangePicker
          existingPlan={plan}
          onStart={handleStartPlan} />
      )}
      {view === 'plan' && plan && !newPlanMode && (
        <PlanCalendar
          plan={plan}
          recipes={recipes}
          onUpdatePlan={updatePlan}
          onNewPlan={() => setNewPlanMode(true)}
          onNavigate={setView} />
      )}
      {view === 'recipes' && (
        <RecipeList recipes={recipes} onAdd={() => openRecipeForm(null)}
          onEdit={openRecipeForm}
          onDelete={id => updateRecipes(recipes.filter(r => r.id !== id))}
          onImport={updateRecipes} />
      )}
      {view === 'grocery' && (
        <GroceryList plan={plan} recipes={recipes} />
      )}

      {recipeFormOpen && (
        <RecipeForm recipe={editingRecipe} onSave={handleSaveRecipe}
          onClose={() => setRecipeFormOpen(false)} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
