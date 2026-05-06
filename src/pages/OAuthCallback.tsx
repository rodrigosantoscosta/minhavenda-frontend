import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logger from '../utils/logger'

/**
 * OAuthCallback — handles the redirect from the backend after Google consent.
 *
 * Flow:
 *   1. Backend redirects browser to FRONTEND_URL/auth/callback?code=<uuid>
 *   2. This page reads `code` from the query string
 *   3. Calls AuthContext.loginWithGoogle(code), which calls POST /auth/google/exchange
 *   4. On success → navigate to intended destination (or home)
 *   5. On failure → store error in sessionStorage, redirect to /login
 *
 * The page is intentionally minimal — it is only ever seen for a fraction of
 * a second while the exchange request is in flight.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()
  const { loginWithGoogle } = useAuth()

  // Prevent double-firing in React StrictMode (double-invoke in dev)
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const code = searchParams.get('code')

    if (!code) {
      logger.warn('OAuthCallback: sem código na query string — redirecionando para login')
      sessionStorage.setItem('loginError', 'Link de autenticação inválido. Tente novamente.')
      navigate('/login', { replace: true })
      return
    }

    logger.debug({ code }, 'OAuthCallback: trocando código OAuth por tokens')

    loginWithGoogle(code).then((result) => {
      if (result.success) {
        logger.info({ userId: result.user?.id }, 'OAuthCallback: login Google concluído')
        // Redirect to the page the user was trying to reach, or home
        const intended = sessionStorage.getItem('oauth:intended') || '/'
        sessionStorage.removeItem('oauth:intended')
        navigate(intended, { replace: true })
      } else {
        logger.warn({ error: result.error }, 'OAuthCallback: falha na troca do código')
        sessionStorage.setItem('loginError', result.error || 'Falha no login com Google. Tente novamente.')
        navigate('/login', { replace: true })
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-5 animate-fadeIn">
        {/* Brand spinner */}
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground animate-spin" />
        </div>

        {/* Google colour bar — signals which provider is authenticating */}
        <div className="flex gap-1">
          {['bg-[#4285F4]', 'bg-[#EA4335]', 'bg-[#FBBC05]', 'bg-[#34A853]'].map((colour, i) => (
            <div
              key={colour}
              className={`w-1.5 h-1.5 rounded-full ${colour} animate-pulse`}
              style={{ animationDelay: `${i * 120}ms` }}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="font-display font-semibold text-gray-800 text-sm">
            Autenticando com Google
          </p>
          <p className="font-sans text-gray-400 text-xs mt-1">
            Aguarde um momento...
          </p>
        </div>
      </div>
    </div>
  )
}
