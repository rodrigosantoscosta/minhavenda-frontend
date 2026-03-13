import { useEffect, useState } from 'react'
import { FiPlus, FiMinus, FiSliders } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatDateTime, PageLoader, EmptyState, AdminCard, AdminModal, PageTitle, Th, Tr, inputCls, inputStyle, FieldLabel, BtnPrimary, BtnSecondary } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

function StockModal({ open, onClose, action, produto, onSuccess }) {
  const [qty, setQty] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const titles = { ADICIONAR: 'Adicionar Estoque', REMOVER: 'Remover Estoque', AJUSTAR: 'Ajustar Estoque' }

  const submit = async () => {
    const n = parseInt(qty)
    if (!produto || !action || isNaN(n) || n <= 0) { toast.error('Informe uma quantidade válida'); return }
    setLoading(true)
    try {
      let result
      if (action === 'ADICIONAR') result = await adminService.adicionarEstoque(produto.id, n)
      if (action === 'REMOVER')   result = await adminService.removerEstoque(produto.id, n)
      if (action === 'AJUSTAR')   result = await adminService.ajustarEstoque(produto.id, n)
      onSuccess(result)
      toast.success('Estoque atualizado!')
      setQty('')
      onClose()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao atualizar estoque')
    } finally { setLoading(false) }
  }

  return (
    <AdminModal open={open} onClose={() => { setQty(''); onClose() }} title={action ? titles[action] : ''} size="sm">
      <div className="space-y-4">
        <p className="text-sm" style={{ color: '#9CA3AF' }}>Produto: <span className="text-white font-medium">{produto?.nome}</span></p>
        <div>
          <FieldLabel>{action === 'AJUSTAR' ? 'Nova Quantidade Total' : 'Quantidade'}</FieldLabel>
          <input type="number" min="1" className={inputCls} style={inputStyle} value={qty} onChange={e => setQty(e.target.value)} autoFocus />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <BtnSecondary onClick={() => { setQty(''); onClose() }}>Cancelar</BtnSecondary>
          <BtnPrimary onClick={submit} disabled={loading}>{loading ? 'Aguarde...' : 'Confirmar'}</BtnPrimary>
        </div>
      </div>
    </AdminModal>
  )
}

export default function AdminEstoque() {
  const [rows, setRows] = useState([])       // { ...produto, estoque?, estoqueLoading }
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)    // { action, produto }
  const toast = useToast()

  useEffect(() => {
    adminService.getProdutos({ ativo: 'true' })
      .then(prods => {
        setRows(prods.map(p => ({ ...p, estoqueLoading: true })))
        setLoading(false)
        // Lazy-load stock for each product in parallel
        prods.forEach(p => {
          adminService.getEstoque(p.id)
            .then(estoque => setRows(rs => rs.map(r => r.id === p.id ? { ...r, estoque, estoqueLoading: false } : r)))
            .catch(() => setRows(rs => rs.map(r => r.id === p.id ? { ...r, estoqueLoading: false } : r)))
        })
      })
      .catch(() => { toast.error('Erro ao carregar produtos'); setLoading(false) })
  }, [])

  const handleSuccess = estoque => {
    setRows(rs => rs.map(r => r.id === estoque.produtoId ? { ...r, estoque } : r))
  }

  const qtyStyle = qty => {
    if (qty <= 5)  return { color: '#EF4444', backgroundColor: 'rgba(239,68,68,0.1)',  border: '1px solid rgba(239,68,68,0.2)' }
    if (qty <= 20) return { color: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }
    return { color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }
  }

  const SmallBtn = ({ onClick, icon: Icon, label, color }) => (
    <button onClick={onClick} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors" style={{ color, backgroundColor: `${color}1A`, border: `1px solid ${color}33` }}>
      <Icon size={12} />{label}
    </button>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageTitle subtitle={`${rows.length} produto${rows.length !== 1 ? 's' : ''} monitorado${rows.length !== 1 ? 's' : ''}`}>Estoque</PageTitle>

        <AdminCard>
          {loading ? <PageLoader /> : rows.length === 0 ? <EmptyState /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ borderBottom: '1px solid #1E2028' }}>
                  <Th>Produto</Th><Th>Quantidade</Th><Th>Última Atualização</Th><Th>Ações</Th>
                </tr></thead>
                <tbody>
                  {rows.map(row => (
                    <Tr key={row.id}>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">{row.nome}</p>
                        <p className="text-xs" style={{ color: '#6B7280' }}>{row.categoriaNome || 'Sem categoria'}</p>
                      </td>
                      <td className="px-5 py-3">
                        {row.estoqueLoading
                          ? <span className="text-xs" style={{ color: '#6B7280' }}>Carregando...</span>
                          : row.estoque
                            ? <span className="text-sm font-mono font-bold px-2 py-0.5 rounded" style={qtyStyle(row.estoque.quantidade)}>{row.estoque.quantidade} un</span>
                            : <span className="text-xs" style={{ color: '#6B7280' }}>—</span>}
                      </td>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>
                        {row.estoque ? formatDateTime(row.estoque.atualizadoEm) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <SmallBtn onClick={() => setModal({ action: 'ADICIONAR', produto: row })} icon={FiPlus}    label="Add"    color="#22C55E" />
                          <SmallBtn onClick={() => setModal({ action: 'REMOVER',   produto: row })} icon={FiMinus}   label="Rem"    color="#EF4444" />
                          <SmallBtn onClick={() => setModal({ action: 'AJUSTAR',   produto: row })} icon={FiSliders} label="Ajustar" color="#9CA3AF" />
                        </div>
                      </td>
                    </Tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      <StockModal
        open={!!modal} onClose={() => setModal(null)}
        action={modal?.action} produto={modal?.produto}
        onSuccess={handleSuccess}
      />
    </AdminLayout>
  )
}
