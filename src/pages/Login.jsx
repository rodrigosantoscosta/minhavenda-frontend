import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShoppingBag, FiAlertCircle } from 'react-icons/fi'
import logger from '../utils/logger'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading } = useAuth()

  useEffect(() => {
    logger.info('🔵 Login component MOUNTED')
    return () => {
      logger.info('🔴 Login component UNMOUNTED')
    }
  }, [])

  const [formData, setFormData] = useState({ email: '', senha: '' })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')

  const from = location.state?.from?.pathname || '/'

  // ✅ Carregar erro do sessionStorage ao montar componente
  useEffect(() => {
    const savedError = sessionStorage.getItem('loginError')
    if (savedError) {
      setServerError(savedError)
      sessionStorage.removeItem('loginError')
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

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

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleDemoLogin = async (tipo) => {
    const credentials = tipo === 'admin'
      ? { email: 'admin@minhavenda.com', senha: 'admin123' }
      : { email: 'maria@email.com', senha: 'senha123' }

    setFormData(credentials)

    const result = await login(credentials.email, credentials.senha)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      const error = result.error || 'Erro ao fazer login'
      sessionStorage.setItem('loginError', error)
      setServerError(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo e título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <FiShoppingBag className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo!</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        {/* ✅ ALERTA DE ERRO */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800 mb-1">
                  Falha na autenticação
                </h3>
                <p className="text-sm text-red-700">{serverError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            e.stopPropagation()

            setServerError('')
            sessionStorage.removeItem('loginError')

            if (!validateForm()) return

            const startTime = Date.now()

            const result = await login(formData.email, formData.senha)


            if (result.success) {
              logger.info('✅ Login success - navigating')
              navigate(from, { replace: true })
              return false
            }

            const error = result.error || 'Erro ao fazer login. Verifique suas credenciais.'

            // Wait a tick to ensure component is stable
            await new Promise(resolve => setTimeout(resolve, 10))

            sessionStorage.setItem('loginError', error)
            setServerError(error)

            logger.info('🔴 Login failed - error set')

            return false
          }}

          className="space-y-6"
        >
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" size={20} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.senha ? 'border-red-500' : 'border-gray-300'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.senha && (
              <p className="mt-1 text-sm text-red-600">{errors.senha}</p>
            )}
          </div>

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Link de Cadastro */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Não tem uma conta?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
            >
              Cadastre-se gratuitamente
            </Link>
          </p>
        </div>

        {/* Divisor */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Ou teste com:</span>
          </div>
        </div>

        {/* Botões Demo */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            🔑 Login como Admin
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('cliente')}
            disabled={loading}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            👤 Login como Cliente
          </button>
        </div>
      </div>
    </div>
  )
}
