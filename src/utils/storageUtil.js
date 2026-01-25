/**
 * Utilitário para manipulação segura do localStorage
 * Adiciona tratamento de erros e serialização automática
 */
const storageUtil = {
  /**
   * SET ITEM - Salvar item no localStorage
   * @param {string} key - Chave do item
   * @param {any} value - Valor (será convertido para JSON automaticamente)
   * @returns {boolean} - true se salvou com sucesso
   */
  setItem(key, value) {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
      
      // Verificar se é erro de quota excedida
      if (error.name === 'QuotaExceededError') {
        console.warn('localStorage cheio! Limpando itens antigos...')
        this.clearOldItems()
      }
      
      return false
    }
  },

  /**
   * GET ITEM - Obter item do localStorage
   * @param {string} key - Chave do item
   * @param {any} defaultValue - Valor padrão se não encontrar
   * @returns {any} - Valor deserializado ou defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      
      if (item === null) {
        return defaultValue
      }
      
      return JSON.parse(item)
    } catch (error) {
      console.error(`Erro ao ler ${key} do localStorage:`, error)
      return defaultValue
    }
  },

  /**
   * REMOVE ITEM - Remover item do localStorage
   * @param {string} key - Chave do item
   * @returns {boolean} - true se removeu com sucesso
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Erro ao remover ${key} do localStorage:`, error)
      return false
    }
  },

  /**
   * CLEAR - Limpar todo o localStorage
   * @returns {boolean}
   */
  clear() {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Erro ao limpar localStorage:', error)
      return false
    }
  },

  /**
   * HAS ITEM - Verificar se item existe
   * @param {string} key - Chave do item
   * @returns {boolean}
   */
  hasItem(key) {
    return localStorage.getItem(key) !== null
  },

  /**
   * GET ALL KEYS - Obter todas as chaves
   * @returns {string[]}
   */
  getAllKeys() {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      console.error('Erro ao obter chaves:', error)
      return []
    }
  },

  /**
   * GET SIZE - Obter tamanho usado (em bytes aproximado)
   * @returns {number}
   */
  getSize() {
    try {
      let total = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      console.error('Erro ao calcular tamanho:', error)
      return 0
    }
  },

  /**
   * SET WITH EXPIRY - Salvar com data de expiração
   * @param {string} key - Chave
   * @param {any} value - Valor
   * @param {number} ttl - Tempo de vida em milissegundos
   */
  setWithExpiry(key, value, ttl) {
    try {
      const now = new Date()
      const item = {
        value: value,
        expiry: now.getTime() + ttl,
      }
      this.setItem(key, item)
    } catch (error) {
      console.error(`Erro ao salvar ${key} com expiração:`, error)
    }
  },

  /**
   * GET WITH EXPIRY - Obter item com verificação de expiração
   * @param {string} key - Chave
   * @returns {any|null}
   */
  getWithExpiry(key) {
    try {
      const item = this.getItem(key)
      
      if (!item) {
        return null
      }
      
      const now = new Date()
      
      // Verificar se expirou
      if (now.getTime() > item.expiry) {
        this.removeItem(key)
        return null
      }
      
      return item.value
    } catch (error) {
      console.error(`Erro ao obter ${key} com expiração:`, error)
      return null
    }
  },

  /**
   * CLEAR OLD ITEMS - Limpar itens expirados
   */
  clearOldItems() {
    try {
      const keys = this.getAllKeys()
      const now = new Date().getTime()
      
      keys.forEach(key => {
        const item = this.getItem(key)
        
        // Se tem propriedade expiry e está expirado
        if (item && item.expiry && now > item.expiry) {
          this.removeItem(key)
          console.log(`Item expirado removido: ${key}`)
        }
      })
    } catch (error) {
      console.error('Erro ao limpar itens antigos:', error)
    }
  },

  /**
   * EXPORT DATA - Exportar todos os dados
   * @returns {object}
   */
  exportData() {
    try {
      const data = {}
      const keys = this.getAllKeys()
      
      keys.forEach(key => {
        data[key] = this.getItem(key)
      })
      
      return data
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
      return {}
    }
  },

  /**
   * IMPORT DATA - Importar dados
   * @param {object} data - Objeto com os dados
   * @param {boolean} clearFirst - Limpar antes de importar
   */
  importData(data, clearFirst = false) {
    try {
      if (clearFirst) {
        this.clear()
      }
      
      Object.keys(data).forEach(key => {
        this.setItem(key, data[key])
      })
      
      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  },

  /**
   * IS AVAILABLE - Verificar se localStorage está disponível
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  },

  /**
   * GET REMAINING SPACE - Estimar espaço restante (aproximado)
   * @returns {number} - bytes restantes (aproximado)
   */
  getRemainingSpace() {
    try {
      // A maioria dos navegadores tem limite de ~5MB
      const maxSize = 5 * 1024 * 1024 // 5MB em bytes
      const currentSize = this.getSize()
      return maxSize - currentSize
    } catch (error) {
      console.error('Erro ao calcular espaço restante:', error)
      return 0
    }
  },
}

export default storageUtil

// Exemplo de uso:
// import storageUtil from './utils/storageUtil'
//
// // Salvar
// storageUtil.setItem('user', { nome: 'João', idade: 25 })
//
// // Obter
// const user = storageUtil.getItem('user')
//
// // Salvar com expiração (1 hora)
// storageUtil.setWithExpiry('token', 'abc123', 3600000)
//
// // Obter com verificação de expiração
// const token = storageUtil.getWithExpiry('token')
//
// // Remover
// storageUtil.removeItem('user')
//
// // Limpar tudo
// storageUtil.clear()
