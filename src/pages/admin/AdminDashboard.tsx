import { useEffect, useState } from 'react'
import type { ElementType } from 'react'
import type { DashboardData } from '../../services/adminService'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend, ResponsiveContainer } from 'recharts'
import { FiAlertTriangle, FiDollarSign, FiShoppingCart, FiClock, FiAlertOctagon } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatBRL, PageLoader, AdminCard, PageTitle, Th, Tr } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

const STATUS_COLORS = {
  CRIADO: '#60A5FA', PAGO: '#22C55E', ENVIADO: '#F59E0B', ENTREGUE: '#10B981', CANCELADO: '#EF4444',
}

const TOOLTIP_STYLE = { background: '#0D0E12', border: '1px solid #1E2028', borderRadius: 8, fontSize: 12, color: '#fff' }

function KpiCard({ label, value, icon: Icon, color, bg }: { label: string; value: string | number; icon: ElementType; color: string; bg: string }) {
  return (
    <AdminCard className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#6B7280' }}>{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </AdminCard>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [degraded, setDegraded] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminService.getDashboard()
      .then(setStats)
      .catch(() => {
        setDegraded(true)
        toast.warning('Endpoint /admin/dashboard ainda não implementado no backend')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  const chartData = stats
    ? Object.entries(stats.pedidosPorStatus).map(([status, count]) => ({ status, count: count as number }))
    : []

  const totalPedidos = chartData.reduce((s, d) => s + d.count, 0)

  const kpis = [
    { label: 'Receita Total',      value: stats ? formatBRL(stats.receitaTotal) : '—', icon: FiDollarSign,    color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    { label: 'Total de Pedidos',   value: stats ? totalPedidos : '—',                  icon: FiShoppingCart,  color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
    { label: 'Pedidos Pendentes',  value: stats ? stats.pedidosPorStatus.CRIADO : '—', icon: FiClock,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { label: 'Alertas de Estoque', value: stats ? stats.estoqueBaixo.length : '—',     icon: FiAlertOctagon,  color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageTitle subtitle="Visão geral da operação">Dashboard</PageTitle>

        {/* Degradation banner */}
        {degraded && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <FiAlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <p className="text-sm" style={{ color: '#FCD34D' }}>
              O endpoint <code className="px-1 rounded text-xs" style={{ backgroundColor: 'rgba(245,158,11,0.2)' }}>GET /api/admin/dashboard</code> ainda não está disponível no backend.
              As páginas de Pedidos, Produtos, Estoque, Categorias e DLQ estão todas funcionais.
            </p>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(k => <KpiCard key={k.label} {...k} />)}
        </div>

        {/* Charts */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-white mb-5">Pedidos por Status</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="40%">
                  <XAxis dataKey="status" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map(d => <Cell key={d.status} fill={STATUS_COLORS[d.status as keyof typeof STATUS_COLORS] ?? '#6B7280'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-white mb-5">Distribuição de Status</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={chartData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {chartData.map(d => <Cell key={d.status} fill={STATUS_COLORS[d.status as keyof typeof STATUS_COLORS] ?? '#6B7280'} />)}
                  </Pie>
                  <Legend formatter={v => <span style={{ color: '#9CA3AF', fontSize: 12 }}>{v}</span>} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </AdminCard>
          </div>
        )}

        {/* Low stock table */}
        {stats && stats.estoqueBaixo.length > 0 && (
          <AdminCard>
            <div className="px-6 py-4 flex items-center gap-2" style={{ borderBottom: '1px solid #1E2028' }}>
              <FiAlertTriangle size={16} style={{ color: '#EF4444' }} />
              <p className="text-sm font-semibold text-white">Alertas de Estoque Baixo</p>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-mono" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                {stats.estoqueBaixo.length} produto{stats.estoqueBaixo.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    {['Produto', 'Quantidade', ''].map(h => (
                      <Th key={h}>{h}</Th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.estoqueBaixo.map((item: { produtoId: string | number; nome: string; quantidade: number }) => (
                    <Tr key={item.produtoId}>
                      <td className="px-6 py-3 text-sm font-sans text-white">{item.nome}</td>
                      <td className="px-6 py-3">
                        <span className="text-sm font-mono tabular-nums px-2 py-0.5 rounded-md" style={{ color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          {item.quantidade} un
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Link to="/admin/estoque" className="text-xs font-sans transition-colors hover:underline" style={{ color: '#F97316' }}>
                          Ajustar Estoque →
                        </Link>
                      </td>
                    </Tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        )}

        {/* No data placeholder when degraded */}
        {degraded && (
          <AdminCard className="p-10 text-center">
            <FiAlertTriangle size={36} className="mx-auto mb-3" style={{ color: '#1E2028' }} />
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Os KPIs e gráficos serão exibidos quando <code className="font-mono text-xs px-1 rounded" style={{ color: '#9CA3AF', backgroundColor: '#1E2028' }}>GET /api/admin/dashboard</code> for implementado.
            </p>
          </AdminCard>
        )}
      </div>
    </AdminLayout>
  )
}
