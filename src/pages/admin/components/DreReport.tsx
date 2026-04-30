import { FiDollarSign, FiTrendingUp, FiTarget, FiPercent } from 'react-icons/fi'
import type { ElementType } from 'react'
import type { DREReport } from '../../../services/adminService'
import { formatDate, formatBRL, T, AdminCard, Th, Tr } from '../../../utils/adminUtils'

const TOOLTIP_STYLE = {
  background: T.card,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  fontSize: 12,
  color: '#fff',
}

function KpiCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: ElementType; color: string; bg: string }) {
  return (
    <AdminCard className="p-5">
      <div className="flex items-center gap-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <Icon size={20} style={{ color }} />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: T.muted }}>
            {label}
          </p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
    </AdminCard>
  )
}

interface DreReportData extends DREReport {
  resumo: { receitaBruta: number; receitaLiquida: number; lucroLiquido: number; margemLucro: number }
  periodo: { inicio: string; fim: string }
  linhas: { descricao: string; valor: number; percentual?: number }[]
}

export default function DreReport({ data }: { data: DreReportData }) {
  const { resumo, periodo, linhas } = data

  const kpis = [
    {
      label: 'Receita Bruta',
      value: formatBRL(resumo.receitaBruta),
      icon: FiDollarSign,
      color: T.blue,
      bg: T.blueBg,
    },
    {
      label: 'Receita Líquida',
      value: formatBRL(resumo.receitaLiquida),
      icon: FiTrendingUp,
      color: T.green,
      bg: T.greenBg,
    },
    {
      label: 'Lucro Líquido',
      value: formatBRL(resumo.lucroLiquido),
      icon: FiTarget,
      color: resumo.lucroLiquido >= 0 ? T.green : T.red,
      bg: resumo.lucroLiquido >= 0 ? T.greenBg : T.redBg,
    },
    {
      label: 'Margem de Lucro',
      value: `${resumo.margemLucro.toFixed(1)}%`,
      icon: FiPercent,
      color: resumo.margemLucro >= 0 ? T.accent : T.red,
      bg: resumo.margemLucro >= 0 ? T.accentBg : T.redBg,
    },
  ]

  function rowStyle(linha: { descricao: string; valor: number }) {
    const isSubtotal = linha.descricao.includes('Líquida') ||
                       linha.descricao.includes('Bruto') ||
                       linha.descricao.includes('Líquido')
    return {
      fontWeight: isSubtotal ? 700 : 400,
      color: isSubtotal ? '#fff' : T.sub,
      backgroundColor: isSubtotal ? 'rgba(255,255,255,0.03)' : 'transparent',
      borderTop: isSubtotal ? `1px solid ${T.border}` : 'none',
    }
  }

  function valorStyle(valor: number) {
    const isNeg = valor < 0
    return {
      color: isNeg ? T.red : T.green,
      fontVariantNumeric: 'tabular-nums',
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Period badge ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: T.accentBg, color: T.accent, border: `1px solid ${T.accentBd}` }}>
          {formatDate(periodo.inicio)} — {formatDate(periodo.fim)}
        </span>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── DRE Hierarchical Table ────────────────────────────────────── */}
      <AdminCard>
        <div className="px-6 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
          <p className="text-sm font-semibold text-white">Demonstrativo de Resultado do Exercício</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <Th>Descrição</Th>
                <Th className="text-right">Valor</Th>
                <Th className="text-right">%</Th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((linha: { descricao: string; valor: number; percentual?: number }, i: number) => (
                <Tr key={i}>
                  <td
                    className="px-6 py-3 text-sm font-sans"
                    style={rowStyle(linha)}
                  >
                    {linha.descricao}
                  </td>
                  <td
                    className="px-6 py-3 text-sm text-right font-mono"
                    style={valorStyle(linha.valor)}
                  >
                    {formatBRL(linha.valor)}
                  </td>
                  <td className="px-6 py-3 text-sm text-right">
                    {linha.percentual !== undefined && linha.percentual !== null ? (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ color: T.muted, backgroundColor: T.card }}>
                        {linha.percentual.toFixed(1)}%
                      </span>
                    ) : (
                      <span style={{ color: T.border }}>—</span>
                    )}
                  </td>
                </Tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>
    </div>
  )
}
