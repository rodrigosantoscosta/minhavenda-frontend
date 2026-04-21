import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { FiDollarSign, FiTag } from 'react-icons/fi'
import { formatDate, formatBRL, T, AdminCard, Th, Tr } from '../../../utils/adminUtils'

const TOOLTIP_STYLE = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
}

const CATEGORY_COLORS = {
  MARKETING:     '#60A5FA',
  LOGISTICS:     '#F59E0B',
  ADMIN:         '#A78BFA',
  TAXES:         '#EF4444',
  INFRASTRUCTURE:'#10B981',
  PAYROLL:       '#F97316',
  OTHER:         '#6B7280',
}

export default function DespesasReport({ data }) {
  const { despesas, periodo, total } = data

  const chartData = despesas.map(d => ({
    categoria: d.categoria,
    total: d.total,
  }))

  return (
    <div className="space-y-6">
      {/* ── Period badge ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: T.accentBg, color: T.accent, border: `1px solid ${T.accentBd}` }}>
          {formatDate(periodo.inicio)} — {formatDate(periodo.fim)}
        </span>
      </div>

      {/* ── Total Card ────────────────────────────────────────────────── */}
      <AdminCard className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: T.redBg }}
          >
            <FiDollarSign size={22} style={{ color: T.red }} />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: T.muted }}>
              Total de Despesas Operacionais
            </p>
            <p className="text-2xl font-bold text-white">{formatBRL(total)}</p>
          </div>
        </div>
      </AdminCard>

      {/* ── Pie Chart + Breakdown ─────────────────────────────────────── */}
      {chartData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <AdminCard className="p-6">
            <p className="text-sm font-semibold text-white mb-5">Despesas por Categoria</p>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="categoria"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {chartData.map(entry => (
                    <Cell
                      key={entry.categoria}
                      fill={CATEGORY_COLORS[entry.categoria] ?? T.muted}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={v => (
                    <span style={{ color: T.sub, fontSize: 12 }}>{v}</span>
                  )}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => formatBRL(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          </AdminCard>

          {/* Breakdown table */}
          <AdminCard>
            <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2">
                <FiTag size={16} style={{ color: T.sub }} />
                <p className="text-sm font-semibold text-white">Detalhamento</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Categoria</Th>
                    <Th className="text-right">Valor</Th>
                    <Th className="text-right">%</Th>
                  </tr>
                </thead>
                <tbody>
                  {despesas.map(d => {
                    const pct = total > 0 ? (d.total / total) * 100 : 0
                    return (
                      <Tr key={d.categoria}>
                        <td className="px-6 py-3 text-sm font-sans text-white">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: CATEGORY_COLORS[d.categoria] ?? T.muted }}
                            />
                            {d.categoria}
                          </div>
                        </td>
                        <td
                          className="px-6 py-3 text-sm text-right font-mono"
                          style={{ color: T.green, fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatBRL(d.total)}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: T.muted, backgroundColor: T.card }}>
                            {pct.toFixed(1)}%
                          </span>
                        </td>
                      </Tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      ) : (
        <AdminCard className="p-10 text-center">
          <FiDollarSign size={36} className="mx-auto mb-3" style={{ color: T.border }} />
          <p className="text-sm" style={{ color: T.muted }}>
            Nenhuma despesa operacional registrada neste período.
          </p>
        </AdminCard>
      )}
    </div>
  )
}
