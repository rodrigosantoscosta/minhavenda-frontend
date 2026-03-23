/**
 * EmptyState — better visual hierarchy with staggered entrance.
 * Skill: split + stagger, text-balance on heading, text-pretty on description.
 */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center py-20 px-4">

      {/* Icon in a soft circle with depth */}
      {icon && (
        <div
          className="relative mb-7 animate-fadeInUp"
          style={{ animationDelay: '0ms' }}
        >
          {/* Outer soft ring */}
          <div className="absolute inset-0 rounded-full bg-gray-100 scale-125 opacity-50" />
          <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-400">
            {icon}
          </div>
        </div>
      )}

      {/* Title — skill: text-balance */}
      {title && (
        <h3
          className="font-display font-bold text-xl text-gray-900 mb-3 text-balance animate-fadeInUp"
          style={{ animationDelay: '80ms' }}
        >
          {title}
        </h3>
      )}

      {/* Description — skill: text-pretty */}
      {description && (
        <p
          className="font-sans text-gray-500 text-sm leading-relaxed mb-8 max-w-sm text-pretty animate-fadeInUp"
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
