## 2026-04-07 — Replace modals with inline date inputs for DRE

### Files changed
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — modified: Removed all modal code and replaced with inline native date inputs

### Changes Summary

#### Complete Simplification: No More Modals

**Before:**
- Two sequential modals for date selection
- Complex state management (`modalStep`, `handleStartApply`, `handleEndApply`)
- Custom calendar with DayPicker library
- ~220 lines of modal component code
- Animation and transition logic
- Multiple closing/opening race condition issues

**After:**
- Two inline `<input type="date">` fields directly in the card
- Native browser date picker (calendar icon clicks → OS date picker)
- Zero modals, zero race conditions
- ~250 lines of code removed
- Simple, familiar UX everyone knows

#### New UI Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Hoje] [7 dias] [Este mês] [30 dias] [Trimestre] ...  │
├─────────────────────────────────────────────────────────┤
│  Data de início          Data de fim                    │
│  [📅 __/__/____]        [📅 __/__/____]  [Consultar]   │
└─────────────────────────────────────────────────────────┘
```

- **Desktop**: Inputs side-by-side with Consultar button
- **Mobile**: Inputs stack vertically, button full-width
- Native date picker icon (📅) visible on click
- Browser's optimized date picker appears (works perfectly on mobile)

#### Code Removed
- `DateSelectionModal` component (~220 lines)
- `modalStep` state variable
- `handleStartApply`, `handleEndApply`, `handleModalClose` handlers
- `toISO()`, `isoToDate()`, `formatDateCard()` helper functions
- `MONTH_NAMES_PT`, `WEEKDAY_PT` constants
- `DayPicker` import and all custom calendar CSS
- `formatRangeLabel()` function
- `useMemo` import (no longer needed)
- `FiChevronRight`, `FiX` icon imports

#### Code Added
- Two `<input type="date">` elements with labels
- Focus/blur styling for accessibility (orange ring on focus)
- `min-h-[44px]` for mobile touch targets
- Responsive layout: `flex-col` on mobile, `flex-row` on desktop

#### State Management Simplified
```javascript
// Old state
const [modalStep, setModalStep] = useState(null) // Removed

// Direct input onChange updates
onChange={(e) => {
  setInicio(e.target.value)
  setActivePreset('custom')
  setDreData(null)
  setDespesasData(null)
}}
```

### Benefits
- ✅ **Simpler UX**: No modals, no confusion, just fill two fields
- ✅ **Better mobile**: Native date pickers are OS-optimized
- ✅ **Accessibility**: Native inputs work with screen readers
- ✅ **Less code**: ~250 lines removed, easier to maintain
- ✅ **No bugs**: No race conditions, no animation issues
- ✅ **Familiar**: Everyone knows how date inputs work
- ✅ **Fast**: Direct input, fewer clicks

### Notes
- Preset buttons still work (Hoje, 7 dias, Este mês, etc.)
- Clicking preset still auto-queries the report
- Manual date input requires clicking "Consultar" button
- All existing validation preserved (can't query without both dates)

---
