import { useEffect, useState } from 'react'
import type React from 'react'
import type { Product, Category } from '../../types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { formatBRL, PageLoader, AdminCard, PageTitle, inputCls, inputStyle, FieldLabel, BtnPrimary } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

export default function AdminEditProduto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorias, setCategorias] = useState<Category[]>([])
  const [produto, setProduto] = useState<Product | null>(null)
  const [form, setForm] = useState({ nome: '', descricao: '', preco: '', urlImagem: '', pesoKg: '', alturaCm: '', larguraCm: '', comprimentoCm: '', categoriaId: '', ativo: true })
  const toast = useToast()

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([adminService.getProduto(id ?? ''), adminService.getCategorias()])
      .then(([p, cats]) => {
        setProduto(p)
        setCategorias(cats)
        setForm({
          nome: p.nome, descricao: p.descricao, preco: String(p.preco),
          urlImagem: p.urlImagem || '', categoriaId: p.categoriaId ? String(p.categoriaId) : '',
          pesoKg: p.pesoKg ? String(p.pesoKg) : '', alturaCm: p.alturaCm ? String(p.alturaCm) : '',
          larguraCm: p.larguraCm ? String(p.larguraCm) : '', comprimentoCm: p.comprimentoCm ? String(p.comprimentoCm) : '',
          ativo: p.ativo,
        })
      })
      .catch(() => toast.error('Produto não encontrado'))
      .finally(() => setLoading(false))
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const body: Record<string, unknown> = { nome: form.nome, descricao: form.descricao, preco: parseFloat(form.preco as string), ativo: form.ativo }
      if (form.urlImagem)     body.urlImagem     = form.urlImagem
      if (form.categoriaId)   body.categoriaId   = parseInt(form.categoriaId as string)
      if (form.pesoKg)        body.pesoKg        = parseFloat(form.pesoKg as string)
      if (form.alturaCm)      body.alturaCm      = parseFloat(form.alturaCm as string)
      if (form.larguraCm)     body.larguraCm     = parseFloat(form.larguraCm as string)
      if (form.comprimentoCm) body.comprimentoCm = parseFloat(form.comprimentoCm as string)
      await adminService.atualizarProduto(id ?? '', body)
      toast.success('Produto atualizado!')
      navigate('/admin/produtos')
    } catch (err) {
      toast.error((err as any)?.response?.data?.message || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>
  if (!produto) return <AdminLayout><p className="text-center py-20" style={{ color: 'hsl(var(--muted-foreground))' }}>Produto não encontrado</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/admin/produtos" className="transition-colors hover:text-foreground" style={{ color: 'hsl(var(--muted-foreground))' }} aria-label="Voltar para lista de produtos"><FiArrowLeft size={20} aria-hidden="true" /></Link>
          <div>
            <PageTitle>Editar Produto</PageTitle>
            <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{produto.nome} · {formatBRL(produto.preco)}</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-5">
            <AdminCard className="p-6 space-y-4">
              <div><FieldLabel>Nome *</FieldLabel><input required className={inputCls} style={inputStyle} value={form.nome} onChange={set('nome')} /></div>
              <div><FieldLabel>Descrição *</FieldLabel><textarea required rows={4} className={`${inputCls} resize-none`} style={inputStyle} value={form.descricao} onChange={set('descricao')} /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><FieldLabel>Preço (BRL) *</FieldLabel><input required type="number" step="0.01" className={inputCls} style={inputStyle} value={form.preco} onChange={set('preco')} /></div>
                <div>
                  <FieldLabel>Categoria</FieldLabel>
                  <select className={inputCls} style={inputStyle} value={form.categoriaId} onChange={set('categoriaId')}>
                    <option value="">Sem categoria</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
              </div>
            </AdminCard>

            <AdminCard className="p-6 space-y-4">
              <p className="text-sm font-semibold text-foreground">Dimensões e Peso</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['Peso (kg)', 'pesoKg'], ['Altura (cm)', 'alturaCm'], ['Largura (cm)', 'larguraCm'], ['Comprimento (cm)', 'comprimentoCm']].map(([lbl, k]) => (
                  <div key={k}><FieldLabel>{lbl}</FieldLabel><input type="number" step="0.01" className={inputCls} style={inputStyle} value={form[k as keyof typeof form] as string} onChange={set(k!)} /></div>
                ))}
              </div>
            </AdminCard>
          </div>

          {/* Right */}
          <div className="space-y-5">
            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-3">Imagem</p>
              {form.urlImagem && (
                <img src={form.urlImagem} alt="preview" className="w-full aspect-square object-cover rounded-xl mb-3 outline outline-1 -outline-offset-1 outline-black/10" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
              <FieldLabel>URL da Imagem</FieldLabel>
              <input className={inputCls} style={inputStyle} value={form.urlImagem} onChange={set('urlImagem')} placeholder="https://..." />
            </AdminCard>

            <AdminCard className="p-6">
              <p className="text-sm font-semibold text-foreground mb-4">Status</p>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Produto ativo</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, ativo: !f.ativo }))}
                  className="relative w-12 h-6 rounded-full transition-colors min-w-[44px] min-h-[44px]"
                  style={{ backgroundColor: form.ativo ? '#F97316' : 'hsl(var(--border))' }}
                  aria-label={form.ativo ? 'Desativar produto' : 'Ativar produto'}
                  role="switch"
                  aria-checked={form.ativo}
                >
                  <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform" style={{ transform: form.ativo ? 'translateX(24px)' : 'translateX(2px)' }} />
                </button>
              </div>
            </AdminCard>

            <BtnPrimary type="submit" disabled={saving} className="w-full justify-center py-3 rounded-xl">
              <FiSave size={16} />{saving ? 'Salvando...' : 'Salvar Alterações'}
            </BtnPrimary>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
