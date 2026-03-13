import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  FiGrid, FiList, FiPackage, FiArchive, FiTag, FiAlertOctagon, FiLogOut
} from 'react-icons/fi'

const NAV_ITEMS = [
  { to: '/admin/dashboard',  icon: FiGrid,         label: 'Dashboard' },
  { to: '/admin/pedidos',    icon: FiList,          label: 'Pedidos' },
  { to: '/admin/produtos',   icon: FiPackage,       label: 'Produtos' },
  { to: '/admin/estoque',    icon: FiArchive,       label: 'Estoque' },
  { to: '/admin/categorias', icon: FiTag,           label: 'Categorias' },
  { to: '/admin/dlq',        icon: FiAlertOctagon,  label: 'DLQ' },
]

export default function AdminLayout({ children }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#0A0B0E', color: '#fff' }}>
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col flex-shrink-0 w-56 border-r"
        style={{ backgroundColor: '#0D0E12', borderColor: '#1E2028' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b" style={{ borderColor: '#1E2028' }}>
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm text-black"
            style={{ backgroundColor: '#F97316', fontFamily: 'inherit' }}
          >
            M
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">MinhaVenda</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'font-medium'
                    : 'hover:text-white'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? '#F97316' : '#6B7280',
                backgroundColor: isActive ? 'rgba(249,115,22,0.12)' : 'transparent',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: '#1E2028' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors hover:text-white"
            style={{ color: '#6B7280' }}
          >
            <FiLogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
