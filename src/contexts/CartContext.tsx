import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, Cart, Product } from '../types'
import useAuthToken from '../hooks/useAuthToken'
import { useToast } from '../components/common/Toast'
import storageUtil from '../utils/storageUtil'
import api from '../services/api'
import logger from '../utils/logger'

interface ExtendedCartItem extends CartItem {
  id: string | number
  nome: string
  preco: number
  precoOriginal: number
  estoque: number | null
  imagem: string
  categoria: string
  itemId?: string | number
}

interface ToastFunctions {
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

interface CartContextType {
  items: ExtendedCartItem[]
  setItems: React.Dispatch<React.SetStateAction<ExtendedCartItem[]>>
  cart: Cart | null
  loading: boolean
  addItem: (produto: Product & { quantidadeEstoque?: number | null }, quantidade?: number) => Promise<void>
  removeItem: (produtoId: string | number) => Promise<void>
  updateQuantity: (produtoId: string | number, novaQuantidade: number) => Promise<void>
  clearCart: () => Promise<void>
  isInCart: (produtoId: string | number) => boolean
  getItemQuantity: (produtoId: string | number) => number
  getTotalItems: () => number
  getSubtotal: () => number
  getTotalDiscount: () => number
  getTotal: (frete?: number) => number
  transferLocalCartToBackend: () => Promise<void>
  refreshCart: () => Promise<void>
  itemCount: number
  total: number
  subtotal: number
  isEmpty: boolean
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [items, setItems] = useState<ExtendedCartItem[]>([])
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const toast = useToast() as ToastFunctions
  const { user, isAuthenticated } = useAuthToken()

  // Flag para evitar múltiplas inicializações
  const isInitialized = useRef<boolean>(false)
  const previousAuthState = useRef<boolean>(isAuthenticated)

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

