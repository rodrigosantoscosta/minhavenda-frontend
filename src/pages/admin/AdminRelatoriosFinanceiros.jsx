import { useState, useCallback, useMemo, useRef, useEffect, useId, forwardRef } from 'react'
import { FiCalendar, FiCheck } from 'react-icons/fi'
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
  { label: 'Hoje',          key: 'today' },
  { label: '7 dias',        key: '7d' },
  { label: 'Este mês',      key: 'month' },
  { label: '30 dias',       key: '30d' },
  { label: 'Trimestre',     key: 'quarter' },
  { label: 'Mês passado',   key: 'lastMonth' },
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
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      return { inicio: dateToISO(start), fim: getToday() }
    }
    case 'month':
      return { inicio: getFirstOfMonth(), fim: getToday() }
    case '30d': {
      const start = new Date(today)
      start.setDate(start.getDate() - 29)
      return { inicio: dateToISO(start), fim: getToday() }
    }
    case 'quarter': {
      const start = new Date(today)
      start.setDate(start.getDate() - 89)
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

// ─── Animated date picker panel with react-day-picker ─────────────────────────

const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

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

function formatDatePretty(iso) {
  if (!iso) return null
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDate()
  const month = MONTH_NAMES_PT[d.getMonth()].slice(0, 3).toLowerCase()
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return { day: String(day), month, weekday: weekdays[d.getDay()] }
}

function CustomDatePanel({ aberto, inicio, fim, onInicioChange, onFimChange, onConsultar, loading }) {
  const contentRef = useRef(null)
  const [anim, setAnim] = useState(aberto ? 'visible' : 'hidden')

  useEffect(() => {
    if (aberto) {
      setAnim('mounting')
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnim('visible'))
      })
    } else {
      setAnim('unmounting')
      const timer = setTimeout(() => setAnim('hidden'), 250)
      return () => clearTimeout(timer)
    }
  }, [aberto])

  if (anim === 'hidden') return null

  const visible = anim === 'visible'
  const panelStyle = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(8px)',
    transition: 'opacity 200ms cubic-bezier(0.2,0,0,1), transform 200ms cubic-bezier(0.2,0,0,1)',
  }

  const range = inicio ? { from: isoToDate(inicio), to: fim ? isoToDate(fim) : undefined } : undefined
  const isInvalid = inicio && fim && new Date(inicio) > new Date(fim)

  function handleSelect(selectedRange) {
    if (!selectedRange?.from) {
      onInicioChange('')
      onFimChange('')
      return
    }
    onInicioChange(toISO(selectedRange.from))
    if (selectedRange.to) {
      onFimChange(toISO(selectedRange.to))
    } else {
      onFimChange('')
    }
  }

  const inicioPretty = formatDatePretty(inicio)
  const fimPretty = formatDatePretty(fim)
  const isSelectingEnd = inicio && !fim
  const hasBothDates = inicio && fim && !isInvalid

  return (
    <div ref={contentRef} style={panelStyle}>
      {/* ── Step Indicator ─────────────────────────────────────────────────── */}
      <div className="mb-3 px-1">
        <div className="flex items-center gap-3">
          {/* Step 1: Start */}
          <div className="flex items-center gap-2 text-xs font-sans tabular-nums" style={{ color: T.accent }}>
            <div
              className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors duration-150"
              style={{ backgroundColor: T.accent, color: '#000' }}
            >
              ✓
            </div>
            <span className="font-semibold">
              {inicioPretty ? `${inicioPretty.day} ${inicioPretty.month}` : 'Início'}
            </span>
            {inicioPretty && (
              <span style={{ color: T.muted }} className="text-[11px]">· {inicioPretty.weekday}</span>
            )}
          </div>

          {/* Connector line */}
          <div
            className="flex-1 h-px transition-colors duration-150"
            style={{ backgroundColor: isSelectingEnd ? T.border2 : T.accent }}
          />

          {/* Step 2: End */}
          <div className="flex items-center gap-2 text-xs font-sans tabular-nums">
            {isSelectingEnd ? (
              <>
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold animate-pulse"
                  style={{ backgroundColor: T.accentBg, color: T.accent, border: `1px solid ${T.accent}` }}
                >
                  2
                </div>
                <span style={{ color: T.muted }}>Escolha o fim...</span>
              </>
            ) : hasBothDates ? (
              <>
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-colors duration-150"
                  style={{ backgroundColor: T.accent, color: '#000' }}
                >
                  ✓
                </div>
                <span className="font-semibold" style={{ color: T.accent }}>
                  {fimPretty ? `${fimPretty.day} ${fimPretty.month}` : '—'}
                </span>
                {fimPretty && (
                  <span style={{ color: T.muted }} className="text-[11px]">· {fimPretty.weekday}</span>
                )}
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: T.border2, color: T.muted }}
                >
                  2
                </div>
                <span style={{ color: T.muted }}>Fim</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Calendar ───────────────────────────────────────────────────────── */}
      <style>{`
        .rdp-root {
          --rdp-accent-color: ${T.accent};
          --rdp-accent-background-color: ${T.accentBg};
        }
        /* Month container */
        .rdp-root .rdp-months { display: block; }
        /* Month header (caption + nav) */
        .rdp-root .rdp-caption {
          color: #fff; display: flex; justify-content: center; align-items: center;
          font-weight: 600; font-size: 15px; padding-bottom: 10px;
          font-family: inherit;
        }
        .rdp-root .rdp-nav { position: static; }
        .rdp-root .rdp-button_icon {
          color: #fff; border-radius: 8px; width: 32px; height: 32px;
          cursor: pointer; transition: background-color 150ms ease;
        }
        .rdp-root .rdp-button_icon:hover { background-color: rgba(255,255,255,0.1); }
        /* Grid */
        .rdp-root .rdp-month_grid {
          width: 100%; border-collapse: separate; border-spacing: 3px 4px;
        }
        .rdp-root .rdp-weekdays {
          border-bottom: 1px solid ${T.border}; margin-bottom: 4px; padding-bottom: 6px;
        }
        .rdp-root .rdp-weekday {
          color: ${T.muted}; font-size: 11px; font-weight: 600;
          padding-bottom: 4px; text-align: center;
        }
        /* Day button — unselected */
        .rdp-root .rdp-day_button {
          width: 36px; height: 36px; min-width: 36px; min-height: 36px;
          border-radius: 10px; font-size: 14px; font-weight: 500;
          color: #E5E7EB; background: transparent; border: 1px solid transparent;
          cursor: pointer;
          transition: background-color 120ms ease, color 120ms ease, border-color 120ms ease, transform 150ms cubic-bezier(0.2,0,0,1), box-shadow 150ms ease;
          display: inline-flex; align-items: center; justify-content: center;
          font-family: inherit;
        }
        .rdp-root .rdp-day_button:hover {
          background-color: rgba(255,255,255,0.08); color: #fff;
        }
        .rdp-root .rdp-day_button:focus-visible { outline: 2px solid ${T.accent}; outline-offset: 1px; }
        .rdp-root .rdp-day_button:active { transform: scale(0.96); }
        /* Selected day (from-only, no range yet) */
        .rdp-root .rdp-day_selected {
          background-color: ${T.accent} !important; color: #000 !important;
          font-weight: 700;
          box-shadow: 0 0 0 3px rgba(249,115,22,0.25);
        }
        .rdp-root .rdp-day_selected:hover {
          background-color: #EA6C10 !important;
        }
        /* Range start & end — solid orange */
        .rdp-root .rdp-range_start .rdp-day_button,
        .rdp-root .rdp-range_end .rdp-day_button {
          background-color: ${T.accent} !important; color: #000 !important;
          font-weight: 700;
        }
        .rdp-root .rdp-range_start .rdp-day_button {
          border-top-right-radius: 0; border-bottom-right-radius: 0;
        }
        .rdp-root .rdp-range_end .rdp-day_button {
          border-top-left-radius: 0; border-bottom-left-radius: 0;
          border-top-right-radius: 10px; border-bottom-right-radius: 10px;
        }
        /* Range middle — connecting pill */
        .rdp-root .rdp-range_middle {
          background-color: rgba(249,115,22,0.18) !important;
          color: #E5E7EB !important;
          border-radius: 0 !important;
        }
        .rdp-root .rdp-range_middle .rdp-day_button {
          background: transparent !important; color: #E5E7EB !important;
          border: none !important; cursor: pointer; font-weight: 500;
        }
        .rdp-root .rdp-range_middle .rdp-day_button:hover {
          background-color: rgba(255,255,255,0.06) !important;
        }
        /* Outside days */
        .rdp-root .rdp-day_outside { opacity: 0.4; }
        .rdp-root .rdp-day_outside .rdp-day_button { color: ${T.border2}; }
        /* Today */
        .rdp-root .rdp-day_today .rdp-day_button {
          border: 1px solid ${T.accent}; font-weight: 600;
        }
        /* Disabled */
        .rdp-root .rdp-day_hidden { opacity: 0.3; cursor: default; }
        .rdp-root .rdp-day_hidden .rdp-day_button { cursor: default; color: ${T.muted}; opacity: 0.3; }
      `}</style>
      <div style={{ cursor: 'pointer' }}>
        <DayPicker
          className="rdp-root"
          mode="range"
          locale={ptBR}
          selected={range}
          onSelect={handleSelect}
          defaultMonth={range?.from || new Date()}
          showOutsideDays
          fixedWeeks
        />
      </div>

      {/* ── Consultar button ───────────────────────────────────────────────── */}
      <button
        onClick={onConsultar}
        disabled={loading || !inicio || !fim}
        aria-busy={loading}
        className="w-full flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl text-sm font-sans font-semibold text-black transition-[background-color,transform,opacity] duration-150 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        style={{
          backgroundColor: T.accent,
          boxShadow: '0 1px 3px rgba(0,0,0,0.3), 0 4px 12px rgba(249,115,22,0.15)',
        }}
        onMouseEnter={e => { if (!(loading || !inicio || !fim)) e.currentTarget.style.backgroundColor = '#EA6C10' }}
        onMouseLeave={e => { if (!(loading || !inicio || !fim)) e.currentTarget.style.backgroundColor = T.accent }}
      >
        <FiCalendar size={14} />
        {loading ? 'Consultando...' : 'Consultar'}
      </button>

      {/* ── Inline error ───────────────────────────────────────────────────── */}
      {isInvalid && (
        <div
          className="mt-2 flex items-center gap-2 text-xs font-sans px-1"
          style={{ color: T.red }}
          role="alert"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M7 3.5v4m0 1.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          Data de início é posterior à data de fim.
        </div>
      )}
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
    className="flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-xs font-sans font-semibold rounded-full whitespace-nowrap transition-[background-color,transform,color,border-color] duration-150 active:scale-[0.96] flex-shrink-0"
    style={{
      backgroundColor: active ? T.accentBg : 'transparent',
      color: active ? T.accent : T.sub,
      border: `1px solid ${active ? T.accentBd : T.border}`,
    }}
    onMouseEnter={e => {
      if (!active) { e.currentTarget.style.borderColor = T.border2; e.currentTarget.style.color = '#E5E7EB' }
    }}
    onMouseLeave={e => {
      if (!active) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.sub }
    }}
  >
    {active && <FiCheck size={12} />}
    {label}
  </button>
))

