import api from './api'
import logger from '../utils/logger'
import type { Product, PaginationInfo } from '../types'

/**
 * Serviço de busca — usa o endpoint GET /produtos do backend NestJS.
 *
 * Sorting: the backend accepts two separate query params:
 *   sort    = 'nome' | 'preco' | 'dataCadastro'   (field name)
 *   sortDir = 'ASC'  | 'DESC'                      (direction)
 *
 * Internally this service uses the "field:direction" shorthand (e.g. "nome:asc")
 * for URLs and state — it is split into { sort, sortDir } before hitting the API.
 */

interface BuscarProdutosParams {
  termo?: string
  categoriaId?: number
  precoMin?: number
  precoMax?: number
  sort?: string
  page?: number
  size?: number
}

interface SortOption {
  value: string
  label: string
}

interface PagedProducts {
  content?: Product[]
  data?: Product[]
  pagination?: PaginationInfo
  [key: string]: unknown
}

class SearchService {
  /**
   * Converte a chave composta "field:dir" nos dois params que o backend espera.
   */
  _splitSort(sortKey: string): { sort: string; sortDir: string } {
    if (!sortKey) return { sort: 'nome', sortDir: 'ASC' }
    const [field, dir = 'asc'] = sortKey.split(':')
    return {
      sort: field,
      sortDir: dir.toUpperCase(),
    }
  }

  /**
   * Buscar produtos com filtros, ordenação e paginação.
   */
  async buscarProdutos(params: BuscarProdutosParams = {}): Promise<PagedProducts> {
    const {
      termo,
      categoriaId,
      precoMin,
      precoMax,
      sort = 'nome:asc',
      page = 0,
      size = 24,
    } = params

    const { sort: sortField, sortDir } = this._splitSort(sort)

    const queryParams: Record<string, unknown> = {
      ativo: true,
      page,
      size,
      sort: sortField,
      sortDir,
    }

    if (termo)        queryParams.termo       = termo
    if (categoriaId)  queryParams.categoriaId = categoriaId
    if (precoMin !== undefined && precoMin !== ('' as unknown as number)) queryParams.precoMin = precoMin
    if (precoMax !== undefined && precoMax !== ('' as unknown as number)) queryParams.precoMax = precoMax

    logger.info({ queryParams }, 'SearchService.buscarProdutos')

    const response = await api.get<PagedProducts>('/produtos', { params: queryParams })
    return response.data
  }

  /**
   * Opções de ordenação expostas ao componente SortOptions.
   * Valores no formato "campo:direção" — split feito por _splitSort() ao enviar.
   */
  getOpcoesOrdenacao(): SortOption[] {
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
  parsearParamsBusca(searchParams: URLSearchParams): BuscarProdutosParams {
    const params: BuscarProdutosParams = {}

    // "q" vem do header SearchBar; "termo" vem de links internos
    const termo = searchParams.get('q') || searchParams.get('termo')
    if (termo) params.termo = termo

    const categoriaId = searchParams.get('categoriaId')
    if (categoriaId) params.categoriaId = parseInt(categoriaId)

    const precoMin = searchParams.get('precoMin')
    if (precoMin) params.precoMin = parseFloat(precoMin)

    const precoMax = searchParams.get('precoMax')
    if (precoMax) params.precoMax = parseFloat(precoMax)

    // sort is stored in URL as "campo:direção" shorthand
    const sort = searchParams.get('sort')
    if (sort) params.sort = sort

    const page = searchParams.get('page')
    params.page = page ? parseInt(page) : 0

    const size = searchParams.get('size')
    params.size = size ? parseInt(size) : 24

    return params
  }

  /** Serializa params para URLSearchParams, omitindo valores vazios. */
  toURLSearchParams(params: BuscarProdutosParams): URLSearchParams {
    const out = new URLSearchParams()
    const map: Record<string, string> = {
      termo:       'q',
      categoriaId: 'categoriaId',
      precoMin:    'precoMin',
      precoMax:    'precoMax',
      sort:        'sort',   // stored as "campo:direção" in URL
      page:        'page',
      size:        'size',
    }
    Object.entries(map).forEach(([key, urlKey]) => {
      const v = params[key as keyof BuscarProdutosParams]
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
