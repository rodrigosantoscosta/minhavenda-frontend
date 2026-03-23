import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import logger from '../../utils/logger'

/**
 * SearchBar — aligned to primary-* design tokens, no hardcoded blue-*
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

  if (autoFocus && inputRef.current) {
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSearch = async (term) => {
    const trimmedTerm = term.trim()
    if (!trimmedTerm) return
    setIsLoading(true)
    try {
      if (onSearch) {
        await onSearch(trimmedTerm)
      } else {
        navigate(`/busca?q=${encodeURIComponent(trimmedTerm)}`)
      }
    } catch (error) {
      logger.error('Erro ao executar busca', { error: error.message, termo: trimmedTerm })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  const handleChange = (e) => setSearchTerm(e.target.value)

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    inputRef.current?.focus()
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Input — uses primary-* tokens consistently */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            block w-full pl-4 pr-20 py-2.5
            border border-gray-200 rounded-xl
            bg-white text-gray-900 placeholder-gray-400
            text-sm font-sans
            hover:border-primary-300
            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
            transition-[border-color,box-shadow] duration-150
            ${isLoading ? 'bg-gray-50' : ''}
          `}
          disabled={isLoading}
          autoComplete="off"
          aria-label="Buscar produtos"
        />

        {/* Clear button */}
        {searchTerm && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-10 flex items-center px-2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
            aria-label="Limpar busca"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Search submit button — primary-* only */}
        <button
          type="submit"
          disabled={isLoading || !searchTerm.trim()}
          className={`
            absolute inset-y-0 right-0 flex items-center justify-center
            w-9 h-9 mr-1 my-auto rounded-lg
            transition-[background-color,transform,opacity] duration-150 ease-spring
            active:scale-[0.96]
            ${searchTerm.trim() && !isLoading
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
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
    </div>
  )
}

export default SearchBar
