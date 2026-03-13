import api from './api'
import logger from '../utils/logger'

const cartService = {
  /**
   * Obter carrinho do usuário autenticado
   */
  async getCarrinho() {
    try {
      const response = await api.get('/carrinho')
      return response.data
    } catch (error) {
      logger.error({ err: error }, 'Erro ao buscar carrinho')
      throw error
    }
  },

  /**
   * Adicionar item ao carrinho
   */
  async adicionarItem(produtoId, quantidade) {
    try {
      const response = await api.post('/carrinho/itens', {
        produtoId,
        quantidade
      })
      return response.data
    } catch (error) {
      logger.error({ err: error, produtoId, quantidade }, 'Erro ao adicionar item')
      throw error
    }
  },

  /**
   * Atualizar quantidade de item
   */
  async atualizarItem(itemId, quantidade) {
    try {
      const response = await api.put(`/carrinho/itens/${itemId}`, {
        quantidade
      })
      return response.data
    } catch (error) {
      logger.error({ err: error, itemId, quantidade }, 'Erro ao atualizar item')
      throw error
    }
  },

  /**
   * Remover item do carrinho
   */
  async removerItem(itemId) {
    try {
      const response = await api.delete(`/carrinho/itens/${itemId}`)
      return response.data
    } catch (error) {
      logger.error({ err: error, itemId }, 'Erro ao remover item')
      throw error
    }
  },

  /**
   * Limpar carrinho
   */
  async limparCarrinho() {
    try {
      const response = await api.delete('/carrinho')
      return response.data
    } catch (error) {
      logger.error({ err: error }, 'Erro ao limpar carrinho')
      throw error
    }
  },

  /**
   * Sincronizar carrinho local com backend
   * Usado após login para transferir itens do localStorage
   */
  async sincronizarCarrinho(_items) {
    // /carrinho/sincronizar não existe no NestJS — o carrinho é persistido por usuário no backend.
    // Stub para não quebrar chamadores existentes após login.
    logger.warn('sincronizarCarrinho: endpoint não implementado no backend NestJS — ignorado')
    return { sincronizado: false }
  },

  /**
   * Obter resumo do carrinho (totais)
   */
  async getResumo() {
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
  }
}

export default cartService