import { useEffect, useState } from 'react'
import type { Order } from '../../types'
import { Link } from 'react-router-dom'
import { FiChevronRight, FiFilter } from 'react-icons/fi'

import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatBRL, formatDate, shortId, StatusBadge, PageLoader, EmptyState, AdminCard, PageTitle, Th, Tr } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

const STATUSES = ['TODOS', 'CRIADO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFiltro, setStatusFiltro] = useState('TODOS')
  const toast = useToast()

  const load = (s: string) => {
    setLoading(true)
    const req = s === 'TODOS' ? adminService.getPedidos() : adminService.getPedidosByStatus(s)
    req
      .then(setPedidos)
      .catch(() => toast.error('Erro ao carregar pedidos'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(statusFiltro) }, [statusFiltro])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageTitle subtitle={`${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''} encontrado${pedidos.length !== 1 ? 's' : ''}`}>
          Pedidos
        </PageTitle>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter size={14} style={{ color: '#6B7280' }} />
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFiltro(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-colors uppercase tracking-wider font-mono"
              style={{
                backgroundColor: statusFiltro === s ? '#F97316' : '#1E2028',
                color: statusFiltro === s ? '#fff' : '#6B7280',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {loading ? <PageLoader /> : pedidos.length === 0 ? <EmptyState message="Nenhum pedido encontrado" /> : (
            pedidos.map(p => (
              <Link key={p.id} to={`/admin/pedidos/${p.id}`}>
                <AdminCard className="p-4 active:opacity-80 transition-opacity">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <StatusBadge status={p.status} />
                    <span className="text-base font-mono font-bold text-white tabular-nums">{formatBRL(p.valorTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>#{shortId(p.id)}</span>
                    <span className="text-xs font-sans" style={{ color: '#6B7280' }}>{formatDate(p.dataCriacao)}</span>
                  </div>
                </AdminCard>
              </Link>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <AdminCard>
            {loading ? <PageLoader /> : pedidos.length === 0 ? <EmptyState message="Nenhum pedido encontrado" /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <Th>ID</Th><Th>Status</Th><Th>Total</Th><Th>Itens</Th><Th>Data</Th><Th>Pagamento</Th><Th>{''}</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {pedidos.map(p => (
                      <Tr key={p.id}>
                        <td className="px-5 py-3">
                          <span
                            className="font-mono text-xs cursor-pointer transition-colors hover:text-white"
                            style={{ color: '#9CA3AF' }}
                            title={String(p.id)}
                            onClick={() => { navigator.clipboard.writeText(String(p.id)); toast.success('ID copiado!') }}
                          >
                            {shortId(p.id)}
                          </span>
                        </td>
                        <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-5 py-3 text-sm font-mono font-bold text-white tabular-nums">{formatBRL(p.valorTotal)}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: '#9CA3AF' }}>{p.quantidadeItens}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: '#9CA3AF' }}>{formatDate(p.dataCriacao)}</td>
                        <td className="px-5 py-3 text-sm" style={{ color: '#9CA3AF' }}>{formatDate(p.dataPagamento)}</td>
                        <td className="px-5 py-3 text-right">
                          <Link
                            to={`/admin/pedidos/${p.id}`}
                            className="inline-flex items-center gap-1 text-xs transition-colors hover:underline"
                            style={{ color: '#F97316' }}
                          >
                            Ver Detalhes <FiChevronRight size={12} />
                          </Link>
                        </td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </AdminLayout>
  )
}
