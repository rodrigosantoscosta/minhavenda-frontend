import { useState, useCallback, useMemo, useRef, useEffect, forwardRef } from 'react'
import { FiCalendar, FiCheck, FiChevronRight, FiX } from 'react-icons/fi'
import { DayPicker } from 'react-day-picker'
import { ptBR } from 'react-day-picker/locale'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { T, PageTitle, AdminCard, PageLoader, EmptyState } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'
import DreReport from './components/DreReport'
import DespesasReport from './components/DespesasReport'

const TABS = ['DRE', 'Despesas']

// ─── Period presets ───────────────────────────────────────────────────────────

const PRESETS = [
  { label: 'Hoje',        key: 'today'     },
  { label: '7 dias',      key: '7d'        },
  { label: 'Este mês',    key: 'month'     },
  { label: '30 dias',     key: '30d'       },
  { label: 'Trimestre',   key: 'quarter'   },
  { label: 'Mês passado', key: 'lastMonth' },
]

function dateToISO(d) {
  return d.toISOString().split('T')[0]
}
function getToday() {
  return dateToISO(new Date())
}
function getFirstOfMonth() {
  const d = new Date()
  d.setDate(1)
  return dateToISO(d)
}

function resolvePreset(key) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  switch (key) {
    case 'today':
      return { inicio: dateToISO(today), fim: getToday() }
    case '7d': {
      const start = new Date(today); start.setDate(start.getDate() - 6)
      return { inicio: dateToISO(start), fim: getToday() }
    }
    case 'month':
      return { inicio: getFirstOfMonth(), fim: getToday() }
    case '30d': {
      const start = new Date(today); start.setDate(start.getDate() - 29)
      return { inicio: dateToISO(start), fim: getToday() }
    }
    case 'quarter': {
      const start = new Date(today); start.setDate(start.getDate() - 89)
      return { inicio: dateToISO(start), fim: getToday() }
    }
    case 'lastMonth': {
      const y = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
      const m = now.getMonth() === 0 ? 11 : now.getMonth() - 1
      const first = new Date(y, m, 1)
      const last = new Date(y, m + 1, 0)
      return { inicio: dateToISO(first), fim: dateToISO(last) }
    }
    default:
      return { inicio: getFirstOfMonth(), fim: getToday() }
  }
}

function formatRangeLabel(inicio, fim) {
  const opts = { day: '2-digit', month: 'short' }
  const s = new Date(inicio + 'T00:00:00').toLocaleDateString('pt-BR', opts)
  const f = new Date(fim + 'T00:00:00').toLocaleDateString('pt-BR', { ...opts, year: 'numeric' })
  return `${s} — ${f}`
}

function toISO(d) {
  if (!d) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}
