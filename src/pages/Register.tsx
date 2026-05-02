import { useState } from 'react'
import type React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/common/Toast'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import logger from '../utils/logger'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleSubmit = async (e: React.FormEvent) => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
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
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nome Completo */}
            <Input
              type="text"
              name="nome"
              label="Nome Completo"
              placeholder="João Silva"
              value={formData.nome}
              onChange={handleChange}
              leftIcon={<FiUser />}
              error={errors.nome}
              required
            />

            {/* Email */}
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              leftIcon={<FiMail />}
              error={errors.email}
              required
            />

            {/* Senha */}
            <div>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="senha"
                label="Senha"
                placeholder="••••••••"
                value={formData.senha}
                onChange={handleChange}
                leftIcon={<FiLock />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                }
                error={errors.senha}
                required
              />
              
              {formData.senha && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Força da senha:</span>
                    <span className={`text-xs font-medium ${
                      passwordStrength.label === 'Fraca' ? 'text-red-600' :
                      passwordStrength.label === 'Média' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.strength / 6) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use letras maiúsculas, minúsculas, números e símbolos
                  </p>
                </div>
              )}
            </div>

            {/* Confirmar Senha */}
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmarSenha"
              label="Confirmar Senha"
              placeholder="••••••••"
              value={formData.confirmarSenha}
              onChange={handleChange}
              leftIcon={<FiLock />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              }
              error={errors.confirmarSenha}
              required
            />

            {/* Termos e Condições */}
            <div>
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  Eu aceito os{' '}
                  <Link to="/termos" className="text-primary-600 hover:text-primary-500 font-medium">
                    Termos de Uso
                  </Link>
                  {' '}e a{' '}
                  <Link to="/privacidade" className="text-primary-600 hover:text-primary-500 font-medium">
                    Política de Privacidade
                  </Link>
                </label>
              </div>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
              )}
            </div>

            {/* Botão Submit */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!acceptedTerms}
            >
              Criar Conta
            </Button>
          </form>

          {/* Link para login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Faça login
            </Link>
          </p>
        </div>

        {/* Benefícios */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Ao criar sua conta você terá:
          </h3>
          <ul className="space-y-2">
            {[
              'Acesso a ofertas exclusivas',
              'Histórico de pedidos',
              'Frete grátis em compras acima de R$ 99',
              'Notificações de produtos favoritos',
            ].map(benefit => (
              <li key={benefit} className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
