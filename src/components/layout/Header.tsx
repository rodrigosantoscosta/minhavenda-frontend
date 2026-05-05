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
    if (isAuthenticated) startPolling(addNotification as any)
    else stopPolling()
    return () => stopPolling()
  }, [isAuthenticated, addNotification])

  const getFirstName = () => {
    if (!user?.nome) return 'Usuário'
    return user.nome.split(' ')[0]
  }

  const handleSearch = (term: string) => {
    navigate(`/busca?q=${encodeURIComponent(term)}`)
    setMobileMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setMobileMenuOpen(false)
  }

  return (
    <header className="bg-background sticky top-0 z-50 shadow-[0_1px_0_0_hsl(var(--border))]">

      {/* Announcement bar — zinc near-black */}
      <div className="bg-foreground text-background py-1.5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs font-sans font-medium tracking-wide">
            <p className="hidden md:block opacity-70">
              🚚 Frete grátis para compras acima de R$ 200
            </p>
            <div className="flex items-center gap-5 ml-auto">
              <Link to="/ajuda" className="opacity-60 hover:opacity-100 transition-opacity duration-150">
                Central de Ajuda
              </Link>
              <Link to="/rastreio" className="opacity-60 hover:opacity-100 transition-opacity duration-150">
                Rastrear Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">

          {/* Logo — Geist wordmark, Zinc & Slate */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            {/* Concentric radius: outer p-1.5 (6px) + inner rounded-md (6px) → outer rounded-lg (10px) */}
            <div className="bg-foreground rounded-lg p-1.5">
              <div className="bg-zinc-700 rounded-md w-7 h-7 flex items-center justify-center">
                <span className="font-display font-bold text-background text-sm leading-none tracking-tight">MV</span>
              </div>
            </div>
            <span className="font-display font-bold text-foreground text-xl hidden sm:block tracking-tight">
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
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors duration-150"
              aria-label="Carrinho de compras"
            >
              <FiShoppingCart className="w-5 h-5 text-foreground" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[10px] font-display font-bold rounded-full min-w-[18px] min-h-[18px] flex items-center justify-center tabular-nums px-1">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu — desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors duration-150 active:scale-[0.96] transition-[transform,background-color]">
                    {/* Avatar — concentric: rounded-full inside rounded-lg */}
                    <div className="w-7 h-7 bg-foreground text-background rounded-full flex items-center justify-center font-display font-semibold text-xs">
                      {getFirstName()[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-sans font-medium text-foreground">
                      {getFirstName()}
                    </span>
                    <FiChevronDown className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
                  </button>

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-1.5 w-56 bg-card rounded-xl shadow-dropdown py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-[opacity,transform] duration-200 origin-top-right scale-95 group-hover:scale-100 border border-border">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-display font-semibold text-foreground text-balance">{user?.nome}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">{user?.email}</p>
                    </div>

                    {[
                      { to: '/perfil',         Icon: FiUser,     label: 'Meu Perfil' },
                      { to: '/pedidos',        Icon: FiPackage,  label: 'Meus Pedidos' },
                      { to: '/configuracoes',  Icon: FiSettings, label: 'Configurações' },
                    ].map(({ to, Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors duration-100 text-sm font-sans text-foreground"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {label}
                      </Link>
                    ))}

                    <div className="border-t border-border my-1" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 w-full text-left transition-colors duration-100 text-sm font-sans text-destructive"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 active:scale-[0.96] font-sans font-medium text-sm"
                >
                  <FiUser className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>

            {/* Mobile menu toggle — min 40×40 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors duration-150 shrink-0"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {/* Skill: CSS cross-fade icon swap without motion library */}
              <div className="relative w-5 h-5">
                <FiX
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-[opacity,transform,filter] duration-300 ease-spring
                    ${mobileMenuOpen ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.25] blur-[4px]'}`}
                />
                <FiMenu
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-[opacity,transform,filter] duration-300 ease-spring
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

      {/* Mobile menu */}
      <div
        className={`md:hidden border-t border-border bg-background overflow-hidden transition-[max-height,opacity] duration-300 ease-spring
          ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-4 py-4">
          {isAuthenticated ? (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg mb-3">
                <div className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center font-display font-semibold">
                  {getFirstName()[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">{user?.nome}</p>
                  <p className="text-xs text-muted-foreground font-sans">{user?.email}</p>
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
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted rounded-lg transition-colors duration-100 text-foreground font-sans"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    {label}
                  </Link>
                ))}

                <div className="border-t border-border my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 rounded-lg w-full text-left transition-colors duration-100 text-destructive font-sans"
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
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 font-sans font-medium"
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
