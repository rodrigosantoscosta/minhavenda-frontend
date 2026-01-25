import { Link } from 'react-router-dom'
import Button from '../common/Button'
import { FiShoppingBag, FiTruck, FiTag } from 'react-icons/fi'

export default function Hero() {
  return (
    <div className="relative bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
      {/* Padrão de Fundo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Conteúdo */}
          <div className="text-white">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full mb-6">
              <FiTag className="mr-2" />
              <span className="text-sm font-medium">Ofertas de até 50% OFF</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Encontre os melhores <span className="text-primary-200">produtos</span> com os melhores <span className="text-primary-200">preços</span>
            </h1>

            <p className="text-xl text-primary-100 mb-8">
              Milhares de produtos em diversas categorias. Entrega rápida e segura para todo o Brasil.
            </p>

            {/* <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/produtos">
                <Button variant="white" size="lg" className="shadow-lg">
                  <FiShoppingBag className="mr-2" />
                  Ver Produtos
                </Button>
              </Link>
              <Link to="/produtos?promocao=true">
                <Button variant="outline-white" size="lg">
                  <FiTag className="mr-2" />
                  Ver Ofertas
                </Button>
              </Link>
            </div> */}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-12">
              <div className="text-center">
                <FiTruck className="text-3xl mx-auto mb-2" />
                <p className="text-sm font-medium">Frete Grátis</p>
                <p className="text-xs text-primary-200">em compras acima de R$ 99</p>
              </div>
              <div className="text-center">
                <FiTag className="text-3xl mx-auto mb-2" />
                <p className="text-sm font-medium">Ofertas Diárias</p>
                <p className="text-xs text-primary-200">produtos com desconto</p>
              </div>
              <div className="text-center">
                <FiShoppingBag className="text-3xl mx-auto mb-2" />
                <p className="text-sm font-medium">Compra Segura</p>
                <p className="text-xs text-primary-200">ambiente protegido</p>
              </div>
            </div>
          </div>

          {/* Imagem/Ilustração */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Círculo de fundo */}
              <div className="absolute inset-0 bg-white bg-opacity-10 rounded-full blur-3xl" />
              
              {/* Imagem placeholder - substituir por imagem real */}
              <img
                src="https://placehold.net/5-600x600.png"
                alt="Shopping"
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Onda decorativa */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="#F9FAFB"
          />
        </svg>
      </div>
    </div>
  )
}
