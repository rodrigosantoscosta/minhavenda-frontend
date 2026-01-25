import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import logger from '../../utils/logger'

/**
 * Componente SearchBar - Barra de busca principal
 * @param {Object} props
 * @param {string} props.placeholder - Texto placeholder (default: "Buscar produtos...")
 * @param {string} props.initialValue - Valor inicial do campo
 * @param {string} props.className - Classes CSS adicionais
 * @param {function} props.onSearch - Callback ao executar busca (opcional)
 * @param {boolean} props.showButton - Mostrar botão de busca (default: true)
 * @param {boolean} props.autoFocus - Auto foco no componente (default: false)
 */
const SearchBar = ({ 
  placeholder = "Buscar produtos...", 
  initialValue = "",
  className = "",
  onSearch,
  showButton = true,
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Auto foco se solicitado
  if (autoFocus && inputRef.current) {
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  /**
   * Executar busca
   * @param {string} term - Termo de busca
   */
  const handleSearch = async (term) => {
    const trimmedTerm = term.trim()
    
    // Se não tiver termo, não faz nada
    if (!trimmedTerm) {
      return
    }

    setIsLoading(true)

    try {
      // Se tiver callback externo, usa ele
      if (onSearch) {
        await onSearch(trimmedTerm)
      } else {
        // Senão, navega para página de busca
        navigate(`/busca?q=${encodeURIComponent(trimmedTerm)}`)
      }
    } catch (error) {
      logger.error('Erro ao executar busca', { error: error.message, termo: trimmedTerm })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle submit do formulário
   * @param {React.FormEvent} e
   */
  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  /**
   * Handle change do input
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleChange = (e) => {
    setSearchTerm(e.target.value)
  }

  /**
   * Handle key down (para detectar Enter)
   * @param {React.KeyboardEvent} e
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchTerm)
    }
  }

  /**
   * Limpar campo de busca
   */
  const handleClear = () => {
    setSearchTerm('')
    inputRef.current?.focus()
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Campo de busca */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-4 pr-20 py-2.5
            border border-gray-300 rounded-lg
            bg-white text-gray-900 placeholder-gray-500
            text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${isLoading ? 'bg-gray-50' : ''}
            ${className}
          `}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Buscar produtos"
        />

        {/* Botão de limpar (quando tem texto) */}
        {searchTerm && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-12 flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Limpar busca"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Botão de busca com ícone de lupa */}
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className={`
            absolute inset-y-0 right-0 flex items-center justify-center
            w-8 h-8 mr-1.5 my-auto
            ${searchTerm.trim() && !isLoading 
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:scale-105' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
            rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200 transform
          `}
          aria-label="Executar busca"
        >
          {isLoading ? (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <MagnifyingGlassIcon className="h-4 w-4" />
          )}
        </button>
      </form>

      {/* Indicador de carregamento (overlay) */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm text-gray-600">Buscando...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar