import { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/common/Toast'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import logger from '../utils/logger'

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    terms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  
  const { register, loading } = useAuth()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if ((errors as Record<string, string>)[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 3) {
      newErrors.nome = 'Nome deve ter pelo menos 3 caracteres'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.senha)) {
      newErrors.senha = 'Senha deve conter letras maiúsculas, minúsculas e números'
    }
    
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirme sua senha'
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem'
    }
    
    if (!acceptedTerms) {
      newErrors.terms = 'Você deve aceitar os termos de uso'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' }
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 10) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^a-zA-Z\d]/.test(password)) strength++
    if (strength <= 2) return { strength, label: 'Fraca', color: 'bg-red-500' }
    if (strength <= 4) return { strength, label: 'Média', color: 'bg-yellow-500' }
    return { strength, label: 'Forte', color: 'bg-green-500' }
  }

  const passwordStrength = getPasswordStrength(formData.senha)

  // FIX: handle result and navigate on success; show error toast on failure
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const result = await register(formData.nome, formData.email, formData.senha)

    if (result.success) {
      logger.info('Registration successful - navigating to home')
      toast.success('Conta criada com sucesso! Bem-vindo(a)!')
      navigate('/', { replace: true })
    } else {
      const message = result.error || 'Erro ao criar conta. Tente novamente.'
      logger.warn({ error: message }, 'Registration failed')
      toast.error(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Cadastre-se gratuitamente e comece a comprar
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-background rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="nome"
                  type="text"
                  name="nome"
                  placeholder="João Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  className="pl-10"
                  error={errors.nome}
                  required
                />
              </div>
              {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
            </div>

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
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  error={errors.email}
                  required
                />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  error={errors.senha}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              
              {formData.senha && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Força da senha:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Fraca' ? 'text-destructive' :
                      passwordStrength.label === 'Média' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-[width,background-color] ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use letras maiúsculas, minúsculas, números e símbolos
                  </p>
                </div>
              )}
              {errors.senha && <p className="text-sm text-destructive">{errors.senha}</p>}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmarSenha"
                  placeholder="••••••••"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  error={errors.confirmarSenha}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {errors.confirmarSenha && <p className="text-sm text-destructive">{errors.confirmarSenha}</p>}
            </div>

            {/* Termos e Condições */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-input"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-foreground">
                  Eu aceito os{' '}
                  <Link to="/termos" className="text-primary hover:text-primary/80 font-medium">
                    Termos de Uso
                  </Link>
                  {' '}e a{' '}
                  <Link to="/privacidade" className="text-primary hover:text-primary/80 font-medium">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-destructive">{errors.terms}</p>
              )}
            </div>

            {/* Botão Submit */}
            <Button
              type="submit"
              fullWidth
              disabled={loading || !acceptedTerms}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Link para login */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              Faça login
            </Link>
          </p>
        </div>

        {/* Benefícios */}
        <div className="mt-8 bg-card rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-card-foreground mb-4">
            Ao criar sua conta você terá:
          </h3>
          <ul className="space-y-2">
            {[
              'Acesso a ofertas exclusivas',
              'Histórico de pedidos',
              'Frete grátis em compras acima de R$ 99',
              'Notificações de produtos favoritos',
            ].map(benefit => (
              <li key={benefit} className="flex items-center text-sm text-muted-foreground">
                <svg className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
