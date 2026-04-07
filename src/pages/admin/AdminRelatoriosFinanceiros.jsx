import { useState, useCallback } from 'react'
import { FiCalendar } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { T, PageTitle, AdminCard, PageLoader, EmptyState } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'
import DreReport from './components/DreReport'
import DespesasReport from './components/DespesasReport'

const TABS = ['DRE', 'Despesas']

function getToday() {
  return new Date().toISOString().split('T')[0]
}

function getFirstOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().split('T')[0]
}

export default function AdminRelatoriosFinanceiros() {
  const [activeTab, setActiveTab] = useState('DRE')
  const [inicio, setInicio] = useState(getFirstOfMonth())
  const [fim, setFim] = useState(getToday())
  const [dreData, setDreData] = useState(null)
  const [despesasData, setDespesasData] = useState(null)
  const [loading, setLoading] = useState(false)
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
    // Clear data on tab switch so user must re-query
    setDreData(null)
    setDespesasData(null)
  }

  const dateInputStyle = {
    backgroundColor: T.card,
    color: '#fff',
    border: `1px solid ${T.border}`,
    borderRadius: 8,
    padding: '8px 12px',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    maxWidth: 180,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageTitle subtitle="Demonstrativo de Resultado do Exercício e Despesas Operacionais">
          Relatórios Financeiros
        </PageTitle>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-1" style={{ borderBottom: `1px solid ${T.border}` }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="px-4 py-2.5 text-sm font-sans font-medium rounded-t-lg transition-colors"
              style={{
                color: activeTab === tab ? T.accent : T.muted,
                backgroundColor: activeTab === tab ? T.surface : 'transparent',
                borderBottom: activeTab === tab ? `2px solid ${T.accent}` : '2px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Date Range Picker ────────────────────────────────────────── */}
        <AdminCard className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: T.sub }}>
                Período de
              </label>
              <input
                type="date"
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                style={dateInputStyle}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: T.sub }}>
                até
              </label>
              <input
                type="date"
                value={fim}
                onChange={e => setFim(e.target.value)}
                style={dateInputStyle}
              />
            </div>
            <button
              onClick={consultar}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{
                backgroundColor: T.accent,
                color: '#000',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EA580C'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = T.accent}
            >
              <FiCalendar size={14} />
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </AdminCard>

        {/* ── Content ──────────────────────────────────────────────────── */}
        {loading && <PageLoader />}

        {!loading && activeTab === 'DRE' && dreData && <DreReport data={dreData} />}

        {!loading && activeTab === 'DRE' && !dreData && (
          <AdminCard className="p-10 text-center">
            <FiCalendar size={36} className="mx-auto mb-3" style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>
              Selecione um período e clique em <strong>Consultar</strong> para gerar o DRE.
            </p>
          </AdminCard>
        )}

        {!loading && activeTab === 'Despesas' && despesasData && <DespesasReport data={despesasData} />}

        {!loading && activeTab === 'Despesas' && !despesasData && (
          <AdminCard className="p-10 text-center">
            <FiCalendar size={36} className="mx-auto mb-3" style={{ color: T.border }} />
            <p className="text-sm" style={{ color: T.muted }}>
              Selecione um período e clique em <strong>Consultar</strong> para visualizar as despesas operacionais.
            </p>
          </AdminCard>
        )}
      </div>
    </AdminLayout>
  )
}
