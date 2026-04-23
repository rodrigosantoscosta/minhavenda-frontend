import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { FiLoader } from 'react-icons/fi'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'white' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  static?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

/**
 * Button Component
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  static: isStatic = false,
  children,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}, ref) => {

  // Skill: specify exact transition properties — never use transition-all
  const baseStyles = [
    'inline-flex items-center justify-center font-sans font-medium rounded-xl',
    'transition-[background-color,color,box-shadow,transform,opacity] duration-150',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    // Skill: scale-on-press (0.96) — disabled when isStatic or disabled
    !isStatic && !disabled ? 'active:not-disabled:scale-[0.96]' : '',
  ].join(' ')

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
  }

  // Skill: shadows-as-borders for elevation variants
  const variantStyles = {
    primary:   'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500/50 shadow-card hover:shadow-card-hover',
    secondary: 'bg-gray-700 text-white hover:bg-gray-800 active:bg-gray-900 focus:ring-gray-500/50 shadow-card hover:shadow-card-hover',
    outline:   'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500/50',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500/50 shadow-card hover:shadow-card-hover',
    ghost:     'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400/50',
    // Skill: white variant used by ProductCard hover overlay
    white:     'bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400/50 shadow-card hover:shadow-card-hover',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 focus:ring-emerald-500/50 shadow-card hover:shadow-card-hover',
  }

  const classes = [
    baseStyles,
    sizeStyles[size] || sizeStyles.md,
    variantStyles[variant] || variantStyles.primary,
    fullWidth ? 'w-full' : '',
    className,
  ].join(' ').replace(/\s+/g, ' ').trim()

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <FiLoader className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
