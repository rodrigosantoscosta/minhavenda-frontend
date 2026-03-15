import api from './api'
import logger from '../utils/logger'

/**
 * Serviço de busca — usa o mesmo endpoint GET /produtos que o productService,
 * garantindo compatibilidade com o backend NestJS.
 */
class SearchService {
  /**
   * Buscar produtos com filtros, ordenação e paginação.
   * @param {Object} params
   * @param {string}  params.termo       - Termo de busca
   * @param {number}  params.categoriaId - ID da categoria
   * @param {number}  params.precoMin    - Preço mínimo
   * @param {number}  params.precoMax    - Preço máximo
   * @param {string}  params.sort        - "campo:direção" ex: "nome:asc"
   * @param {number}  params.page        - Página (0-based)
   * @param {number}  params.size        - Tamanho da página
   * @returns {Promise<Object>} Page<ProdutoDTO>
   */
  async buscarProdutos(params = {}) {
    const {
      termo,
      categoriaId,
      precoMin,
      precoMax,
      sort = 'nome:asc',
      page = 0,
      size = 24,
    } = params

    const queryParams = { ativo: true, page, size }

    if (termo)        queryParams.termo       = termo
    if (categoriaId)  queryParams.categoriaId = categoriaId
    if (precoMin !== undefined && precoMin !== '') queryParams.precoMin = precoMin
    if (precoMax !== undefined && precoMax !== '') queryParams.precoMax = precoMax
    if (sort)         queryParams.sort        = sort

    logger.info({ queryParams }, 'SearchService.buscarProdutos')

    const response = await api.get('/produtos', { params: queryParams })
    return response.data
  }

  getOpcoesOrdenacao() {
    return [
      { value: 'nome:asc',          label: 'Nome (A-Z)' },
      { value: 'nome:desc',         label: 'Nome (Z-A)' },
      { value: 'preco:asc',         label: 'Menor Preço' },
      { value: 'preco:desc',        label: 'Maior Preço' },
      { value: 'dataCadastro:desc', label: 'Mais Recentes' },
      { value: 'dataCadastro:asc',  label: 'Mais Antigos' },
    ]
  }

  /**
   * Lê os query params da URL e devolve um objeto normalizado.
   * O header envia ?q=term, então mapeamos q → termo aqui.
   */
  parsearParamsBusca(searchParams) {
    const params = {}

    // "q" vem do header SearchBar; "termo" vem de links internos
    const termo = searchParams.get('q') || searchParams.get('termo')
    if (termo) params.termo = termo

    const categoriaId = searchParams.get('categoriaId')
    if (categoriaId) params.categoriaId = parseInt(categoriaId)

    const precoMin = searchParams.get('precoMin')
    if (precoMin) params.precoMin = parseFloat(precoMin)

    const precoMax = searchParams.get('precoMax')
    if (precoMax) params.precoMax = parseFloat(precoMax)

    const sort = searchParams.get('sort')
    if (sort) params.sort = sort

    const page = searchParams.get('page')
    params.page = page ? parseInt(page) : 0

    const size = searchParams.get('size')
    params.size = size ? parseInt(size) : 24

    return params
  }

  /** Serializa params para URLSearchParams, omitindo valores vazios. */
  toURLSearchParams(params) {
    const out = new URLSearchParams()
    const map = {
      termo:       'q',
      categoriaId: 'categoriaId',
      precoMin:    'precoMin',
      precoMax:    'precoMax',
      sort:        'sort',
      page:        'page',
      size:        'size',
    }
    Object.entries(map).forEach(([key, urlKey]) => {
      const v = params[key]
      if (key === 'page' || (v !== undefined && v !== null && v !== '')) {
        out.set(urlKey, String(v))
      }
    })
    if (out.get('page') === '0') out.delete('page')
    return out
  }
}

export const searchService = new SearchService()
export default searchService
