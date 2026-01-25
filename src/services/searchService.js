import { get } from './api'
import logger from '../utils/logger'

/**
 * Serviço para gerenciar buscas e filtros de produtos
 */
class SearchService {
  /**
   * Buscar produtos com filtros avançados
   * @param {Object} params - Parâmetros de busca
   * @param {string} params.termo - Termo de busca no nome/descrição
   * @param {number} params.categoriaId - ID da categoria
   * @param {number} params.precoMin - Preço mínimo
   * @param {number} params.precoMax - Preço máximo
   * @param {boolean} params.ativo - Se produto está ativo (default: true)
   * @param {string} params.sort - Ordenação (default: "nome:asc")
   * @param {number} params.page - Página (default: 0)
   * @param {number} params.size - Tamanho da página (default: 20)
   * @returns {Promise<Object>} - Page<ProdutoDTO>
   */
  async buscarProdutos(params = {}) {
    try {
      const {
        termo,
        categoriaId,
        precoMin,
        precoMax,
        ativo = true,
        sort = 'nome:asc',
        page = 0,
        size = 20
      } = params

      // Construir query params
      const queryParams = new URLSearchParams()
      
      if (termo) queryParams.append('termo', termo)
      if (categoriaId) queryParams.append('categoriaId', categoriaId)
      if (precoMin !== undefined) queryParams.append('precoMin', precoMin)
      if (precoMax !== undefined) queryParams.append('precoMax', precoMax)
      if (ativo !== undefined) queryParams.append('ativo', ativo)
      if (sort) queryParams.append('sort', sort)
      if (page !== undefined) queryParams.append('page', page)
      if (size !== undefined) queryParams.append('size', size)

      const url = `/produtos/buscar?${queryParams.toString()}`
      
      logger.info({ params, url }, 'Buscando produtos com filtros')
      
      const response = await get(url)
      
      logger.info({ 
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        currentPage: response.number
      }, 'Produtos encontrados com sucesso')
      
      return response
    } catch (error) {
      logger.error({ error, params }, 'Erro ao buscar produtos')
      throw error
    }
  }

  /**
   * Busca simples por termo
   * @param {string} q - Termo de busca (required)
   * @param {Object} options - Opções de paginação e ordenação
   * @returns {Promise<Object>} - Page<ProdutoDTO>
   */
  async buscarPorTermo(q, options = {}) {
    try {
      if (!q || q.trim().length === 0) {
        throw new Error('Termo de busca é obrigatório')
      }

      const {
        page = 0,
        size = 20,
        sort = 'nome:asc'
      } = options

      const queryParams = new URLSearchParams({
        q: q.trim(),
        page: page.toString(),
        size: size.toString(),
        sort
      })

      const url = `/produtos/busca?${queryParams.toString()}`
      
      logger.info({ q, options, url }, 'Buscando produtos por termo')
      
      const response = await get(url)
      
      logger.info({ 
        termo: q,
        totalElements: response.totalElements,
        totalPages: response.totalPages
      }, 'Busca por termo concluída')
      
      return response
    } catch (error) {
      logger.error({ error, q, options }, 'Erro na busca por termo')
      throw error
    }
  }

  /**
   * Listar produtos com paginação (sem filtros)
   * @param {Object} options - Opções de paginação e ordenação
   * @returns {Promise<Object>} - Page<ProdutoDTO>
   */
  async listarProdutos(options = {}) {
    try {
      const {
        page = 0,
        size = 20,
        sort = 'nome:asc'
      } = options

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort
      })

      const url = `/produtos/paginado?${queryParams.toString()}`
      
      logger.info({ options, url }, 'Listando produtos paginados')
      
      const response = await get(url)
      
      logger.info({ 
        totalElements: response.totalElements,
        totalPages: response.totalPages
      }, 'Produtos listados com sucesso')
      
