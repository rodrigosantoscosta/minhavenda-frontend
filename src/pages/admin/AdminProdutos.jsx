import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import {
  formatBRL, PageLoader, EmptyState, AdminCard, AdminModal, ConfirmModal,
  PageTitle, Th, Tr, inputCls, inputStyle, FieldLabel, BtnPrimary, BtnSecondary,
} from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

function CreateModal({ open, onClose, categorias, onCreated }) {
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', urlImagem: '', pesoKg: '', alturaCm: '', larguraCm: '', comprimentoCm: '', categoriaId: '' })
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    if (!form.nome || !form.descricao || !form.preco) { toast.error('Preencha os campos obrigatórios'); return }
    setLoading(true)
    try {
      const body = { nome: form.nome, descricao: form.descricao, preco: parseFloat(form.preco) }
      if (form.urlImagem)     body.urlImagem     = form.urlImagem
      if (form.categoriaId)   body.categoriaId   = parseInt(form.categoriaId)
      if (form.pesoKg)        body.pesoKg        = parseFloat(form.pesoKg)
      if (form.alturaCm)      body.alturaCm      = parseFloat(form.alturaCm)
      if (form.larguraCm)     body.larguraCm     = parseFloat(form.larguraCm)
      if (form.comprimentoCm) body.comprimentoCm = parseFloat(form.comprimentoCm)
      const produto = await adminService.criarProduto(body)
      onCreated(produto)
      toast.success('Produto criado!')
      onClose()
      setForm({ nome: '', descricao: '', preco: '', urlImagem: '', pesoKg: '', alturaCm: '', larguraCm: '', comprimentoCm: '', categoriaId: '' })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erro ao criar produto')
    } finally { setLoading(false) }
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Novo Produto" size="lg">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2"><FieldLabel>Nome *</FieldLabel><input className={inputCls} style={inputStyle} value={form.nome} onChange={set('nome')} /></div>
        <div className="col-span-2"><FieldLabel>Descrição *</FieldLabel><textarea className={inputCls} style={inputStyle} rows={3} value={form.descricao} onChange={set('descricao')} /></div>
        <div><FieldLabel>Preço (BRL) *</FieldLabel><input type="number" step="0.01" className={inputCls} style={inputStyle} value={form.preco} onChange={set('preco')} /></div>
        <div>
          <FieldLabel>Categoria</FieldLabel>
          <select className={inputCls} style={inputStyle} value={form.categoriaId} onChange={set('categoriaId')}>
            <option value="">Sem categoria</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
        <div className="col-span-2">
          <FieldLabel>URL da Imagem</FieldLabel>
          <input className={inputCls} style={inputStyle} value={form.urlImagem} onChange={set('urlImagem')} placeholder="https://..." />
          {form.urlImagem && <img src={form.urlImagem} alt="preview" className="mt-2 h-16 w-16 object-cover rounded-lg" style={{ border: '1px solid #1E2028' }} onError={e => e.target.style.display = 'none'} />}
        </div>
        <div><FieldLabel>Peso (kg)</FieldLabel><input type="number" step="0.01" className={inputCls} style={inputStyle} value={form.pesoKg} onChange={set('pesoKg')} /></div>
        <div><FieldLabel>Altura (cm)</FieldLabel><input type="number" className={inputCls} style={inputStyle} value={form.alturaCm} onChange={set('alturaCm')} /></div>
        <div><FieldLabel>Largura (cm)</FieldLabel><input type="number" className={inputCls} style={inputStyle} value={form.larguraCm} onChange={set('larguraCm')} /></div>
        <div><FieldLabel>Comprimento (cm)</FieldLabel><input type="number" className={inputCls} style={inputStyle} value={form.comprimentoCm} onChange={set('comprimentoCm')} /></div>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <BtnSecondary onClick={onClose}>Cancelar</BtnSecondary>
        <BtnPrimary onClick={submit} disabled={loading}>{loading ? 'Criando...' : 'Criar Produto'}</BtnPrimary>
      </div>
    </AdminModal>
  )
}

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [atoFilter, setAtoFilter] = useState('true')
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const toast = useToast()

  const load = useCallback(() => {
    setLoading(true)
    const params = {}
    if (search)    params.nome = search
    if (catFilter) params.categoriaId = catFilter
    if (atoFilter) params.ativo = atoFilter
    Promise.all([adminService.getProdutos(params), adminService.getCategorias()])
      .then(([prods, cats]) => { setProdutos(prods); setCategorias(cats) })
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [search, catFilter, atoFilter])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await adminService.excluirProduto(deleteId)
      setProdutos(ps => ps.filter(p => p.id !== deleteId))
      toast.success('Produto excluído')
      setDeleteId(null)
    } catch { toast.error('Erro ao excluir produto') }
    finally { setDeleteLoading(false) }
  }

  const selCls = `${inputCls} w-auto`

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle subtitle={`${produtos.length} produto${produtos.length !== 1 ? 's' : ''}`}>Produtos</PageTitle>
          <BtnPrimary onClick={() => setCreateOpen(true)}><FiPlus size={16} /> Novo Produto</BtnPrimary>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
            <input
              placeholder="Buscar por nome..."
              className="w-full rounded-lg pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none transition-colors"
              style={{ backgroundColor: '#111318', border: '1px solid #1E2028' }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className={selCls} style={inputStyle} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">Todas as categorias</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <select className={selCls} style={inputStyle} value={atoFilter} onChange={e => setAtoFilter(e.target.value)}>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
            <option value="">Todos</option>
          </select>
        </div>

        <AdminCard>
          {loading ? <PageLoader /> : produtos.length === 0 ? <EmptyState /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ borderBottom: '1px solid #1E2028' }}>
                  <Th></Th><Th>Nome</Th><Th>Categoria</Th><Th>Preço</Th><Th>Status</Th><Th>Ações</Th>
                </tr></thead>
                <tbody>
                  {produtos.map(p => (
                    <Tr key={p.id}>
                      <td className="px-5 py-3 w-12">
                        {p.urlImagem
                          ? <img src={p.urlImagem} alt={p.nome} className="w-10 h-10 rounded-lg object-cover" style={{ border: '1px solid #1E2028' }} onError={e => e.target.style.display = 'none'} />
                          : <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E2028' }}><FiPackage size={16} style={{ color: '#6B7280' }} /></div>}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">{p.nome}</p>
                        <p className="text-xs truncate max-w-xs" style={{ color: '#6B7280' }}>{p.descricao}</p>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: '#9CA3AF' }}>{p.categoriaNome || '—'}</td>
                      <td className="px-5 py-3 text-sm font-mono font-medium text-white">{formatBRL(p.preco)}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={p.ativo ? { color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : { color: '#6B7280', backgroundColor: '#1E2028', border: '1px solid #2a2d38' }}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/produtos/${p.id}`} className="p-1.5 rounded-md transition-colors hover:text-orange-400" style={{ color: '#6B7280' }}><FiEdit2 size={14} /></Link>
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-md transition-colors hover:text-red-400" style={{ color: '#6B7280' }}><FiTrash2 size={14} /></button>
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

      <CreateModal open={createOpen} onClose={() => setCreateOpen(false)} categorias={categorias} onCreated={p => setProdutos(ps => [p, ...ps])} />
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir Produto" message="Esta ação é irreversível. O produto será excluído permanentemente." loading={deleteLoading} />
    </AdminLayout>
  )
}
