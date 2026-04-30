import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Input from '../common/Input'
import { validarEndereco } from '../../services/checkoutService'
import { FiMapPin, FiSearch } from 'react-icons/fi'

interface AddressData {
  cep?: string; rua?: string; numero?: string; complemento?: string
  bairro?: string; cidade?: string; estado?: string
}
interface AddressFormProps {
  onAddressChange?: (data: { address: AddressData; isValid: boolean; errors: Record<string, string> }) => void
  initialData?: AddressData
  errors?: Record<string, string>
  showTitle?: boolean
}

/**
 * AddressForm Component
 * 
 * Formulário de endereço com validação em tempo real
 * e busca de CEP integrada
 */
export default function AddressForm({ 
  onAddressChange, 
  initialData = {}, 
  errors: externalErrors = {},
  showTitle = true 
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSearchingCep, setIsSearchingCep] = useState(false)
  const [cepNotFound, setCepNotFound] = useState(false)
  const [isTouched, setIsTouched] = useState(false)
  
  // Cache para buscas de CEP e ref para evitar requisições duplicadas
  const cepCacheRef = useRef(new Map())
  const searchControllerRef = useRef(null)

  // Memoizar validação para evitar recálculos desnecessários (MOVIDO PARA CIMA)
  const validation = useMemo(() => validarEndereco(formData), [formData])

  // Memoizar callback do componente pai para evitar loops (MOVIDO PARA CIMA)
  const memoizedOnAddressChange = useCallback((data: { address: AddressData; isValid: boolean; errors: Record<string, string> }) => {
    onAddressChange?.(data)
  }, [onAddressChange])

  // Atualizar dados iniciais quando mudar
  useEffect(() => {
    if (Object.keys(initialData).length > 0) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Validar com debounce para evitar loops de renderização
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isTouched) {
        setErrors(validation.errors)
        
        // Notificar componente pai sobre mudanças e validação
        memoizedOnAddressChange({
          address: formData,
          isValid: validation.isValid,
          errors: validation.errors
        })
      }
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timeoutId)
  }, [formData, isTouched, validation, memoizedOnAddressChange])

  // Notificar sobre estado inicial (sem debounce)
  useEffect(() => {
    if (!isTouched) {
      memoizedOnAddressChange({
        address: formData,
        isValid: validation.isValid,
        errors: {}
      })
    }
  }, [formData, isTouched, validation.isValid, memoizedOnAddressChange]) // Executar apenas uma vez no mount

  // Lidar com mudanças nos campos (otimizado para evitar múltiplos re-renders)
  const handleInputChange = useCallback((field: string, value: string) => {
    // Operação atômica: atualizar todos os estados relacionados de uma vez
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Se o CEP foi alterado, limpar campos de endereço para nova busca
      if (field === 'cep') {
        const cepNumbers = value.replace(/\D/g, '')
        if (cepNumbers.length < 8) {
          newData.rua = ''
          newData.bairro = ''
          newData.cidade = ''
          newData.estado = ''
          newData.complemento = ''
        }
      }
      
      return newData
    })

    // Atualizar estados relacionados em batch
    setIsTouched(true)
    setCepNotFound(false)
    
    // Limpar erro do campo específico
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [errors])

