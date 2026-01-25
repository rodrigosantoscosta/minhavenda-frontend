import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import logger from '../utils/logger'
import { 
  FiUser, 
  FiMail, 
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiX,
  FiShield,
  FiPackage,
  FiHeart,
  FiCreditCard
} from 'react-icons/fi'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const toast = useToast()

  // Estado de edição
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    telefone: user?.telefone || '',
    cpf: user?.cpf || '',
    endereco: user?.endereco || {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    }
  })

  // Errors
  const [errors, setErrors] = useState({})

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('endereco.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        endereco: {
          ...prev.endereco,
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Limpar erro
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Validar formulário
  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome || formData.nome.length < 3) {
      newErrors.nome = 'Nome deve ter no mínimo 3 caracteres'
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar alterações
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // TODO: Fazer PUT /api/perfil com formData
      // const response = await api.put('/perfil', formData)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Atualizar contexto
      updateUser(formData)

      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      logger.error('Erro ao atualizar perfil', { error: error.message })
      toast.error('Erro ao atualizar perfil. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Cancelar edição
  const handleCancel = () => {
    setFormData({
      nome: user?.nome || '',
      email: user?.email || '',
      telefone: user?.telefone || '',
      cpf: user?.cpf || '',
      endereco: user?.endereco || {}
    })
    setErrors({})
    setIsEditing(false)
  }

  // Buscar CEP (ViaCEP)
  const handleCepBlur = async () => {
    const cep = formData.endereco.cep?.replace(/\D/g, '')
    
    if (cep?.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              rua: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }
          }))
          toast.success('CEP encontrado!')
        } else {
          toast.error('CEP não encontrado')
        }
      } catch (error) {
        logger.error('Erro ao buscar CEP', { error: error.message, cep })
        toast.error('Erro ao buscar CEP')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-gray-600">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-6">
          
          {/* Card: Informações Pessoais */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Informações Pessoais
              </h2>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <FiEdit2 className="mr-2" size={16} />
                  Editar
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <FiX className="mr-2" size={16} />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    loading={loading}
                  >
                    <FiSave className="mr-2" size={16} />
                    Salvar
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <Input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.nome}
                  leftIcon={<FiUser />}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  error={errors.email}
                  leftIcon={<FiMail />}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <Input
                  name="telefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<FiPhone />}
                />
              </div>

              {/* CPF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF
                </label>
                <Input
                  name="cpf"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<FiShield />}
                />
              </div>
            </div>
          </div>

          {/* Card: Endereço */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiMapPin />
              Endereço de Entrega
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CEP */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <Input
                  name="endereco.cep"
                  placeholder="00000-000"
                  value={formData.endereco.cep}
                  onChange={handleChange}
                  onBlur={handleCepBlur}
                  disabled={!isEditing}
                />
              </div>

              {/* Rua */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rua
                </label>
                <Input
                  name="endereco.rua"
                  value={formData.endereco.rua}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Número */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <Input
                  name="endereco.numero"
                  value={formData.endereco.numero}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Complemento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <Input
                  name="endereco.complemento"
                  placeholder="Apto, Bloco, etc"
                  value={formData.endereco.complemento}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Bairro */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <Input
                  name="endereco.bairro"
                  value={formData.endereco.bairro}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <Input
                  name="endereco.cidade"
                  value={formData.endereco.cidade}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>

              {/* Estado */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <Input
                  name="endereco.estado"
                  placeholder="SP"
                  maxLength={2}
                  value={formData.endereco.estado}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>

          {/* Cards: Links Rápidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Meus Pedidos */}
            <button className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <FiPackage className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Meus Pedidos</h3>
                  <p className="text-sm text-gray-500">Ver histórico</p>
                </div>
              </div>
            </button>

            {/* Favoritos */}
            <button className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiHeart className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Favoritos</h3>
                  <p className="text-sm text-gray-500">Lista de desejos</p>
                </div>
              </div>
            </button>

            {/* Pagamentos */}
            <button className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCreditCard className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pagamentos</h3>
                  <p className="text-sm text-gray-500">Formas de pagamento</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}