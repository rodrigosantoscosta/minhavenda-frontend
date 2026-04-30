import { useEffect, useState, useMemo } from 'react'
import type { Product, Stock } from '../../types'
import { FiPlus, FiMinus, FiSliders, FiSearch, FiAlertTriangle, FiAlertCircle, FiCheckCircle, FiPackage } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import {
  formatDateTime, PageLoader, EmptyState, AdminCard, AdminModal,
  PageTitle, Th, Tr, inputCls, inputStyle, FieldLabel, BtnPrimary, BtnSecondary, T,
} from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

// ─── Severity helpers ────────────────────────────────────────────────────────

function getSeverity(qty: number | undefined | null) {
  if (qty === undefined || qty === null) return 'unknown'
  if (qty <= 5)  return 'critical'
  if (qty <= 20) return 'low'
  return 'ok'
}

const SEVERITY = {
  critical: {
    label: 'Crítico',
    icon: FiAlertCircle,
    color: '#EF4444',
    bg:   'rgba(239,68,68,0.12)',
    bd:   'rgba(239,68,68,0.25)',
    pill: 'bg-red-500/10 text-red-400 border border-red-500/20',
  },
  low: {
    label: 'Baixo',
    icon: FiAlertTriangle,
    color: '#F59E0B',
    bg:   'rgba(245,158,11,0.12)',
    bd:   'rgba(245,158,11,0.25)',
    pill: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  ok: {
    label: 'OK',
    icon: FiCheckCircle,
    color: '#22C55E',
    bg:   'rgba(34,197,94,0.12)',
    bd:   'rgba(34,197,94,0.25)',
    pill: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  },
  unknown: {
    label: '—',
    icon: FiPackage,
    color: '#6B7280',
    bg:   'rgba(107,114,128,0.12)',
    bd:   'rgba(107,114,128,0.25)',
    pill: 'bg-gray-500/10 text-gray-500 border border-gray-500/20',
  },
}

function SeverityBadge({ qty, size = 'sm' }: { qty: number | undefined | null; size?: string }) {
  const s = getSeverity(qty)
  const cfg = SEVERITY[s]
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold uppercase tracking-wider ${cfg.pill} ${sizeClass}`}>
      <cfg.icon size={size === 'sm' ? 10 : 12} />
      {cfg.label}
    </span>
  )
}

function QtyBadge({ qty, loading }: { qty: number | undefined | null; loading: boolean }) {
  if (loading) return <span className="text-xs font-sans" style={{ color: T.muted }}>…</span>
  if (qty === undefined || qty === null) return <span className="text-xs font-sans" style={{ color: T.muted }}>—</span>
  const s = getSeverity(qty)
  const cfg = SEVERITY[s]
  return (
    <span
      className="inline-block text-base font-mono font-bold tabular-nums px-2.5 py-1 rounded-lg"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.bd}` }}
    >
      {qty}
      <span className="text-xs font-sans font-normal ml-1 opacity-70">un</span>
    </span>
  )
}

// ─── Summary bar ─────────────────────────────────────────────────────────────

type EstoqueRow = Product & { estoqueLoading?: boolean; estoque?: Stock }

