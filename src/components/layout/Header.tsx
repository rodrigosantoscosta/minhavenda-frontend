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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { Separator } from '../ui/separator'

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
    <header className="bg-background sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4 py-2.5">
        <div className="flex items-center gap-4">

          {/* Logo — plain text */}
          <Link to="/" className="shrink-0">
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              MinhaVenda
            </span>
          </Link>

          {/* Search — centered, desktop */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="w-full max-w-md">
              <SearchBar
                onSearch={handleSearch}
                placeholder="Buscar produtos..."
                showButton={false}
                className="w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">
            {isAuthenticated && <NotificationBell />}

            {/* Cart */}
            <Link
              to="/carrinho"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150"
              aria-label="Carrinho de compras"
            >
              <FiShoppingCart className="w-4.5 h-4.5 text-foreground" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[10px] font-display font-bold rounded-full min-w-[16px] min-h-[16px] flex items-center justify-center tabular-nums px-0.5">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User menu — desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors duration-150">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-foreground text-background text-xs font-display font-semibold">
                          {getFirstName()[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-sans font-medium text-foreground">
                        {getFirstName()}
                      </span>
                      <FiChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-display font-semibold text-foreground">{user?.nome}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5 font-sans">{user?.email}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to="/perfil" className="cursor-pointer">
                        <FiUser className="w-4 h-4 mr-2 text-muted-foreground" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/pedidos" className="cursor-pointer">
                        <FiPackage className="w-4 h-4 mr-2 text-muted-foreground" />
                        Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/configuracoes" className="cursor-pointer">
                        <FiSettings className="w-4 h-4 mr-2 text-muted-foreground" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 font-sans font-medium text-sm"
                >
                  <FiUser className="w-4 h-4" />
                  Entrar
                </Link>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition-colors duration-150 shrink-0"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              <div className="relative w-5 h-5">
                <FiX
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-[opacity,transform] duration-200
                    ${mobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
                />
                <FiMenu
                  className={`absolute inset-0 w-5 h-5 text-foreground transition-[opacity,transform] duration-200
                    ${mobileMenuOpen ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Search — mobile */}
        <div className="md:hidden mt-2.5">
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
        className={`md:hidden border-t border-border bg-background overflow-hidden transition-[max-height,opacity] duration-300
          ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="container mx-auto px-4 py-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-muted rounded-lg mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-foreground text-background font-display font-semibold">
                    {getFirstName()[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
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
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted rounded-lg transition-colors duration-100 text-foreground font-sans text-sm"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    {label}
                  </Link>
                ))}

                <Separator className="my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-lg w-full text-left transition-colors duration-100 text-destructive font-sans text-sm"
                >
                  <FiLogOut className="w-4 h-4" />
                  Sair
                </button>
              </nav>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150 font-sans font-medium text-sm"
            >
              <FiUser className="w-4 h-4" />
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
