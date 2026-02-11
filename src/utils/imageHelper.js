/**
 * Image Helper
 * 
 * Utilitário simples para gerenciar URLs de imagens
 * Backend já retorna URLs completas prontas para uso
 */

const PLACEHOLDER = 'https://placehold.co/600x400/e5e7eb/6b7280?text=Sem+Imagem'

/**
 * Retorna URL da imagem ou placeholder se não houver
 * 
 * @param {string} urlImagem - URL completa da imagem do backend
 * @returns {string} URL da imagem ou placeholder
 */
export const getProductImageUrl = (urlImagem) => {
  return urlImagem && urlImagem.trim() !== '' ? urlImagem : PLACEHOLDER
}

/**
 * Retorna placeholder com texto customizado
 * 
 * @param {string} text - Texto do placeholder
 * @returns {string} URL do placeholder
 */
export const getPlaceholder = (text = 'Sem+Imagem') => {
  return `https://placehold.co/600x400/e5e7eb/6b7280?text=${text.replace(/ /g, '+')}`
}

export default {
  getProductImageUrl,
  getPlaceholder
}