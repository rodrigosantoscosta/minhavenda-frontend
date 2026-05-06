import { useState } from 'react'
import React from 'react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import searchService from '../../services/searchService'

interface SortOption { value: string; label: string }

interface SortOptionsProps {
  value?: string
  onChange?: (value: string) => void
  className?: string
  showLabel?: boolean
  options?: SortOption[]
}

const SortOptions = ({
  value = 'nome:asc',
  onChange,
  className = '',
  showLabel = true,
  options
}: SortOptionsProps) => {
  const [isOpen, setIsOpen] = useState(false)

  const sortOptions = options || searchService.getOpcoesOrdenacao()
  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0]

  const handleSortChange = (option: SortOption) => {
    if (onChange) onChange(option.value)
    setIsOpen(false)
  }

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-sans font-medium text-foreground mb-2">
          Ordenar por
        </label>
      )}

      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onBlur={handleBlur}
          className={[
            'w-full md:w-auto flex items-center justify-between gap-2',
            'px-4 py-2.5 rounded-lg border font-sans text-sm',
            'bg-background text-foreground',
            'hover:bg-muted transition-[border-color,background-color,box-shadow] duration-150',
            'focus:outline-none focus:ring-2 focus:ring-ring/40',
            isOpen
              ? 'border-ring ring-2 ring-ring/40'
              : 'border-input hover:border-ring/50',
          ].join(' ')}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Opções de ordenação"
        >
          <span className="truncate">{selectedOption.label}</span>
          <ChevronUpDownIcon
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-20 mt-1.5 w-full min-w-[180px] bg-card border border-border rounded-lg shadow-dropdown py-1 animate-fadeInUp origin-top">
            <ul
              className="max-h-60 overflow-auto"
              role="listbox"
              aria-label="Opções de ordenação"
            >
              {sortOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      onClick={() => handleSortChange(option)}
                      className={[
                        'w-full px-4 py-2.5 text-left text-sm font-sans flex items-center justify-between gap-3',
                        'transition-colors duration-100 focus:outline-none',
                        isSelected
                          ? 'bg-muted text-foreground font-medium'
                          : 'text-foreground hover:bg-muted/60',
                      ].join(' ')}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <CheckIcon className="h-4 w-4 text-foreground shrink-0" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Mobile label */}
      <div className="mt-2 md:hidden">
        <p className="text-xs text-muted-foreground font-sans">
          Ordenando por: <span className="font-medium text-foreground">{selectedOption.label}</span>
        </p>
      </div>
    </div>
  )
}

export default SortOptions
