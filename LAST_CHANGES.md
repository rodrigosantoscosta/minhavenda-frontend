## 2026-04-07 — Replace DRE Custom Date Panel with Two Separate Modals

### Files changed
- `src/pages/admin/AdminRelatoriosFinanceiros.jsx` — modified: Replaced single range-picker modal with two separate sequential modals

### Changes Summary

#### Complete Restructure of Date Selection Flow

**Old Flow (Range Picker):**
- Single modal with calendar in range mode
- User selected start and end dates on same calendar
- Complex range highlighting logic
- Auto-applied both dates at once

**New Flow (Two Separate Modals):**
1. User clicks "Personalizado" → Modal 1 opens
2. **Modal 1**: "Selecione a data de início"
   - Single date calendar
   - User picks start date
   - Click "OK" → Modal closes
3. **Modal 2**: "Selecione a data de fim" (opens automatically)
   - Single date calendar  
   - User picks end date
   - Click "OK" → Modal closes
4. Both dates displayed in separate cards
5. User clicks "Consultar" button manually

#### Implementation Details

**Replaced DateRangeModal with DateSelectionModal:**
- New component accepts `step` prop ('start' or 'end')
- Mode changed from `mode="range"` to `mode="single"` in DayPicker
- Simpler calendar without range highlighting CSS
- Shows selected date with weekday in date card
- "OK" button instead of "Aplicar período"

**Updated State Management:**
- Changed `modalOpen` (boolean) → `modalStep` (null | 'start' | 'end')
- Added `handleStartApply`: sets start date, opens end date modal
- Added `handleEndApply`: sets end date, closes modal (no auto-query)
- Added `handleModalClose`: resets modal step to null

**Enhanced Date Display:**
- Replaced single range label with two separate date cards
- Each card shows: label (Início/Fim) + formatted date
- Cards have borders and background for visual separation
- Arrow icon between cards shows direction
- Empty state shows "—" for unselected dates

**Removed Features:**
- Step indicator (1 → 2) from previous iteration
- Range selection CSS (`.rdp-range_start`, `.rdp-range_middle`, `.rdp-range_end`)
- Disabled dates logic (no longer needed)
- Reset button (simpler to just close and reopen modal)
- Auto-consultar on apply (user must click button)

### Notes
- Modal animation and styling preserved from previous versions
- Both modals use same component, just different `step` prop
- No breaking changes to preset buttons (7 days, This month, etc.)
- Consultar button only enabled when both dates are set (existing validation)
- Pre-existing React lint warning about setState in useEffect (matches pattern used throughout codebase)

---
