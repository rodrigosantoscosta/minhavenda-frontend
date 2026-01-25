import { Link } from 'react-router-dom'
import Button from '../components/common/Button'
import { FiHome, FiSearch, FiAlertCircle } from 'react-icons/fi'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        
        {/* Ícone */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <FiAlertCircle className="text-red-600" size={48} />
          </div>
        </div>

        {/* Número 404 */}
        <h1 className="text-9xl font-bold text-primary-600 mb-4">
          404
        </h1>
        
        {/* Título */}
        <h2 className="text-3xl font-semibold text-gray-900 mb-4">
          Página não encontrada
        </h2>
        
        {/* Descrição */}
        <p className="text-gray-600 text-lg mb-8">
          Ops! A página que você está procurando não existe ou foi movida para outro lugar.
        </p>
        
        {/* Sugestões */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <p className="text-gray-700 font-medium mb-3">
            Aqui estão algumas sugestões:
          </p>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Verifique se o endereço está correto</li>
            <li>• Volte para a página inicial</li>
            <li>• Procure o produto que deseja</li>
            <li>• Entre em contato com nossa equipe</li>
          </ul>
        </div>

        {/* Botões */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              <FiHome className="mr-2" />
              Voltar para Home
            </Button>
          </Link>
          
          <Link to="/produtos">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <FiSearch className="mr-2" />
              Ver Produtos
            </Button>
          </Link>
        </div>

        {/* Link de ajuda */}
        <div className="mt-8">
          <p className="text-sm text-gray-500">
            Precisa de ajuda?{' '}
            <Link to="/contato" className="text-primary-600 hover:text-primary-700 font-medium">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}