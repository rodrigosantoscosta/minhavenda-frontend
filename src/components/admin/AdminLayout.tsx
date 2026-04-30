import { useState } from 'react'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiGrid, FiList, FiPackage, FiArchive, FiTag,
  FiAlertOctagon, FiLogOut, FiMenu, FiX, FiChevronRight, FiBarChart2,
} from 'react-icons/fi'

const NAV_ITEMS = [
  { to: '/admin/dashboard',         icon: FiGrid,        label: 'Dashboard' },
  { to: '/admin/pedidos',           icon: FiList,         label: 'Pedidos' },
  { to: '/admin/produtos',          icon: FiPackage,      label: 'Produtos' },
  { to: '/admin/estoque',           icon: FiArchive,      label: 'Estoque' },
  { to: '/admin/categorias',        icon: FiTag,          label: 'Categorias' },
  { to: '/admin/relatorios-financeiros', icon: FiBarChart2, label: 'Relatórios' },
  { to: '/admin/dlq',               icon: FiAlertOctagon, label: 'DLQ' },
]

// Design tokens
const T = {
  bg:      '#0A0B0E',
  surface: '#0D0E12',
  card:    '#111318',
  border:  '#1E2028',
  muted:   '#6B7280',
  sub:     '#9CA3AF',
  accent:  '#F97316',
  accentBg:'rgba(249,115,22,0.12)',
}

function SidebarContent({ onNavClick, onLogout }: { onNavClick: () => void; onLogout: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${T.border}` }}
      >
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm"
          style={{ backgroundColor: T.accent, color: '#000', fontFamily: 'Sora, sans-serif' }}
        >
          MV
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none font-display">MinhaVenda</p>
          <p className="text-xs mt-0.5 font-sans" style={{ color: T.muted }}>Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors duration-150"
            style={({ isActive }) => ({
              color:           isActive ? T.accent : T.muted,
              backgroundColor: isActive ? T.accentBg : 'transparent',
              fontWeight:      isActive ? 600 : 400,
            })}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {/* Skill: contextual chevron on active item */}
            <FiChevronRight
              size={12}
              className="transition-[opacity,transform] duration-150"
              style={{ opacity: 0, transform: 'translateX(-4px)' }}
              onMouseEnter={e => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
            />
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div
        className="px-3 pb-4 pt-3 flex-shrink-0"
        style={{ borderTop: `1px solid ${T.border}` }}
      >
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-sans transition-colors duration-150 hover:text-white"
          style={{ color: T.muted }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <FiLogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close drawer on route change
  const handleNavClick = () => setMobileOpen(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Current page label for mobile header
  const currentPage = NAV_ITEMS.find(n => location.pathname.startsWith(n.to))?.label ?? 'Admin'

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: T.bg, color: '#fff' }}
    >
      {/* ── Desktop sidebar — always visible lg+ ── */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 w-56"
        style={{ backgroundColor: T.surface, borderRight: `1px solid ${T.border}` }}
      >
        <SidebarContent onNavClick={handleNavClick} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile drawer — slides in from left ── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col lg:hidden
          transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ backgroundColor: T.surface, borderRight: `1px solid ${T.border}` }}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{ color: T.muted }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = T.muted}
          aria-label="Fechar menu"
        >
          <FiX size={18} />
        </button>
        <SidebarContent onNavClick={handleNavClick} onLogout={handleLogout} />
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header
          className="flex lg:hidden items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ backgroundColor: T.surface, borderBottom: `1px solid ${T.border}` }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
            style={{ color: T.muted }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Abrir menu"
          >
            <FiMenu size={20} />
          </button>

          {/* Logo compact */}
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs"
            style={{ backgroundColor: T.accent, color: '#000', fontFamily: 'Sora, sans-serif' }}
          >
            MV
          </div>

          {/* Current page breadcrumb */}
          <p className="text-sm font-display font-semibold text-white flex-1 truncate">
            {currentPage}
          </p>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
