import api from './api'
import logger from '../utils/logger'
import type { Cart, CartItem, AddCartItemRequest, UpdateCartItemRequest } from '../types'

interface CartResumo {
  quantidadeItens: number
  valorTotal: number
  valorDesconto: number
}

interface CartService {
  getCarrinho(): Promise<Cart>
  adicionarItem(produtoId: string | number, quantidade: number): Promise<Cart>
  atualizarItem(itemId: string | number, quantidade: number): Promise<Cart>
  removerItem(itemId: string | number): Promise<Cart>
  limparCarrinho(): Promise<void>
  sincronizarCarrinho(items: CartItem[]): Promise<{ sincronizado: boolean }>
  getResumo(): Promise<CartResumo>
}

const cartService: CartService = {
  /**
   * Obter carrinho do usuário autenticado
   */
  async getCarrinho(): Promise<Cart> {
    try {
      const response = await api.get<Cart>('/carrinho')
      return response.data
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar carrinho')
      throw error
    }
  },

  /**
   * Adicionar item ao carrinho
   */
  async adicionarItem(produtoId: string | number, quantidade: number): Promise<Cart> {
    try {
      const response = await api.post<Cart>('/carrinho/itens', {
        produtoId,
        quantidade,
      } satisfies AddCartItemRequest)
      return response.data
    } catch (error) {
      logger.error({ err: error, produtoId, quantidade }, 'Erro ao adicionar item')
      throw error
    }
  },

  /**
   * Atualizar quantidade de item
   */
  async atualizarItem(itemId: string | number, quantidade: number): Promise<Cart> {
    try {
      const response = await api.put<Cart>(`/carrinho/itens/${itemId}`, {
        quantidade,
      } satisfies UpdateCartItemRequest)
      return response.data
    } catch (error) {
      logger.error({ err: error, itemId, quantidade }, 'Erro ao atualizar item')
      throw error
    }
  },

  /**
   * Remover item do carrinho
   */
  async removerItem(itemId: string | number): Promise<Cart> {
    try {
      const response = await api.delete<Cart>(`/carrinho/itens/${itemId}`)
      return response.data
    } catch (error) {
      logger.error({ err: error, itemId }, 'Erro ao remover item')
      throw error
    }
  },

  /**
   * Limpar carrinho
   */
  async limparCarrinho(): Promise<void> {
    try {
      await api.delete('/carrinho')
    } catch (error) {
      logger.error({ err: error }, 'Erro ao limpar carrinho')
      throw error
    }
  },

  /**
   * Sincronizar carrinho local com backend
   * Usado após login para transferir itens do localStorage
   */
  async sincronizarCarrinho(_items: CartItem[]): Promise<{ sincronizado: boolean }> {
    // /carrinho/sincronizar não existe no NestJS — o carrinho é persistido por usuário no backend.
    // Stub para não quebrar chamadores existentes após login.
    logger.warn('sincronizarCarrinho: endpoint não implementado no backend NestJS — ignorado')
    return { sincronizado: false }
  },

  /**
   * Obter resumo do carrinho (totais)
   */
  async getResumo(): Promise<CartResumo> {
    // /carrinho/resumo não existe no NestJS — os totais vêm do próprio GET /carrinho.
    try {
      const carrinho = await this.getCarrinho()
      return {
        quantidadeItens: carrinho.quantidadeItens ?? carrinho.itens?.length ?? 0,
        valorTotal:      carrinho.valorTotal ?? 0,
        valorDesconto:   carrinho.valorDesconto ?? 0,
      }
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar resumo do carrinho')
      throw error
    }
  },
}

export default cartService
