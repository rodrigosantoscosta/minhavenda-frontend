import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import SearchBar from '../search/SearchBar'
import { 
  FiShoppingCart, 
  FiUser, 
  FiMenu, 
  FiX, 
  FiSearch,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiChevronDown
} from 'react-icons/fi'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  
  // Contexts
  const { user, isAuthenticated, logout } = useAuth()
  const { getTotalItems } = useCart()

  // Pegar primeiro nome do usuário
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
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <p className="hidden md:block">
              📦 Frete grátis para compras acima de R$ 200
            </p>
            <div className="flex items-center space-x-4">
              <Link to="/ajuda" className="hover:underline">
                Central de Ajuda
              </Link>
              <Link to="/rastreio" className="hover:underline">
                Rastrear Pedido
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white font-bold text-2xl px-3 py-1 rounded-lg">
              MV
            </div>
            <span className="text-2xl font-bold text-gray-800 hidden sm:block">
              MinhaVenda
            </span>
          </Link>

{/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar produtos..."
              showButton={false}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/carrinho"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiShoppingCart className="w-6 h-6 text-gray-700" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {getFirstName()[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {getFirstName()}
                    </span>
                    <FiChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.nome}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/perfil"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <FiUser className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Meu Perfil</span>
                    </Link>
                    
                    <Link
                      to="/pedidos"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <FiPackage className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Meus Pedidos</span>
                    </Link>

                    <Link
                      to="/configuracoes"
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <FiSettings className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Configurações</span>
                    </Link>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 hover:bg-red-50 w-full text-left transition-colors"
                    >
                      <FiLogOut className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-red-600 font-medium">Sair</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiUser className="w-5 h-5" />
                  <span className="font-medium">Entrar</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6 text-gray-700" />
              ) : (
                <FiMenu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

{/* Search Bar - Mobile */}
        <div className="md:hidden mt-4">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar produtos..."
            showButton={true}
            className="w-full"
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4">
            {isAuthenticated ? (
              <>
                {/* User Info Mobile */}
                <div className="px-4 py-3 bg-gray-50 rounded-lg mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                      {getFirstName()[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user?.nome}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items Mobile */}
                <nav className="space-y-1">
                  <Link
                    to="/perfil"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Meu Perfil</span>
                  </Link>
                  
                  <Link
                    to="/pedidos"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiPackage className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Meus Pedidos</span>
                  </Link>

                  <Link
                    to="/configuracoes"
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiSettings className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Configurações</span>
                  </Link>

                  <div className="border-t border-gray-200 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 rounded-lg w-full text-left transition-colors"
                  >
                    <FiLogOut className="w-5 h-5 text-red-600" />
                    <span className="text-red-600 font-medium">Sair</span>
                  </button>
                </nav>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center space-x-3 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FiUser className="w-5 h-5" />
                <span className="font-medium">Entrar</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}