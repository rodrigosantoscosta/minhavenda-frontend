import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import useAuthToken from '../hooks/useAuthToken'
import { useToast } from '../components/common/Toast'
import storageUtil from '../utils/storageUtil'
import api from '../services/api'
import logger from '../utils/logger'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { user, isAuthenticated } = useAuthToken()

  // Flag para evitar múltiplas inicializações
  const isInitialized = useRef(false)
  const previousAuthState = useRef(isAuthenticated)

  // Carregar carrinho apenas quando auth muda de false para true
  useEffect(() => {
    const authChanged = previousAuthState.current !== isAuthenticated
    previousAuthState.current = isAuthenticated

    if (!isInitialized.current || authChanged) {
      logger.info({ isAuthenticated, userId: user?.id, authChanged }, 'Auth state changed - loading cart')
      isInitialized.current = true
      loadCart()
    }
  }, [isAuthenticated])

  const loadCart = useCallback(async () => {
    try {
      if (isAuthenticated) {
        logger.info('Loading cart from backend')
        await loadCartFromBackend()
      } else {
        logger.info('Loading cart from localStorage')
        loadCartFromLocalStorage()
      }
    } catch (error) {
      logger.error({ error }, 'Error loading cart')
      loadCartFromLocalStorage()
    }
  }, [isAuthenticated])

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
      stocks.forEach(({ id, estoque }) => { stockMap[id] = estoque })
      logger.debug({ stockMap }, 'Product stocks fetched')
      return stockMap
    } catch (error) {
      logger.error({ error }, 'Error fetching product stocks')
      return {}
    }
  }

  const loadCartFromBackend = async () => {
    if (loading) {
      logger.debug('loadCartFromBackend already in progress, skipping')
      return
    }

    try {
      setLoading(true)
      logger.info('Fetching cart from API')

      const response = await api.get('/carrinho')
      const backendCart = response.data

      logger.info({
        carrinhoId: backendCart.id,
        itemCount: backendCart.itens?.length || 0,
        valorTotal: backendCart.valorTotal
      }, 'Cart loaded from backend')

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

      const localItems = storageUtil.getItem('cart') || []
      if (localItems.length > 0 && backendItems.length === 0) {
        logger.info({ localItemCount: localItems.length }, 'Syncing local cart to backend')
        await syncCartWithBackend(localItems)
      } else {
        storageUtil.removeItem('cart')
      }
    } catch (error) {
      logger.error({ error }, 'Error loading cart from backend')

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

  // FIX: toast fired once after loop, not once per item
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

      storageUtil.removeItem('cart')
      await loadCartFromBackend()
      // Single toast after all items are synced
      toast.success('Carrinho sincronizado com sucesso!')
      logger.info('Cart sync completed successfully')
    } catch (error) {
      logger.error({ error }, 'Error syncing cart to backend')
    }
  }

  const addItem = async (produto, quantidade = 1) => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        logger.info({ produtoId: produto.id, nome: produto.nome, quantidade }, 'Adding item via API')

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
        logger.info({ produtoId: produto.id, nome: produto.nome, quantidade }, 'Adding item to localStorage')

        // FIX: normalise stock value — accept quantidadeEstoque, estoque, or null (= no limit)
        const estoqueDisponivel = produto.quantidadeEstoque ?? produto.estoque ?? null

        const existingItemIndex = items.findIndex(item => item.id === produto.id)

        if (existingItemIndex >= 0) {
          const updatedItems = [...items]
          const novaQuantidade = updatedItems[existingItemIndex].quantidade + quantidade

          if (estoqueDisponivel !== null && novaQuantidade > estoqueDisponivel) {
            logger.warn({ produtoId: produto.id, solicitado: novaQuantidade, estoque: estoqueDisponivel }, 'Insufficient stock')
            toast.warning('Quantidade solicitada maior que o estoque disponível')
            return
          }

          updatedItems[existingItemIndex].quantidade = novaQuantidade
          setItems(updatedItems)
          storageUtil.setItem('cart', updatedItems)
          logger.info({ produtoId: produto.id, novaQuantidade }, 'Item quantity updated in localStorage')
          toast.success('Quantidade atualizada no carrinho')
        } else {
          if (estoqueDisponivel !== null && quantidade > estoqueDisponivel) {
            logger.warn({ produtoId: produto.id, solicitado: quantidade, estoque: estoqueDisponivel }, 'Insufficient stock for new item')
            toast.warning('Quantidade solicitada maior que o estoque disponível')
            return
          }

          // FIX: guard against estoqueDisponivel === 0 explicitly
          if (estoqueDisponivel === 0) {
            logger.warn({ produtoId: produto.id }, 'Product out of stock')
            toast.warning('Produto sem estoque disponível')
            return
          }

          const newItem = {
            id: produto.id,
            nome: produto.nome,
            preco: produto.precoPromocional ?? (typeof produto.preco === 'object' ? produto.preco?.valor : produto.preco),
            precoOriginal: typeof produto.preco === 'object' ? produto.preco?.valor : produto.preco,
            quantidade: quantidade,
            estoque: estoqueDisponivel,
            imagem: produto.urlImagem,
            categoria: produto.categoria?.nome || produto.categoriaNome || 'Sem categoria',
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

  const removeItem = async (produtoId) => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        const item = items.find(item => item.id === produtoId)

        if (!item || !item.itemId) {
          logger.warn({ produtoId }, 'Item not found in cart')
          toast.error('Item não encontrado no carrinho')
          return
        }

        logger.info({ itemId: item.itemId, produtoId, nome: item.nome }, 'Removing item via API')

        const response = await api.delete(`/carrinho/itens/${item.itemId}`)
        const backendCart = response.data

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

  const updateQuantity = async (produtoId, novaQuantidade) => {
    try {
      if (novaQuantidade <= 0) {
        await removeItem(produtoId)
        return
      }

      setLoading(true)

      if (isAuthenticated) {
        const item = items.find(item => item.id === produtoId)

        if (!item || !item.itemId) {
          logger.warn({ produtoId }, 'Item not found for quantity update')
          toast.error('Item não encontrado no carrinho')
          return
        }

        logger.info({ itemId: item.itemId, produtoId, oldQuantity: item.quantidade, newQuantity: novaQuantidade }, 'Updating quantity via API')

        const response = await api.put(`/carrinho/itens/${item.itemId}`, { quantidade: novaQuantidade })
        const backendCart = response.data

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
            if (item.estoque !== null && novaQuantidade > item.estoque) {
              logger.warn({ produtoId, solicitado: novaQuantidade, estoque: item.estoque }, 'Quantity exceeds stock')
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

      if (isAuthenticated) {
        await loadCartFromBackend()
      }
    } finally {
      setLoading(false)
    }
  }

  const clearCart = async () => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        logger.info('Clearing cart via API')
        const response = await api.delete('/carrinho')
        const backendCart = response.data
        setCart(backendCart)
        setItems([])
        logger.info('Cart cleared successfully')
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

  const isInCart = (produtoId) => items.some(item => item.id === produtoId)
  const getItemQuantity = (produtoId) => { const item = items.find(item => item.id === produtoId); return item ? item.quantidade : 0 }
  const getTotalItems = () => items.reduce((total, item) => total + item.quantidade, 0)
  const getSubtotal = () => items.reduce((total, item) => total + (item.preco * item.quantidade), 0)
  const getTotalDiscount = () => items.reduce((total, item) => { const desconto = (item.precoOriginal - item.preco) * item.quantidade; return total + desconto }, 0)
  const getTotal = (frete = 0) => getSubtotal() + frete

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

  const refreshCart = async () => {
    if (isAuthenticated) {
      logger.info('Manual cart refresh requested')
      await loadCartFromBackend()
    }
  }

  const value = {
    items,
    setItems,
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
    itemCount: getTotalItems(),
    total: getTotal(),
    subtotal: getSubtotal(),
    isEmpty: items.length === 0,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider')
  return context
}

export default CartContext
