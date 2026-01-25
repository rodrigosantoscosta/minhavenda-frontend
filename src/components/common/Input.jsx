import { forwardRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

/**
 * Input Component
 * 
 * @param {string} label - Label do input
 * @param {string} type - text | email | password | number | tel | url
 * @param {string} error - Mensagem de erro
 * @param {string} helperText - Texto de ajuda
 * @param {ReactNode} leftIcon - Ícone à esquerda
 * @param {ReactNode} rightIcon - Ícone à direita
 * @param {ReactNode} rightElement - Elemento customizado à direita (botão, etc.)
 * @param {boolean} required - Campo obrigatório
 * @param {boolean} disabled - Campo desabilitado
 * @param {string} size - sm | md | lg
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  helperText,
  leftIcon,
  rightIcon,
  rightElement,
  required = false,
  disabled = false,
  size = 'md',
  className = '',
  ...restProps
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  }

  // Determinar se há conteúdo à direita
  const hasRightContent = rightElement || rightIcon || isPassword
  
  // Input classes
  const inputClasses = `
    w-full
    ${sizeStyles[size]}
    ${leftIcon ? 'pl-10' : ''}
    ${hasRightContent ? 'pr-10' : ''}
    ${rightElement ? 'has-right-element' : ''}
    border rounded-lg
    ${error 
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
    }
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
    focus:outline-none focus:ring-2
    transition-colors
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={inputType}
          className={inputClasses}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          {...restProps}
        />

        {/* Right Element (prioridade sobre rightIcon/password) */}
        {rightElement && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
            {rightElement}
          </div>
        )}

        {/* Right Icon or Password Toggle (só se não houver rightElement) */}
        {!rightElement && (rightIcon || isPassword) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            ) : (
              <span className="text-gray-400">{rightIcon}</span>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p id="error-message" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p id="helper-text" className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
