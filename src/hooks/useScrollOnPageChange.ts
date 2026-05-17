import { useEffect } from 'react'

type ScrollBehaviorType = 'auto' | 'instant' | 'smooth'

interface ScrollOnPageChangeOptions {
  behavior?: ScrollBehaviorType
}

/**
 * useScrollOnPageChange
 *
 * Rola a janela para o topo sempre que `page` mudar.
 * Centraliza o comportamento de scroll na paginação, evitando duplicação
 * nos componentes de página.
 *
 * Distinção importante:
 *  - ScrollToTop (route-level): usa useLayoutEffect para scroll instantâneo
 *    ao mudar de rota, antes do paint.
 *  - useScrollOnPageChange (pagination-level): usa useEffect para scroll
 *    instantâneo após o React re-renderizar com o novo número de página.
 *
 * @param page - Página atual (0-based ou 1-based, tanto faz — apenas
 *   o *valor* é observado, não o sistema de indexação).
 * @param options
 */
export function useScrollOnPageChange(page: number, options: ScrollOnPageChangeOptions = {}): void {
  const { behavior = 'instant' as ScrollBehaviorType } = options

  useEffect(() => {
    window.scrollTo({ top: 0, behavior })
  }, [page, behavior])
}