  const loadCart = useCallback(async (): Promise<void> => {
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

  const loadCartFromLocalStorage = (): void => {
    try {
      const savedCart = storageUtil.getItem('cart')
      if (savedCart && Array.isArray(savedCart)) {
        logger.info({ itemCount: savedCart.length }, 'Cart loaded from localStorage')
        setItems(savedCart as ExtendedCartItem[])
      } else {
        logger.info('No cart in localStorage')
        setItems([])
      }
    } catch (error) {
      logger.error({ error }, 'Error loading cart from localStorage')
      setItems([])
    }
  }

  // Stock is validated server-side (PUT /carrinho/itens/:id returns 400 if exhausted).
  // The /estoque endpoint is ADMIN-only — never pre-fetch stock for customers.
  // Items loaded from the backend get estoque: null (no known client-side limit).

  const loadCartFromBackend = async (): Promise<void> => {
    if (loading) {
      logger.debug('loadCartFromBackend already in progress, skipping')
      return
    }

    try {
      setLoading(true)
      logger.info('Fetching cart from API')

      const response = await api.get('/carrinho')
      const backendCart = response.data as Cart

      logger.info({
        carrinhoId: backendCart.id,
        itemCount: backendCart.itens?.length || 0,
        valorTotal: backendCart.valorTotal
      }, 'Cart loaded from backend')

      const backendItems: ExtendedCartItem[] = (backendCart.itens || []).map(item => ({
        id: item.produtoId,
        nome: (item as unknown as Record<string, unknown>).produtoNome as string,
        preco: item.precoUnitario,
        precoOriginal: item.precoUnitario,
        quantidade: item.quantidade,
        estoque: null, // validated server-side; null = no client-side limit
        imagem: (item as unknown as Record<string, unknown>).produtoImagem as string || '',
        categoria: (item as unknown as Record<string, unknown>).categoriaNome as string || 'Sem categoria',
        itemId: item.id
      })) as ExtendedCartItem[]

      setCart(backendCart)
      setItems(backendItems)

      const localItems = (storageUtil.getItem('cart') as ExtendedCartItem[]) || []
      if (localItems.length > 0 && backendItems.length === 0) {
        logger.info({ localItemCount: localItems.length }, 'Syncing local cart to backend')
        await syncCartWithBackend(localItems)
      } else {
        storageUtil.removeItem('cart')
      }
    } catch (error) {
      logger.error({ error }, 'Error loading cart from backend')

      const err = error as { response?: { status?: number } }
      if (err.response?.status === 404) {
        logger.info('Cart not found (404) - initializing empty cart')
        setCart(null)
        setItems([])

        const localItems2 = (storageUtil.getItem('cart') as ExtendedCartItem[]) || []
        if (localItems2.length > 0) {
          logger.info({ localItemCount: localItems2.length }, 'Syncing local items after 404')
          await syncCartWithBackend(localItems2)
        }
      } else {
        loadCartFromLocalStorage()
      }
    } finally {
      setLoading(false)
    }
  }

  // FIX: toast fired once after loop, not once per item
  const syncCartWithBackend = async (localItems: ExtendedCartItem[]): Promise<void> => {
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

  const addItem = async (produto: Product & { quantidadeEstoque?: number | null }, quantidade: number = 1): Promise<void> => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        logger.info({ produtoId: produto.id, nome: produto.nome, quantidade }, 'Adding item via API')

        const response = await api.post('/carrinho/itens', {
          produtoId: produto.id,
          quantidade: quantidade
        })

        const backendCart = response.data as Cart

        logger.info({
          carrinhoId: backendCart.id,
          itemCount: backendCart.itens?.length,
          valorTotal: backendCart.valorTotal
        }, 'Item added - cart updated')

        const backendItems: ExtendedCartItem[] = (backendCart.itens || []).map(item => ({
          id: item.produtoId,
          produtoId: item.produtoId,
          precoUnitario: item.precoUnitario,
          nome: (item as unknown as Record<string, unknown>).produtoNome as string,
          preco: item.precoUnitario,
          precoOriginal: item.precoUnitario,
          quantidade: item.quantidade,
          estoque: null, // validated server-side; null = no client-side limit
          imagem: (item as unknown as Record<string, unknown>).produtoImagem as string || '',
          categoria: (item as unknown as Record<string, unknown>).categoriaNome as string || 'Sem categoria',
          itemId: item.id
        })) as ExtendedCartItem[]

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

          const precoValue = typeof produto.preco === 'object' ? (produto.preco as Record<string, number>)?.valor : produto.preco
          const precoOriginalValue = typeof produto.preco === 'object' ? (produto.preco as Record<string, number>)?.valor : produto.preco

          const newItem: ExtendedCartItem = {
            id: produto.id,
            produtoId: produto.id,
            precoUnitario: precoValue,
            nome: produto.nome,
            preco: produto.precoPromocional ?? precoValue,
            precoOriginal: precoOriginalValue,
            quantidade: quantidade,
            estoque: estoqueDisponivel,
            imagem: produto.urlImagem || '',
            categoria: produto.categoria?.nome || (produto as unknown as Record<string, string>).categoriaNome || 'Sem categoria',
          }

          const updatedItems = [...items, newItem]
          setItems(updatedItems)
          storageUtil.setItem('cart', updatedItems)
          logger.info({ produtoId: produto.id, nome: produto.nome }, 'New item added to localStorage')
          toast.success(`${produto.nome} adicionado ao carrinho!`)
        }
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      logger.error({ error, produtoId: produto?.id, nome: produto?.nome }, 'Error adding item to cart')
      const message = err.response?.data?.message || 'Erro ao adicionar ao carrinho'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (produtoId: string | number): Promise<void> => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        const item = items.find(item => item.id === produtoId)

        if (!item?.itemId) {
          // itemId may be stale — reload and retry once
          logger.warn({ produtoId }, 'itemId missing, reloading cart before remove')
          await loadCartFromBackend()
          const freshItem = items.find(i => i.id === produtoId)
          if (!freshItem?.itemId) {
            logger.error({ produtoId }, 'Item still not found after reload')
            toast.error('Item não encontrado no carrinho')
            return
          }
          // Re-invoke with fresh state (recursive, but itemId will be set now)
          await removeItem(produtoId)
          return
        }

        logger.info({ itemId: item.itemId, produtoId, nome: item.nome }, 'Removing item via API')

        const response = await api.delete(`/carrinho/itens/${item.itemId}`)
        const backendCart = response.data as Cart

        const backendItems: ExtendedCartItem[] = (backendCart.itens || []).map(item => ({
          id: item.produtoId,
          produtoId: item.produtoId,
          precoUnitario: item.precoUnitario,
          nome: (item as unknown as Record<string, unknown>).produtoNome as string,
          preco: item.precoUnitario,
          precoOriginal: item.precoUnitario,
          quantidade: item.quantidade,
          estoque: null,
          imagem: (item as unknown as Record<string, unknown>).produtoImagem as string || '',
          categoria: (item as unknown as Record<string, unknown>).categoriaNome as string || 'Sem categoria',
          itemId: item.id
        })) as ExtendedCartItem[]

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
      const err = error as { response?: { data?: { message?: string } }; message?: string }
      logger.error({ error, produtoId }, 'Error removing item')
      const message = err.response?.data?.message || 'Erro ao remover do carrinho'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Debounce timers: one per item — keyed by produtoId
  const updateDebounceRefs = useRef<Record<string | number, ReturnType<typeof setTimeout>>>({})

  const updateQuantity = async (produtoId: string | number, novaQuantidade: number): Promise<void> => {
    if (novaQuantidade <= 0) {
      await removeItem(produtoId)
      return
    }

    // 1. Optimistic update — reflect change immediately in the UI
    setItems(prev => prev.map(item =>
      item.id === produtoId ? { ...item, quantidade: novaQuantidade } : item
    ))

    if (!isAuthenticated) {
      // localStorage path — already done above, just persist
      setItems(prev => {
        storageUtil.setItem('cart', prev)
        return prev
      })
      return
    }

    // 2. Debounce the API call — cancel pending timer for this item if any
    if (updateDebounceRefs.current[produtoId]) {
      clearTimeout(updateDebounceRefs.current[produtoId])
    }

    updateDebounceRefs.current[produtoId] = setTimeout(async () => {
      delete updateDebounceRefs.current[produtoId]

      // Read latest state at flush time via functional updater
      setItems(prev => {
        const item = prev.find(i => i.id === produtoId)
        if (!item?.itemId) return prev

        const flushQuantidade = item.quantidade

        // Fire the API call outside the setter
        ;(async () => {
          try {
            logger.info({ itemId: item.itemId, produtoId, flushQuantidade }, 'Flushing quantity update to API')
            const response = await api.put(`/carrinho/itens/${item.itemId}`, { quantidade: flushQuantidade })
            const backendCart = response.data as Cart

            const backendItems: ExtendedCartItem[] = (backendCart.itens || []).map(i => ({
              id: i.produtoId,
              produtoId: i.produtoId,
              precoUnitario: i.precoUnitario,
              nome: (i as unknown as Record<string, unknown>).produtoNome as string,
              preco: i.precoUnitario,
              precoOriginal: i.precoUnitario,
              quantidade: i.quantidade,
              estoque: null,
              imagem: (i as unknown as Record<string, unknown>).produtoImagem as string || '',
              categoria: (i as unknown as Record<string, unknown>).categoriaNome as string || 'Sem categoria',
              itemId: i.id
            })) as ExtendedCartItem[]

            setCart(backendCart)
            setItems(backendItems)
            logger.info({ produtoId, flushQuantidade, valorTotal: backendCart.valorTotal }, 'Quantity flushed successfully')
          } catch (error) {
            const err = error as { response?: { data?: { message?: string } }; message?: string }
            logger.error({ error, produtoId, flushQuantidade }, 'Error flushing quantity update')
            const message = err.response?.data?.message || 'Erro ao atualizar quantidade'
            toast.error(message)
            // Roll back to server state on error
            await loadCartFromBackend()
          }
        })()

        return prev
      })
    }, 600)
  }

  const clearCart = async (): Promise<void> => {
    try {
      setLoading(true)

      if (isAuthenticated) {
        logger.info('Clearing cart via API')
        const response = await api.delete('/carrinho')
        const backendCart = response.data as Cart
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

  const isInCart = (produtoId: string | number): boolean => items.some(item => item.id === produtoId)
  const getItemQuantity = (produtoId: string | number): number => { const item = items.find(item => item.id === produtoId); return item ? item.quantidade : 0 }
  const getTotalItems = (): number => items.reduce((total: number, item: ExtendedCartItem) => total + item.quantidade, 0)
  const getSubtotal = (): number => items.reduce((total: number, item: ExtendedCartItem) => total + (item.preco * item.quantidade), 0)
  const getTotalDiscount = (): number => items.reduce((total: number, item: ExtendedCartItem) => { const desconto = (item.precoOriginal - item.preco) * item.quantidade; return total + desconto }, 0)
  const getTotal = (frete: number = 0): number => getSubtotal() + frete

  const transferLocalCartToBackend = async (): Promise<void> => {
    try {
      const localItems = storageUtil.getItem('cart') as ExtendedCartItem[]
      if (localItems && localItems.length > 0) {
        logger.info({ itemCount: localItems.length }, 'Transferring local cart to backend after login')
        await syncCartWithBackend(localItems)
      }
    } catch (error) {
      logger.error({ error }, 'Error transferring local cart')
    }
  }

  const refreshCart = async (): Promise<void> => {
    if (isAuthenticated) {
      logger.info('Manual cart refresh requested')
      await loadCartFromBackend()
    }
  }

  const value: CartContextType = {
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

export function useCart(): CartContextType {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart deve ser usado dentro de CartProvider')
  return context
}

export default CartContext
