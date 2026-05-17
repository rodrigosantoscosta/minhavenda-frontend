import { useEffect, useState } from 'react'
import { FiRefreshCw, FiExternalLink, FiAlertTriangle, FiAlertOctagon } from 'react-icons/fi'
import AdminLayout from '../../components/admin/AdminLayout'
import adminService from '../../services/adminService'
import { PageLoader, AdminCard, PageTitle, BtnPrimary } from '../../utils/adminUtils'
import { useToast } from '../../components/common/Toast'

export default function AdminDLQ() {
  const [queues, setQueues] = useState<string[]>([])
  const [dica, setDica] = useState('')
  const [managementUI, setManagementUI] = useState('http://localhost:15672')
  const [loading, setLoading] = useState(true)
  const [requeueing, setRequeueing] = useState<string | null>(null)
  const [requeueingAll, setRequeuingAll] = useState(false)
  const toast = useToast()

  useEffect(() => {
    adminService.getDlqQueues()
      .then(data => { const d = data as any; setQueues(d.dlqs ?? []); setDica(d.dica ?? ''); setManagementUI(d.managementUI ?? 'http://localhost:15672') })
      .catch(() => toast.error('Erro ao carregar DLQs'))
      .finally(() => setLoading(false))
  }, [])

  const handleRequeue = async (queue: string) => {
    setRequeueing(queue)
    try {
      const res = await adminService.requeueDlq(queue) as any
      if (res.erro) { toast.error(`Erro: ${res.erro}`) }
      else toast.success(`${res.mensagensReenfileiradas} mensagem(ns) reprocessada(s) de ${queue}`)
    } catch (err) { toast.error((err as any)?.response?.data?.message || 'Erro ao reprocessar') }
    finally { setRequeueing(null) }
  }

  const handleRequeueAll = async () => {
    setRequeuingAll(true)
    try {
      const res = await adminService.requeueAllDlq() as any
      toast.success(`Total: ${res.totalMensagensReenfileiradas} mensagem(ns) reprocessada(s)`)
    } catch (err) { toast.error((err as any)?.response?.data?.message || 'Erro ao reprocessar') }
    finally { setRequeuingAll(false) }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiAlertOctagon size={28} style={{ color: '#F97316' }} />
            <PageTitle subtitle="Gerenciamento de mensagens com falha no RabbitMQ">Dead Letter Queue</PageTitle>
          </div>
          <BtnPrimary onClick={handleRequeueAll} disabled={requeueingAll || queues.length === 0}>
            <FiRefreshCw size={16} className={requeueingAll ? 'animate-spin' : ''} aria-hidden="true" />
            {requeueingAll ? 'Reprocessando...' : 'Reprocessar Todas'}
          </BtnPrimary>
        </div>

        {/* Info banner */}
        <AdminCard className="p-4">
          <div className="flex items-start gap-3">
            <FiAlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <div>
              {dica && <p className="text-sm mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>{dica}</p>}
              <a href={managementUI} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm transition-colors hover:underline" style={{ color: '#F97316' }}>
                Abrir RabbitMQ Management UI <FiExternalLink size={12} />
              </a>
            </div>
          </div>
        </AdminCard>

        {/* DLQ cards */}
        {queues.length === 0 ? (
          <AdminCard className="p-12 text-center">
            <FiAlertOctagon size={40} className="mx-auto mb-3" style={{ color: 'hsl(var(--border))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Nenhuma DLQ encontrada</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>Todas as mensagens estão sendo processadas normalmente</p>
          </AdminCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {queues.map(queue => (
              <AdminCard key={queue} className="p-6 hover:border-orange-500/30 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <FiAlertOctagon size={16} style={{ color: '#EF4444' }} />
                </div>
                <p className="text-xs font-mono break-all mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>{queue}</p>
                <button
                  onClick={() => handleRequeue(queue)}
                  disabled={requeueing === queue}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px]"
                  style={{ color: '#F97316', backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)' }}
                  aria-label={`Reprocessar fila ${queue}`}
                >
                  <FiRefreshCw size={14} className={requeueing === queue ? 'animate-spin' : ''} aria-hidden="true" />
                  {requeueing === queue ? 'Reprocessando...' : 'Reprocessar'}
                </button>
              </AdminCard>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