function isoToDate(iso) {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const MONTH_NAMES_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const WEEKDAY_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

function formatDateCard(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  return {
    day:     String(d.getDate()).padStart(2, '0'),
    month:   MONTH_NAMES_PT[d.getMonth()].slice(0, 3),
    year:    String(d.getFullYear()),
    weekday: WEEKDAY_PT[d.getDay()],
  }
}

// ─── Date Selection Modal (Single Date Picker) ────────────────────────────────

function DateSelectionModal({ open, onClose, onApply, step, initialDate }) {
  const [selectedDate, setSelectedDate] = useState(initialDate || '')
  const [anim, setAnim] = useState(open ? 'visible' : 'hidden')

  const isStartStep = step === 'start'
  const title = isStartStep ? 'Selecione a data de início' : 'Selecione a data de fim'
  const subtitle = isStartStep ? 'Escolha quando o período começa' : 'Escolha quando o período termina'

  // Sync local state when modal opens
  useEffect(() => {
    if (open) {
      setSelectedDate(initialDate || '')
      setAnim('mounting')
      const raf = requestAnimationFrame(() =>
        requestAnimationFrame(() => setAnim('visible'))
      )
      return () => cancelAnimationFrame(raf)
    } else {
      setAnim('unmounting')
      const t = setTimeout(() => setAnim('hidden'), 220)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (anim === 'hidden') return null

  const visible = anim === 'visible'
  const backdropStyle = {
    opacity:    visible ? 1 : 0,
    transition: 'opacity 200ms cubic-bezier(0.2,0,0,1)',
  }
  const panelStyle = {
    opacity:   visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
    transition: 'opacity 220ms cubic-bezier(0.2,0,0,1), transform 220ms cubic-bezier(0.2,0,0,1)',
  }

  const selected = selectedDate ? isoToDate(selectedDate) : undefined

  function handleSelect(day) {
    if (!day) {
      setSelectedDate('')
      return
    }
    setSelectedDate(toISO(day))
  }

  function handleApply() {
    if (!selectedDate) return
    onApply(selectedDate)
    onClose()
  }

  const dateCard = formatDateCard(selectedDate)
  const canApply = !!selectedDate

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={backdropStyle}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          ...panelStyle,
          backgroundColor: T.card,
          border: `1px solid ${T.border}`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs mt-0.5" style={{ color: T.muted }}>{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-xl transition-colors duration-150"
            style={{ backgroundColor: T.border }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = T.border2}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = T.border}
            aria-label="Fechar"
          >
            <FiX size={14} style={{ color: T.sub }} />
          </button>
        </div>

        {/* ── Selected date display ──────────────────────────────────── */}
        <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div
            className="rounded-xl px-3 py-2.5 transition-[border-color,box-shadow] duration-150"
            style={{
              backgroundColor: T.bg,
              border: `1px solid ${selectedDate ? T.accentBd : T.border}`,
              boxShadow: selectedDate ? `0 0 0 3px ${T.accentBg}` : 'none',
            }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: T.muted }}>
              {isStartStep ? 'Início' : 'Fim'}
            </p>
            {dateCard ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold tabular-nums text-white">{dateCard.day}</span>
                <span className="text-sm font-medium" style={{ color: T.accent }}>{dateCard.month}</span>
                <span className="text-xs ml-0.5" style={{ color: T.muted }}>{dateCard.year}</span>
                <span className="text-xs ml-1" style={{ color: T.muted }}>({dateCard.weekday})</span>
              </div>
            ) : (
              <p className="text-xs" style={{ color: T.border2 }}>Nenhuma data selecionada</p>
            )}
          </div>
        </div>

        {/* ── Calendar ───────────────────────────────────────────────── */}
        <div className="px-4 py-3 overflow-y-auto">
          <style>{`
            .rdp-modal-root { --rdp-accent-color: ${T.accent}; --rdp-accent-background-color: ${T.accentBg}; }
            .rdp-modal-root .rdp-months { display: block; }
            .rdp-modal-root .rdp-caption {
              color: #fff; display: flex; justify-content: center; align-items: center;
              font-weight: 600; font-size: 14px; padding-bottom: 8px; font-family: inherit;
            }
            .rdp-modal-root .rdp-nav { position: static; }
            .rdp-modal-root .rdp-button_icon {
              color: #fff; border-radius: 8px; width: 30px; height: 30px;
              cursor: pointer; transition: background-color 120ms ease;
            }
            .rdp-modal-root .rdp-button_icon:hover { background-color: rgba(255,255,255,0.1); }
            .rdp-modal-root .rdp-month_grid {
              width: 100%; border-collapse: separate; border-spacing: 2px 3px;
            }
            .rdp-modal-root .rdp-weekdays { border-bottom: 1px solid ${T.border}; padding-bottom: 5px; margin-bottom: 3px; }
            .rdp-modal-root .rdp-weekday {
              color: ${T.muted}; font-size: 11px; font-weight: 600;
              padding-bottom: 3px; text-align: center;
            }
            .rdp-modal-root .rdp-day_button {
              width: 34px; height: 34px; min-width: 34px; min-height: 34px;
              border-radius: 9px; font-size: 13px; font-weight: 500;
              color: #E5E7EB; background: transparent; border: 1px solid transparent;
              cursor: pointer;
              transition: background-color 100ms ease, color 100ms ease, transform 120ms cubic-bezier(0.2,0,0,1);
              display: inline-flex; align-items: center; justify-content: center;
              font-family: inherit;
            }
            .rdp-modal-root .rdp-day_button:hover { background-color: rgba(255,255,255,0.08); color: #fff; }
            .rdp-modal-root .rdp-day_button:active { transform: scale(0.96); }
            .rdp-modal-root .rdp-day_button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 1px; }
            /* Selected */
            .rdp-modal-root .rdp-day_selected {
              background-color: ${T.accent} !important; color: #000 !important; font-weight: 700;
              box-shadow: 0 0 0 3px rgba(249,115,22,0.2);
            }
            /* Misc */
            .rdp-modal-root .rdp-day_outside { opacity: 0.35; }
            .rdp-modal-root .rdp-day_outside .rdp-day_button { color: ${T.border2}; }
            .rdp-modal-root .rdp-day_today .rdp-day_button {
              border: 1px solid ${T.accent}; font-weight: 600;
            }
            .rdp-modal-root .rdp-day_hidden { opacity: 0.25; }
            .rdp-modal-root .rdp-day_hidden .rdp-day_button { cursor: default; color: ${T.muted}; }
          `}</style>
          <DayPicker
            className="rdp-modal-root"
            mode="single"
            locale={ptBR}
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected || new Date()}
            showOutsideDays
            fixedWeeks
          />
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${T.border}` }}
        >
          <button
            onClick={onClose}
            className="flex-1 min-h-[40px] rounded-xl text-sm font-semibold transition-[background-color,transform] duration-150 active:scale-[0.96]"
            style={{ backgroundColor: T.border, color: T.sub }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = T.border2}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = T.border}
          >
            Cancelar
          </button>
          <button
            onClick={handleApply}
            disabled={!canApply}
            className="flex-1 min-h-[40px] rounded-xl text-sm font-semibold transition-[background-color,transform,opacity] duration-150 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: T.accent, color: '#000' }}
            onMouseEnter={e => { if (canApply) e.currentTarget.style.backgroundColor = '#EA6C10' }}
            onMouseLeave={e => { if (canApply) e.currentTarget.style.backgroundColor = T.accent }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Preset pill ─────────────────────────────────────────────────────────────

const PresetPill = forwardRef(({ label, active, onClick, id }, ref) => (
  <button
    ref={ref}
    id={id}
    onClick={onClick}
    aria-pressed={active}
    className="flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.96] flex-shrink-0"
    style={{
      backgroundColor: active ? T.accentBg : 'transparent',
      color:  active ? T.accent : T.sub,
      border: `1px solid ${active ? T.accentBd : T.border}`,
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = '#E5E7EB' } }}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.color = T.sub   } }}
  >
    {active && <FiCheck size={11} />}
    {label}
  </button>
))

// ─── Results fade-in ──────────────────────────────────────────────────────────

function ResultsFadeIn({ children }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0'
      ref.current.style.transform = 'translateY(6px)'
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (ref.current) {
            ref.current.style.transition = 'opacity 250ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)'
            ref.current.style.opacity = '1'
            ref.current.style.transform = 'translateY(0)'
          }
        })
      )
    }
  }, [children])
  return <div ref={ref}>{children}</div>
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminRelatoriosFinanceiros() {
  const [activeTab,    setActiveTab]    = useState('DRE')
  const [activePreset, setActivePreset] = useState('month')
  const [modalStep,    setModalStep]    = useState(null) // null | 'start' | 'end'
  const [inicio,       setInicio]       = useState(getFirstOfMonth())
  const [fim,          setFim]          = useState(getToday())
  const [dreData,      setDreData]      = useState(null)
  const [despesasData, setDespesasData] = useState(null)
  const [loading,      setLoading]      = useState(false)
  const toast = useToast()

  const consultar = useCallback(async (i = inicio, f = fim) => {
    if (!i || !f) { toast.warning('Selecione as datas de início e fim'); return }
    if (new Date(i) > new Date(f)) { toast.warning('Data de início não pode ser posterior ao fim'); return }

    setLoading(true)
    try {
      if (activeTab === 'DRE') {
        setDreData(await adminService.getDRE(i, f))
      } else {
        setDespesasData(await adminService.getDespesas(i, f))
      }
    } catch {
      toast.error('Erro ao carregar relatório')
    } finally {
      setLoading(false)
    }
  }, [activeTab, inicio, fim, toast])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setDreData(null)
    setDespesasData(null)
  }

  const handlePreset = (key) => {
    if (key === 'custom') { setModalStep('start'); return }
    const { inicio: i, fim: f } = resolvePreset(key)
    setInicio(i); setFim(f)
    setActivePreset(key)
    setDreData(null); setDespesasData(null)
    // query with resolved values directly
    setTimeout(() => consultar(i, f), 0)
  }

  const handleStartApply = useCallback((selectedDate) => {
    setInicio(selectedDate)
    // Use requestAnimationFrame to ensure first modal closes before second opens
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setModalStep('end')
      })
    })
  }, [])

  const handleEndApply = useCallback((selectedDate) => {
    setFim(selectedDate)
    setActivePreset('custom')
    setModalStep(null)
    // Don't auto-consultar, let user click the button
  }, [])

  const handleModalClose = useCallback(() => {
    setModalStep(null)
  }, [])

  const rangeLabel = useMemo(() => formatRangeLabel(inicio, fim), [inicio, fim])
  const isCustomActive = activePreset === 'custom'

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageTitle subtitle="Demonstrativo de Resultado do Exercício e Despesas Operacionais">
          Relatórios Financeiros
        </PageTitle>

        <div className="space-y-4">
          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <div className="flex gap-1" style={{ borderBottom: `1px solid ${T.border}` }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-t-lg transition-[color,background-color] duration-150 active:scale-[0.96]"
                style={{
                  color: activeTab === tab ? T.accent : T.muted,
                  backgroundColor: activeTab === tab ? T.surface : 'transparent',
                  borderBottom: activeTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
                }}
                onMouseEnter={e => { if (activeTab !== tab) e.currentTarget.style.color = T.sub }}
                onMouseLeave={e => { if (activeTab !== tab) e.currentTarget.style.color = T.muted }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Period Selector Card ─────────────────────────────────── */}
          <AdminCard>
            <div className="p-4 sm:p-5 space-y-4">

              {/* Presets row */}
              <div className="flex flex-wrap gap-2" role="group" aria-label="Períodos predefinidos">
                {PRESETS.map((p) => (
                  <PresetPill
                    key={p.key}
                    label={p.label}
                    active={activePreset === p.key}
                    onClick={() => handlePreset(p.key)}
                    id={`preset-${p.key}`}
                  />
                ))}

                {/* Custom period button — distinct style */}
                <button
                  onClick={() => handlePreset('custom')}
                  aria-pressed={isCustomActive}
                  className="flex items-center gap-1.5 min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-[background-color,color,border-color,transform] duration-150 active:scale-[0.96] flex-shrink-0"
                  style={{
                    backgroundColor: isCustomActive ? T.accentBg : 'transparent',
                    color:  isCustomActive ? T.accent : T.sub,
                    border: `1px solid ${isCustomActive ? T.accentBd : T.border}`,
                  }}
                  onMouseEnter={e => { if (!isCustomActive) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = '#E5E7EB' } }}
                  onMouseLeave={e => { if (!isCustomActive) { e.currentTarget.style.borderColor = T.border;  e.currentTarget.style.color = T.sub   } }}
                >
                  {isCustomActive && <FiCheck size={11} />}
                  <FiCalendar size={11} />
                  {isCustomActive ? rangeLabel : 'Personalizado'}
                </button>
              </div>

              {/* Dates display + Consultar */}
              <div
                className="flex items-center justify-between gap-3 pt-1"
                style={{ borderTop: `1px solid ${T.border}` }}
              >
                <div className="flex items-center gap-3">
                  <FiCalendar size={13} style={{ color: T.accent, flexShrink: 0 }} />
                  <div className="flex items-center gap-2">
                    {/* Start date card */}
                    <div
                      className="px-2.5 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: T.bg,
                        border: `1px solid ${inicio ? T.accentBd : T.border}`,
                      }}
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.muted }}>
                        Início
                      </p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: inicio ? '#E5E7EB' : T.border2 }}>
                        {inicio ? new Date(inicio + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>

                    {/* Arrow */}
                    <FiChevronRight size={14} style={{ color: T.border2 }} />

                    {/* End date card */}
                    <div
                      className="px-2.5 py-1.5 rounded-lg"
                      style={{
                        backgroundColor: T.bg,
                        border: `1px solid ${fim ? T.accentBd : T.border}`,
                      }}
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: T.muted }}>
                        Fim
                      </p>
                      <p className="text-sm font-semibold tabular-nums" style={{ color: fim ? '#E5E7EB' : T.border2 }}>
                        {fim ? new Date(fim + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => consultar()}
                  disabled={loading}
                  aria-busy={loading}
                  className="flex items-center gap-2 min-h-[36px] px-5 rounded-xl text-xs font-semibold transition-[background-color,transform,opacity] duration-150 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex-shrink-0"
                  style={{
                    backgroundColor: T.accent,
                    color: '#000',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(249,115,22,0.15)',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#EA6C10' }}
                  onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = T.accent }}
                >
                  {loading ? 'Consultando...' : 'Consultar'}
                </button>
              </div>
            </div>
          </AdminCard>
        </div>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading && <PageLoader />}

        {!loading && activeTab === 'DRE' && dreData && (
          <ResultsFadeIn><DreReport data={dreData} /></ResultsFadeIn>
        )}

        {!loading && activeTab === 'DRE' && !dreData && (
          <AdminCard className="p-10 text-center">
            <FiCalendar size={36} className="mx-auto mb-3" style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>
              Selecione um período e clique em Consultar para gerar o DRE.
            </p>
          </AdminCard>
        )}

        {!loading && activeTab === 'Despesas' && despesasData && (
          <ResultsFadeIn><DespesasReport data={despesasData} /></ResultsFadeIn>
        )}

        {!loading && activeTab === 'Despesas' && !despesasData && (
          <AdminCard className="p-10 text-center">
            <FiCalendar size={36} className="mx-auto mb-3" style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>
              Selecione um período para visualizar as despesas operacionais.
            </p>
          </AdminCard>
        )}
      </div>

      {/* ── Date selection modals (two-step flow) ───────────────────── */}
      <DateSelectionModal
        open={modalStep === 'start'}
        onClose={handleModalClose}
        onApply={handleStartApply}
        step="start"
        initialDate={inicio}
      />
      <DateSelectionModal
        open={modalStep === 'end'}
        onClose={handleModalClose}
        onApply={handleEndApply}
        step="end"
        initialDate={fim}
      />
    </AdminLayout>
  )
}
