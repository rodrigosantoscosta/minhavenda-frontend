import api from './api'

const cartService = {
  /**
   * Obter carrinho do usuário autenticado
   */
  async getCarrinho() {
    try {
      const response = await api.get('/carrinho')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar carrinho:', error)
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
      console.error('Erro ao adicionar item:', error)
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
      console.error('Erro ao atualizar item:', error)
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
      console.error('Erro ao remover item:', error)
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
      console.error('Erro ao limpar carrinho:', error)
      throw error
    }
  },

  /**
   * Sincronizar carrinho local com backend
   * Usado após login para transferir itens do localStorage
   */
  async sincronizarCarrinho(items) {
    try {
      const response = await api.post('/carrinho/sincronizar', {
        items
      })
      return response.data
    } catch (error) {
      console.error('Erro ao sincronizar carrinho:', error)
      throw error
    }
  },

  /**
   * Obter resumo do carrinho (totais)
   */
  async getResumo() {
    try {
      const response = await api.get('/carrinho/resumo')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar resumo:', error)
      throw error
    }
  }
}

export default cartService