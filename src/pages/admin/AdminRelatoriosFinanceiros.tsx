import { useState, useCallback, useRef, useEffect, forwardRef } from 'react'
import { FiCalendar, FiCheck } from 'react-icons/fi'
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
    const { inicio: i, fim: f } = resolvePreset(key)
    setInicio(i); setFim(f)
    setActivePreset(key)
    setDreData(null); setDespesasData(null)
    // query with resolved values directly
    setTimeout(() => consultar(i, f), 0)
  }

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
              </div>

              {/* Inline date inputs + Consultar */}
              <div
                className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-1"
                style={{ borderTop: `1px solid ${T.border}` }}
              >
                {/* Start date input */}
                <div className="flex-1">
                  <label
                    htmlFor="dre-inicio"
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: T.muted }}
                  >
                    Data de início
                  </label>
                  <div className="relative">
                    <input
                      id="dre-inicio"
                      type="date"
                      value={inicio}
                      onChange={(e) => {
                        setInicio(e.target.value)
                        setActivePreset('custom')
                        setDreData(null)
                        setDespesasData(null)
                      }}
                      className="w-full min-h-[44px] px-3 pr-10 py-2.5 rounded-xl text-sm font-medium tabular-nums transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      style={{
                        backgroundColor: T.bg,
                        border: `1px solid ${T.border}`,
                        color: '#E5E7EB',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        appearance: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = T.accent
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.accentBg}`
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <style>{`
                      #dre-inicio::-webkit-calendar-picker-indicator {
                        position: absolute;
                        right: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        opacity: 0;
                        cursor: pointer;
                      }
                    `}</style>
                    <FiCalendar
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: T.accent }}
                    />
                  </div>
                </div>

                {/* End date input */}
                <div className="flex-1">
                  <label
                    htmlFor="dre-fim"
                    className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5"
                    style={{ color: T.muted }}
                  >
                    Data de fim
                  </label>
                  <div className="relative">
                    <input
                      id="dre-fim"
                      type="date"
                      value={fim}
                      onChange={(e) => {
                        setFim(e.target.value)
                        setActivePreset('custom')
                        setDreData(null)
                        setDespesasData(null)
                      }}
                      className="w-full min-h-[44px] px-3 pr-10 py-2.5 rounded-xl text-sm font-medium tabular-nums transition-[border-color,box-shadow] duration-150 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                      style={{
                        backgroundColor: T.bg,
                        border: `1px solid ${T.border}`,
                        color: '#E5E7EB',
                        WebkitAppearance: 'none',
                        MozAppearance: 'textfield',
                        appearance: 'none',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = T.accent
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${T.accentBg}`
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = T.border
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <style>{`
                      #dre-fim::-webkit-calendar-picker-indicator {
                        position: absolute;
                        right: 0;
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        opacity: 0;
                        cursor: pointer;
                      }
                    `}</style>
                    <FiCalendar
                      size={16}
                      className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: T.accent }}
                    />
                  </div>
                </div>

                {/* Consultar button */}
                <button
                  onClick={() => consultar()}
                  disabled={loading}
                  aria-busy={loading}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-xl text-xs font-semibold transition-[background-color,transform,opacity] duration-150 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex-shrink-0 sm:w-auto w-full"
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
    </AdminLayout>
  )
}
