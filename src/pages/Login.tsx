import { useState } from 'react'
import type React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import logger from '../utils/logger'

/**
 * Login — split-panel layout with shadcn/ui components.
 * Left: brand visual panel (zinc dark)  |  Right: form (zinc light)
 */
export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  const [formData, setFormData]         = useState<{ email: string; senha: string }>({ email: '', senha: '' })
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError]   = useState<string>(() => {
    const saved = sessionStorage.getItem('loginError')
    if (saved) sessionStorage.removeItem('loginError')
    return saved ?? ''
  })

  const from = location.state?.from?.pathname || '/'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if ((errors as Record<string, string>)[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (serverError) {
      setServerError('')
      sessionStorage.removeItem('loginError')
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.senha) newErrors.senha = 'Senha é obrigatória'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    await new Promise((resolve) => setTimeout(resolve, 100))
    sessionStorage.setItem('loginError', error)
    setServerError(error)
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — zinc dark brand visual ── */}
      <div className="hidden lg:flex lg:w-[52%] bg-zinc-950 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative background shapes — subtle zinc tones */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-zinc-800/40 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-zinc-700/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-zinc-600/15 blur-2xl pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="bg-zinc-100 rounded-lg p-2">
            <div className="bg-zinc-300 rounded-md w-8 h-8 flex items-center justify-center">
              <span className="font-display font-bold text-zinc-900 text-base leading-none tracking-tight">MV</span>
            </div>
          </div>
          <span className="font-display font-bold text-white text-2xl tracking-tight">MinhaVenda</span>
        </Link>

        {/* Hero copy — skill: staggered fadeInUp */}
        <div className="relative z-10">
          <p className="text-zinc-500 font-sans text-sm font-medium uppercase tracking-widest mb-4 animate-fadeInUp">
            Bem-vindo de volta
          </p>
          <h1
            className="font-display font-bold text-white text-4xl leading-tight text-balance mb-6 animate-fadeInUp"
            style={{ animationDelay: '80ms' }}
          >
            Tudo que você precisa,<br />em um só lugar.
          </h1>
          <p
            className="font-sans text-zinc-400 text-base leading-relaxed text-pretty max-w-sm animate-fadeInUp"
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
                <p className="font-sans text-zinc-500 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note */}
        <p
          className="font-sans text-zinc-700 text-xs relative z-10 animate-fadeInUp"
          style={{ animationDelay: '320ms' }}
        >
          © {new Date().getFullYear()} MinhaVenda. Compra segura garantida.
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="bg-foreground rounded-lg p-1.5">
              <div className="bg-zinc-700 rounded-md w-7 h-7 flex items-center justify-center">
                <span className="font-display font-bold text-background text-sm leading-none tracking-tight">MV</span>
              </div>
            </div>
            <span className="font-display font-bold text-foreground text-xl tracking-tight">MinhaVenda</span>
          </div>

          {/* Heading */}
          <div className="mb-8 animate-fadeInUp">
            <h2 className="font-display font-bold text-2xl text-foreground text-balance">
              Acesse sua conta
            </h2>
            <p className="font-sans text-muted-foreground text-sm mt-1.5">
              Não tem conta?{' '}
              <Link to="/register" className="text-foreground font-semibold underline underline-offset-4 hover:text-foreground/70 transition-colors duration-150">
                Cadastre-se grátis
              </Link>
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-fadeInUp">
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
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className="pl-10"
                  error={errors.email}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pr-10"
                  error={errors.senha}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha}</p>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Google OAuth */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs text-muted-foreground uppercase tracking-wide">
                <span className="bg-background px-3">ou continue com</span>
              </div>
            </div>

            <a
              href={`${import.meta.env.VITE_API_URL}/auth/google`}
              className="mt-4 w-full flex items-center justify-center gap-3 border border-input rounded-lg py-2.5 bg-background hover:bg-muted hover:border-input transition-colors text-sm font-medium text-foreground shadow-sm"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
                <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
              </svg>
              Entrar com Google
            </a>
          </div>

          {/* Demo credentials */}
          <div
            className="mt-6 animate-fadeInUp"
            style={{ animationDelay: '280ms' }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-background text-xs font-sans text-muted-foreground uppercase tracking-wide">
                  Acesso demo
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Cliente', email: 'joao.silva@email.com', senha: 'senha123' },
                { label: 'Admin',   email: 'admin@loja.com',        senha: 'senha123' },
              ].map(({ label, email, senha }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFormData({ email, senha })
                    setErrors({})
                    setServerError('')
                  }}
                  className="flex flex-col items-start px-3 py-2.5 rounded-lg border border-border
                    hover:border-foreground/30 hover:bg-muted
                    transition-[border-color,background-color,transform] duration-150 active:scale-[0.96]
                    text-left group"
                >
                  <span className="text-xs font-display font-semibold text-foreground group-hover:text-foreground transition-colors duration-150">
                    {label}
                  </span>
                  <span className="text-[11px] font-sans text-muted-foreground truncate w-full mt-0.5">
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
