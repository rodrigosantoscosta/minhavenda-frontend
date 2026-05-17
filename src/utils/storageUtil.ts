/**
 * Utility for safe localStorage manipulation
 * Adds error handling and automatic serialization
 */
import logger from './logger'

interface StorageItemWithExpiry {
  value: unknown
  expiry: number
}

const storageUtil = {
  /**
   * SET ITEM - Save item to localStorage
   * @param key - Item key
   * @param value - Value (will be JSON stringified automatically)
   * @returns true if saved successfully
   */
  setItem(key: string, value: unknown): boolean {
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
      return true
    } catch (error) {
      logger.error({ err: error, key }, `Erro ao salvar ${key} no localStorage`)

      // Check if quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.warn('localStorage cheio! Limpando itens antigos...')
        this.clearOldItems()
      }

      return false
    }
  },

  /**
   * GET ITEM - Get item from localStorage
   * @param key - Item key
   * @param defaultValue - Default value if not found
   * @returns Deserialized value or defaultValue
   */
  getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(key)

      if (item === null) {
        return defaultValue
      }

      return JSON.parse(item) as T
    } catch (error) {
      logger.error({ err: error, key }, `Erro ao ler ${key} do localStorage`)
      return defaultValue
    }
  },

  /**
   * REMOVE ITEM - Remove item from localStorage
   * @param key - Item key
   * @returns true if removed successfully
   */
  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logger.error({ err: error, key }, `Erro ao remover ${key} do localStorage`)
      return false
    }
  },

  /**
   * CLEAR - Clear all localStorage
   * @returns true if cleared successfully
   */
  clear(): boolean {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      logger.error({ err: error }, 'Erro ao limpar localStorage')
      return false
    }
  },

  /**
   * HAS ITEM - Check if item exists
   * @param key - Item key
   * @returns true if item exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null
  },

  /**
   * GET ALL KEYS - Get all keys
   * @returns Array of all keys
   */
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage)
    } catch (error) {
      logger.error({ err: error }, 'Erro ao obter chaves')
      return []
    }
  },

  /**
   * GET SIZE - Get used size in bytes (approximate)
   * @returns Size in bytes
   */
  getSize(): number {
    try {
      let total = 0
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          total += localStorage[key].length + key.length
        }
      }
      return total
    } catch (error) {
      logger.error({ err: error }, 'Erro ao calcular tamanho')
      return 0
    }
  },

  /**
   * SET WITH EXPIRY - Save with expiration date
   * @param key - Key
   * @param value - Value
   * @param ttl - Time to live in milliseconds
   */
  setWithExpiry(key: string, value: unknown, ttl: number): void {
    try {
      const now = new Date()
      const item: StorageItemWithExpiry = {
        value: value,
        expiry: now.getTime() + ttl,
      }
      this.setItem(key, item)
    } catch (error) {
      logger.error({ err: error, key }, `Erro ao salvar ${key} com expiração`)
    }
  },

  /**
   * GET WITH EXPIRY - Get item with expiration check
   * @param key - Key
   * @returns Value or null if expired/not found
   */
  getWithExpiry<T>(key: string): T | null {
    try {
      const item = this.getItem<StorageItemWithExpiry>(key)

      if (!item) {
        return null
      }

      const now = new Date()

      // Check if expired
      if (now.getTime() > item.expiry) {
        this.removeItem(key)
        return null
      }

      return item.value as T
    } catch (error) {
      logger.error({ err: error, key }, `Erro ao obter ${key} com expiração`)
      return null
    }
  },

  /**
   * CLEAR OLD ITEMS - Clear expired items
   */
  clearOldItems(): void {
    try {
      const keys = this.getAllKeys()
      const now = new Date().getTime()

      keys.forEach(key => {
        const item = this.getItem<StorageItemWithExpiry>(key)

        // If has expiry property and is expired
        if (item && item.expiry && now > item.expiry) {
          this.removeItem(key)
        }
      })
    } catch (error) {
      logger.error({ err: error }, 'Erro ao limpar itens antigos')
    }
  },

  /**
   * EXPORT DATA - Export all data
   * @returns Object with all data
   */
  exportData(): Record<string, unknown> {
    try {
      const data: Record<string, unknown> = {}
      const keys = this.getAllKeys()

      keys.forEach(key => {
        data[key] = this.getItem(key)
      })

      return data
    } catch (error) {
      logger.error({ err: error }, 'Erro ao exportar dados')
      return {}
    }
  },

  /**
   * IMPORT DATA - Import data
   * @param data - Object with data
   * @param clearFirst - Clear before importing
   * @returns true if imported successfully
   */
  importData(data: Record<string, unknown>, clearFirst = false): boolean {
    try {
      if (clearFirst) {
        this.clear()
      }

      Object.keys(data).forEach(key => {
        this.setItem(key, data[key])
      })

      return true
    } catch (error) {
      logger.error({ err: error }, 'Erro ao importar dados')
      return false
    }
  },

  /**
   * IS AVAILABLE - Check if localStorage is available
   * @returns true if available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      logger.warn({ err: error }, 'localStorage não disponível')
      return false
    }
  },

  /**
   * GET REMAINING SPACE - Estimate remaining space (approximate)
   * @returns Remaining bytes (approximate)
   */
  getRemainingSpace(): number {
    try {
      // Most browsers have ~5MB limit
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      const currentSize = this.getSize()
      return maxSize - currentSize
    } catch (error) {
      logger.error({ err: error }, 'Erro ao calcular espaço restante')
      return 0
    }
  },
}

export default storageUtil