      return response
    } catch (error) {
      logger.error({ error, options }, 'Erro ao listar produtos')
      throw error
    }
  }

  /**
   * Obter opções de ordenação disponíveis
   * @returns {Array<Object>} - Array de opções de ordenação
   */
  getOpcoesOrdenacao() {
    return [
      { value: 'nome:asc', label: 'Nome (A-Z)', field: 'nome', direction: 'asc' },
      { value: 'nome:desc', label: 'Nome (Z-A)', field: 'nome', direction: 'desc' },
      { value: 'preco:asc', label: 'Menor Preço', field: 'preco', direction: 'asc' },
      { value: 'preco:desc', label: 'Maior Preço', field: 'preco', direction: 'desc' },
      { value: 'dataCadastro:desc', label: 'Mais Recentes', field: 'dataCadastro', direction: 'desc' },
      { value: 'dataCadastro:asc', label: 'Mais Antigos', field: 'dataCadastro', direction: 'asc' }
    ]
  }

  /**
   * Construir URL com parâmetros de busca
   * @param {Object} params - Parâmetros de busca
   * @returns {string} - URL com query params
   */
  construirURLBusca(params = {}) {
    const queryParams = new URLSearchParams()
    
    // Mapear parâmetros para query string
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString())
      }
    })
    
    const queryString = queryParams.toString()
    return queryString ? `/busca?${queryString}` : '/busca'
  }

  /**
   * Parsear query params da URL para objeto
   * @param {URLSearchParams} searchParams - Query params da URL
   * @returns {Object} - Objeto com parâmetros parseados
   */
  parsearParamsBusca(searchParams) {
    const params = {}
    
    // Parsear cada parâmetro conhecido
    if (searchParams.has('q')) params.termo = searchParams.get('q')
    if (searchParams.has('termo')) params.termo = searchParams.get('termo')
    if (searchParams.has('categoriaId')) {
      const categoriaId = searchParams.get('categoriaId')
      params.categoriaId = categoriaId ? parseInt(categoriaId) : undefined
    }
    if (searchParams.has('precoMin')) {
      const precoMin = searchParams.get('precoMin')
      params.precoMin = precoMin ? parseFloat(precoMin) : undefined
    }
    if (searchParams.has('precoMax')) {
      const precoMax = searchParams.get('precoMax')
      params.precoMax = precoMax ? parseFloat(precoMax) : undefined
    }
    if (searchParams.has('ativo')) {
      const ativo = searchParams.get('ativo')
      params.ativo = ativo !== 'false'
    }
    if (searchParams.has('sort')) params.sort = searchParams.get('sort')
    if (searchParams.has('page')) {
      const page = searchParams.get('page')
      params.page = page ? parseInt(page) : 0
    }
    if (searchParams.has('size')) {
      const size = searchParams.get('size')
      params.size = size ? parseInt(size) : 20
    }
    
    return params
  }

  /**
   * Validar parâmetros de busca
   * @param {Object} params - Parâmetros para validar
   * @returns {Object} - Objeto com erros de validação
   */
  validarParamsBusca(params = {}) {
    const errors = {}
    
    // Validar preço mínimo
    if (params.precoMin !== undefined) {
      if (isNaN(params.precoMin) || params.precoMin < 0) {
        errors.precoMin = 'Preço mínimo deve ser um número positivo'
      }
    }
    
    // Validar preço máximo
    if (params.precoMax !== undefined) {
      if (isNaN(params.precoMax) || params.precoMax < 0) {
        errors.precoMax = 'Preço máximo deve ser um número positivo'
      }
    }
    
    // Validar intervalo de preços
    if (params.precoMin !== undefined && params.precoMax !== undefined) {
      if (params.precoMin > params.precoMax) {
        errors.precoMin = 'Preço mínimo não pode ser maior que o preço máximo'
        errors.precoMax = 'Preço máximo não pode ser menor que o preço mínimo'
      }
    }
    
    // Validar categoria
    if (params.categoriaId !== undefined) {
      if (isNaN(params.categoriaId) || params.categoriaId <= 0) {
        errors.categoriaId = 'ID da categoria deve ser um número positivo'
      }
    }
    
    // Validar página
    if (params.page !== undefined) {
      if (isNaN(params.page) || params.page < 0) {
        errors.page = 'Página deve ser um número não negativo'
      }
    }
    
    // Validar tamanho da página
    if (params.size !== undefined) {
      if (isNaN(params.size) || params.size < 1 || params.size > 100) {
        errors.size = 'Tamanho da página deve estar entre 1 e 100'
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// Exportar instância única do serviço
export const searchService = new SearchService()
export default searchService