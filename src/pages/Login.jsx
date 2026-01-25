import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { 
  FiMail, 
  FiLock, 
  FiEye, 
  FiEyeOff,
  FiShoppingBag,
  FiAlertCircle
} from 'react-icons/fi'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  // Estado do formulário
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  // Estado de validação
  const [errors, setErrors] = useState({})
  
  // Estado para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false)

  // Estado para erro geral
  const [serverError, setServerError] = useState('')

  // Página de redirect (após login)
  const from = location.state?.from?.pathname || '/'

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro do campo ao digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Limpar erro do servidor
    if (serverError) {
      setServerError('')
    }
  }

  // Validar formulário
  const validateForm = () => {
    const newErrors = {}

    // Validar email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter no mínimo 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')

    // Validar formulário
    if (!validateForm()) {
      return
    }

    // Fazer login
    const result = await login(formData.email, formData.senha)

    if (result.success) {
      // Redirecionar para a página de origem ou home
      navigate(from, { replace: true })
    } else {
      // Mostrar erro do servidor
      setServerError(result.error || 'Erro ao fazer login. Verifique suas credenciais.')
    }
  }

  // Handle demo login 
  const handleDemoLogin = async (tipo) => {
    const credentials = tipo === 'admin' 
      ? { email: 'admin@minhavenda.com', senha: 'admin123' }
      : { email: 'maria@email.com', senha: 'senha123' }

    setFormData(credentials)
    
    const result = await login(credentials.email, credentials.senha)
    if (result.success) {
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          
          {/* Logo e Título */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <FiShoppingBag className="text-primary-600" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Bem-vindo de volta!
            </h2>
            <p className="mt-2 text-gray-600">
              Faça login para continuar
            </p>
          </div>

          {/* Erro do Servidor */}
          {serverError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">
                  {serverError}
                </p>
              </div>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                leftIcon={<FiMail />}
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="senha"
                  name="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.senha}
                  onChange={handleChange}
                  error={errors.senha}
                  leftIcon={<FiLock />}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            {/* Esqueci a senha */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>

              <Link 
                to="/esqueci-senha" 
                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Botão Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Divider */}
          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou</span>
            </div>
          </div>

          {/* Login Demo  */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('user')}
              className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Demo Usuário
            </button>
          </div>

          {/* Link para Cadastro */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link 
                to="/cadastro" 
                className="font-medium text-primary-600 hover:text-primary-700 transition-colors"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </div>

        {/* Link para Home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    </div>
  )
}