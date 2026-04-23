/**
 * Image Helper
 *
 * Simple utility for managing image URLs
 * Backend already returns complete URLs ready for use
 */

const PLACEHOLDER = 'https://placehold.co/600x400/e5e7eb/6b7280?text=Sem+Imagem'

/**
 * Returns product image URL or placeholder if empty
 *
 * @param urlImagem - Complete image URL from backend
 * @returns Image URL or placeholder
 */
export const getProductImageUrl = (urlImagem: string | undefined): string => {
  return urlImagem && urlImagem.trim() !== '' ? urlImagem : PLACEHOLDER
}

/**
 * Returns placeholder with custom text
 *
 * @param text - Placeholder text
 * @returns Placeholder URL
 */
export const getPlaceholder = (text = 'Sem+Imagem'): string => {
  return `https://placehold.co/600x400/e5e7eb/6b7280?text=${text.replace(/ /g, '+')}`
}

export default {
  getProductImageUrl,
  getPlaceholder
}
