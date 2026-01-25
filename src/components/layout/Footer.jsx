import { Link } from 'react-router-dom'
import { 
  FiMail, 
  FiPhone, 
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin
} from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-primary-600 text-white font-bold text-xl px-2 py-1 rounded">
                MV
              </div>
              <span className="text-white text-xl font-bold">MinhaVenda</span>
            </div>
            <p className="text-sm mb-4">
              Sua loja online com os melhores produtos e preços. Qualidade e confiança em cada compra.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <FiFacebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <FiInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <FiTwitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 p-2 rounded-full hover:bg-primary-600 transition-colors"
              >
                <FiLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition-colors">
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link to="/produtos" className="hover:text-primary-400 transition-colors">
                  Produtos
                </Link>
              </li>
              <li>
                <Link to="/categorias" className="hover:text-primary-400 transition-colors">
                  Categorias
                </Link>
              </li>
              <li>
                <Link to="/ofertas" className="hover:text-primary-400 transition-colors">
                  Ofertas
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-primary-400 transition-colors">
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/ajuda" className="hover:text-primary-400 transition-colors">
                  Central de Ajuda
                </Link>
              </li>
              <li>
                <Link to="/rastreio" className="hover:text-primary-400 transition-colors">
                  Rastrear Pedido
                </Link>
              </li>
              <li>
                <Link to="/trocas" className="hover:text-primary-400 transition-colors">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary-400 transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/politica-privacidade" className="hover:text-primary-400 transition-colors">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <FiMapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  Rua Exemplo, 123<br />
                  Centro - São Paulo, SP<br />
                  CEP 01234-567
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="w-5 h-5 flex-shrink-0" />
                <a href="tel:+551112345678" className="hover:text-primary-400 transition-colors">
                  (11) 1234-5678
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FiMail className="w-5 h-5 flex-shrink-0" />
                <a href="mailto:contato@minhavenda.com.br" className="hover:text-primary-400 transition-colors">
                  contato@minhavenda.com.br
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Newsletter</h4>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Assinar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm font-medium text-white mb-2">
                Formas de Pagamento
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  💳 Visa
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  💳 Mastercard
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  💳 Elo
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  🏦 PIX
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  📄 Boleto
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-sm font-medium text-white mb-2">
                Segurança
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  🔒 SSL
                </div>
                <div className="bg-white px-3 py-1 rounded text-xs font-medium text-gray-700">
                  ✓ Site Seguro
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <p>
              © {currentYear} MinhaVenda. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <Link to="/termos" className="hover:text-primary-400 transition-colors">
                Termos de Uso
              </Link>
              <Link to="/politica-privacidade" className="hover:text-primary-400 transition-colors">
                Privacidade
              </Link>
              <Link to="/cookies" className="hover:text-primary-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
