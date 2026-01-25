import { useState } from 'react'
import { useToast } from '../components/common/Toast'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import ProductCard from '../components/common/ProductCard'
import OrderCard from '../components/common/OrderCard'
import Modal, { ConfirmModal } from '../components/common/Modal'
import Badge, { StatusBadge, StockBadge, DiscountBadge } from '../components/common/Badge'
import { 
  Spinner, 
  LoadingOverlay, 
  LoadingContainer,
  ProductCardSkeleton 
} from '../components/common/Loading'
import { 
  FiShoppingCart, 
  FiHeart, 
  FiMail,   
  FiLock,
  FiUser 
} from 'react-icons/fi'
import { formatarEndereco } from '../services/checkoutService'

export default function TestComponents() {
  const toast = useToast()
  
  // Estados para controlar modais
  const [showModal, setShowModal] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)

  // Produto de exemplo
  const produtoExemplo = {
    id: 1,
    nome: 'Notebook Gamer Pro',
    descricao: 'Notebook potente para jogos e trabalho pesado',
    preco: { valor: 4999.90 },
    precoPromocional: 3999.90,
    imagem: 'https://placehold.co/600x400/transparent/F00',
    estoque: 5,
    categoria: { nome: 'Eletrônicos' },
    novo: true,
    emPromocao: true,
  }

  // Pedido de exemplo
  const pedidoExemplo = {
    id: 12345,
    dataCriacao: '2025-01-13',
    status: 'ENVIADO',
    total: 4999.90,
    itens: [
      { 
        produto: { 
          nome: 'Notebook', 
          imagem: 'https://placehold.co/600x400/transparent/F00' 
        } 
      },
      { 
        produto: { 
          nome: 'Mouse', 
          imagem: 'https://via.placeholder.com/50' 
        } 
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        🧪 Teste de Componentes
      </h1>

      {/* ========== SEÇÃO 1: BUTTONS ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">1️⃣ Buttons (Botões)</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Variantes:</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => toast.success('Primary clicado!')}>
                Primary
              </Button>
              <Button variant="secondary">
                Secondary
              </Button>
              <Button variant="outline">
                Outline
              </Button>
              <Button variant="danger">
                Danger
              </Button>
              <Button variant="ghost">
                Ghost
              </Button>
              <Button variant="success">
                Success
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Tamanhos:</p>
            <div className="flex items-center gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Com Ícones:</p>
            <div className="flex gap-2">
              <Button leftIcon={<FiShoppingCart />}>
                Adicionar
              </Button>
              <Button variant="outline" leftIcon={<FiHeart />}>
                Favoritar
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Estados:</p>
            <div className="flex gap-2">
              <Button loading={true}>
                Loading...
              </Button>
              <Button disabled>
                Disabled
              </Button>
              <Button fullWidth>
                Full Width
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 2: INPUTS ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">2️⃣ Inputs (Campos)</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          
          <Input
            label="Nome Completo"
            placeholder="Digite seu nome"
            leftIcon={<FiUser />}
          />

          <Input
            type="email"
            label="Email"
            placeholder="seu@email.com"
            leftIcon={<FiMail />}
            helperText="Nunca compartilharemos seu email"
          />

          <Input
            type="password"
            label="Senha"
            placeholder="••••••••"
            leftIcon={<FiLock />}
          />

          <Input
            type="number"
            label="Quantidade"
            placeholder="0"
          />

          <Input
            label="Campo com Erro"
            error="Este campo é obrigatório"
          />

          <div className="grid grid-cols-3 gap-4">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 3: BADGES ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">3️⃣ Badges (Etiquetas)</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Variantes:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Com Dot:</p>
            <div className="flex gap-2">
              <Badge variant="success" dot>Ativo</Badge>
              <Badge variant="danger" dot>Inativo</Badge>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Status de Pedidos:</p>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="PENDENTE" />
              <StatusBadge status="PAGO" />
              <StatusBadge status="ENVIADO" />
              <StatusBadge status="ENTREGUE" />
              <StatusBadge status="CANCELADO" />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Estoque:</p>
            <div className="flex gap-2">
              <StockBadge quantity={50} />
              <StockBadge quantity={5} />
              <StockBadge quantity={0} />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Desconto:</p>
            <DiscountBadge percentage={25} />
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 4: TOAST ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">4️⃣ Toast (Notificações)</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-4">
            Clique nos botões para ver as notificações aparecerem no canto da tela:
          </p>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="success"
              onClick={() => toast.success('Operação realizada com sucesso!')}
            >
              Success Toast
            </Button>
            <Button 
              variant="danger"
              onClick={() => toast.error('Erro ao processar a operação')}
            >
              Error Toast
            </Button>
            <Button 
              variant="warning"
              onClick={() => toast.warning('Atenção: estoque baixo!')}
            >
              Warning Toast
            </Button>
            <Button 
              onClick={() => toast.info('Produto atualizado')}
            >
              Info Toast
            </Button>
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 5: LOADING ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">5️⃣ Loading (Carregamento)</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-6">
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Spinners:</p>
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Loading Container:</p>
            <LoadingContainer loading={loading} message="Carregando dados...">
              <div className="p-4 bg-green-50 rounded">
                <p className="text-green-800">✅ Conteúdo carregado!</p>
              </div>
            </LoadingContainer>
            <Button 
              onClick={() => setLoading(!loading)}
              className="mt-2"
            >
              Toggle Loading
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Loading Overlay (Tela Inteira):</p>
            <Button onClick={() => {
              setShowOverlay(true)
              setTimeout(() => setShowOverlay(false), 2000)
            }}>
              Mostrar Overlay (2s)
            </Button>
            {showOverlay && <LoadingOverlay message="Processando..." />}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Skeleton (Placeholder):</p>
            <div className="grid grid-cols-3 gap-4">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 6: MODALS ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">6️⃣ Modals (Janelas)</h2>
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          
          <Button onClick={() => setShowModal(true)}>
            Abrir Modal Customizado
          </Button>

          <Button 
            variant="danger"
            onClick={() => setShowConfirm(true)}
          >
            Abrir Modal de Confirmação
          </Button>

          {/* Modal Customizado */}
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Exemplo de Modal"
            size="lg"
            footer={
              <>
                <Button variant="ghost" onClick={() => setShowModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={() => {
                  toast.success('Modal confirmado!')
                  setShowModal(false)
                }}>
                  Confirmar
                </Button>
              </>
            }
          >
            <p className="text-gray-700">
              Este é um exemplo de modal customizado. Você pode colocar qualquer conteúdo aqui:
              formulários, textos, imagens, etc.
            </p>
            <Input 
              label="Campo de exemplo" 
              placeholder="Digite algo..."
              className="mt-4"
            />
          </Modal>

          {/* Modal de Confirmação */}
          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => {
              toast.success('Item excluído!')
              setShowConfirm(false)
            }}
            title="Confirmar Exclusão"
            message="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
            confirmText="Sim, excluir"
            cancelText="Cancelar"
            variant="danger"
          />
        </div>
      </section>

      {/* ========== SEÇÃO 7: CARDS ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">7️⃣ Cards</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Product Card:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProductCard
              product={produtoExemplo}
              onAddToCart={(p) => toast.success(`${p.nome} adicionado!`)}
              onToggleFavorite={(p) => toast.info(`${p.nome} favoritado!`)}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Order Card:</h3>
          <div className="max-w-2xl">
            <OrderCard order={pedidoExemplo} />
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 5: FORMATAÇÃO DE ENDEREÇO ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">5️⃣ Formatação de Endereço</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-4">
            Teste da função de formatação de endereço:
          </p>
          
          {/* Endereço de teste */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Endereço Original:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                {`{"cep":"91751-775","rua":"Viela Um","numero":"1","complemento":"(Av Ver Roberto Landell Moura)","bairro":"Ipanema","cidade":"Porto Alegre","estado":"RS"}`}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Endereço Formatado:</h3>
              <div className="bg-green-50 border border-green-200 p-3 rounded">
                <p className="text-green-800 font-medium">
                  {formatarEndereco({
                    cep: "91751-775",
                    rua: "Viela Um",
                    numero: "1",
                    complemento: "(Av Ver Roberto Landell Moura)",
                    bairro: "Ipanema",
                    cidade: "Porto Alegre",
                    estado: "RS"
                  })}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Exemplo Completo:</h3>
              <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                <p className="text-blue-800 font-medium">
                  {formatarEndereco({
                    cep: "01234-567",
                    rua: "Rua das Flores",
                    numero: "123",
                    complemento: "Apto 45",
                    bairro: "Centro",
                    cidade: "São Paulo",
                    estado: "SP"
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 6: TESTE DE CÁLCULO DE PREÇOS ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">6️⃣ Teste de Cálculo de Preços</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-4">
            Teste da função de extração de valores de preço:
          </p>
          
          {/* Função de teste */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Função getPrecoValue:</h3>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                {`const getPrecoValue = (preco) => {
  if (typeof preco === 'object' && preco !== null) {
    return preco.valor || 0
  }
  return preco || 0
}`}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Testes:</h3>
              <div className="space-y-2">
                {(() => {
                  const getPrecoValue = (preco) => {
                    if (typeof preco === 'object' && preco !== null) {
                      return preco.valor || 0
                    }
                    return preco || 0
                  }
                  
                  return (
                    <>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm"><strong>Objeto:</strong> {`{valor: 299.90}`}</p>
                        <p className="text-sm"><strong>Resultado:</strong> <span className="font-mono">{getPrecoValue({valor: 299.90})}</span></p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm"><strong>Número:</strong> {`299.90`}</p>
                        <p className="text-sm"><strong>Resultado:</strong> <span className="font-mono">{getPrecoValue(299.90)}</span></p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded">
                        <p className="text-sm"><strong>Nulo:</strong> {`null`}</p>
                        <p className="text-sm"><strong>Resultado:</strong> <span className="font-mono">{getPrecoValue(null)}</span></p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SEÇÃO 7: TESTE DE ORDER CARD ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">7️⃣ Teste de OrderCard</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-4">
            Teste do componente OrderCard com diferentes formatos de total:
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">OrderCard com total em objeto:</h3>
              <OrderCard 
                order={{
                  id: 'PED123456',
                  dataCriacao: '2026-01-24T10:00:00Z',
                  status: 'ENTREGUE',
                  total: { valor: 599.90 },
                  itens: [
                    { id: 1, produto: { nome: 'Produto Teste', imagem: 'https://via.placeholder.com/60' }, quantidade: 2 }
                  ],
                  endereco: {
                    rua: 'Rua das Flores',
                    numero: '123',
                    bairro: 'Centro',
                    cidade: 'São Paulo',
                    estado: 'SP'
                  }
                }}
              />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">OrderCard com valores.total:</h3>
              <OrderCard 
                order={{
                  id: 'PED123457',
                  dataCriacao: '2026-01-24T11:00:00Z',
                  status: 'PAGO',
                  valores: { total: 299.90 },
                  itens: [
                    { id: 2, produto: { nome: 'Produto Teste 2', imagem: 'https://via.placeholder.com/60' }, quantidade: 1 }
                  ],
                  endereco: {
                    rua: 'Rua das Acácias',
                    numero: '456',
                    bairro: 'Jardins',
                    cidade: 'São Paulo',
                    estado: 'SP'
                  }
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== RESUMO ========== */}
      <section className="mb-12">
        <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded">
          <h3 className="text-lg font-bold text-primary-900 mb-2">
            ✅ Todos os Componentes Testados!
          </h3>
          <p className="text-primary-800">
            Se você consegue ver esta página sem erros, todos os componentes estão funcionando corretamente!
          </p>
          <p className="text-primary-800 mt-2">
            Pressione F12 para abrir o Console e verificar se não há erros.
          </p>
        </div>
      </section>

      {/* ========== SEÇÃO 8: TESTE DE FLUXO COMPLETO ========== */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">8️⃣ Teste de Fluxo Completo</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-sm text-gray-600 mb-4">
            Teste do fluxo completo do checkout:
          </p>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Problemas Resolvidos:</h3>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                <li>Modal de sucesso agora exibe corretamente</li>
                <li>Checkout finaliza pedido com sucesso</li>
                <li>Página de detalhes do pedido criada</li>
                <li>Rota /pedido/:id configurada</li>
                <li>Cálculos de preço corrigidos</li>
                <li>Funções mock atualizadas</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">🔄 Fluxo Testado:</h3>
              <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
                <li>Adicionar produtos ao carrinho</li>
                <li>Acessar página de checkout</li>
                <li>Preencher endereço de entrega</li>
                <li>Selecionar forma de pagamento</li>
                <li>Clicar em "Confirmar Pedido"</li>
                <li>Modal de sucesso exibido</li>
                <li>Redirecionado para página de detalhes</li>
                <li>Informações do pedido exibidas corretamente</li>
              </ol>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">📋 Próximos Passos:</h3>
              <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                <li>Testar com USE_MOCK = false (API real)</li>
                <li>Implementar integração de pagamento real</li>
                <li>Adicionar notificações por email</li>
                <li>Implementar webhook de pagamento</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}