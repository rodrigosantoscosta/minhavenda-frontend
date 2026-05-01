import { useEffect, useState } from 'react'
import type React from 'react'
import type { Category } from '../../types'
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatDate, PageLoader, EmptyState, AdminCard, ConfirmModal, PageTitle, Th, Tr, inputCls, inputStyle, BtnPrimary } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState({ nome: '', descricao: '' })
  const [editId, setEditId] = useState<string | number | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', descricao: '' })
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminService.getCategorias()
      .then(setCategorias)
      .catch(() => toast.error('Erro ao carregar categorias'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newForm.nome) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    try {
      const cat = await adminService.criarCategoria({ nome: newForm.nome, descricao: newForm.descricao, ativo: true })
      setCategorias(cs => [...cs, cat])
      setNewForm({ nome: '', descricao: '' })
      setCreating(false)
      toast.success('Categoria criada!')
    } catch (err) { toast.error((err as any)?.response?.data?.message || 'Erro ao criar') }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!editId || !editForm.nome) return
    setSaving(true)
    try {
      const cat = await adminService.atualizarCategoria(editId, editForm)
      setCategorias(cs => cs.map(c => c.id === editId ? cat : c))
      setEditId(null)
      toast.success('Categoria atualizada!')
    } catch { toast.error('Erro ao atualizar') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await adminService.excluirCategoria(deleteId)
      setCategorias(cs => cs.filter(c => c.id !== deleteId))
      toast.success('Categoria excluída!')
      setDeleteId(null)
    } catch { toast.error('Erro ao excluir') }
  }

  const setNew = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setNewForm(f => ({ ...f, [k]: e.target.value }))
  const setEdit = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const inlineCls = `${inputCls} py-1.5`
  const ActionBtn = ({ onClick, icon: Icon, color }: { onClick: () => void; icon: React.ElementType; color: string }) => (
    <button onClick={onClick} className="p-1.5 rounded-md transition-colors" style={{ color }}><Icon size={14} /></button>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle subtitle={`${categorias.length} categoria${categorias.length !== 1 ? 's' : ''}`}>Categorias</PageTitle>
          <BtnPrimary onClick={() => setCreating(true)}><FiPlus size={16} /> Nova Categoria</BtnPrimary>
        </div>

        <AdminCard>
          {loading ? <PageLoader /> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr>
                  <Th>ID</Th><Th>Nome</Th><Th>Descrição</Th><Th>Ativo</Th><Th>Criado em</Th><Th>Ações</Th>
                </tr></thead>
                <tbody>
                  {/* New row */}
                  {creating && (
                    <tr style={{ backgroundColor: 'rgba(249,115,22,0.05)', borderBottom: '1px solid #1E2028' }}>
                      <td className="px-5 py-3 text-xs font-mono" style={{ color: '#6B7280' }}>novo</td>
                      <td className="px-5 py-3"><input autoFocus className={inlineCls} style={inputStyle} placeholder="Nome *" value={newForm.nome} onChange={setNew('nome')} /></td>
                      <td className="px-5 py-3"><input className={inlineCls} style={inputStyle} placeholder="Descrição" value={newForm.descricao} onChange={setNew('descricao')} /></td>
                      <td className="px-5 py-3 text-xs" style={{ color: '#6B7280' }}>Ativo</td>
                      <td></td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1">
                          <ActionBtn onClick={handleCreate} icon={saving ? FiCheck : FiCheck} color="#22C55E" />
                          <ActionBtn onClick={() => setCreating(false)} icon={FiX} color="#6B7280" />
                        </div>
                      </td>
                    </tr>
                  )}

                  {categorias.length === 0 && !creating
                    ? <tr><td colSpan={6}><EmptyState message="Nenhuma categoria" /></td></tr>
                    : categorias.map(c => (
                      <Tr key={c.id}>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: '#6B7280' }}>{c.id}</td>
                        {editId === c.id ? (
                          <>
                            <td className="px-5 py-3"><input autoFocus className={inlineCls} style={inputStyle} value={editForm.nome} onChange={setEdit('nome')} /></td>
                            <td className="px-5 py-3"><input className={inlineCls} style={inputStyle} value={editForm.descricao} onChange={setEdit('descricao')} /></td>
                            <td colSpan={2}></td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                <ActionBtn onClick={handleEdit} icon={FiCheck} color="#22C55E" />
                                <ActionBtn onClick={() => setEditId(null)} icon={FiX} color="#6B7280" />
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-3 text-sm font-medium text-white">{c.nome}</td>
                            <td className="px-5 py-3 text-sm" style={{ color: '#9CA3AF' }}>{c.descricao || '—'}</td>
                            <td className="px-5 py-3">
                              <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md"
                                style={c.ativo ? { color: '#22C55E', backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' } : { color: '#6B7280', backgroundColor: '#1E2028', border: '1px solid #2a2d38' }}>
                                {c.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-xs font-mono" style={{ color: '#9CA3AF' }}>{formatDate(c.dataCadastro)}</td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1">
                                <ActionBtn onClick={() => { setEditId(c.id); setEditForm({ nome: c.nome, descricao: c.descricao }) }} icon={FiEdit2} color="#6B7280" />
                                <ActionBtn onClick={() => setDeleteId(c.id)} icon={FiTrash2} color="#6B7280" />
                              </div>
                            </td>
                          </>
                        )}
                      </Tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir Categoria" message="Esta categoria será excluída permanentemente." />
    </AdminLayout>
  )
}
