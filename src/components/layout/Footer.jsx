import { Link } from 'react-router-dom'
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiLinkedin,
} from 'react-icons/fi'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const quickLinks = [
    { to: '/',         label: 'Página Inicial' },
    { to: '/produtos', label: 'Produtos' },
    { to: '/ofertas',  label: 'Ofertas' },
    { to: '/sobre',    label: 'Sobre Nós' },
  ]

  const serviceLinks = [
    { to: '/ajuda',               label: 'Central de Ajuda' },
    { to: '/rastreio',            label: 'Rastrear Pedido' },
    { to: '/trocas',              label: 'Trocas e Devoluções' },
    { to: '/faq',                 label: 'Perguntas Frequentes' },
    { to: '/politica-privacidade',label: 'Privacidade' },
  ]

  const socials = [
    { href: 'https://facebook.com',  Icon: FiFacebook,  label: 'Facebook' },
    { href: 'https://instagram.com', Icon: FiInstagram, label: 'Instagram' },
    { href: 'https://twitter.com',   Icon: FiTwitter,   label: 'Twitter' },
    { href: 'https://linkedin.com',  Icon: FiLinkedin,  label: 'LinkedIn' },
  ]

  const paymentMethods = ['Visa', 'Mastercard', 'Elo', 'PIX', 'Boleto']

  return (
    <footer className="bg-gray-950 text-gray-400 font-sans">

      {/* Accent top line */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary-600 to-transparent" />

      {/* Main */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="bg-primary-600 rounded-xl p-1.5">
                <div className="bg-primary-500 rounded-lg w-7 h-7 flex items-center justify-center">
                  <span className="font-display font-bold text-white text-sm leading-none">MV</span>
                </div>
              </div>
              <span className="font-display font-bold text-white text-xl tracking-tight">MinhaVenda</span>
            </Link>

            <p className="text-sm leading-relaxed text-pretty mb-6">
              Sua loja online com os melhores produtos e preços. Qualidade e confiança em cada compra.
            </p>

            {/* Social icons — clean icon-only, hover primary color */}
            <div className="flex items-center gap-3">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex items-center justify-center w-9 h-9 rounded-xl text-gray-500 hover:text-primary-400 hover:bg-white/5 transition-[color,background-color] duration-150"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-5 tracking-wide uppercase text-xs">
              Links Rápidos
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm hover:text-primary-400 transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service */}
          <div>
            <h3 className="font-display font-semibold text-white text-xs mb-5 tracking-wide uppercase">
              Atendimento
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm hover:text-primary-400 transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + newsletter */}
          <div>
            <h3 className="font-display font-semibold text-white text-xs mb-5 tracking-wide uppercase">
              Contato
            </h3>
            <ul className="space-y-3 text-sm mb-7">
              <li className="flex items-start gap-3">
                <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-600" />
                <span className="leading-relaxed">Rua Exemplo, 123<br />Centro — São Paulo, SP</span>
              </li>
              <li className="flex items-center gap-3">
                <FiPhone className="w-4 h-4 shrink-0 text-gray-600" />
                <a href="tel:+551112345678" className="hover:text-primary-400 transition-colors duration-150">
                  (11) 1234-5678
                </a>
              </li>
              <li className="flex items-center gap-3">
                <FiMail className="w-4 h-4 shrink-0 text-gray-600" />
                <a href="mailto:contato@minhavenda.com.br" className="hover:text-primary-400 transition-colors duration-150 truncate">
                  contato@minhavenda.com.br
                </a>
              </li>
            </ul>

            {/* Newsletter */}
            <p className="text-xs font-display font-semibold text-white uppercase tracking-wide mb-3">Newsletter</p>
            <div className="flex rounded-xl overflow-hidden shadow-card">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="flex-1 px-3 py-2.5 bg-white/5 border border-white/10 border-r-0 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm text-white placeholder-gray-600 font-sans"
              />
              <button
                type="button"
                className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-sans font-medium rounded-r-xl transition-colors duration-150 active:scale-[0.96] transition-transform"
              >
                Assinar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment methods — text pills, no emoji */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
              <span className="text-xs font-display font-semibold text-gray-600 uppercase tracking-wide">
                Pagamento
              </span>
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-sans font-medium text-gray-500"
                >
                  {method}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-sans font-medium text-gray-500">
                SSL Seguro
              </span>
              <span className="px-2.5 py-1 rounded-lg border border-white/10 text-xs font-sans font-medium text-gray-500">
                Site Verificado
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <p className="font-sans">© {currentYear} MinhaVenda. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              {[
                { to: '/termos',               label: 'Termos de Uso' },
                { to: '/politica-privacidade', label: 'Privacidade' },
                { to: '/cookies',              label: 'Cookies' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="hover:text-primary-400 transition-colors duration-150">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
