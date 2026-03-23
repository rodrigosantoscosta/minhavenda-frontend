/**
 * Badge — solid pill style for strong legibility at small sizes.
 * danger/warning use solid fills so they read clearly on product cards.
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) {
  const variants = {
    primary:   'bg-primary-100 text-primary-800',
    success:   'bg-emerald-100 text-emerald-800',
    // Skill: solid fills for danger/warning — legible at xs size on images
    danger:    'bg-red-500 text-white',
    warning:   'bg-amber-400 text-amber-900',
    dark:      'bg-gray-800 text-white',
    secondary: 'bg-gray-100 text-gray-700',
    info:      'bg-sky-100 text-sky-800',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold tracking-wide',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold',
  }

  return (
    <span className={`inline-flex items-center rounded-full font-sans ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