// Buscar CEP (otimizado com cache e cancelamento de requisições)
  const handleCepSearch = useCallback(async () => {
    // Ler estado atual diretamente para evitar dependências
    const currentCep = formData.cep.replace(/\D/g, '')
    if (currentCep.length !== 8) return

    // Verificar cache primeiro
    if (cepCacheRef.current.has(currentCep)) {
      const cachedData = cepCacheRef.current.get(currentCep)
      setFormData(prev => ({
        ...prev,
        rua: cachedData.rua,
        bairro: cachedData.bairro,
        cidade: cachedData.cidade,
        estado: cachedData.estado,
        complemento: cachedData.complemento
      }))
      setErrors(prev => ({ ...prev, cep: '' }))
      return
    }

    // Cancelar requisição anterior se existir
    if (searchControllerRef.current) {
      searchControllerRef.current.abort()
    }

    setIsSearchingCep(true)
    setCepNotFound(false)

    // Criar novo AbortController
    searchControllerRef.current = new AbortController()

    try {
      // API de CEP real com AbortController
      const response = await fetch(`https://viacep.com.br/ws/${currentCep}/json/`, {
        signal: searchControllerRef.current.signal
      })
      
      if (!response.ok) throw new Error('Erro na requisição')
      
      const data = await response.json()

      if (data.erro) {
        setCepNotFound(true)
        setErrors(prev => ({ ...prev, cep: 'CEP não encontrado' }))
      } else {
        // Adicionar ao cache
        const addressData = {
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || '',
          complemento: data.complemento || ''
        }
        cepCacheRef.current.set(currentCep, addressData)

        // Preencher campos com dados do CEP
        setFormData(prev => ({
          ...prev,
          ...addressData
        }))
        setErrors(prev => ({ ...prev, cep: '' }))
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setCepNotFound(true)
        setErrors(prev => ({ ...prev, cep: 'Erro ao buscar CEP' }))
      }
    } finally {
      setIsSearchingCep(false)
      searchControllerRef.current = null
    }
  }, [formData.cep]) // Depender apenas do CEP para evitar loops

  // Auto-buscar CEP quando estiver completo (otimizado)
  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, '')
    if (cep.length === 8 && !isSearchingCep && !cepNotFound) {
      handleCepSearch()
    }
  }, [formData.cep, cepNotFound, isSearchingCep, handleCepSearch]) // Incluir handleCepSearch para evitar warning

  // Formatar CEP enquanto digita (memoizado)
  const handleCepChange = useCallback((value: string) => {
    // Remove caracteres não numéricos
    const cepNumbers = value.replace(/\D/g, '')
    
    // Formata como 00000-000
    let formattedCep = ''
    if (cepNumbers.length > 5) {
      formattedCep = `${cepNumbers.slice(0, 5)}-${cepNumbers.slice(5, 8)}`
    } else {
      formattedCep = cepNumbers
    }
    
    handleInputChange('cep', formattedCep)
  }, [handleInputChange])

  // Formatar campos (memoizados)
  const handleNumeroChange = useCallback((value: string) => {
    // Permitir apenas números e caracteres comuns
    const cleaned = value.replace(/[^a-zA-Z0-9\s-]/g, '')
    handleInputChange('numero', cleaned)
  }, [handleInputChange])

  const handleEstadoChange = useCallback((value: string) => {
    // Converter para maiúsculas e limitar a 2 caracteres
    const cleaned = value.toUpperCase().slice(0, 2)
    handleInputChange('estado', cleaned)
  }, [handleInputChange])

  

  // Combinar erros internos com erros externos (apenas se formulário foi tocado)
  const combinedErrors = useMemo(() => 
    isTouched ? { ...errors, ...externalErrors } : {},
    [isTouched, errors, externalErrors]
  )

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FiMapPin className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Endereço de Entrega
            </h3>
            <p className="text-sm text-gray-600">
              Informe onde deseja receber seu pedido
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* CEP */}
        <div className="md:col-span-2">
           <Input
            label="CEP"
            placeholder="00000-000"
            value={formData.cep}
            onChange={(e) => handleCepChange(e.target.value)}
            onBlur={handleCepSearch}
            error={combinedErrors.cep}
            required
            maxLength={9}
            autoComplete="postal-code"
            name="postal_code"
            rightElement={
              <button
                type="button"
                onClick={handleCepSearch}
                disabled={isSearchingCep || formData.cep.length !== 9}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent border border-transparent hover:border-primary-200 flex items-center justify-center"
                title="Buscar CEP"
                tabIndex={-1}
              >
                {isSearchingCep ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSearch className="w-4 h-4 flex-shrink-0" />
                )}
              </button>
            }
          />
          {cepNotFound && (
            <p className="mt-1 text-sm text-amber-600">
              CEP não encontrado. Preencha o endereço manualmente.
            </p>
          )}
        </div>

        {/* Rua */}
        <div className="md:col-span-2">
          <Input
            label="Rua"
            placeholder="Nome da rua"
            value={formData.rua}
            onChange={(e) => handleInputChange('rua', e.target.value)}
            error={combinedErrors.rua}
            required
            disabled={isSearchingCep}
            autoComplete="address-line1"
            name="street_address"
          />
        </div>

        {/* Número */}
        <div>
          <Input
            label="Número"
            placeholder="123"
            value={formData.numero}
            onChange={(e) => handleNumeroChange(e.target.value)}
            error={combinedErrors.numero}
            required
            disabled={isSearchingCep}
            autoComplete="address-line2"
            name="street_number"
          />
        </div>

        {/* Complemento */}
        <div>
          <Input
            label="Complemento"
            placeholder="Apto 101, Bloco A (opcional)"
            value={formData.complemento}
            onChange={(e) => handleInputChange('complemento', e.target.value)}
            disabled={isSearchingCep}
            autoComplete="address-line3"
            name="address_complement"
          />
        </div>

        {/* Bairro */}
        <div>
          <Input
            label="Bairro"
            placeholder="Nome do bairro"
            value={formData.bairro}
            onChange={(e) => handleInputChange('bairro', e.target.value)}
            error={combinedErrors.bairro}
            required
            disabled={isSearchingCep}
            autoComplete="address-level4"
            name="neighborhood"
          />
        </div>

        {/* Cidade */}
        <div>
          <Input
            label="Cidade"
            placeholder="Nome da cidade"
            value={formData.cidade}
            onChange={(e) => handleInputChange('cidade', e.target.value)}
            error={combinedErrors.cidade}
            required
            disabled={isSearchingCep}
            autoComplete="address-level2"
            name="city"
          />
        </div>

        {/* Estado */}
        <div>
          <Input
            label="Estado"
            placeholder="SP"
            value={formData.estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            error={combinedErrors.estado}
            required
            maxLength={2}
            disabled={isSearchingCep}
            autoComplete="address-level1"
            name="state"
          />
        </div>
      </div>
    </div>
  )
}