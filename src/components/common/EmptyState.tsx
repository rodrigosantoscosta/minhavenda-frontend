import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon?: ReactNode
  title?: string
  description?: string
  action?: ReactNode
}

/**
 * EmptyState — staggered entrance, zinc/slate token alignment.
 * Skill: text-balance heading, text-pretty description, layered soft rings.
 */
export default function EmptyState({ icon, title, description, action }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center py-20 px-4">

      {/* Icon in a soft circle with depth — muted palette */}
      {icon && (
        <div
          className="relative mb-7 animate-fadeInUp"
          style={{ animationDelay: '0ms' }}
        >
          {/* Outer soft ring */}
          <div className="absolute inset-0 rounded-full bg-muted scale-125 opacity-50" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-muted text-muted-foreground">
            {icon}
          </div>
        </div>
      )}

      {/* Title — skill: text-balance */}
      {title && (
        <h3
          className="font-display font-bold text-xl text-foreground mb-3 text-balance animate-fadeInUp"
          style={{ animationDelay: '80ms' }}
        >
          {title}
        </h3>
      )}

      {/* Description — skill: text-pretty */}
      {description && (
        <p
          className="font-sans text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm text-pretty animate-fadeInUp"
          style={{ animationDelay: '160ms' }}
        >
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <div
          className="animate-fadeInUp"
          style={{ animationDelay: '240ms' }}
        >
          {action}
        </div>
      )}
    </div>
  )
}
