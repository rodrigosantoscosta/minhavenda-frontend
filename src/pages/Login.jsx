import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import logger from '../utils/logger'

/**
 * Login — split-panel layout.
 * Left: brand visual panel  |  Right: form
 * Skill: staggered fadeInUp, text-balance headings, scale-on-press, primary-* only.
 */
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  const [formData, setFormData]       = useState({ email: '', senha: '' })
  const [errors, setErrors]           = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]  = useState('')

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    const savedError = sessionStorage.getItem('loginError')
    if (savedError) {
      setServerError(savedError)
      sessionStorage.removeItem('loginError')
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) {
      setServerError('')
      sessionStorage.removeItem('loginError')
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setServerError('')
    sessionStorage.removeItem('loginError')
    if (!validateForm()) return

    const result = await login(formData.email, formData.senha)
    if (result.success) {
      logger.info('Login success')
      navigate(from, { replace: true })
      return
    }

    const error = result.error || 'Verifique suas credenciais e tente novamente.'
    await new Promise((resolve) => setTimeout(resolve, 10))
    sessionStorage.setItem('loginError', error)
    setServerError(error)
  }

  const inputClass = (hasError) => `
    w-full pl-10 pr-4 py-3 border rounded-xl font-sans text-sm text-gray-900
    placeholder-gray-400 bg-white
    focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500
    transition-[border-color,box-shadow] duration-150
    ${hasError ? 'border-red-400 bg-red-50/30' : 'border-gray-200 hover:border-gray-300'}
  `

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — brand visual ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-primary-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary-800/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-primary-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-primary-700/20 blur-2xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="bg-primary-600 rounded-xl p-2">
            <div className="bg-primary-500 rounded-lg w-8 h-8 flex items-center justify-center">
              <span className="font-display font-bold text-white text-base leading-none">MV</span>
            </div>
          </div>
          <span className="font-display font-bold text-white text-2xl tracking-tight">MinhaVenda</span>
        </Link>

        {/* Hero copy — skill: staggered fadeInUp */}
        <div className="relative z-10">
          <p className="text-primary-400 font-sans text-sm font-medium uppercase tracking-widest mb-4 animate-fadeInUp">
            Bem-vindo de volta
          </p>
          <h1
            className="font-display font-bold text-white text-4xl leading-tight text-balance mb-6 animate-fadeInUp"
            style={{ animationDelay: '80ms' }}
          >
            Tudo que você precisa,<br />em um só lugar.
          </h1>
          <p
            className="font-sans text-primary-300/80 text-base leading-relaxed text-pretty max-w-sm animate-fadeInUp"
            style={{ animationDelay: '160ms' }}
          >
            Milhares de produtos, entrega rápida e compra 100% protegida. Sua satisfação é nossa prioridade.
          </p>

          {/* Trust signals */}
          <div
            className="flex items-center gap-6 mt-10 animate-fadeInUp"
            style={{ animationDelay: '240ms' }}
          >
            {[
              { value: '50k+', label: 'Clientes' },
              { value: '99%',  label: 'Satisfação' },
              { value: '24h',  label: 'Suporte' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="font-display font-bold text-white text-2xl tabular-nums">{value}</p>
                <p className="font-sans text-primary-400 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <p
          className="font-sans text-primary-500 text-xs relative z-10 animate-fadeInUp"
          style={{ animationDelay: '320ms' }}
        >
          © {new Date().getFullYear()} MinhaVenda. Compra segura garantida.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-md">

          {/* Mobile logo — only visible below lg */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="bg-primary-600 rounded-xl p-1.5">
              <div className="bg-primary-500 rounded-lg w-7 h-7 flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm leading-none">MV</span>
              </div>
            </div>
            <span className="font-display font-bold text-gray-900 text-xl tracking-tight">MinhaVenda</span>
          </div>

          {/* Heading — skill: staggered fadeInUp */}
          <div className="mb-8 animate-fadeInUp">
            <h2 className="font-display font-bold text-2xl text-gray-900 text-balance">
              Acesse sua conta
            </h2>
            <p className="font-sans text-gray-500 text-sm mt-1.5">
              Não tem conta?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-150">
                Cadastre-se grátis
              </Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeInUp">
              <FiAlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-display font-semibold text-red-800">Falha na autenticação</p>
                <p className="text-sm font-sans text-red-700 mt-0.5">{serverError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div className="animate-fadeInUp" style={{ animationDelay: '80ms' }}>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={inputClass(!!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-sans text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div className="animate-fadeInUp" style={{ animationDelay: '140ms' }}>
              <label className="block text-sm font-sans font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400 w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputClass(!!errors.senha)}
                />
                {/* Toggle visibility — min 40×40 hit area */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-400 hover:text-gray-600 transition-colors duration-150"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {/* Skill: CSS cross-fade icon swap */}
                  <div className="relative w-4 h-4">
                    <FiEye
                      className={`absolute inset-0 w-4 h-4 transition-[opacity,transform,filter] duration-200 ease-spring
                        ${showPassword ? 'opacity-0 scale-[0.25] blur-[4px]' : 'opacity-100 scale-100 blur-0'}`}
                    />
                    <FiEyeOff
                      className={`absolute inset-0 w-4 h-4 transition-[opacity,transform,filter] duration-200 ease-spring
                        ${showPassword ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[0.25] blur-[4px]'}`}
                    />
                  </div>
                </button>
              </div>
              {errors.senha && (
                <p className="mt-1.5 text-xs font-sans text-red-600">{errors.senha}</p>
              )}
            </div>

            {/* Submit */}
            <div className="animate-fadeInUp pt-1" style={{ animationDelay: '200ms' }}>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-sans font-semibold py-3 rounded-xl
                  transition-[background-color,transform] duration-150 active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-card hover:shadow-card-hover"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Entrando...
                  </span>
                ) : (
                  'Entrar'
                )}
              </button>
            </div>
          </form>

          {/* Demo credentials */}
          <div
            className="mt-6 animate-fadeInUp"
            style={{ animationDelay: '280ms' }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gray-50 text-xs font-sans text-gray-400 uppercase tracking-wide">
                  Acesso demo
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Cliente', email: 'joao.silva@email.com', senha: 'senha123' },
                { label: 'Admin',   email: 'admin@loja.com',        senha: 'admin123' },
              ].map(({ label, email, senha }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFormData({ email, senha })
                    setErrors({})
                    setServerError('')
                  }}
                  className="flex flex-col items-start px-3 py-2.5 rounded-xl border border-gray-200
                    hover:border-primary-300 hover:bg-primary-50
                    transition-[border-color,background-color,transform] duration-150 active:scale-[0.96]
                    text-left group"
                >
                  <span className="text-xs font-display font-semibold text-gray-700 group-hover:text-primary-700 transition-colors duration-150">
                    {label}
                  </span>
                  <span className="text-[11px] font-sans text-gray-400 truncate w-full mt-0.5 group-hover:text-primary-500 transition-colors duration-150">
                    {email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
