// src/components/product/ImageGallery.jsx - GALERIA DE IMAGENS
import { useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export default function ImageGallery({ 
  images = [], 
  selectedIndex = 0, 
  onSelectImage 
}) {
  const [imageError, setImageError] = useState(false)
  
  // Se não houver imagens, usar placeholder
  const imageList = images.length > 0 
    ? images 
    : ['https://placehold.co/600x400/transparent/F00']

  const currentImage = imageList[selectedIndex] || imageList[0]

  const handlePrevious = () => {
    const newIndex = selectedIndex === 0 ? imageList.length - 1 : selectedIndex - 1
    onSelectImage(newIndex)
  }

  const handleNext = () => {
    const newIndex = selectedIndex === imageList.length - 1 ? 0 : selectedIndex + 1
    onSelectImage(newIndex)
  }

  return (
    <div className="space-y-4">
      {/* Imagem Principal */}
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
        <img
          src={imageError ? 'https://placehold.co/600x400/transparent/F00' : currentImage}
          alt="Produto"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
        
        {/* Navegação (aparece no hover se tiver múltiplas imagens) */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Imagem anterior"
            >
              <FiChevronLeft size={24} />
            </button>
            
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Próxima imagem"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Indicador de Posição */}
        {imageList.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {imageList.map((_, index) => (
              <button
                key={index}
                onClick={() => onSelectImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-white w-8'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
                aria-label={`Ir para imagem ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails (miniaturas) */}
      {imageList.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {imageList.map((image, index) => (
            <button
              key={index}
              onClick={() => onSelectImage(index)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-primary-600 ring-2 ring-primary-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x400/transparent/F00'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
