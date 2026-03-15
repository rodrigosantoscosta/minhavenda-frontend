import { useEffect } from 'react'

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
 * @param {number} page - Página atual (0-based ou 1-based, tanto faz — apenas
 *   o *valor* é observado, não o sistema de indexação).
 * @param {{ behavior?: ScrollBehavior }} [options]
 */
export function useScrollOnPageChange(page, options = {}) {
  const { behavior = 'instant' } = options

  useEffect(() => {
    window.scrollTo({ top: 0, behavior })
  }, [page, behavior])
}
