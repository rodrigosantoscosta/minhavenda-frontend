/**
 * src/utils/adminUtils.jsx
 * Shared formatting helpers and components for the admin dashboard.
 */

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr))
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

// ─── ID shortener ─────────────────────────────────────────────────────────────

export function shortId(id) {
  return id.slice(0, 8).toUpperCase()
}

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  CRIADO:    { label: 'Criado',    color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  PAGO:      { label: 'Pago',      color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  ENVIADO:   { label: 'Enviado',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ENTREGUE:  { label: 'Entregue',  color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  CANCELADO: { label: 'Cancelado', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' }
  return (
    <span
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}40`,
        fontFamily: 'monospace',
      }}
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider"
    >
      {cfg.label}
    </span>
  )
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────

/** Full-page centred spinner */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8" style={{ color: '#F97316' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-sm" style={{ color: '#6B7280' }}>Carregando...</p>
      </div>
    </div>
  )
}

/** Centred empty-state message */
export function EmptyState({ message = 'Nenhum item encontrado' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm" style={{ color: '#6B7280' }}>{message}</p>
    </div>
  )
}

/** Dark modal overlay */
export function AdminModal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        className={`relative w-full ${widths[size]} rounded-2xl shadow-2xl`}
        style={{ backgroundColor: '#111318', border: '1px solid #1E2028' }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1E2028' }}>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

/** Confirm-before-destruct modal */
export function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm mb-5" style={{ color: '#9CA3AF' }}>{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-white transition-colors" style={{ backgroundColor: '#1E2028' }}>
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          {loading ? 'Aguarde...' : 'Confirmar'}
        </button>
      </div>
    </AdminModal>
  )
}

/** Shared dark input className */
export const inputCls = [
  'w-full rounded-lg px-3 py-2.5 text-sm text-white',
  'focus:outline-none transition-colors',
].join(' ')

export const inputStyle = { backgroundColor: '#0A0B0E', border: '1px solid #1E2028' }
export const inputFocusStyle = { borderColor: '#F97316' }

/** Label above an input */
export function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#6B7280' }}>
      {children}
    </label>
  )
}

/** Reusable dark card wrapper */
export function AdminCard({ children, className = '' }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ backgroundColor: '#111318', border: '1px solid #1E2028' }}>
      {children}
    </div>
  )
}

/** Table header cell */
export function Th({ children }) {
  return (
    <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#6B7280' }}>
      {children}
    </th>
  )
}

/** Table data row — adds hover + bottom border */
export function Tr({ children }) {
  return (
    <tr className="transition-colors" style={{ borderBottom: '1px solid #1E2028' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {children}
    </tr>
  )
}

/** Page title heading */
export function PageTitle({ children, subtitle }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'inherit' }}>{children}</h1>
      {subtitle && <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{subtitle}</p>}
    </div>
  )
}

/** Orange primary button */
export function BtnPrimary({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${className}`}
      style={{ backgroundColor: disabled ? '#7C3B0E' : '#F97316' }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.backgroundColor = '#EA6C10')}
      onMouseLeave={e => !disabled && (e.currentTarget.style.backgroundColor = '#F97316')}
    >
      {children}
    </button>
  )
}

/** Neutral secondary button */
export function BtnSecondary({ children, onClick, disabled, className = '' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${className}`}
      style={{ backgroundColor: '#1E2028' }}
    >
      {children}
    </button>
  )
}
