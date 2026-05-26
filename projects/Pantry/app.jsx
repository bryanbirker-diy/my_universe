// app.jsx — Pantry Meal Planner (all components)

// ─── Auth import ──────────────────────────────────────────────
const { AuthProvider: PantryAuthProvider, useAuth: usePantryAuth } = window._oursAuth;

// ── TopBar ────────────────────────────────────────────────────
function TopBar({ onAddRecipe }) {
  return (
    <header className="app-topbar">
      <a href="../../" style={{
        fontFamily: '"Cormorant Garamond", Garamond, serif',
        fontWeight: 300, fontSize: 15,
        color: 'var(--clay)', textDecoration: 'none',
        letterSpacing: '-0.01em', flexShrink: 0, opacity: 0.75,
      }} title="Back to ours">← ours</a>
      <div className="brand" style={{ flex: 1 }}>
        <span className="brand-mark" />
        Our Pantry
      </div>
      <button className="btn btn-clay btn-sm" onClick={onAddRecipe}
        style={{ flexShrink: 0 }}>
        ＋ Recipe
      </button>
    </header>
  );
}

// ── BottomNav ─────────────────────────────────────────────────
const TABS = [
  { id: 'plan',    label: 'Plan',    icon: '📅' },
  { id: 'recipes', label: 'Recipes', icon: '🍲' },
  { id: 'grocery', label: 'Grocery', icon: '🛒' },
  { id: 'pantry',  label: 'Pantry',  icon: '🌿' },
];

function BottomNav({ view, setView }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button key={t.id}
          className={`bottom-tab${view === t.id ? ' active' : ''}`}
          onClick={() => setView(t.id)}>
          <span className="tab-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  );
}

// ── DateField ─────────────────────────────────────────────────
const DOW_SHORT  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MON_SHORT  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LETTER = ['M','T','W','T','F','S','S'];

function fmtDateDisplay(iso) {
  if (!iso) return '';
  const [,m,d] = iso.split('-').map(Number);
  const dow = new Date(iso + 'T00:00:00').getDay();
  return `${DOW_SHORT[dow]} · ${MON_SHORT[m-1]} ${d}`;
}

function DateField({ label, value, onChange, min }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--ink-fade)', marginBottom: 5 }}>
        {label}
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          border: '1.5px solid var(--rule)',
          borderRadius: '6px 8px 5px 7px',
          padding: '11px 14px',
          background: 'rgba(255,255,255,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'var(--pen)', fontSize: 15,
          color: value ? 'var(--ink)' : 'var(--ink-fade)',
          pointerEvents: 'none', userSelect: 'none',
        }}>
          <span>{value ? fmtDateDisplay(value) : 'Pick a date…'}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4, flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <input type="date" value={value} min={min} onChange={onChange}
          style={{
            position: 'absolute', inset: 0, opacity: 0,
            cursor: 'pointer', width: '100%', height: '100%',
            fontSize: 16,
          }}
        />
      </div>
    </div>
  );
}

