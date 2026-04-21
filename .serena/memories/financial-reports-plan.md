# Financial Reports (DRE) — Frontend Implementation

## Status: COMPLETE

## Overview
Financial reports page (DRE — Demonstrativo de Resultados do Exercício) allows admin to view profit/loss statements for date ranges.

## Files
- `src/pages/admin/AdminRelatoriosFinanceiros.tsx` — main reports page
- `src/pages/admin/components/DreReport.tsx` — DRE report component
- `src/pages/admin/components/DespesasReport.tsx` — expenses breakdown component

## API Endpoints

### DRE Report
```
GET /api/relatorios-financeiros/dre?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
```

**Query params:**
- `inicio`: string (required) — start date (ISO format)
- `fim`: string (required) — end date (ISO format)

**Response:** `DreResponseDto`
```typescript
{
  periodo: string
  receitaBruta: number
  deducoes: number
  receitaLiquida: number
  custoMercadorias: number
  lucroBruto: number
  despesasOperacionais: number
  lucroLiquido: number
}
```

### Expenses List
```
GET /api/relatorios-financeiros/despesas?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
```

**Response:** `DespesasResponseDto`
```typescript
{
  despesas: DespesaReport[]
  total: number
}
```

Where `DespesaReport` is:
```typescript
{
  id: string
  data: string
  descricao: string
  valor: number
  categoria: string
}
```

## UI Implementation

### Period Selector
- Preset buttons: Hoje, 7 dias, Este mês, 30 dias, Trimestre, Semestre, Ano
- Custom date range: two inline `<input type="date">` fields (no modals)
- Native browser date picker (optimized for mobile)
- "Consultar" button for custom dates (presets auto-query)

### Report Display
- DRE card showing full P&L statement
- Expenses table with category breakdown
- Loading states and empty states
- Export functionality (planned)

### Date Handling
- Dates sent as ISO strings: `YYYY-MM-DD`
- Backend expects: `DrePeriodoQueryDto` with `inicio` and `fim` fields
- Validation: both dates required, `fim` must be >= `inicio`

## Backend DTOs (verified)
- `DrePeriodoQueryDto`: `{ inicio: string, fim: string }`
- `DreResponseDto`: full P&L structure
- `DespesasResponseDto`: `{ despesas: DespesaDto[], total: number }`

## Notes
- Migration V15 adds financial reports tables
- Migration V16 seeds sample expense data
- No modal date pickers — use native `<input type="date">` for better UX
- Mobile-first: inputs stack vertically on small screens, side-by-side on desktop
