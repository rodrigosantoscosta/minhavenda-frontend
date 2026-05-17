import { useEffect, useState } from 'react'
import type React from 'react'
import type { Order } from '../../types'
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

function ActionModal({ open, onClose, action, pedidoId, onSuccess }: {
  open: boolean; onClose: () => void; action: string | null
  pedidoId: string | undefined; onSuccess: (order: Order) => void
}) {
  const [fields, setFields] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFields(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setLoading(true)
    try {
      let result
      const pid = pedidoId ?? ''
      if (action === 'PAGAR')    result = await adminService.pagarPedido(pid, { metodoPagamento: (fields.metodoPagamento || 'PIX') as 'PIX' | 'BOLETO' | 'CARTAO' })
      if (action === 'ENVIAR')   result = await adminService.enviarPedido(pid, { codigoRastreio: fields.codigoRastreio || '', transportadora: fields.transportadora || '' })
      if (action === 'ENTREGAR') result = await adminService.entregarPedido(pid)
      if (action === 'CANCELAR') result = await adminService.cancelarPedido(pid, { motivo: fields.motivo || '' })
      onSuccess(result as Order)
      toast.success('Ação realizada com sucesso!')
      onClose()
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || 'Erro ao processar ação')
    } finally {
      setLoading(false)
      setFields({})
    }
  }

  const titles = { PAGAR: 'Marcar como Pago', ENVIAR: 'Marcar como Enviado', ENTREGAR: 'Marcar como Entregue', CANCELAR: 'Cancelar Pedido' }

  return (
    <AdminModal open={open} onClose={onClose} title={(action ? titles[action as keyof typeof titles] : '') ?? ''} size="sm">
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
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Confirmar entrega do pedido ao cliente?</p>
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
  const [pedido, setPedido] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<string | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminService.getPedido(id ?? '')
      .then(setPedido)
      .catch(() => toast.error('Pedido não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>
  if (!pedido) return <AdminLayout><p className="text-center py-20" style={{ color: 'hsl(var(--muted-foreground))' }}>Pedido não encontrado</p></AdminLayout>

  const timeline = [
    { label: 'Criado',   date: pedido.dataCriacao },
    { label: 'Pago',     date: pedido.dataPagamento },
    { label: 'Enviado',  date: pedido.dataEnvio },
    { label: 'Entregue', date: pedido.dataEntrega },
  ]

  const actions = []
  if (pedido.status === 'CRIADO')  { actions.push({ key: 'PAGAR', label: 'Marcar como Pago', style: { color: '#16A34A', backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.25)' } }); actions.push({ key: 'CANCELAR', label: 'Cancelar', style: { color: '#DC2626', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' } }) }
  if (pedido.status === 'PAGO')    { actions.push({ key: 'ENVIAR', label: 'Marcar como Enviado', style: { color: '#D97706', backgroundColor: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)' } }); actions.push({ key: 'CANCELAR', label: 'Cancelar', style: { color: '#DC2626', backgroundColor: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.25)' } }) }
  if (pedido.status === 'ENVIADO') { actions.push({ key: 'ENTREGAR', label: 'Marcar como Entregue', style: { color: '#059669', backgroundColor: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)' } }) }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link to="/admin/pedidos" className="transition-colors hover:text-foreground shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }} aria-label="Voltar para lista de pedidos">
              <FiArrowLeft size={20} aria-hidden="true" />
            </Link>
            <PageTitle>Pedido</PageTitle>
            <span className="font-mono text-sm shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>{String(pedido.id).slice(0, 8).toUpperCase()}</span>
            <StatusBadge status={pedido.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {actions.map(a => (
              <button
                key={a.key}
                onClick={() => setModal(a.key)}
                className="px-3 py-2 rounded-xl text-sm font-sans font-medium transition-[background-color,transform] duration-150 active:scale-[0.96] min-h-[44px]"
                style={a.style}
                aria-label={a.label}
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
              <p className="text-sm font-semibold text-foreground mb-5">Linha do Tempo</p>
              <div className="flex">
                {timeline.map((step, i) => {
                  const done = !!step.date
                  const isCurrent = !done && i === timeline.findIndex(s => !s.date)
                  return (
                    <div key={step.label} className="flex-1 flex flex-col items-center relative">
                      {i < timeline.length - 1 && (
                        <div className="absolute top-3.5 left-1/2 w-full h-0.5" style={{ backgroundColor: done ? '#F97316' : 'hsl(var(--border))', transform: 'translateX(50%)' }} />
                      )}
                      <div className="w-7 h-7 rounded-full flex items-center justify-center z-10" style={{ backgroundColor: done ? '#F97316' : 'hsl(var(--border))' }}>
                        {done ? <FiCheckCircle size={14} color="#fff" /> : isCurrent ? <FiClock size={12} color="hsl(var(--muted-foreground))" /> : <FiCircle size={12} color="hsl(var(--muted-foreground))" />}
                      </div>
                      <p className="text-xs font-medium text-foreground mt-2">{step.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatDate(step.date)}</p>
                    </div>
                  )
                })}
              </div>
            </AdminCard>

            {/* Items */}
            <AdminCard>
              <div className="px-6 py-4" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                <p className="text-sm font-display font-semibold text-foreground">Itens do Pedido</p>
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
                        <td className="px-6 py-3 text-sm font-sans text-foreground">{item.produtoNome}</td>
                        <td className="px-6 py-3 text-sm font-mono tabular-nums" style={{ color: 'hsl(var(--muted-foreground))' }}>{item.quantidade}</td>
                        <td className="px-6 py-3 text-sm font-mono tabular-nums" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatBRL(item.precoUnitario)}</td>
                        <td className="px-6 py-3 text-sm font-mono font-bold tabular-nums text-foreground">{formatBRL(item.subtotal)}</td>
                      </Tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>

            {/* Address + tracking */}
            <AdminCard className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Endereço de Entrega</p>
                <p className="text-sm text-foreground">{pedido.enderecoEntrega}</p>
              </div>
              {pedido.observacoes && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Observações</p>
                  <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{pedido.observacoes}</p>
                </div>
              )}
              {(pedido.status === 'ENVIADO' || pedido.status === 'ENTREGUE') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Cód. Rastreio</p>
                    <p className="text-sm font-mono" style={{ color: '#F97316' }}>{pedido.codigoRastreio || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Transportadora</p>
                    <p className="text-sm text-foreground">{pedido.transportadora || '—'}</p>
                  </div>
                </div>
              )}
            </AdminCard>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-4">Resumo Financeiro</p>
              <div className="space-y-2">
                {[['Subtotal', formatBRL(pedido.subtotal)], ['Frete', formatBRL(pedido.valorFrete)], ['Desconto', `- ${formatBRL(pedido.valorDesconto)}`]].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{l}</span>
                    <span className="text-sm font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold font-mono" style={{ color: '#F97316' }}>{formatBRL(pedido.valorTotal)}</span>
              </div>
            </AdminCard>

            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-4">Datas</p>
              <div className="space-y-2">
                {[
                  ['Criado em', pedido.dataCriacao], ['Atualizado em', pedido.dataAtualizacao],
                  ['Pago em', pedido.dataPagamento], ['Enviado em', pedido.dataEnvio], ['Entregue em', pedido.dataEntrega],
                ].map(([l, v]) => (
                  <div key={l} className="flex justify-between">
                    <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{l}</span>
                    <span className="text-xs font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatDateTime(v)}</span>
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
