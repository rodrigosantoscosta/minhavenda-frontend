import { useState } from 'react'

import type { Product } from '../../types'

export default function ProductInfo({ produto }: { produto: Product }) {
  const [activeTab, setActiveTab] = useState('descricao')

  const tabs = [
    { id: 'descricao', label: 'Descrição' },
    { id: 'especificacoes', label: 'Especificações' },
    { id: 'avaliacoes', label: 'Avaliações' },
    { id: 'entrega', label: 'Entrega e Devoluções' },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="p-6">
        
        {/* Tab: Descrição */}
        {activeTab === 'descricao' && (
          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Sobre este produto</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              {produto.descricao || 'Descrição não disponível.'}
            </p>
            
            {produto.descricaoDetalhada && (
              <div 
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: produto.descricaoDetalhada }}
              />
            )}

            {/* Placeholder se não houver descrição */}
            {!produto.descricao && !produto.descricaoDetalhada && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-500">
                  Este produto ainda não possui descrição detalhada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Especificações */}
        {activeTab === 'especificacoes' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Especificações Técnicas</h3>
            
            {produto.especificacoes ? (
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(produto.especificacoes).map(([key, value]) => (
                    <tr key={key}>
                      <td className="py-3 pr-4 text-sm font-medium text-gray-900 w-1/3">
                        {key}
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Placeholder com especificações mock
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900 w-1/3">
                      SKU
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {produto.id || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                      Categoria
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {produto.categoria?.nome || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                      Disponibilidade
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {produto.estoque > 0 ? 'Em estoque' : 'Indisponível'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                      Peso
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {produto.peso ? `${produto.peso} kg` : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-sm font-medium text-gray-900">
                      Dimensões
                    </td>
                    <td className="py-3 text-sm text-gray-700">
                      {produto.dimensoes || 'N/A'}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab: Avaliações */}
        {activeTab === 'avaliacoes' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Avaliações dos Clientes</h3>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-2">
                Este produto ainda não possui avaliações.
              </p>
              <p className="text-sm text-gray-400">
                Seja o primeiro a avaliar este produto!
              </p>
            </div>

            {/* Placeholder para futura implementação de avaliações */}
            {/* 
            <div className="space-y-4">
              <AvaliacaoItem />
              <AvaliacaoItem />
            </div>
            */}
          </div>
        )}

        {/* Tab: Entrega e Devoluções */}
        {activeTab === 'entrega' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Informações de Entrega</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">📦 Opções de Entrega</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Entrega Normal: 5-10 dias úteis</li>
                  <li>• Entrega Expressa: 2-3 dias úteis (taxa adicional)</li>
                  <li>• Frete Grátis para compras acima de R$ 99,00</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Política de Devolução</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 30 dias para devolução ou troca</li>
                  <li>• Produto deve estar em perfeito estado</li>
                  <li>• Embalagem original preservada</li>
                  <li>• Devolução grátis em caso de defeito</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">✅ Garantia</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• Garantia do fabricante: 12 meses</li>
                  <li>• Garantia estendida disponível</li>
                  <li>• Assistência técnica autorizada</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
