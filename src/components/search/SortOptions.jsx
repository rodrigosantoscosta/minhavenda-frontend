import { useState } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'
import searchService from '../../services/searchService'

/**
 * Componente SortOptions - Opções de ordenação
 * @param {Object} props
 * @param {string} props.value - Valor atual da ordenação (ex: "nome:asc")
 * @param {function} props.onChange - Callback quando ordenação muda
 * @param {string} props.className - Classes CSS adicionais
 * @param {boolean} props.showLabel - Mostrar label "Ordenar por" (default: true)
 * @param {Array} props.options - Opções customizadas (opcional)
 */
const SortOptions = ({ 
  value = 'nome:asc', 
  onChange, 
  className = '',
  showLabel = true,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Opções padrão ou customizadas
  const sortOptions = options || searchService.getOpcoesOrdenacao()

  // Opção selecionada atual
  const selectedOption = sortOptions.find(option => option.value === value) || sortOptions[0]

  /**
   * Handle change da ordenação
   * @param {Object} option - Opção selecionada
   */
  const handleSortChange = (option) => {
    if (onChange) {
      onChange(option.value)
    }
    setIsOpen(false)
  }

  /**
   * Toggle dropdown
   */
  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  /**
   * Fechar dropdown ao clicar fora
   */
  const handleBlur = (e) => {
    // Verificar se o clique foi fora do dropdown
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOpen(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordenar por
        </label>
      )}
      
      <div className="relative">
        {/* Botão principal */}
        <button
          type="button"
          onClick={toggleDropdown}
          onBlur={handleBlur}
          className={`
            w-full md:w-auto
            flex items-center justify-between
            px-4 py-2.5
            bg-white border border-gray-300 rounded-lg
            text-sm text-gray-700
            hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-colors duration-200
            ${isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label="Opções de ordenação"
        >
          <span className="truncate">{selectedOption.label}</span>
          <ChevronUpDownIcon 
            className={`ml-2 h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
            <ul 
              className="py-1 max-h-60 overflow-auto"
              role="listbox"
              aria-label="Opções de ordenação"
            >
              {sortOptions.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => handleSortChange(option)}
                    className={`
                      w-full px-4 py-2 text-left text-sm
                      hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                      transition-colors duration-150
                      ${option.value === value 
                        ? 'bg-blue-50 text-blue-700 font-medium' 
                        : 'text-gray-700'
                      }
                    `}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {option.value === value && (
                        <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Indicador visual para mobile */}
      <div className="mt-2 md:hidden">
        <p className="text-xs text-gray-500">
          Ordenando por: <span className="font-medium">{selectedOption.label}</span>
        </p>
      </div>
    </div>
  )
}

export default SortOptions