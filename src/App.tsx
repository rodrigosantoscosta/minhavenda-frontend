import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/common/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'

import ScrollToTop from './components/common/ScrollToTop'
import MockModeBanner from './components/common/MockModeBanner'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Cart from './pages/Cart'
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/common/ProtectedRoute'

// ========== PÁGINAS PÚBLICAS ==========
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

import ProductDetail from './pages/ProductDetail'
import SearchPage from './pages/SearchPage'
import NotFound from './pages/NotFound'
import OAuthCallback from './pages/OAuthCallback'

// ========== PÁGINAS PROTEGIDAS ==========
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'

// ========== PÁGINAS ADMIN ==========
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPedidos from './pages/admin/AdminPedidos'
import AdminPedidoDetail from './pages/admin/AdminPedidoDetail'
import AdminProdutos from './pages/admin/AdminProdutos'
import AdminEditProduto from './pages/admin/AdminEditProduto'
import AdminEstoque from './pages/admin/AdminEstoque'
import AdminCategorias from './pages/admin/AdminCategorias'
import AdminDLQ from './pages/admin/AdminDLQ'
import AdminRelatoriosFinanceiros from './pages/admin/AdminRelatoriosFinanceiros'

/**
 * Inner component — needs to be inside BrowserRouter to call useLocation.
 * Hides the storefront Header/Footer for all /admin/* routes so AdminLayout
 * can render its own sidebar without conflict.
 */
function AppInner() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <MockModeBanner />
            {!isAdmin && <Header />}

            <main className="flex-1">
              <ScrollToTop />
              <Routes>
                {/* ── Públicas ── */}
                <Route path="/" element={<Home />} />
                {/* <Route path="/produtos" element={<Products />} /> */}
                <Route path="/produto/:id" element={<ProductDetail />} />
                <Route path="/busca" element={<SearchPage />} />

                {/* ── Autenticação ── */}
                {/* ── OAuth callback — must be public, no guard ── */}
                <Route path="/auth/callback" element={<OAuthCallback />} />

                <Route path="/login"    element={<PublicRoute redirectTo="/"><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute redirectTo="/"><Register /></PublicRoute>} />

                {/* ── Protegidas (cliente) ── */}
                <Route path="/carrinho"    element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout"   element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/perfil"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/pedidos"    element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="/pedido/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />

                {/* ── Admin (requer role ADMIN) ── */}
                <Route path="/admin/dashboard"   element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/pedidos"     element={<AdminRoute><AdminPedidos /></AdminRoute>} />
                <Route path="/admin/pedidos/:id" element={<AdminRoute><AdminPedidoDetail /></AdminRoute>} />
                <Route path="/admin/produtos"    element={<AdminRoute><AdminProdutos /></AdminRoute>} />
                <Route path="/admin/produtos/:id" element={<AdminRoute><AdminEditProduto /></AdminRoute>} />
                <Route path="/admin/estoque"     element={<AdminRoute><AdminEstoque /></AdminRoute>} />
                <Route path="/admin/categorias"  element={<AdminRoute><AdminCategorias /></AdminRoute>} />
                <Route path="/admin/relatorios-financeiros" element={<AdminRoute><AdminRelatoriosFinanceiros /></AdminRoute>} />
                <Route path="/admin/dlq"         element={<AdminRoute><AdminDLQ /></AdminRoute>} />

                {/* ── 404 ── */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {!isAdmin && <Footer />}
          </div>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
