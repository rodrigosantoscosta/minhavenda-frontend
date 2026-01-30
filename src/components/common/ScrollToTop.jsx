import { useLayoutEffect } from 'react'

import { useLocation } from 'react-router-dom'

/**
 * ScrollToTop Component
 * 
 * Automaticamente rola a página para o topo quando a rota muda.
 * Melhora a experiência do usuário ao navegar entre páginas.
 * 
 * @example
 * @returns {null} Componente não renderiza nada
 */

export default function ScrollToTop() {
  const { pathname } = useLocation()
  
  useLayoutEffect(() => {
    // Scroll instantâneo para o topo da página
    window.scrollTo(0, 0)
  }, [pathname]) // Executa sempre que pathname mudar
  
  // Componente não renderiza nada
  return null
}
