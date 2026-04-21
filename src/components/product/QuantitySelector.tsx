import { FiMinus, FiPlus } from 'react-icons/fi'

export default function QuantitySelector({ 
  value = 1, 
  onChange, 
  min = 1, 
  max = 99,
  disabled = false 
}) {
  
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value) || min
    
    if (newValue < min) {
      onChange(min)
    } else if (newValue > max) {
      onChange(max)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden">
      {/* Botão Decrementar */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-300"
        aria-label="Diminuir quantidade"
      >
        <FiMinus size={18} />
      </button>

      {/* Input de Quantidade */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        min={min}
        max={max}
        className="w-20 px-4 py-3 text-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
        aria-label="Quantidade"
      />

      {/* Botão Incrementar */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="px-4 py-3 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-300"
        aria-label="Aumentar quantidade"
      >
        <FiPlus size={18} />
      </button>
    </div>
  )
}
