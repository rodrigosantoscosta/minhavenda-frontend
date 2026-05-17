import { useState, useRef } from 'react'
import type { FormEvent, ChangeEvent, KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import logger from '../../utils/logger'

/**
 * SearchBar — aligned to primary-* design tokens, no hardcoded blue-*
 */
interface SearchBarProps {
  placeholder?: string
  initialValue?: string
  className?: string
  onSearch?: (term: string) => void | Promise<void>
  showButton?: boolean
  autoFocus?: boolean
}

const SearchBar = ({
  placeholder = "Buscar produtos...",
  initialValue = "",
  className = "",
  onSearch,
  showButton: _showButton = true,
  autoFocus = false
}: SearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)

  if (autoFocus && inputRef.current) {
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleSearch = async (term: string) => {
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
      logger.error({ error: (error as Error).message, termo: trimmedTerm }, 'Erro ao executar busca')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch(searchTerm)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch(searchTerm)
  }

  return (
    <div className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-muted/50 text-foreground placeholder-muted-foreground text-sm font-sans focus:outline-none focus:ring-1 focus:ring-ring/30 focus:border-ring focus:bg-background transition-[border-color,background-color] duration-150"
          disabled={isLoading}
          autoComplete="off"
          aria-label="Buscar produtos"
        />
      </form>
    </div>
  )
}

export default SearchBar