// ── CalendarMiniPreview ────────────────────────────────────────
function CalendarMiniPreview({ start, end }) {
  const s = new Date(start + 'T00:00:00');
  const year  = s.getFullYear();
  const month = s.getMonth();

  const firstDOW      = new Date(year, month, 1).getDay();
  const adjustedFirst = (firstDOW + 6) % 7; // Mon=0
  const daysInMonth   = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < adjustedFirst; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const inRange = iso >= start && iso <= end;
    cells.push({ d, iso, inRange, isStart: iso === start, isEnd: iso === end });
  }

  const numDays = daysBetween(start, end);

  return (
    <div style={{
      border: '1.5px solid var(--rule-soft)',
      borderRadius: '8px 10px 7px 9px',
      padding: '14px 14px 12px',
      background: 'rgba(255,255,255,0.45)',
      marginTop: 14,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 9, letterSpacing: '0.12em',
        textTransform: 'uppercase', color: 'var(--ink-fade)', marginBottom: 10 }}>
        Preview
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1, marginBottom: 3 }}>
        {DAY_LETTER.map((n, i) => (
          <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 9, textAlign: 'center',
            color: 'var(--ink-fade)', textTransform: 'uppercase', padding: '1px 0' }}>{n}</div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`e${i}`} style={{ height: 26 }} />;
          const isEndpoint = cell.isStart || cell.isEnd;
          const bg    = isEndpoint ? 'var(--clay)' : cell.inRange ? 'rgba(195,145,105,0.22)' : 'transparent';
          const color = isEndpoint ? '#fdf6ec' : cell.inRange ? 'var(--brown)' : 'var(--ink-fade)';
          const br    = cell.isStart && cell.isEnd ? '50%'
            : cell.isStart ? '50% 0 0 50%'
            : cell.isEnd   ? '0 50% 50% 0'
            : cell.inRange ? '0' : '4px';
          return (
            <div key={cell.iso} style={{
              height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: 11,
              background: bg, color, fontWeight: isEndpoint ? 700 : 400, borderRadius: br,
            }}>{cell.d}</div>
          );
        })}
      </div>

      <div style={{
        fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink-soft)',
        marginTop: 10, textAlign: 'center',
        borderTop: '1px solid var(--rule-soft)', paddingTop: 8,
      }}>
        {numDays} day{numDays !== 1 ? 's' : ''} · {numDays * 3} meals · {numDays} dessert slot{numDays !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ── DateRangePicker ───────────────────────────────────────────
function DateRangePicker({ onStart, existingPlan }) {
  const today = new Date().toISOString().slice(0, 10);
  const [start, setStart] = React.useState(existingPlan ? existingPlan.start_date : today);
  const [end,   setEnd]   = React.useState(existingPlan ? existingPlan.end_date   : '');
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
    if (!start || !end)  { setError('Pick a start and end date.'); return; }
    if (end < start)     { setError('End date must be after start.'); return; }
    setError('');
    if (existingPlan) { setShowConfirm(true); } else { onStart(start, end); }
  }

  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '28px 20px 48px' }}>
      <div className="h1 underline-sketch" style={{ display: 'inline-block', fontSize: 32, marginBottom: 6 }}>
        Plan a stretch.
      </div>
      <div style={{ fontFamily: 'var(--pen)', fontSize: 15, color: 'var(--ink-soft)', marginBottom: 22, lineHeight: 1.4 }}>
        Pick a range. We'll build the calendar.
      </div>

      <DateField label="Start" value={start}
        onChange={e => { setStart(e.target.value); setError(''); }} />
      <DateField label="End" value={end} min={start}
        onChange={e => { setEnd(e.target.value); setError(''); }} />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2, marginBottom: 4 }}>
        {[[7,'1 week'],[3,'3 days'],[14,'2 weeks']].map(([d, label]) => (
          <button key={d}
            className={`chip${numDays === d ? ' chip-brown' : ''}`}
            style={{ cursor: 'pointer', padding: '4px 13px', fontSize: 12 }}
            onClick={() => setQuick(d)}>
            {label}
          </button>
        ))}
        <button
          className="chip"
          style={{ cursor: 'pointer', padding: '4px 13px', fontSize: 12, borderStyle: 'dashed' }}
          onClick={() => { setStart(today); setEnd(''); }}>
          custom
        </button>
      </div>

      {error && (
        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--terracotta)', marginTop: 6 }}>
          {error}
        </div>
      )}

      {start && end && end >= start && (
        <CalendarMiniPreview start={start} end={end} />
      )}

      <button className="btn btn-clay btn-lg"
        style={{ width: '100%', justifyContent: 'center', marginTop: 20, fontSize: 15 }}
        onClick={tryStart}>
        Build our calendar →
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
function SlotSheet({ slot, recipes, plan, onAssign, onClose }) {
  const isDessert = slot.meal_type === 'dessert';

  const [mode,      setMode]      = React.useState(isDessert ? 'pick-recipe' : 'menu');
  const [search,    setSearch]    = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState(isDessert ? 'dessert' : 'meal');
  const [outLabel,  setOutLabel]  = React.useState('');
  const searchRef   = React.useRef(null);
  const outLabelRef = React.useRef(null);

  React.useEffect(() => {
    if (mode === 'pick-recipe' && searchRef.current)   searchRef.current.focus();
    if (mode === 'going-out'   && outLabelRef.current) outLabelRef.current.focus();
  }, [mode]);

  // Compute ingredient overlap with already-planned meals for smart sorting
  const planIngredients = React.useMemo(() => {
    const set = new Set();
    if (!plan) return set;
    for (const s of plan.slots) {
      if (s.id === slot.id || s.status !== 'recipe' || !s.recipe_id) continue;
      const r = recipes.find(r => r.id === s.recipe_id);
      if (!r) continue;
      for (const ing of (r.ingredients || [])) set.add(ing.trim().toLowerCase());
    }
    return set;
  }, [plan, slot, recipes]);

  const filtered = React.useMemo(() => {
    const list = recipes.filter(r => {
      const rType = r.type || 'meal';
      return rType === typeFilter &&
        r.main_dish_name.toLowerCase().includes(search.toLowerCase());
    });
    // Sort by ingredient overlap (most shared first), then alphabetically
    list.sort((a, b) => {
      const aScore = (a.ingredients || []).filter(i => planIngredients.has(i.trim().toLowerCase())).length;
      const bScore = (b.ingredients || []).filter(i => planIngredients.has(i.trim().toLowerCase())).length;
      if (bScore !== aScore) return bScore - aScore;
      return a.main_dish_name.localeCompare(b.main_dish_name);
    });
    return list;
  }, [recipes, search, typeFilter, planIngredients]);

  const hasOverlap = planIngredients.size > 0 &&
    filtered.some(r => (r.ingredients || []).some(i => planIngredients.has(i.trim().toLowerCase())));

  const MEAL_FULL = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', dessert: 'Dessert' };
  const TYPE_FILTER_OPTS = [['meal','Meals'],['dessert','Desserts'],['party_trick','Party Tricks']];

  function assign(status, recipe_id = null, label = '') {
    onAssign(slot.id, status, recipe_id, label);
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 4 }}>
          <span className="eyebrow">{formatDate(slot.date)} · {MEAL_FULL[slot.meal_type]}</span>
          <button className="btn btn-sm btn-ghost" onClick={onClose} style={{ padding: '0 8px', fontSize: 16 }}>✕</button>
        </div>

        {/* ── Main menu (non-dessert slots) ── */}
        {mode === 'menu' && (
          <>
            <div className="h2 underline-sketch" style={{ display: 'inline-block', marginBottom: 16 }}>
              Fill this slot
            </div>
            <div className="col" style={{ gap: 8 }}>
              <button className="btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => {
                  if (recipes.filter(r => (r.type || 'meal') !== 'dessert').length === 0)
                    alert('No recipes yet — add one from the Recipes tab first.');
                  else { setTypeFilter('meal'); setMode('pick-recipe'); }
                }}>
                <span style={{ fontSize: 22 }}>🍲</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15 }}>Pick a recipe</div>
                  <div className="note">from your library · {recipes.filter(r => (r.type||'meal') !== 'dessert').length} saved</div>
                </div>
              </button>

              <button className="btn btn-terracotta"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => { setOutLabel(''); setMode('going-out'); }}>
                <span style={{ fontSize: 22 }}>🎉</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15, color: 'inherit' }}>Going out</div>
                  <div className="note" style={{ color: 'rgba(253,246,236,0.75)' }}>plans, events, eating out · no groceries</div>
                </div>
              </button>

              <button className="btn btn-olive"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', gap: 12 }}
                onClick={() => assign('wing_it')}>
                <span style={{ fontSize: 22 }}>🤷</span>
                <div style={{ textAlign: 'left' }}>
                  <div className="h3" style={{ fontSize: 15, color: 'inherit' }}>Wing it</div>
                  <div className="note" style={{ color: 'rgba(247,245,230,0.8)' }}>no plan · no groceries</div>
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

        {/* ── Recipe picker ── */}
        {mode === 'pick-recipe' && (
          <>
            <div className="row" style={{ gap: 10, marginBottom: 12 }}>
              {isDessert ? (
                <>
                  <div className="h3">🍰 Add a dessert</div>
                  <div style={{ flex: 1 }} />
                  {slot.status !== 'empty' && (
                    <button className="btn btn-sm btn-ghost" onClick={() => assign('empty')}>Clear</button>
                  )}
                </>
              ) : (
                <>
                  <button className="btn btn-sm btn-ghost" onClick={() => { setMode('menu'); setSearch(''); }}>← back</button>
                  <div className="h3">Choose a recipe</div>
                </>
              )}
            </div>

            {/* Type filter chips — shown for non-dessert slots */}
            {!isDessert && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                {TYPE_FILTER_OPTS.map(([t, l]) => (
                  <button key={t}
                    className={`chip${typeFilter === t ? ' chip-brown' : ''}`}
                    style={{ cursor: 'pointer', padding: '3px 11px', fontSize: 11 }}
                    onClick={() => { setTypeFilter(t); setSearch(''); }}>
                    {l}
                  </button>
                ))}
              </div>
            )}

            <input ref={searchRef} type="text" className="text-input" placeholder="Search…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ marginBottom: 8 }} />

            {/* Smart sort indicator */}
            {hasOverlap && (
              <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--brown)',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4, opacity: 0.85 }}>
                ✦ Sorted by ingredient overlap with your plan
              </div>
            )}

            <div className="col" style={{ gap: 6, maxHeight: 300, overflowY: 'auto' }}>
              {filtered.length === 0 && (
                <div className="note" style={{ textAlign: 'center', padding: '24px 0' }}>
                  {recipes.filter(r => (r.type || 'meal') === typeFilter).length === 0
                    ? `No ${typeFilter === 'party_trick' ? 'party tricks' : typeFilter + 's'} saved yet — add one in Recipes.`
                    : 'No recipes match.'}
                </div>
              )}
              {filtered.map(r => {
                const score = (r.ingredients || []).filter(i => planIngredients.has(i.trim().toLowerCase())).length;
                return (
                  <button key={r.id} className="btn"
                    style={{ justifyContent: 'flex-start', gap: 10, textAlign: 'left', padding: '10px 12px' }}
                    onClick={() => assign('recipe', r.id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{r.main_dish_name}</div>
                      {r.side_dishes && r.side_dishes.length > 0 && (
                        <div className="note" style={{ marginTop: 2 }}>{r.side_dishes.join(' · ')}</div>
                      )}
                    </div>
                    {score > 0 && (
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--brown)',
                        background: 'rgba(138,111,78,0.12)', padding: '2px 7px',
                        borderRadius: 8, flexShrink: 0, whiteSpace: 'nowrap',
                      }}>
                        {score} shared
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* ── Going out ── */}
        {mode === 'going-out' && (
          <>
            <div className="row" style={{ gap: 10, marginBottom: 16 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => setMode('menu')}>← back</button>
              <div className="h3">What's the plan?</div>
            </div>
            <input ref={outLabelRef} type="text" className="text-input"
              value={outLabel} onChange={e => setOutLabel(e.target.value)}
              placeholder="e.g. Ang's Birthday, Going to Jane's…"
              onKeyDown={e => e.key === 'Enter' && assign('going_out', null, outLabel)}
              style={{ marginBottom: 14 }} />
            <div className="note" style={{ marginBottom: 16 }}>Optional — leave blank to just mark as going out.</div>
            <button className="btn btn-terracotta" style={{ width: '100%' }}
              onClick={() => assign('going_out', null, outLabel)}>
              Set it ✓
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── PlanCalendar ──────────────────────────────────────────────
function PlanCalendar({ plan, recipes, onUpdatePlan, onNewPlan, onNavigate }) {
  const [activeSlot,     setActiveSlot]     = React.useState(null);
  const [confirmNewPlan, setConfirmNewPlan] = React.useState(false);

  const recipeMap = Object.fromEntries(recipes.map(r => [r.id, r]));

  const days = React.useMemo(() => {
    const map = {};
    for (const slot of plan.slots) {
      if (!map[slot.date]) map[slot.date] = {};
      map[slot.date][slot.meal_type] = slot;
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [plan.slots]);

  // Stats — exclude dessert from the main meal count
  const mealSlots   = plan.slots.filter(s => s.meal_type !== 'dessert');
  const total       = mealSlots.length;
  const filledCount = mealSlots.filter(s => s.status !== 'empty').length;
  const recipeCount = plan.slots.filter(s => s.status === 'recipe').length;
  const numDays     = daysBetween(plan.start_date, plan.end_date);

  function handleAssign(slotId, status, recipe_id, label = '') {
    onUpdatePlan({
      ...plan,
      slots: plan.slots.map(s => s.id === slotId
        ? { ...s, status, recipe_id: recipe_id || null, label: label || '' }
        : s),
    });
  }

  function cellContent(slot) {
    if (!slot || slot.status === 'empty') return { kind: 'empty' };
    if (slot.status === 'eat_out'  || slot.status === 'going_out')
      return { kind: 'eatout', name: slot.label ? `🎉 ${slot.label}` : 'Going out 🎉' };
    if (slot.status === 'ad_hoc'   || slot.status === 'wing_it')
      return { kind: 'adhoc',  name: 'Wing it 🤷' };
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
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10,
        justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="h2">{formatDate(plan.start_date)} – {formatDate(plan.end_date)}</div>
          <div className="note" style={{ marginTop: 3 }}>
            {numDays} day{numDays !== 1 ? 's' : ''} · {filledCount}/{total} meals filled · {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
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
        const dessertSlot    = slotsByType['dessert'];
        const dessertContent = dessertSlot ? cellContent(dessertSlot) : null;
        const filledHere     = ['breakfast','lunch','dinner']
          .filter(mt => slotsByType[mt] && slotsByType[mt].status !== 'empty').length;

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

            {/* Dessert row — always present on new plans */}
            {dessertSlot && (
              <div
                className={`day-slot-dessert${dessertContent && dessertContent.kind !== 'empty' ? ' filled' : ''}`}
                onClick={() => setActiveSlot(dessertSlot)}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>🍰</span>
                <span className="slot-label" style={{ marginRight: 4 }}>dessert</span>
                {(!dessertContent || dessertContent.kind === 'empty') ? (
                  <span className="slot-add" style={{ marginTop: 0 }}>+ optional</span>
                ) : (
                  <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>
                    {dessertContent.name}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

      {activeSlot && (
        <SlotSheet slot={activeSlot} recipes={recipes} plan={plan}
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
const RECIPE_TYPES = [
  { value: 'meal',        label: '🍽 Meal',        note: 'breakfast, lunch or dinner' },
  { value: 'dessert',     label: '🍰 Dessert',     note: 'sweet treats & baked goods' },
  { value: 'party_trick', label: '🎉 Party Trick', note: 'dips, trays, crowd pleasers' },
];

function RecipeForm({ recipe, onSave, onClose }) {
  const isEdit = !!recipe;
  const [step,      setStep]      = React.useState(1);
  const [mainDish,  setMainDish]  = React.useState(recipe?.main_dish_name ?? '');
  const [sides,     setSides]     = React.useState(recipe?.side_dishes ?? []);
  const [sideInput, setSideInput] = React.useState('');
  const [ingText,   setIngText]   = React.useState((recipe?.ingredients ?? []).join('\n'));
  const [type,      setType]      = React.useState(recipe?.type ?? 'meal');
  const [errors,    setErrors]    = React.useState({});
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
      id:             recipe?.id ?? generateId(),
      main_dish_name: mainDish.trim(),
      side_dishes:    sides,
      ingredients,
      type,
      created_at:     recipe?.created_at ?? new Date().toISOString(),
    });
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="spread" style={{ marginBottom: 14 }}>
          <div className="eyebrow">{isEdit ? 'Edit recipe' : 'New recipe'}</div>
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

            {/* Type selector */}
            <div className="field" style={{ marginBottom: 16 }}>
              <span className="field-label">Type</span>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {RECIPE_TYPES.map(t => (
                  <button key={t.value}
                    className={`btn btn-sm${type === t.value ? ' btn-brown' : ''}`}
                    onClick={() => setType(t.value)}
                    type="button">
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="note" style={{ marginTop: 4 }}>
                {RECIPE_TYPES.find(t => t.value === type)?.note}
              </div>
            </div>

            <div className="field" style={{ marginBottom: 14 }}>
              <span className="field-label">
                {type === 'party_trick' ? 'Dish name *' : type === 'dessert' ? 'Dessert name *' : 'Main dish *'}
              </span>
              <input ref={mainRef} type="text" className="text-input"
                value={mainDish}
                placeholder={type === 'dessert' ? 'e.g. Chocolate Chip Cookies' : type === 'party_trick' ? 'e.g. Buffalo Dip' : 'e.g. Grilled Chicken Bowl'}
                onChange={e => { setMainDish(e.target.value); setErrors({}); }}
                onKeyDown={e => e.key === 'Enter' && goStep2()} />
              {errors.main && <div className="field-error">{errors.main}</div>}
            </div>

            {type !== 'party_trick' && (
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
            )}

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
              placeholder={type === 'dessert'
                ? 'butter\nsugar\nflour\nchocolate chips\neggs'
                : type === 'party_trick'
                ? 'cream cheese\nbuffalo sauce\nshredded chicken\nranch'
                : 'chicken breast\nrice\nbroccoli\ngarlic\nolive oil'} />
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
const TYPE_BADGE = {
  meal:        null,
  dessert:     { label: '🍰 Dessert',     cls: 'chip chip-terracotta' },
  party_trick: { label: '🎉 Party Trick', cls: 'chip chip-olive' },
};

function RecipeList({ recipes, onAdd, onEdit, onDelete, onImport }) {
  const [confirmId,     setConfirmId]     = React.useState(null);
  const [importPreview, setImportPreview] = React.useState(null);
  const [search,        setSearch]        = React.useState('');
  const [typeFilter,    setTypeFilter]    = React.useState('all');
  const fileInputRef = React.useRef();

  const filtered = React.useMemo(() => {
    return recipes.filter(r => {
      const rType = r.type || 'meal';
      return (typeFilter === 'all' || rType === typeFilter) &&
        r.main_dish_name.toLowerCase().includes(search.toLowerCase());
    });
  }, [recipes, search, typeFilter]);

  function exportToCSV() {
    const header = 'name,type,sides,ingredients';
    const rows = recipes.map(r => {
      const name  = (r.main_dish_name || '').replace(/,/g, ' ');
      const rtype = r.type || 'meal';
      const sides = (r.side_dishes  || []).join('; ');
      const ings  = (r.ingredients  || []).join('; ');
      return `${name},${rtype},${sides},${ings}`;
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
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = ev => {
      const lines = ev.target.result.split('\n').map(l => l.trim()).filter(Boolean);
      const dataLines = lines[0].toLowerCase().startsWith('name') ? lines.slice(1) : lines;
      const imported = dataLines.map(line => {
        const parts = line.split(',');
        // Support old format (name,sides,ingredients) and new (name,type,sides,ingredients)
        const hasType = ['meal','dessert','party_trick'].includes((parts[1] || '').trim());
        const name  = (parts[0] || '').trim();
        const type  = hasType ? (parts[1] || 'meal').trim() : 'meal';
        const sides = (hasType ? parts[2] : parts[1] || '').split(';').map(s => s.trim()).filter(Boolean);
        const ings  = (hasType ? parts[3] : parts[2] || '').split(';').map(i => i.trim()).filter(Boolean);
        return { id: generateId(), main_dish_name: name, type, side_dishes: sides, ingredients: ings };
      }).filter(r => r.main_dish_name);
      setImportPreview(imported);
    };
    reader.readAsText(file);
  }

  function confirmImport(mode) {
    const merged = mode === 'add' ? [...recipes, ...importPreview] : importPreview;
    onImport(merged);
    setImportPreview(null);
  }

  const typeCounts = React.useMemo(() => ({
    all:         recipes.length,
    meal:        recipes.filter(r => (r.type||'meal') === 'meal').length,
    dessert:     recipes.filter(r => r.type === 'dessert').length,
    party_trick: recipes.filter(r => r.type === 'party_trick').length,
  }), [recipes]);

  return (
    <div className="page">
      <div className="spread" style={{ marginBottom: 10 }}>
        <div>
          <div className="h2">Recipes</div>
          {recipes.length > 0 && (
            <div className="note">{filtered.length} of {recipes.length}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {recipes.length > 0 && (
            <button className="btn btn-sm" onClick={exportToCSV}>↓ Export</button>
          )}
          <button className="btn btn-sm" onClick={() => fileInputRef.current.click()}>↑ Import</button>
          <button className="btn btn-brown" onClick={onAdd}>＋ Add recipe</button>
        </div>
      </div>

      {/* Search + filter chips */}
      {recipes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <input type="text" className="text-input" placeholder="Search recipes…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[['all','All'],['meal','Meals'],['dessert','Desserts'],['party_trick','Party Tricks']].map(([t, l]) => (
              <button key={t}
                className={`chip${typeFilter === t ? ' chip-brown' : ''}`}
                style={{ cursor: 'pointer', padding: '3px 11px', fontSize: 11 }}
                onClick={() => setTypeFilter(t)}>
                {l}
                {typeCounts[t] > 0 && (
                  <span style={{ opacity: 0.6, marginLeft: 3 }}>{typeCounts[t]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

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

      {filtered.length === 0 && recipes.length > 0 && (
        <div className="note" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-soft)' }}>
          No recipes match your filter.
        </div>
      )}

      {filtered.map(r => {
        const badge = TYPE_BADGE[r.type || 'meal'];
        return (
          <div key={r.id} className="recipe-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                  <div className="h3" style={{ fontSize: 17 }}>{r.main_dish_name}</div>
                  {badge && <span className={badge.cls} style={{ fontSize: 10 }}>{badge.label}</span>}
                </div>
                {r.side_dishes.length > 0 && (
                  <div className="row" style={{ gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
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
        );
      })}

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
function GroceryList({ plan, recipes, pantry, onAddStaple }) {
  const [checked,   setChecked]   = React.useState({});
  const [copyLabel, setCopyLabel] = React.useState('Prepare list');

  const items = React.useMemo(
    () => generateGroceryList(plan, recipes, pantry),
    [plan, recipes, pantry]
  );

  function toggle(name) { setChecked(p => ({ ...p, [name]: !p[name] })); }

  async function copyToClipboard() {
    const remaining = items.filter(i => !checked[i.name]);
    if (!remaining.length) return;
    const text = remaining.map(i => i.name).join('\n');
    setCopyLabel('📋 Ready to paste!');
    setTimeout(() => setCopyLabel('Prepare list'), 2500);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      } catch { /* silent */ }
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

  if (recipeSlots === 0 && !(pantry?.runningLow?.length)) {
    return (
      <div className="page">
        <div className="h2" style={{ marginBottom: 20 }}>Grocery List</div>
        <div className="empty-state">
          <div style={{ fontSize: 48, marginBottom: 14 }}>🤷</div>
          <div className="h3" style={{ marginBottom: 8 }}>Nothing to buy</div>
          <div style={{ color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            Assign a recipe to at least one slot, or add items to Running Low in Pantry.
          </div>
        </div>
      </div>
    );
  }

  const unchecked    = items.filter(i => !checked[i.name]);
  const checkedItems = items.filter(i =>  checked[i.name]);
  const numDays      = daysBetween(plan.start_date, plan.end_date);

  // Pantry stats
  const staplesCount  = pantry?.staples?.length  || 0;
  const onHandCount   = pantry?.onHand?.length   || 0;
  const runningLowCount = items.filter(i => i.runningLow).length;

  return (
    <div className="page">
      <div className="spread" style={{ marginBottom: 4 }}>
        <div>
          <div className="h2">Grocery List</div>
          <div className="note">
            {formatDate(plan.start_date)} – {formatDate(plan.end_date)} · {numDays} day{numDays !== 1 ? 's' : ''} · {items.length} item{items.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button className="btn btn-sm" onClick={copyToClipboard}>{copyLabel}</button>
      </div>

      {/* Pantry summary chips */}
      {(staplesCount > 0 || onHandCount > 0 || runningLowCount > 0) && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8, marginBottom: 4 }}>
          {staplesCount > 0 && (
            <span className="chip" style={{ fontSize: 10 }}>
              ⭐ {staplesCount} staple{staplesCount !== 1 ? 's' : ''} hidden
            </span>
          )}
          {onHandCount > 0 && (
            <span className="chip" style={{ fontSize: 10 }}>
              ✅ {onHandCount} on hand hidden
            </span>
          )}
          {runningLowCount > 0 && (
            <span className="chip chip-terracotta" style={{ fontSize: 10 }}>
              🔔 {runningLowCount} running low added
            </span>
          )}
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--brown)', fontFamily: 'var(--mono)', marginTop: 8, marginBottom: 6 }}>
        Check off what you have · ☆ to save as a staple · copy the rest to your shopping app.
      </div>

      <div className="divider-wavy" style={{ margin: '8px 0 16px' }} />

      {/* Unchecked items */}
      {unchecked.map(item => (
        <div key={item.name} className="grocery-item" onClick={() => toggle(item.name)}>
          <span className="check" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15 }}>{item.name}</div>
            {item.usedIn.length > 0 && (
              <div className="note" style={{ marginTop: 1 }}>used in: {item.usedIn.join(', ')}</div>
            )}
            {item.runningLow && (
              <div className="note" style={{ marginTop: 1, color: 'var(--terracotta)' }}>🔔 running low</div>
            )}
          </div>
          {!item.runningLow && onAddStaple && (
            <button
              title="Save as staple — never add to grocery list again"
              onClick={e => { e.stopPropagation(); onAddStaple(item.name); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-fade)', fontSize: 17, padding: '2px 4px',
                flexShrink: 0, lineHeight: 1, transition: 'color .1s',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--clay)'}
              onMouseLeave={e => e.target.style.color = 'var(--ink-fade)'}>
              ☆
            </button>
          )}
        </div>
      ))}

      {/* Checked items */}
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

// ── PantrySection (sub-component) ─────────────────────────────
function PantrySection({ title, icon, description, accentColor, items, inputValue, onInputChange, onAdd, onRemove }) {
  function handleAdd() {
    const v = inputValue.trim();
    if (!v) return;
    onAdd(v);
  }
  return (
    <div className="pantry-section">
      <div className="pantry-section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span className="h3" style={{ fontSize: 17 }}>{title}</span>
            <span className="eyebrow" style={{ marginLeft: 4, opacity: 0.7 }}>{items.length}</span>
          </div>
          <div className="note" style={{ marginTop: 3 }}>{description}</div>
        </div>
      </div>

      <div>
        {items.length === 0 && (
          <div className="note" style={{ padding: '10px 14px', fontStyle: 'italic' }}>None added yet.</div>
        )}
        {items.map(item => (
          <div key={item} className="pantry-item">
            <span style={{ flex: 1, fontSize: 14 }}>{item}</span>
            <button onClick={() => onRemove(item)}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--ink-fade)', fontSize: 15, padding: '2px 6px', lineHeight: 1 }}
              title="Remove">
              ✕
            </button>
          </div>
        ))}
      </div>

      <div style={{ padding: '8px 14px 10px', borderTop: '1px dotted var(--rule-soft)' }}>
        <div className="row" style={{ gap: 6 }}>
          <input type="text" className="text-input"
            value={inputValue}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            placeholder="Add item…"
            style={{ flex: 1, fontSize: 13 }} />
          <button className="btn btn-sm" onClick={handleAdd}>Add</button>
        </div>
      </div>
    </div>
  );
}

// ── PantryTab ─────────────────────────────────────────────────
function PantryTab({ pantry, onUpdatePantry }) {
  const [staplesInput,    setStaplesInput]    = React.useState('');
  const [onHandInput,     setOnHandInput]     = React.useState('');
  const [runningLowInput, setRunningLowInput] = React.useState('');

  function addToSection(sectionKey, rawValue, setInput) {
    const trimmed = rawValue.trim();
    if (!trimmed) return;
    const current = pantry[sectionKey] || [];
    if (current.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setInput('');
      return;
    }
    onUpdatePantry({ ...pantry, [sectionKey]: [...current, trimmed] });
    setInput('');
  }

  function removeFromSection(sectionKey, value) {
    onUpdatePantry({ ...pantry, [sectionKey]: (pantry[sectionKey] || []).filter(i => i !== value) });
  }

  return (
    <div className="page">
      <div className="h2" style={{ marginBottom: 4 }}>Pantry</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink-soft)', marginBottom: 22, lineHeight: 1.6 }}>
        Control what shows up on your grocery list. Staples are always hidden. On Hand hides items for this plan. Running Low adds to your list even without a recipe.
      </div>

      <PantrySection
        title="Staples" icon="⭐" accentColor="var(--brown)"
        description="Always on hand — never added to grocery list"
        items={pantry.staples || []}
        inputValue={staplesInput}
        onInputChange={setStaplesInput}
        onAdd={v => addToSection('staples', v, setStaplesInput)}
        onRemove={v => removeFromSection('staples', v)} />

      <PantrySection
        title="On Hand" icon="✅" accentColor="var(--olive)"
        description="Have it this week — excluded from this grocery list, cleared on new plan"
        items={pantry.onHand || []}
        inputValue={onHandInput}
        onInputChange={setOnHandInput}
        onAdd={v => addToSection('onHand', v, setOnHandInput)}
        onRemove={v => removeFromSection('onHand', v)} />

      <PantrySection
        title="Running Low" icon="🔔" accentColor="var(--terracotta)"
        description="Need to grab — appended to your grocery list regardless of recipes"
        items={pantry.runningLow || []}
        inputValue={runningLowInput}
        onInputChange={setRunningLowInput}
        onAdd={v => addToSection('runningLow', v, setRunningLowInput)}
        onRemove={v => removeFromSection('runningLow', v)} />
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────
function App() {
  const { household } = usePantryAuth();
  const householdId = household?.id;

  const [view,           setView]           = React.useState('plan');
  const [recipes,        setRecipes]        = React.useState(() => getRecipes());
  const [plan,           setPlan]           = React.useState(() => getPlan());
  const [pantry,         setPantry]         = React.useState(() => getPantry());
  const [newPlanMode,    setNewPlanMode]    = React.useState(false);
  const [recipeFormOpen, setRecipeFormOpen] = React.useState(false);
  const [editingRecipe,  setEditingRecipe]  = React.useState(null);

  // Real-time subscriptions — kick in once we have a householdId
  React.useEffect(() => {
    if (!householdId) return;
    const unsubR  = subscribeRecipes(householdId, setRecipes);
    const unsubP  = subscribePlan(householdId, setPlan);
    const unsubPa = subscribePantry(householdId, setPantry);
    return () => { unsubR(); unsubP(); unsubPa(); };
  }, [householdId]);

  // ── Recipes CRUD ────────────────────────────────────────────
  function updateRecipes(updated) {
    saveRecipes(updated);
    setRecipes(updated);
  }

  async function handleSaveRecipe(r) {
    const updated = editingRecipe
      ? recipes.map(x => x.id === r.id ? r : x)
      : [...recipes, r];
    updateRecipes(updated);
    setRecipeFormOpen(false);
    setEditingRecipe(null);
    saveRecipeFirestore(householdId, r).catch(console.error);
  }

  async function handleDeleteRecipe(id) {
    const updated = recipes.filter(r => r.id !== id);
    updateRecipes(updated);
    deleteRecipeFirestore(householdId, id).catch(console.error);
  }

  // ── Plan CRUD ───────────────────────────────────────────────
  function updatePlan(updated) {
    if (updated) savePlan(updated); else clearPlan();
    setPlan(updated);
    savePlanFirestore(householdId, updated).catch(console.error);
  }

  // ── Pantry CRUD ─────────────────────────────────────────────
  function updatePantry(updated) {
    savePantry(updated);
    setPantry(updated);
    savePantryFirestore(householdId, updated).catch(console.error);
  }

  function handleAddStaple(name) {
    const key     = name.trim().toLowerCase();
    if (!key) return;
    const current = pantry.staples || [];
    if (current.some(i => i.toLowerCase() === key)) return; // already a staple
    updatePantry({ ...pantry, staples: [...current, name.trim()] });
  }

  // ── Shared helpers ──────────────────────────────────────────
  function openRecipeForm(r = null) { setEditingRecipe(r); setRecipeFormOpen(true); }

  function handleStartPlan(start, end, cancel = false) {
    if (cancel) { setNewPlanMode(false); return; }
    updatePlan({ start_date: start, end_date: end, slots: buildSlots(start, end) });
    // Clear "on hand" items when a new plan starts
    updatePantry({ ...pantry, onHand: [] });
    setNewPlanMode(false);
    setView('plan');
  }

  const showDatePicker = view === 'plan' && (!plan || newPlanMode);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper-2)', fontFamily: 'var(--pen)', color: 'var(--ink)' }}>
      <TopBar onAddRecipe={() => openRecipeForm(null)} />

      {showDatePicker && (
        <DateRangePicker existingPlan={plan} onStart={handleStartPlan} />
      )}
      {view === 'plan' && plan && !newPlanMode && (
        <PlanCalendar
          plan={plan} recipes={recipes}
          onUpdatePlan={updatePlan}
          onNewPlan={() => setNewPlanMode(true)}
          onNavigate={setView} />
      )}
      {view === 'recipes' && (
        <RecipeList recipes={recipes}
          onAdd={() => openRecipeForm(null)}
          onEdit={openRecipeForm}
          onDelete={handleDeleteRecipe}
          onImport={updated => {
            updateRecipes(updated);
            updated.forEach(r => saveRecipeFirestore(householdId, r).catch(console.error));
          }} />
      )}
      {view === 'grocery' && (
        <GroceryList plan={plan} recipes={recipes} pantry={pantry} onAddStaple={handleAddStaple} />
      )}
      {view === 'pantry' && (
        <PantryTab pantry={pantry} onUpdatePantry={updatePantry} />
      )}

      <BottomNav view={view} setView={v => { setView(v); setNewPlanMode(false); }} />

      {recipeFormOpen && (
        <RecipeForm recipe={editingRecipe} onSave={handleSaveRecipe}
          onClose={() => { setRecipeFormOpen(false); setEditingRecipe(null); }} />
      )}
    </div>
  );
}

function PantryRoot() {
  return (
    <PantryAuthProvider>
      <App />
    </PantryAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PantryRoot />);