// ─── Results wrapper with fade-in ────────────────────────────────────────────

function ResultsFadeIn({ children }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0'
      ref.current.style.transform = 'translateY(6px)'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ref.current.style.transition = 'opacity 250ms cubic-bezier(0.2,0,0,1), transform 250ms cubic-bezier(0.2,0,0,1)'
          ref.current.style.opacity = '1'
          ref.current.style.transform = 'translateY(0)'
        })
      })
    }
  }, [children])

  return (
    <div ref={ref}>
      {children}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminRelatoriosFinanceiros() {
  const [activeTab, setActiveTab] = useState('DRE')
  const [activePreset, setActivePreset] = useState('month')
  const [showCustom, setShowCustom] = useState(false)
  const [inicio, setInicio] = useState(getFirstOfMonth())
  const [fim, setFim] = useState(getToday())
  const [dreData, setDreData] = useState(null)
  const [despesasData, setDespesasData] = useState(null)
  const [loading, setLoading] = useState(false)
  const presetButtonsRef = useRef([])
  const toast = useToast()

  const consultar = useCallback(async () => {
    if (!inicio || !fim) {
      toast.warning('Selecione as datas de início e fim')
      return
    }
    if (new Date(inicio) > new Date(fim)) {
      toast.warning('Data de início não pode ser posterior à data de fim')
      return
    }

    setLoading(true)
    try {
      if (activeTab === 'DRE') {
        const res = await adminService.getDRE(inicio, fim)
        setDreData(res)
      } else {
        const res = await adminService.getDespesas(inicio, fim)
        setDespesasData(res)
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

  const setDatesAndQuery = useCallback((i, f, presetKey) => {
    setInicio(i)
    setFim(f)
    setActivePreset(presetKey)
    setDreData(null)
    setDespesasData(null)
    // Defer the query so state settles
    setTimeout(() => consultar(), 0)
  }, [consultar])

  const handlePreset = (key) => {
    if (key === 'custom') {
      setActivePreset('custom')
      setShowCustom(true)
      return
    }
    setShowCustom(false)
    const { inicio: i, fim: f } = resolvePreset(key)
    setDatesAndQuery(i, f, key)
  }

  const handleCustomDateChange = useCallback((field, value) => {
    if (field === 'inicio') setInicio(value)
    if (field === 'fim') setFim(value)
    setActivePreset('custom')
    setShowCustom(true)
    setDreData(null)
    setDespesasData(null)
  }, [])

  const rangeLabel = useMemo(() => formatRangeLabel(inicio, fim), [inicio, fim])

  const customId = useId()
  const customToggleId = `${customId}-custom-toggle`

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageTitle subtitle="Demonstrativo de Resultado do Exercício e Despesas Operacionais">
          Relatórios Financeiros
        </PageTitle>

        <div className="space-y-4">
          {/* ── Tabs ─────────────────────────────────────────────────────── */}
          <div className="flex gap-1" style={{ borderBottom: `1px solid ${T.border}` }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className="min-h-[44px] px-4 py-2.5 text-sm font-sans font-medium rounded-t-lg transition-[color,background-color] duration-150 active:scale-[0.96]"
                style={{
                  color: activeTab === tab ? T.accent : T.muted,
                  backgroundColor: activeTab === tab ? T.surface : 'transparent',
                  borderBottom: activeTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
                }}
                onMouseEnter={e => {
                  if (activeTab !== tab) e.currentTarget.style.color = T.sub
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab) e.currentTarget.style.color = T.muted
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* ── Period Selector Card ─────────────────────────────────────── */}
          <AdminCard>
            <div className="p-4 sm:p-5 space-y-4">

              {/* Preset chips — scrollable on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Períodos predefinidos">
                {PRESETS.map((p, idx) => (
                  <PresetPill
                    key={p.key}
                    label={p.label}
                    active={activePreset === p.key}
                    onClick={() => handlePreset(p.key)}
                    id={`preset-${p.key}`}
                    ref={el => (presetButtonsRef.current[idx] = el)}
                  />
                ))}
                <PresetPill
                  label="Personalizado"
                  active={showCustom}
                  onClick={() => handlePreset('custom')}
                  id={customToggleId}
                  ref={el => { presetButtonsRef.current[PRESETS.length] = el }}
                />
              </div>

              {/* ── Animated custom date panel ──────────────────────────── */}
              <CustomDatePanel
                aberto={showCustom}
                inicio={inicio}
                fim={fim}
                onInicioChange={v => handleCustomDateChange('inicio', v)}
                onFimChange={v => handleCustomDateChange('fim', v)}
                onConsultar={consultar}
                loading={loading}
              />

              {/* ── Range summary (always visible) ──────────────────────── */}
              <div className="flex items-center gap-2 pt-1" style={{ borderTop: `1px solid ${T.border}` }}>
                <FiCalendar
                  size={14}
                  style={{ color: T.accent, transition: 'color 150ms ease' }}
                />
                <span className="text-sm font-sans font-medium tabular-nums" style={{ color: '#E5E7EB' }}>
                  {rangeLabel}
                </span>
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
              Selecione um período para gerar o DRE.
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
    </AdminLayout>
  )
}
