import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useNotificationContext } from '../../contexts/NotificationContext'
import { startPolling, stopPolling } from '../../services/notificationService'
import SearchBar from '../search/SearchBar'
import NotificationBell from '../common/NotificationBell'
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiChevronDown
} from 'react-icons/fi'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const { user, isAuthenticated, logout } = useAuth()
  const { getTotalItems } = useCart()
  const { addNotification } = useNotificationContext()

  useEffect(() => {
    if (isAuthenticated) startPolling(addNotification)
    else stopPolling()
    return () => stopPolling()
  }, [isAuthenticated, addNotification])

  const getFirstName = () => {
    if (!user?.nome) return 'Usuário'
    return user.nome.split(' ')[0]
  }

  const handleSearch = (term) => {
    navigate(`/busca?q=${encodeURIComponent(term)}`)
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-white sticky top-0 z-50 shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">

      {/* Announcement bar — slim, refined */}
      <div className="bg-primary-600 text-white py-1.5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs font-sans font-medium tracking-wide">
            <p className="hidden md:block opacity-90">
              🚚 Frete grátis para compras acima de R$ 200
            </p>
            <div className="flex items-center gap-5 ml-auto">
              <Link to="/ajuda" className="opacity-80 hover:opacity-100 transition-opacity duration-150">
                Central de Ajuda
              </Link>
              <Link to="/rastreio" className="opacity-80 hover:opacity-100 transition-opacity duration-150">
                Rastrear Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* Logo — Sora wordmark */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {/* Concentric radius: outer p-1.5 (6px) + inner rounded-lg (8px) ≈ rounded-xl (12px) outer */}
            <div className="bg-primary-600 rounded-xl p-1.5">
              <div className="bg-primary-500 rounded-lg w-7 h-7 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm leading-none">MV</span>
              </div>
            </div>
            <span className="font-display font-bold text-gray-900 text-xl hidden sm:block tracking-tight">
              MinhaVenda
            </span>
          </Link>

          {/* Search — desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar produtos..."
              showButton={false}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {isAuthenticated && <NotificationBell />}

            {/* Cart — skill: min 40×40 hit area */}
            <Link
              to="/carrinho"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors duration-150"
              aria-label="Carrinho de compras"
            >
              <FiShoppingCart className="w-5 h-5 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-display font-bold rounded-full w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center tabular-nums">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu — desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors duration-150 active:scale-[0.96] transition-transform">
                    {/* Avatar — concentric: rounded-full inside rounded-xl */}
                    <div className="w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center font-display font-semibold text-xs">
                      {getFirstName()[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-sans font-medium text-gray-800">
                      {getFirstName()}
                    </span>
                    <FiChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown — shadow-dropdown from token */}
                  <div className="absolute right-0 mt-1.5 w-56 bg-white rounded-2xl shadow-dropdown py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,transform] duration-200 origin-top-right scale-95 group-hover:scale-100">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-display font-semibold text-gray-900 text-balance">{user?.nome}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-sans">{user?.email}</p>
                    </div>

                    {[
                      { to: '/perfil',         Icon: FiUser,     label: 'Meu Perfil' },
                      { to: '/pedidos',        Icon: FiPackage,  label: 'Meus Pedidos' },
                      { to: '/configuracoes',  Icon: FiSettings, label: 'Configurações' },
                    ].map(({ to, Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors duration-100 text-sm font-sans text-gray-700"
                      >
                        <Icon className="w-4 h-4 text-gray-500" />
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-gray-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left transition-colors duration-100 text-sm font-sans text-red-600"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-150 active:scale-[0.96] font-sans font-medium text-sm"
                >
                  <FiUser className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>

            {/* Mobile menu toggle — min 40×40 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors duration-150"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {/* Skill: CSS cross-fade icon swap without motion library */}
              <div className="relative w-5 h-5">
                <FiX
                  className={`absolute inset-0 w-5 h-5 text-gray-700 transition-[opacity,transform,filter] duration-300 ease-spring
                    ${mobileMenuOpen ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.25] blur-[4px]'}`}
                />
                <FiMenu
                  className={`absolute inset-0 w-5 h-5 text-gray-700 transition-[opacity,transform,filter] duration-300 ease-spring
                    ${mobileMenuOpen ? 'opacity-0 scale-[0.25] blur-[4px]' : 'opacity-100 scale-100 blur-0'}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="md:hidden mt-3">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar produtos..."
            showButton={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Mobile menu — CSS max-height transition for smooth open/close */}
      <div
        className={`md:hidden border-t border-gray-100 bg-white overflow-hidden transition-[max-height,opacity] duration-300 ease-spring
          ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-4 py-4">
          {isAuthenticated ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
                <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-display font-semibold">
                  {getFirstName()[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-gray-900">{user?.nome}</p>
                  <p className="text-xs text-gray-500 font-sans">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-0.5">
                {[
                  { to: '/perfil',        Icon: FiUser,     label: 'Meu Perfil' },
                  { to: '/pedidos',       Icon: FiPackage,  label: 'Meus Pedidos' },
                  { to: '/configuracoes', Icon: FiSettings, label: 'Configurações' },
                ].map(({ to, Icon, label }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors duration-100 text-gray-700 font-sans"
                  >
                    <Icon className="w-5 h-5 text-gray-500" />
                    {label}
                  </Link>
                ))}

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-xl w-full text-left transition-colors duration-100 text-red-600 font-sans"
                >
                  <FiLogOut className="w-5 h-5" />
                  Sair
                </button>
              </nav>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-150 font-sans font-medium"
            >
              <FiUser className="w-5 h-5" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
