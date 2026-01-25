// src/services/authService.js - CORRIGIDO
import api from './api'

const authService = {
  /**
   * Login do usuário
   */
  async login(email, senha) {
    try {
      console.log('🔄 authService.login chamado:', { email })
      
      const response = await api.post('/auth/login', {
        email,
        senha
      })

      console.log('📦 Resposta da API:', response.data)

      // Tratar diferentes formatos de resposta
      const data = response.data
      
      // Formato 1: { token, user: { nome, email, ... } }
      if (data.token && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return data
      }
      
      // Formato 2: { token, nome, email, ... } (dados do user no mesmo nível)
      if (data.token && data.nome) {
        const user = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          tipo: data.tipo
        }
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { token: data.token, user }
      }
      
      // Formato 3: Somente token (buscar user depois)
      if (data.token) {
        localStorage.setItem('token', data.token)
        
        // Criar user básico com email
        const user = { email }
        localStorage.setItem('user', JSON.stringify(user))
        
        console.warn('⚠️ Backend retornou apenas token, criando user básico')
        return { token: data.token, user }
      }
      
      throw new Error('Resposta do servidor inválida: sem token')
      
    } catch (error) {
      console.error('❌ Erro no authService.login:', error)
      throw error
    }
  },

  /**
   * Registro de novo usuário
   */
  async register(nome, email, senha) {
    try {
      console.log('🔄 authService.register chamado:', { nome, email })
      
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha
      })

      console.log('📦 Resposta da API:', response.data)

      const data = response.data
      
      // Formato 1: { token, user: { nome, email, ... } }
      if (data.token && data.user) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        return data
      }
      
      // Formato 2: { token, nome, email, ... }
      if (data.token && data.nome) {
        const user = {
          id: data.id,
          nome: data.nome,
          email: data.email,
          tipo: data.tipo
        }
        
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(user))
        
        return { token: data.token, user }
      }
      
      // Formato 3: Somente token
      if (data.token) {
        localStorage.setItem('token', data.token)
        
        const user = { nome, email }
        localStorage.setItem('user', JSON.stringify(user))
        
        console.warn('⚠️ Backend retornou apenas token, criando user básico')
        return { token: data.token, user }
      }
      
      throw new Error('Resposta do servidor inválida: sem token')
      
    } catch (error) {
      console.error('❌ Erro no authService.register:', error)
      throw error
    }
  },

  /**
   * Logout do usuário
   */
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    console.log('🔄 localStorage limpo')
  },

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated() {
    const token = localStorage.getItem('token')
    return !!token
  },

  /**
   * Obter usuário logado
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('❌ Erro ao parsear user do localStorage:', error)
      return null
    }
  },

  /**
   * Obter token
   */
  getToken() {
    return localStorage.getItem('token')
  },

  /**
   * Atualizar dados do usuário no localStorage
   */
  updateCurrentUser(updatedUser) {
    try {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      console.log('✅ User atualizado no localStorage')
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
    }
  }
}

export default authService