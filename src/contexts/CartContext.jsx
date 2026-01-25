import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from '../components/common/Toast'
import storageUtil from '../utils/storageUtil'
import api from '../services/api'
import logger from '../utils/logger'

// 1. Criar o Context
const CartContext = createContext(null)

// 2. Provider Component
export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { user, isAuthenticated } = useAuth()

  // 3. Carregar carrinho ao iniciar e quando auth mudar
  useEffect(() => {
    logger.info({ isAuthenticated, userId: user?.id }, 'Auth state changed - loading cart')
    loadCart()
  }, [isAuthenticated, user])

  // Carregar carrinho (localStorage ou backend)
  const loadCart = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        logger.info({ userId: user.id }, 'Loading cart from backend')
        await loadCartFromBackend()
      } else {
        logger.info('Loading cart from localStorage')
        loadCartFromLocalStorage()
      }
    } catch (error) {
      logger.error({ error, userId: user?.id }, 'Error loading cart')
      loadCartFromLocalStorage()
    }
  }, [isAuthenticated, user])

  // Carregar do localStorage
  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = storageUtil.getItem('cart')
      if (savedCart && Array.isArray(savedCart)) {
        logger.info({ itemCount: savedCart.length }, 'Cart loaded from localStorage')
        setItems(savedCart)
      } else {
        logger.info('No cart in localStorage')
        setItems([])
      }
    } catch (error) {
      logger.error({ error }, 'Error loading cart from localStorage')
      setItems([])
    }
  }

  // Buscar estoque atual de múltiplos produtos
  const fetchProductsStock = async (produtoIds) => {
    try {
      const stockPromises = produtoIds.map(async (id) => {
        try {
          const response = await api.get(`/produtos/${id}`)
          return { id, estoque: response.data.quantidadeEstoque || 0 }
        } catch (error) {
          logger.warn({ error, produtoId: id }, 'Failed to fetch product stock')
          return { id, estoque: 0 }
        }
      })
      
      const stocks = await Promise.all(stockPromises)
      
      const stockMap = {}
      stocks.forEach(({ id, estoque }) => {
        stockMap[id] = estoque
      })
      
      logger.debug({ stockMap }, 'Product stocks fetched')
      return stockMap
    } catch (error) {
      logger.error({ error }, 'Error fetching product stocks')
      return {}
    }
  }

  // Carregar do backend (quando logado)
  const loadCartFromBackend = async () => {
    try {
      setLoading(true)
      logger.info({ userId: user?.id }, 'Fetching cart from API')
      
      const response = await api.get('/carrinho')
      const backendCart = response.data
      
      logger.info({ 
        carrinhoId: backendCart.id, 
        itemCount: backendCart.itens?.length || 0,
        valorTotal: backendCart.valorTotal 
      }, 'Cart loaded from backend')
      
      // Extrair IDs dos produtos para buscar estoques
      const produtoIds = (backendCart.itens || []).map(item => item.produtoId)
      
      // Buscar estoques atuais
      const stockMap = await fetchProductsStock(produtoIds)
      
      // Transformar itens do backend para formato local
      const backendItems = (backendCart.itens || []).map(item => ({
        id: item.produtoId,
        nome: item.produtoNome,
        preco: item.precoUnitario,
        precoOriginal: item.precoUnitario,
        quantidade: item.quantidade,
        estoque: stockMap[item.produtoId] || 0,
        imagem: item.produtoImagem || '',
        categoria: item.categoriaNome || 'Sem categoria',
        itemId: item.id // ID do item no carrinho
      }))
      
      setCart(backendCart)
      setItems(backendItems)
      
      // Sincronizar items locais se existirem
      const localItems = storageUtil.getItem('cart') || []
      if (localItems.length > 0 && backendItems.length === 0) {
        logger.info({ localItemCount: localItems.length }, 'Syncing local cart to backend')
        await syncCartWithBackend(localItems)
      } else {
        storageUtil.removeItem('cart')
      }
      
    } catch (error) {
      logger.error({ error, userId: user?.id }, 'Error loading cart from backend')
      
      if (error.response?.status === 404) {
        logger.info('Cart not found (404) - initializing empty cart')
        setCart(null)
        setItems([])
        
        const localItems = storageUtil.getItem('cart') || []
        if (localItems.length > 0) {
          logger.info({ localItemCount: localItems.length }, 'Syncing local items after 404')
          await syncCartWithBackend(localItems)
        }
      } else {
        loadCartFromLocalStorage()
      }
    } finally {
      setLoading(false)
    }
  }

  // Sincronizar carrinho local com backend
  const syncCartWithBackend = async (localItems) => {
    try {
      logger.info({ itemCount: localItems.length }, 'Starting cart sync to backend')
      
      for (const item of localItems) {
        try {
          await api.post('/carrinho/itens', {
            produtoId: item.id,
            quantidade: item.quantidade
          })
          logger.debug({ produtoId: item.id, nome: item.nome }, 'Item synced to backend')
        } catch (error) {
          logger.error({ error, itemId: item.id, nome: item.nome }, 'Failed to sync item')
        }
      }
      
      await loadCartFromBackend()
      storageUtil.removeItem('cart')
      
      logger.info('Cart sync completed successfully')
      toast.success('Carrinho sincronizado com sucesso!')
    } catch (error) {
      logger.error({ error }, 'Error syncing cart to backend')
    }
  }

  // 5. Adicionar item ao carrinho
  const addItem = async (produto, quantidade = 1) => {
    try {
      setLoading(true)
      
      if (isAuthenticated && user) {
        logger.info({ 
          produtoId: produto.id, 
          nome: produto.nome, 
          quantidade,
          userId: user.id 
        }, 'Adding item via API')
        
        const response = await api.post('/carrinho/itens', {
          produtoId: produto.id,
          quantidade: quantidade
        })
        
        const backendCart = response.data
        
        logger.info({ 
          carrinhoId: backendCart.id,
          itemCount: backendCart.itens?.length,
          valorTotal: backendCart.valorTotal 
        }, 'Item added - cart updated')
        
        // Buscar estoques atualizados
        const produtoIds = (backendCart.itens || []).map(item => item.produtoId)
        const stockMap = await fetchProductsStock(produtoIds)
        
        const backendItems = (backendCart.itens || []).map(item => ({
          id: item.produtoId,
          nome: item.produtoNome,
          preco: item.precoUnitario,
          precoOriginal: item.precoUnitario,
          quantidade: item.quantidade,
          estoque: stockMap[item.produtoId] || 0,
          imagem: item.produtoImagem || '',
          categoria: item.categoriaNome || 'Sem categoria',
          itemId: item.id
        }))
        
        setCart(backendCart)
        setItems(backendItems)
        toast.success(`${produto.nome} adicionado ao carrinho!`)
        
      } else {
        // Não autenticado - adicionar localmente
        logger.info({ produtoId: produto.id, nome: produto.nome, quantidade }, 'Adding item to localStorage')
        
        const existingItemIndex = items.findIndex(item => item.id === produto.id)

        if (existingItemIndex >= 0) {
          const updatedItems = [...items]
          const novaQuantidade = updatedItems[existingItemIndex].quantidade + quantidade

          if (produto.quantidadeEstoque && novaQuantidade > produto.quantidadeEstoque) {
            logger.warn({ 
              produtoId: produto.id, 
              solicitado: novaQuantidade, 
              estoque: produto.quantidadeEstoque 
            }, 'Insufficient stock')
            toast.warning('Quantidade solicitada maior que o estoque disponível')
            return
          }

          updatedItems[existingItemIndex].quantidade = novaQuantidade
          setItems(updatedItems)
          storageUtil.setItem('cart', updatedItems)
          
          logger.info({ produtoId: produto.id, novaQuantidade }, 'Item quantity updated in localStorage')
          toast.success('Quantidade atualizada no carrinho')
        } else {
          if (produto.quantidadeEstoque && quantidade > produto.quantidadeEstoque) {
            logger.warn({ 
              produtoId: produto.id, 
              solicitado: quantidade, 
              estoque: produto.quantidadeEstoque 
            }, 'Insufficient stock for new item')
            toast.warning('Quantidade solicitada maior que o estoque disponível')
            return
          }

          const newItem = {
            id: produto.id,
            nome: produto.nome,
            preco: produto.precoPromocional || produto.preco.valor,
            precoOriginal: produto.preco.valor,
            quantidade: quantidade,
            estoque: produto.quantidadeEstoque,
            imagem: produto.imagem,
            categoria: produto.categoria?.nome || 'Sem categoria',
          }

          const updatedItems = [...items, newItem]
          setItems(updatedItems)
          storageUtil.setItem('cart', updatedItems)
          
          logger.info({ produtoId: produto.id, nome: produto.nome }, 'New item added to localStorage')
          toast.success(`${produto.nome} adicionado ao carrinho!`)
        }
      }
    } catch (error) {
      logger.error({ error, produtoId: produto?.id, nome: produto?.nome }, 'Error adding item to cart')
      const message = error.response?.data?.message || 'Erro ao adicionar ao carrinho'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // 6. Remover item do carrinho
  const removeItem = async (produtoId) => {
    try {
      setLoading(true)
      
      if (isAuthenticated && user) {
        const item = items.find(item => item.id === produtoId)
        if (!item || !item.itemId) {
          logger.warn({ produtoId }, 'Item not found in cart')
          toast.error('Item não encontrado no carrinho')
          return
        }
        
        logger.info({ itemId: item.itemId, produtoId, nome: item.nome }, 'Removing item via API')
        
        const response = await api.delete(`/carrinho/itens/${item.itemId}`)
        const backendCart = response.data
        
        // Buscar estoques atualizados
        const produtoIds = (backendCart.itens || []).map(item => item.produtoId)
        const stockMap = await fetchProductsStock(produtoIds)
        
        const backendItems = (backendCart.itens || []).map(item => ({
          id: item.produtoId,
          nome: item.produtoNome,
          preco: item.precoUnitario,
          precoOriginal: item.precoUnitario,
          quantidade: item.quantidade,
          estoque: stockMap[item.produtoId] || 0,
          imagem: item.produtoImagem || '',
          categoria: item.categoriaNome || 'Sem categoria',
          itemId: item.id
        }))
        
        setCart(backendCart)
        setItems(backendItems)
        
        logger.info({ produtoId, itemCount: backendItems.length }, 'Item removed successfully')
        toast.info('Item removido do carrinho')
        
      } else {
        logger.info({ produtoId }, 'Removing item from localStorage')
        
        const updatedItems = items.filter(item => item.id !== produtoId)
        setItems(updatedItems)
        
        if (updatedItems.length > 0) {
          storageUtil.setItem('cart', updatedItems)
        } else {
          storageUtil.removeItem('cart')
        }
        
        logger.info({ produtoId, remainingItems: updatedItems.length }, 'Item removed from localStorage')
        toast.info('Item removido do carrinho')
      }
    } catch (error) {
      logger.error({ error, produtoId }, 'Error removing item')
      const message = error.response?.data?.message || 'Erro ao remover do carrinho'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // 7. Atualizar quantidade de um item
  const updateQuantity = async (produtoId, novaQuantidade) => {
    try {
      if (novaQuantidade <= 0) {
        await removeItem(produtoId)
        return
      }
      
      setLoading(true)
      
      if (isAuthenticated && user) {
        const item = items.find(item => item.id === produtoId)
        if (!item || !item.itemId) {
          logger.warn({ produtoId }, 'Item not found for quantity update')
          toast.error('Item não encontrado no carrinho')
          return
        }
        
        logger.info({ 
          itemId: item.itemId, 
          produtoId, 
          oldQuantity: item.quantidade,
          newQuantity: novaQuantidade 
        }, 'Updating quantity via API')
        
        const response = await api.put(`/carrinho/itens/${item.itemId}`, {
          quantidade: novaQuantidade
        })
        
        const backendCart = response.data
        
        // Buscar estoques atualizados
        const produtoIds = (backendCart.itens || []).map(item => item.produtoId)
        const stockMap = await fetchProductsStock(produtoIds)
        
        const backendItems = (backendCart.itens || []).map(item => ({
          id: item.produtoId,
          nome: item.produtoNome,
          preco: item.precoUnitario,
          precoOriginal: item.precoUnitario,
          quantidade: item.quantidade,
          estoque: stockMap[item.produtoId] || 0,
          imagem: item.produtoImagem || '',
          categoria: item.categoriaNome || 'Sem categoria',
          itemId: item.id
        }))
        
        setCart(backendCart)
        setItems(backendItems)
        
        logger.info({ produtoId, novaQuantidade, valorTotal: backendCart.valorTotal }, 'Quantity updated successfully')
        
      } else {
        logger.info({ produtoId, novaQuantidade }, 'Updating quantity in localStorage')
        
        const updatedItems = items.map(item => {
          if (item.id === produtoId) {
            if (novaQuantidade > item.estoque) {
              logger.warn({ 
                produtoId, 
                solicitado: novaQuantidade, 
                estoque: item.estoque 
              }, 'Quantity exceeds stock')
              toast.warning('Quantidade maior que o estoque disponível')
              return item
            }
            return { ...item, quantidade: novaQuantidade }
          }
          return item
        })

        setItems(updatedItems)
        storageUtil.setItem('cart', updatedItems)
        
        logger.info({ produtoId, novaQuantidade }, 'Quantity updated in localStorage')
      }
    } catch (error) {
      logger.error({ error, produtoId, novaQuantidade }, 'Error updating quantity')
      const message = error.response?.data?.message || 'Erro ao atualizar quantidade'
      toast.error(message)
      
      if (isAuthenticated && user) {
        await loadCartFromBackend()
      }
    } finally {
      setLoading(false)
    }
  }

  // 8. Limpar carrinho completamente
  const clearCart = async () => {
    try {
      setLoading(true)
      
      if (isAuthenticated && user) {
        logger.info({ userId: user.id }, 'Clearing cart via API')
        
        const response = await api.delete('/carrinho')
        const backendCart = response.data
        
        setCart(backendCart)
        setItems([])
        
        logger.info({ userId: user.id }, 'Cart cleared successfully')
        toast.info('Carrinho esvaziado')
        
      } else {
        logger.info('Clearing cart from localStorage')
        
        setItems([])
        storageUtil.removeItem('cart')
        
        logger.info('Cart cleared from localStorage')
        toast.info('Carrinho esvaziado')
      }
    } catch (error) {
      logger.error({ error }, 'Error clearing cart')
      setItems([])
      storageUtil.removeItem('cart')
      toast.info('Carrinho esvaziado')
    } finally {
      setLoading(false)
    }
  }

  // 9. Verificar se produto está no carrinho
  const isInCart = (produtoId) => {
    return items.some(item => item.id === produtoId)
  }

  // 10. Obter quantidade de um produto no carrinho
  const getItemQuantity = (produtoId) => {
    const item = items.find(item => item.id === produtoId)
    return item ? item.quantidade : 0
  }

  // 11. Calcular total de itens (quantidade)
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantidade, 0)
  }

  // 12. Calcular subtotal (sem descontos/frete)
  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  }

  // 13. Calcular desconto total
  const getTotalDiscount = () => {
    return items.reduce((total, item) => {
      const desconto = (item.precoOriginal - item.preco) * item.quantidade
      return total + desconto
    }, 0)
  }

  // 14. Calcular total final
  const getTotal = (frete = 0) => {
    return getSubtotal() + frete
  }

  // 15. Transferir carrinho após login
  const transferLocalCartToBackend = async () => {
    try {
      const localItems = storageUtil.getItem('cart')
      
      if (localItems && localItems.length > 0) {
        logger.info({ itemCount: localItems.length }, 'Transferring local cart to backend after login')
        await syncCartWithBackend(localItems)
      }
    } catch (error) {
      logger.error({ error }, 'Error transferring local cart')
    }
  }

  // 16. Atualizar carrinho do backend
  const refreshCart = async () => {
    if (isAuthenticated && user) {
      logger.info('Manual cart refresh requested')
      await loadCartFromBackend()
    }
  }

  // 17. Valor que será compartilhado
  const value = {
    items,
    setItems,  // Export setItems for direct manipulation
    cart,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    isInCart,
    getItemQuantity,
    getTotalItems,
    getSubtotal,
    getTotalDiscount,
    getTotal,
    transferLocalCartToBackend,
    refreshCart,
    // Aliases para compatibilidade
    itemCount: getTotalItems(),
    total: getTotal(),
    subtotal: getSubtotal(),
    isEmpty: items.length === 0,
  }

  // 18. Retornar Provider
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// 19. Hook customizado
export function useCart() {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error('useCart deve ser usado dentro de CartProvider')
  }
  
  return context
}

export default CartContext