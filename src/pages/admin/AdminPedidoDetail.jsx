import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiCircle, FiClock } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import {
  formatBRL, formatDate, formatDateTime, StatusBadge,
  PageLoader, AdminCard, AdminModal, PageTitle, Th, Tr,
  inputCls, inputStyle, FieldLabel, BtnPrimary, BtnSecondary,
} from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

const METODOS_PAGAMENTO = ['CARTAO', 'PIX', 'BOLETO']

function ActionModal({ open, onClose, action, pedidoId, onSuccess }) {
  const [fields, setFields] = useState({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const set = k => e => setFields(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    try {
      let result
      if (action === 'PAGAR')    result = await adminService.pagarPedido(pedidoId, { metodoPagamento: fields.metodoPagamento || 'PIX' })
      if (action === 'ENVIAR')   result = await adminService.enviarPedido(pedidoId, { codigoRastreio: fields.codigoRastreio || '', transportadora: fields.transportadora || '' })
      if (action === 'ENTREGAR') result = await adminService.entregarPedido(pedidoId)
      if (action === 'CANCELAR') result = await adminService.cancelarPedido(pedidoId, { motivo: fields.motivo || '' })
      onSuccess(result)
      toast.success('Ação realizada com sucesso!')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao processar ação')
    } finally {
      setLoading(false)
      setFields({})
    }
  }

  const titles = { PAGAR: 'Marcar como Pago', ENVIAR: 'Marcar como Enviado', ENTREGAR: 'Marcar como Entregue', CANCELAR: 'Cancelar Pedido' }

  return (
    <AdminModal open={open} onClose={onClose} title={titles[action] ?? ''} size="sm">
      <div className="space-y-4">
        {action === 'PAGAR' && (
          <div>
            <FieldLabel>Método de Pagamento *</FieldLabel>
            <select
              className={inputCls} style={inputStyle}
              value={fields.metodoPagamento || ''} onChange={set('metodoPagamento')}
            >
              <option value="">Selecione...</option>
              {METODOS_PAGAMENTO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
        {action === 'ENVIAR' && (
          <>
            <div>
              <FieldLabel>Código de Rastreio *</FieldLabel>
              <input className={inputCls} style={inputStyle} placeholder="BR123456789BR" value={fields.codigoRastreio || ''} onChange={set('codigoRastreio')} />
            </div>
            <div>
              <FieldLabel>Transportadora *</FieldLabel>
              <input className={inputCls} style={inputStyle} placeholder="Correios" value={fields.transportadora || ''} onChange={set('transportadora')} />
            </div>
          </>
        )}
        {action === 'CANCELAR' && (
          <div>
            <FieldLabel>Motivo *</FieldLabel>
            <textarea
              className={inputCls} style={inputStyle}
              rows={3} placeholder="Descreva o motivo..."
              value={fields.motivo || ''} onChange={set('motivo')}
            />
          </div>
        )}
        {action === 'ENTREGAR' && (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Confirmar entrega do pedido ao cliente?</p>
        )}
        <div className="flex justify-end gap-3 pt-1">
          <BtnSecondary onClick={onClose}>Cancelar</BtnSecondary>
          <BtnPrimary onClick={submit} disabled={loading}>{loading ? 'Aguarde...' : 'Confirmar'}</BtnPrimary>
        </div>
      </div>
    </AdminModal>
  )
}

export default function AdminPedidoDetail() {
  const { id } = useParams()
  const [pedido, setPedido] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const toast = useToast()

  useEffect(() => {
    adminService.getPedido(id)
      .then(setPedido)
      .catch(() => toast.error('Pedido não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>
  if (!pedido) return <AdminLayout><p className="text-center py-20" style={{ color: '#6B7280' }}>Pedido não encontrado</p></AdminLayout>

  const timeline = [
    { label: 'Criado',   date: pedido.dataCriacao },
    { label: 'Pago',     date: pedido.dataPagamento },
    { label: 'Enviado',  date: pedido.dataEnvio },
    { label: 'Entregue', date: pedido.dataEntrega },
  ]

  const actions = []
  if (pedido.status === 'CRIADO')  { actions.push({ key: 'PAGAR', label: 'Marcar como Pago', style: { color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' } }); actions.push({ key: 'CANCELAR', label: 'Cancelar', style: { color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' } }) }
  if (pedido.status === 'PAGO')    { actions.push({ key: 'ENVIAR', label: 'Marcar como Enviado', style: { color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' } }); actions.push({ key: 'CANCELAR', label: 'Cancelar', style: { color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' } }) }
  if (pedido.status === 'ENVIADO') { actions.push({ key: 'ENTREGAR', label: 'Marcar como Entregue', style: { color: '#10B981', backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' } }) }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link to="/admin/pedidos" className="transition-colors hover:text-white shrink-0" style={{ color: '#6B7280' }}>
              <FiArrowLeft size={20} />
            </Link>
            <PageTitle>Pedido</PageTitle>
            <span className="font-mono text-sm shrink-0" style={{ color: '#9CA3AF' }}>{pedido.id.slice(0, 8).toUpperCase()}</span>
            <StatusBadge status={pedido.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map(a => (
              <button
                key={a.key}
                onClick={() => setModal(a.key)}
                className="px-3 py-2 rounded-xl text-sm font-sans font-medium transition-[background-color,transform] duration-150 active:scale-[0.96]"
                style={a.style}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            {/* Timeline */}
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-white mb-5">Linha do Tempo</p>
              <div className="flex">
                {timeline.map((step, i) => {
                  const done = !!step.date
                  const isCurrent = !done && i === timeline.findIndex(s => !s.date)
                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative">
                      {i < timeline.length - 1 && (
                        <div className="absolute top-3.5 left-1/2 w-full h-0.5" style={{ backgroundColor: done ? '#F97316' : '#1E2028', transform: 'translateX(50%)' }} />
                      )}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: done ? '#F97316' : '#1E2028' }}>
                        {done ? <FiCheckCircle size={14} color="#fff" /> : isCurrent ? <FiClock size={12} color="#6B7280" /> : <FiCircle size={12} color="#374151" />}
                      </div>
                      <p className="text-xs font-medium text-white mt-2">{step.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>{formatDate(step.date)}</p>
                    </div>
                  )
                })}
              </div>
            </AdminCard>

            {/* Items */}
            <AdminCard>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid #1E2028' }}>
                <p className="text-sm font-display font-semibold text-white">Itens do Pedido</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      {['Produto', 'Qtd', 'Preço Unit.', 'Subtotal'].map(h => (
                        <Th key={h}>{h}</Th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.itens.map(item => (
                      <Tr key={item.id}>
                        <td className="px-6 py-3 text-sm font-sans text-white">{item.produtoNome}</td>
                        <td className="px-6 py-3 text-sm font-mono tabular-nums" style={{ color: '#9CA3AF' }}>{item.quantidade}</td>
                        <td className="px-6 py-3 text-sm font-mono tabular-nums" style={{ color: '#9CA3AF' }}>{formatBRL(item.precoUnitario)}</td>
                        <td className="px-6 py-3 text-sm font-mono font-bold tabular-nums text-white">{formatBRL(item.subtotal)}</td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            {/* Address + tracking */}
            <AdminCard className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Endereço de Entrega</p>
                <p className="text-sm text-white">{pedido.enderecoEntrega}</p>
              </div>
              {pedido.observacoes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Observações</p>
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>{pedido.observacoes}</p>
                </div>
              )}
              {(pedido.status === 'ENVIADO' || pedido.status === 'ENTREGUE') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Cód. Rastreio</p>
                    <p className="text-sm font-mono" style={{ color: '#F97316' }}>{pedido.codigoRastreio || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Transportadora</p>
                    <p className="text-sm text-white">{pedido.transportadora || '—'}</p>
                  </div>
                </div>
              )}
            </AdminCard>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-white mb-4">Resumo Financeiro</p>
              <div className="space-y-2">
                {[['Subtotal', formatBRL(pedido.subtotal)], ['Frete', formatBRL(pedido.valorFrete)], ['Desconto', `- ${formatBRL(pedido.valorDesconto)}`]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-sm" style={{ color: '#6B7280' }}>{l}</span>
                    <span className="text-sm font-mono" style={{ color: '#9CA3AF' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid #1E2028' }}>
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="text-lg font-bold font-mono" style={{ color: '#F97316' }}>{formatBRL(pedido.valorTotal)}</span>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-white mb-4">Datas</p>
              <div className="space-y-2">
                {[
                  ['Criado em', pedido.dataCriacao], ['Atualizado em', pedido.dataAtualizacao],
                  ['Pago em', pedido.dataPagamento], ['Enviado em', pedido.dataEnvio], ['Entregue em', pedido.dataEntrega],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-xs" style={{ color: '#6B7280' }}>{l}</span>
                    <span className="text-xs font-mono" style={{ color: '#9CA3AF' }}>{formatDateTime(v)}</span>
                  </div>
                ))}
              </div>
            </AdminCard>
          </div>
        </div>
      </div>

      <ActionModal open={!!modal} onClose={() => setModal(null)} action={modal} pedidoId={id} onSuccess={setPedido} />
    </AdminLayout>
  )
}
