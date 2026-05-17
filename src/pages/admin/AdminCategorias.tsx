import { useEffect, useState } from 'react'
import type React from 'react'
import type { Category } from '../../types'
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatDate, PageLoader, EmptyState, AdminCard, ConfirmModal, PageTitle, Th, Tr, inputCls, inputStyle, BtnPrimary } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

function ActionBtn({ onClick, icon: Icon, color, ariaLabel }: { onClick: () => void; icon: React.ElementType; color: string; ariaLabel?: string }) {
  return (
    <button onClick={onClick} className="p-1.5 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color }} aria-label={ariaLabel}>
      <Icon size={14} />
    </button>
  )
}

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newForm, setNewForm] = useState({ nome: '', descricao: '' })
  const [editId, setEditId] = useState<string | number | null>(null)
  const [editForm, setEditForm] = useState({ nome: '', descricao: '' })
  const [deleteId, setDeleteId] = useState<string | number | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminService.getCategorias()
      .then(setCategorias)
      .catch(() => toast.error('Erro ao carregar categorias'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newForm.nome) { toast.error('Nome é obrigatório'); return }
    try {
      const cat = await adminService.criarCategoria({ nome: newForm.nome, descricao: newForm.descricao } as any)
      setCategorias(cs => [...cs, cat])
      setNewForm({ nome: '', descricao: '' })
      setCreating(false)
      toast.success('Categoria criada!')
    } catch (err) { toast.error((err as any)?.response?.data?.message || 'Erro ao criar') }
  }

  const handleEdit = async () => {
    if (!editId || !editForm.nome) return
    try {
      const cat = await adminService.atualizarCategoria(editId, editForm)
      setCategorias(cs => cs.map(c => c.id === editId ? cat : c))
      setEditId(null)
      toast.success('Categoria atualizada!')
    } catch { toast.error('Erro ao atualizar') }
  }

  const handleDelete = async () => {
    try {
      await adminService.excluirCategoria(deleteId!)
      setCategorias(cs => cs.filter(c => c.id !== deleteId))
      toast.success('Categoria excluída!')
      setDeleteId(null)
    } catch { toast.error('Erro ao excluir') }
  }

  const setNew = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setNewForm(f => ({ ...f, [k]: e.target.value }))
  const setEdit = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setEditForm(f => ({ ...f, [k]: e.target.value }))

  const inlineCls = `${inputCls} py-1.5`

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle subtitle={`${categorias.length} categoria${categorias.length !== 1 ? 's' : ''}`}>Categorias</PageTitle>
          <BtnPrimary onClick={() => setCreating(true)}><FiPlus size={16} /> Nova Categoria</BtnPrimary>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {loading ? <PageLoader /> : categorias.length === 0 ? <EmptyState message="Nenhuma categoria" /> : (
            categorias.map(c => (
              <AdminCard key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                    <p className="text-xs font-sans mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.descricao || 'Sem descrição'}</p>
                  </div>
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md shrink-0"
                    style={c.ativo ? { color: '#16A34A', backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' } : { color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                    {c.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatDate((c as any).dataCadastro)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditId(c.id); setEditForm({ nome: c.nome, descricao: c.descricao || '' }) }}
                      className="p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      aria-label={`Editar categoria ${c.nome}`}
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-2 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      aria-label={`Excluir categoria ${c.nome}`}
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </AdminCard>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block">
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
                      <tr style={{ backgroundColor: 'rgba(249,115,22,0.05)', borderBottom: '1px solid hsl(var(--border))' }}>
                        <td className="px-5 py-3 text-xs font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>novo</td>
                        <td className="px-5 py-3"><input autoFocus className={inlineCls} style={inputStyle} placeholder="Nome *" value={newForm.nome} onChange={setNew('nome')} /></td>
                        <td className="px-5 py-3"><input className={inlineCls} style={inputStyle} placeholder="Descrição" value={newForm.descricao} onChange={setNew('descricao')} /></td>
                        <td className="px-5 py-3 text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>Ativo</td>
                        <td></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1">
                            <ActionBtn onClick={handleCreate} icon={FiCheck} color="#22C55E" ariaLabel="Confirmar criação" />
                            <ActionBtn onClick={() => setCreating(false)} icon={FiX} color="hsl(var(--muted-foreground))" ariaLabel="Cancelar criação" />
                          </div>
                        </td>
                      </tr>
                    )}

                    {categorias.length === 0 && !creating
                      ? <tr><td colSpan={6}><EmptyState message="Nenhuma categoria" /></td></tr>
                      : categorias.map(c => (
                        <Tr key={c.id}>
                          <td className="px-5 py-3 text-xs font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.id}</td>
                          {editId === c.id ? (
                            <>
                              <td className="px-5 py-3"><input autoFocus className={inlineCls} style={inputStyle} value={editForm.nome} onChange={setEdit('nome')} /></td>
                              <td className="px-5 py-3"><input className={inlineCls} style={inputStyle} value={editForm.descricao} onChange={setEdit('descricao')} /></td>
                              <td colSpan={2}></td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1">
                                  <ActionBtn onClick={handleEdit} icon={FiCheck} color="#22C55E" ariaLabel="Confirmar edição" />
                                  <ActionBtn onClick={() => setEditId(null)} icon={FiX} color="hsl(var(--muted-foreground))" ariaLabel="Cancelar edição" />
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3 text-sm font-medium text-foreground">{c.nome}</td>
                              <td className="px-5 py-3 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>{c.descricao || '—'}</td>
                              <td className="px-5 py-3">
                                <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-md"
                                  style={c.ativo ? { color: '#16A34A', backgroundColor: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)' } : { color: 'hsl(var(--muted-foreground))', backgroundColor: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                                  {c.ativo ? 'Ativo' : 'Inativo'}
                                </span>
                              </td>
                              <td className="px-5 py-3 text-xs font-mono" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatDate((c as any).dataCadastro)}</td>
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1">
                                  <ActionBtn onClick={() => { setEditId(c.id); setEditForm({ nome: c.nome, descricao: c.descricao || '' }) }} icon={FiEdit2} color="hsl(var(--muted-foreground))" ariaLabel={`Editar categoria ${c.nome}`} />
                                  <ActionBtn onClick={() => setDeleteId(c.id)} icon={FiTrash2} color="hsl(var(--muted-foreground))" ariaLabel={`Excluir categoria ${c.nome}`} />
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
      </div>

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Excluir Categoria" message="Esta categoria será excluída permanentemente." />
    </AdminLayout>
  )
}
