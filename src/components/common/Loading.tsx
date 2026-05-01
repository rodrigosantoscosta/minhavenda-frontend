
export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  className?: string
}

/**
 * Loading — brand-aligned spinner with fadeIn entrance.
 * Skill: specific transition properties, no transition-all.
 */
export default function Loading(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 animate-fadeIn">
      <div className="flex flex-col items-center gap-5">
        {/* Brand spinner — single ring in primary, GPU-composited */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary-100" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary-600 animate-spin" />
        </div>
        {/* Staggered text — skill: fadeInUp with delay */}
        <div className="text-center" style={{ animationDelay: '120ms' }}>
          <p className="font-display font-semibold text-gray-800 text-sm animate-fadeInUp">
            Carregando
          </p>
          <p className="font-sans text-gray-400 text-xs mt-1 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
            Aguarde um momento...
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Spinner — inline, for use within other components.
 */
export function Spinner({ size = 'md', className = '' }: SpinnerProps): React.JSX.Element {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-11 h-11 border-2',
  }
  return (
    <div className={`relative shrink-0 ${sizes[size] ? '' : ''} ${className}`}>
      <div className={`rounded-full border-primary-100 ${sizes[size] || sizes.md}`} />
      <div className={`absolute inset-0 rounded-full border-transparent border-t-primary-600 animate-spin ${sizes[size] || sizes.md}`} />
    </div>
  )
}
