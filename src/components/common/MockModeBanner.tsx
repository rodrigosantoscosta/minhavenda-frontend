/**
 * src/components/common/MockModeBanner.tsx
 *
 * Renders a sticky top banner whenever VITE_USE_MOCK=true so every developer
 * (and anyone running the app locally without the backend) gets an unmissable
 * visual reminder that all data is Faker-generated and not persisted.
 *
 * The banner is completely absent from production builds because Vite replaces
 * `import.meta.env.VITE_USE_MOCK` at build time and dead-code-eliminates the
 * component tree when the condition is false.
 */

const IS_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export default function MockModeBanner() {
  if (!IS_MOCK) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.45rem 1rem',
        background: 'repeating-linear-gradient(135deg, #78350f 0px, #78350f 10px, #92400e 10px, #92400e 20px)',
        color: '#fef3c7',
        fontSize: '0.8rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        userSelect: 'none',
        boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
      }}
    >
      {/* Warning icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      <span>
         MODO MOCK ATIVO — dados gerados pelo Faker, sem backend real.{' '}
        <span style={{ opacity: 0.75, fontWeight: 400 }}>
          Remova <code style={{ background: 'rgba(0,0,0,0.25)', padding: '0 4px', borderRadius: 3 }}>VITE_USE_MOCK=true</code> do{' '}
          <code style={{ background: 'rgba(0,0,0,0.25)', padding: '0 4px', borderRadius: 3 }}>.env.development</code> para usar o backend real.
        </span>
      </span>
    </div>
  )
}
