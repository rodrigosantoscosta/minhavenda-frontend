import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from './components/common/Toast'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Cart from './pages/Cart'
import { ProtectedRoute, PublicRoute, AdminRoute } from './components/common/ProtectedRoute'

// ========== PÁGINAS PÚBLICAS ==========
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import SearchPage from './pages/SearchPage'
import NotFound from './pages/NotFound'

// ========== PÁGINAS DE TESTE ==========
import TestApi from './pages/TestApi'
// import TestComponents from './pages/TestComponents'

// ========== PÁGINAS PROTEGIDAS ==========             
import Checkout from './pages/Checkout'       
import Profile from './pages/Profile'         
import Orders from './pages/Orders'           
import OrderDetail from './pages/OrderDetail'           
// import Unauthorized from './pages/Unauthorized'

// ========== PÁGINAS ADMIN  ==========
// import AdminPanel from './pages/AdminPanel'   

function App() {
  return (
    // 1. ToastProvider (notificações) - mais externo
    <ToastProvider>
      <BrowserRouter>
        {/* 2. AuthProvider (autenticação) */}
        <AuthProvider>
          {/* 3. CartProvider (carrinho) */}
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              {/* Header em todas as páginas */}
              <Header />
              
              {/* Conteúdo principal */}
              <main className="flex-1">
                <Routes>
                  {/* ========================================
                      ROTAS PÚBLICAS (Não precisa login)
                  ======================================== */}
                  
                  {/* Home - Catálogo Principal */}
                  <Route path="/" element={<Home />} />
                  
                  {/* Produtos - Listagem com Filtros */}
                  <Route path="/produtos" element={<Products />} />
                  
                  {/* Detalhes do Produto */}
                  <Route path="/produto/:id" element={<ProductDetail />} />
                  
                  {/* Busca de Produtos */}
                  <Route path="/busca" element={<SearchPage />} />
                  
                  {/* ========================================
                      ROTAS DE AUTENTICAÇÃO
                      (Redireciona para / se já logado)
                  ======================================== */}
                  
                  <Route 
                    path="/login" 
                    element={
                      <PublicRoute redirectTo="/">
                        <Login />
                      </PublicRoute>
                    } 
                  />
                  
                  <Route 
                    path="/cadastro" 
                    element={
                      <PublicRoute redirectTo="/">
                        <Register />
                      </PublicRoute>
                    } 
                  />

                  {/* ========================================
                      ROTAS PROTEGIDAS (Requer Login)
                      Descomente quando criar as páginas
                  ======================================== */}
                  
{/* Carrinho */}
                  <Route 
                    path="/carrinho" 
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    } 
                  />
                   
                  {/* Checkout */}
                  <Route 
                    path="/checkout" 
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Perfil - DIA 5 */}
                  <Route 
                    path="/perfil" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  
 {/* Pedidos */}
                  <Route 
                    path="/pedidos" 
                    element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Detalhes do Pedido */}
                  <Route 
                    path="/pedido/:id" 
                    element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } 
                  />

                  {/* ========================================
                      ROTAS ADMIN (Requer Role ADMIN)
                      Descomente quando criar as páginas
                  ======================================== */}
                  
                  {/* Painel Admin - DIA 6+ */}
                  {/* <Route 
                    path="/admin/*" 
                    element={
                      <AdminRoute>
                        <AdminPanel />
                      </AdminRoute>
                    } 
                  /> */}

                  {/* ========================================
                      ROTAS DE TESTE (Desenvolvimento)
                      Remover em produção
                  ======================================== */}
                  
                  <Route path="/test" element={<TestApi />} />
                  {/* <Route path="/test-components" element={<TestComponents />} /> */}

                  {/* ========================================
                      ROTAS DE ERRO
                  ======================================== */}
                  
                  {/* Sem Autorização - DIA 5 */}
                  {/* <Route path="/unauthorized" element={<Unauthorized />} /> */}
                  
                  {/* 404 - Página Não Encontrada */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {/* Footer em todas as páginas */}
              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App