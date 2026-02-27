// src/services/productService.js
import api from './api'
import logger from '../utils/logger'

const productService = {
  // Listar produtos com filtros e paginação
  async getProdutos(params = {}) {
    try {
      const response = await api.get('/produtos/buscar', { params })
      return response.data
    } catch (error) {
      logger.error({ error, params }, 'Erro ao buscar produtos')
      throw error
    }
  },

  // Buscar produto por ID
  async getProdutoById(id) {
    try {
      const response = await api.get(`/produtos/${id}`)
      return response.data
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      throw error
    }
  },

  // Listar categorias
  async getCategorias() {
    try {
      const response = await api.get('/categorias')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      throw error
    }
  },
}

export default productService