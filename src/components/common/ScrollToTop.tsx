import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 *
 * Rola a janela para o topo ao mudar de ROTA (pathname).
 * Usa useLayoutEffect para scroll síncrono antes do paint, evitando flash.
 *
 * Distinção de responsabilidades:
 *  - ScrollToTop  → mudança de rota  (pathname)  → scroll instantâneo
 *  - useScrollOnPageChange → paginação interna → scroll suave (smooth)
 *
 * @returns {null} Componente não renderiza nada
 */

export default function ScrollToTop(): null {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
