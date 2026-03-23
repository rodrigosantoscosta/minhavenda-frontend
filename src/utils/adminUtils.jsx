/**
 * src/utils/adminUtils.jsx
 * Shared formatting helpers and UI atoms for the admin dashboard.
 */

// ─── Design tokens ────────────────────────────────────────────────────────────

export const T = {
  bg:        '#0A0B0E',
  surface:   '#0D0E12',
  card:      '#111318',
  border:    '#1E2028',
  border2:   '#2a2d38',
  muted:     '#6B7280',
  sub:       '#9CA3AF',
  accent:    '#F97316',
  accentBg:  'rgba(249,115,22,0.12)',
  accentBd:  'rgba(249,115,22,0.25)',
  green:     '#22C55E',
  greenBg:   'rgba(34,197,94,0.1)',
  red:       '#EF4444',
  redBg:     'rgba(239,68,68,0.1)',
  redBd:     'rgba(239,68,68,0.2)',
  amber:     '#F59E0B',
  amberBg:   'rgba(245,158,11,0.1)',
  blue:      '#60A5FA',
  blueBg:    'rgba(96,165,250,0.1)',
  teal:      '#10B981',
}

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

// ─── ID shortener ─────────────────────────────────────────────────────────────

export function shortId(id) {
  return String(id).slice(0, 8).toUpperCase()
}

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG = {
  CRIADO:    { label: 'Criado',    color: T.blue,   bg: T.blueBg  },
  PAGO:      { label: 'Pago',      color: T.green,  bg: T.greenBg },
  ENVIADO:   { label: 'Enviado',   color: T.amber,  bg: T.amberBg },
  ENTREGUE:  { label: 'Entregue',  color: T.teal,   bg: 'rgba(16,185,129,0.12)' },
  CANCELADO: { label: 'Cancelado', color: T.red,    bg: T.redBg   },
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: T.muted, bg: 'rgba(107,114,128,0.12)' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold uppercase tracking-wider font-mono whitespace-nowrap"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.label}
    </span>
  )
}

// ─── PageLoader ───────────────────────────────────────────────────────────────

/** Full-area centred spinner — matches brand single-ring style */
export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-9 h-9">
          <div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'rgba(249,115,22,0.15)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: T.accent }}
          />
        </div>
        <p className="text-sm font-sans" style={{ color: T.muted }}>Carregando...</p>
      </div>
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ message = 'Nenhum item encontrado' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-sm font-sans" style={{ color: T.muted }}>{message}</p>
    </div>
  )
}

// ─── AdminModal ───────────────────────────────────────────────────────────────

/** Dark modal — closes on Escape and backdrop click */
export function AdminModal({ open, onClose, title, children, size = 'md' }) {
  // Skill: Escape key closes modal
  if (typeof document !== 'undefined' && open) {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler, { once: true })
  }

  if (!open) return null
  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      {/* Sheet on mobile, centered card on sm+ */}
      <div
        className={`relative w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col`}
        style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${T.border}` }}
        >
          <h2 className="text-base font-display font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-xl leading-none transition-colors font-sans"
            style={{ color: T.muted }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = T.muted}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

export function ConfirmModal({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <AdminModal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm font-sans mb-5" style={{ color: T.sub }}>{message}</p>
      <div className="flex justify-end gap-3">
        <BtnSecondary onClick={onClose}>Cancelar</BtnSecondary>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 rounded-xl text-sm font-sans font-medium transition-colors duration-150 disabled:opacity-50 active:scale-[0.96]"
          style={{ backgroundColor: T.redBg, color: T.red, border: `1px solid ${T.redBd}` }}
        >
          {loading ? 'Aguarde...' : 'Confirmar'}
        </button>
      </div>
    </AdminModal>
  )
}

// ─── Input primitives ─────────────────────────────────────────────────────────

/** Combined input className — no need for separate style object */
export const inputCls = [
  'w-full rounded-xl px-3 py-2.5 text-sm text-white font-sans',
  'focus:outline-none focus:ring-1 focus:ring-orange-500/60',
  'transition-[border-color,box-shadow] duration-150',
].join(' ')

export const inputStyle = { backgroundColor: T.bg, border: `1px solid ${T.border}` }
export const inputFocusStyle = { borderColor: T.accent }

export function FieldLabel({ children }) {
  return (
    <label className="block text-xs font-display font-medium uppercase tracking-wider mb-1.5" style={{ color: T.muted }}>
      {children}
    </label>
  )
}

// ─── AdminCard ────────────────────────────────────────────────────────────────

export function AdminCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ backgroundColor: T.card, border: `1px solid ${T.border}` }}
    >
      {children}
    </div>
  )
}

// ─── Table primitives ─────────────────────────────────────────────────────────

export function Th({ children, className = '' }) {
  return (
    <th
      className={`px-5 py-3 text-left text-xs font-display font-semibold uppercase tracking-wider whitespace-nowrap ${className}`}
      style={{ color: T.muted, borderBottom: `1px solid ${T.border}` }}
    >
      {children}
    </th>
  )
}

export function Tr({ children, onClick }) {
  return (
    <tr
      className={`transition-colors duration-100 ${onClick ? 'cursor-pointer' : ''}`}
      style={{ borderBottom: `1px solid ${T.border}` }}
      onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {children}
    </tr>
  )
}

// ─── PageTitle ────────────────────────────────────────────────────────────────

export function PageTitle({ children, subtitle }) {
  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-display font-bold text-white text-balance">{children}</h1>
      {subtitle && <p className="text-sm font-sans mt-1" style={{ color: T.muted }}>{subtitle}</p>}
    </div>
  )
}

// ─── Buttons ──────────────────────────────────────────────────────────────────

/** Orange primary button — pure CSS hover, no inline event handlers */
export function BtnPrimary({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-semibold text-white
        transition-[background-color,transform,opacity] duration-150
        active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ backgroundColor: T.accent }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.backgroundColor = '#EA6C10' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.backgroundColor = T.accent }}
    >
      {children}
    </button>
  )
}

export function BtnSecondary({ children, onClick, disabled, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-xl text-sm font-sans font-medium text-white
        transition-[background-color,transform,opacity] duration-150
        active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ backgroundColor: T.border }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.backgroundColor = '#2a2d38' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.backgroundColor = T.border }}
    >
      {children}
    </button>
  )
}