function SummaryBar({ rows, activeFilter, onFilter }: { rows: EstoqueRow[]; activeFilter: string; onFilter: (f: string) => void }) {
  const loaded = rows.filter(r => !r.estoqueLoading && r.estoque)
  const counts = {
    critical: loaded.filter(r => getSeverity(r.estoque?.quantidade) === 'critical').length,
    low:      loaded.filter(r => getSeverity(r.estoque?.quantidade) === 'low').length,
    ok:       loaded.filter(r => getSeverity(r.estoque?.quantidade) === 'ok').length,
  }
  const total = rows.length
  const loadedCount = loaded.length

  const buckets = [
    { key: 'critical', ...SEVERITY.critical, count: counts.critical },
    { key: 'low',      ...SEVERITY.low,      count: counts.low },
    { key: 'ok',       ...SEVERITY.ok,       count: counts.ok },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {buckets.map(b => {
        const isActive = activeFilter === b.key
        return (
          <button
            key={b.key}
            onClick={() => onFilter(isActive ? 'all' : b.key)}
            className={`
              flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3
              p-3 sm:p-4 rounded-2xl text-left
              transition-[transform,box-shadow,background-color] duration-150
              active:scale-[0.97]
            `}
            style={{
              backgroundColor: isActive ? b.bg : T.card,
              border: `1px solid ${isActive ? b.bd : T.border}`,
              boxShadow: isActive ? `0 0 0 1px ${b.bd}` : 'none',
            }}
          >
            {/* Icon */}
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
              style={{ backgroundColor: b.bg }}
            >
              <b.icon size={16} style={{ color: b.color }} />
            </div>

            {/* Text */}
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-display font-bold tabular-nums" style={{ color: b.color }}>
                {b.count}
              </p>
              <p className="text-xs font-sans" style={{ color: T.muted }}>{b.label}</p>
            </div>
          </button>
        )
      })}

      {/* Loading progress — shown while stock is still loading */}
      {loadedCount < total && (
        <div className="col-span-3 flex items-center gap-2 px-1">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: T.border }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${(loadedCount / total) * 100}%`, backgroundColor: T.accent }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums shrink-0" style={{ color: T.muted }}>
            {loadedCount}/{total}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Stock action modal ───────────────────────────────────────────────────────

function StockModal({ open, onClose, action, produto, onSuccess }: {
  open: boolean; onClose: () => void; action: string | null
  produto: EstoqueRow | null; onSuccess: (result: Stock) => void
}) {
  const [qty, setQty] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const titles = {
    ADICIONAR: 'Adicionar Estoque',
    REMOVER:   'Remover Estoque',
    AJUSTAR:   'Ajustar para Quantidade',
  }

  const submit = async () => {
    const n = parseInt(qty)
    if (!produto || !action || isNaN(n) || n < 0) { toast.error('Informe uma quantidade válida'); return }
    setLoading(true)
    try {
      let result
      if (action === 'ADICIONAR') result = await adminService.adicionarEstoque(produto.id, n)
      if (action === 'REMOVER')   result = await adminService.removerEstoque(produto.id, n)
      if (action === 'AJUSTAR')   result = await adminService.ajustarEstoque(produto.id, n)
      onSuccess(result)
      toast.success('Estoque atualizado!')
      setQty('')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao atualizar estoque')
    } finally { setLoading(false) }
  }

  const handleClose = () => { setQty(''); onClose() }

  const accentColor = action === 'ADICIONAR' ? T.green : action === 'REMOVER' ? T.red : T.sub

  return (
    <AdminModal open={open} onClose={handleClose} title={action ? titles[action as keyof typeof titles] : ''} size="sm">
      <div className="space-y-4">
        {/* Product name */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ backgroundColor: T.bg, border: `1px solid ${T.border}` }}
        >
          <FiPackage size={16} style={{ color: T.muted }} />
          <div className="min-w-0">
            <p className="text-sm font-sans font-medium text-white truncate">{produto?.nome}</p>
            <p className="text-xs font-sans" style={{ color: T.muted }}>{produto?.categoriaNome || 'Sem categoria'}</p>
          </div>
          {produto?.estoque && (
            <QtyBadge qty={produto.estoque.quantidade} loading={false} />
          )}
        </div>

        {/* Qty input */}
        <div>
          <FieldLabel>{action === 'AJUSTAR' ? 'Nova Quantidade Total' : 'Quantidade'}</FieldLabel>
          <input
            type="number"
            min={action === 'REMOVER' ? 1 : 0}
            className={inputCls}
            style={inputStyle}
            value={qty}
            onChange={e => setQty(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoFocus
            placeholder={action === 'AJUSTAR' ? 'Ex: 50' : 'Ex: 10'}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <BtnSecondary onClick={handleClose}>Cancelar</BtnSecondary>
          <button
            onClick={submit}
            disabled={loading || !qty}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold text-white transition-[opacity,transform] duration-150 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Aguarde...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}

// ─── Action buttons ───────────────────────────────────────────────────────────

function ActionButtons({ row, onAction, compact = false }: { row: EstoqueRow; onAction: (action: string, row: EstoqueRow) => void; compact?: boolean }) {
  const btns = [
    { action: 'ADICIONAR', icon: FiPlus,    color: T.green, label: 'Adicionar' },
    { action: 'REMOVER',   icon: FiMinus,   color: T.red,   label: 'Remover'  },
    { action: 'AJUSTAR',   icon: FiSliders, color: T.sub,   label: 'Ajustar'  },
  ]

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        {btns.map(b => (
          <button
            key={b.action}
            onClick={() => onAction(b.action, row)}
            title={b.label}
            className="flex items-center justify-center w-7 h-7 rounded-lg transition-[background-color,transform] duration-100 active:scale-[0.92]"
            style={{ color: b.color, backgroundColor: `${b.color}18` }}
          >
            <b.icon size={13} />
          </button>
        ))}
      </div>
    )
  }

  // Full — for mobile cards
  return (
    <div className="grid grid-cols-3 gap-2">
      {btns.map(b => (
        <button
          key={b.action}
          onClick={() => onAction(b.action, row)}
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-sans font-semibold transition-[background-color,transform] duration-100 active:scale-[0.96]"
          style={{ color: b.color, backgroundColor: `${b.color}18`, border: `1px solid ${b.color}30` }}
        >
          <b.icon size={13} />
          {b.label}
        </button>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminEstoque() {
  const [rows, setRows]         = useState<(Product & { estoqueLoading?: boolean; estoque?: Stock })[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<{ action: string; produto: Product } | null>(null)
  const [search, setSearch]     = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [sevFilter, setSevFilter] = useState('all')
  const toast = useToast()

  // Load products then lazy-load stock in parallel
  useEffect(() => {
    adminService.getProdutos({ ativo: 'true' })
      .then(prods => {
        setRows(prods.map(p => ({ ...p, estoqueLoading: true as boolean })) as (Product & { estoqueLoading?: boolean; estoque?: Stock })[])
        setLoading(false)
        prods.forEach(p => {
          adminService.getEstoque(p.id)
            .then((estoque: Stock) => setRows(rs => rs.map(r => r.id === p.id ? { ...r, estoque, estoqueLoading: false } : r) as typeof rs))
            .catch(() => setRows(rs => rs.map(r => r.id === p.id ? { ...r, estoqueLoading: false } : r) as typeof rs))
        })
      })
      .catch(() => { toast.error('Erro ao carregar produtos'); setLoading(false) })
  }, [])

  const handleSuccess = (estoque: Stock) => {
    setRows(rs => rs.map(r => r.id === estoque.produtoId ? { ...r, estoque } : r))
  }

  const handleAction = (action: string, row: EstoqueRow) => setModal({ action, produto: row })

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const seen = new Set()
    return rows
      .filter(r => r.categoriaNome && !seen.has(r.categoriaNome) && seen.add(r.categoriaNome))
      .map(r => r.categoriaNome)
      .sort()
  }, [rows])

  // Filtered + sorted rows (critical first)
  const filtered = useMemo(() => {
    const sevOrder = { critical: 0, low: 1, ok: 2, unknown: 3 }
    return rows
      .filter(r => {
        const matchName = !search || r.nome.toLowerCase().includes(search.toLowerCase())
        const matchCat  = !catFilter || r.categoriaNome === catFilter
        const matchSev  = sevFilter === 'all' || getSeverity(r.estoque?.quantidade) === sevFilter
        return matchName && matchCat && matchSev
      })
      .sort((a, b) => {
        const sa = sevOrder[getSeverity(a.estoque?.quantidade)]
        const sb = sevOrder[getSeverity(b.estoque?.quantidade)]
        return sa !== sb ? sa - sb : a.nome.localeCompare(b.nome)
      })
  }, [rows, search, catFilter, sevFilter])

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <PageTitle subtitle={`${rows.length} produto${rows.length !== 1 ? 's' : ''} monitorado${rows.length !== 1 ? 's' : ''}`}>
          Estoque
        </PageTitle>

        {/* Summary bar */}
        {!loading && rows.length > 0 && (
          <SummaryBar rows={rows} activeFilter={sevFilter} onFilter={setSevFilter} />
        )}

        {/* Filter bar */}
        {!loading && rows.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: T.muted }} />
              <input
                placeholder="Buscar produto..."
                className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-[border-color,box-shadow] duration-150"
                style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            {categories.length > 1 && (
              <select
                className="rounded-xl px-3 py-2.5 text-sm text-white font-sans focus:outline-none focus:ring-1 focus:ring-orange-500/50 transition-[border-color] duration-150"
                style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
                value={catFilter}
                onChange={e => setCatFilter(e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
        )}

        {loading ? <PageLoader /> : rows.length === 0 ? <EmptyState message="Nenhum produto encontrado" /> : (
          <>
            {/* ── Mobile card stack — sm:hidden ── */}
            <div className="sm:hidden space-y-3">
              {filtered.length === 0 ? (
                <EmptyState message="Nenhum produto corresponde ao filtro" />
              ) : filtered.map(row => {
                const qty = row.estoque?.quantidade
                const sev = getSeverity(qty)
                const cfg = SEVERITY[sev]
                return (
                  <AdminCard key={row.id} className="p-4">
                    {/* Top row: severity + qty */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <SeverityBadge qty={qty} />
                        <p className="text-sm font-sans font-semibold text-white mt-1.5 truncate">{row.nome}</p>
                        <p className="text-xs font-sans mt-0.5" style={{ color: T.muted }}>{row.categoriaNome || 'Sem categoria'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <QtyBadge qty={qty} loading={row.estoqueLoading} />
                        {row.estoque?.atualizadoEm && (
                          <p className="text-[10px] font-mono mt-1.5" style={{ color: T.muted }}>
                            {formatDateTime(row.estoque.atualizadoEm)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <ActionButtons row={row} onAction={handleAction} compact={false} />
                  </AdminCard>
                )
              })}
            </div>

            {/* ── Desktop table — hidden sm:block ── */}
            <div className="hidden sm:block">
              <AdminCard>
                {filtered.length === 0 ? (
                  <EmptyState message="Nenhum produto corresponde ao filtro" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr>
                          <Th>Produto</Th>
                          <Th>Status</Th>
                          <Th>Quantidade</Th>
                          <Th>Atualizado em</Th>
                          <Th></Th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(row => {
                          const qty = row.estoque?.quantidade
                          return (
                            <Tr key={row.id}>
                              {/* Product */}
                              <td className="px-5 py-3.5">
                                <p className="text-sm font-sans font-medium text-white">{row.nome}</p>
                                <p className="text-xs font-sans mt-0.5" style={{ color: T.muted }}>
                                  {row.categoriaNome || 'Sem categoria'}
                                </p>
                              </td>

                              {/* Status badge */}
                              <td className="px-5 py-3.5">
                                {row.estoqueLoading
                                  ? <span className="text-xs font-sans" style={{ color: T.muted }}>…</span>
                                  : <SeverityBadge qty={qty} />
                                }
                              </td>

                              {/* Qty */}
                              <td className="px-5 py-3.5">
                                <QtyBadge qty={qty} loading={row.estoqueLoading} />
                              </td>

                              {/* Updated at */}
                              <td className="px-5 py-3.5 text-xs font-mono" style={{ color: T.sub }}>
                                {row.estoque ? formatDateTime(row.estoque.atualizadoEm) : '—'}
                              </td>

                              {/* Actions */}
                              <td className="px-5 py-3.5">
                                <ActionButtons row={row} onAction={handleAction} compact={true} />
                              </td>
                            </Tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </AdminCard>
            </div>
          </>
        )}
      </div>

      <StockModal
        open={!!modal}
        onClose={() => setModal(null)}
        action={modal?.action}
        produto={modal?.produto}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  )
}
