/**
 * src/mocks/factories.js
 *
 * Faker-powered data factories shared by all mock services.
 * Uses a fixed seed so data is stable across reloads — great for portfolio demos.
 */
import { faker } from '@faker-js/faker/locale/pt_BR'

faker.seed(42)

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORY_DEFS = [
  { id: 'cat-1', nome: 'Eletrônicos',    slug: 'eletronicos' },
  { id: 'cat-2', nome: 'Informática',    slug: 'informatica' },
  { id: 'cat-3', nome: 'Roupas',         slug: 'roupas' },
  { id: 'cat-4', nome: 'Calçados',       slug: 'calcados' },
  { id: 'cat-5', nome: 'Casa e Cozinha', slug: 'casa-cozinha' },
  { id: 'cat-6', nome: 'Esportes',       slug: 'esportes' },
  { id: 'cat-7', nome: 'Livros',         slug: 'livros' },
  { id: 'cat-8', nome: 'Beleza',         slug: 'beleza' },
]

export const getCategorias = () => CATEGORY_DEFS

// ─── Products ─────────────────────────────────────────────────────────────────

// Deterministic names per category so they look realistic
const PRODUCT_NAMES = {
  'cat-1': ['Smart TV 55"', 'Fone Bluetooth', 'Caixa de Som Portátil', 'Smartwatch', 'Câmera de Segurança', 'Projetor Full HD', 'Carregador Sem Fio', 'Echo Dot 5ª Geração'],
  'cat-2': ['Notebook Gamer', 'Mouse Sem Fio', 'Teclado Mecânico', 'Monitor 27" 4K', 'SSD 1TB', 'Webcam Full HD', 'Headset USB', 'Hub USB-C 7 em 1'],
  'cat-3': ['Camiseta Básica', 'Calça Jeans Slim', 'Moletom com Capuz', 'Jaqueta Corta-Vento', 'Vestido Floral', 'Camisa Social', 'Bermuda Cargo', 'Blusa Cropped'],
  'cat-4': ['Tênis Running', 'Sapatênis Casual', 'Bota Couro', 'Sandália Confort', 'Chinelo Premium', 'Tênis Skate', 'Mocassim Masculino', 'Scarpin Salto Fino'],
  'cat-5': ['Panela de Pressão', 'Conjunto de Facas', 'Cafeteira Espresso', 'Liquidificador Pro', 'Air Fryer 5L', 'Jogo de Panelas', 'Aspirador Robô', 'Ferro a Vapor'],
  'cat-6': ['Tênis de Corrida', 'Luvas de Boxe', 'Mochila Esportiva', 'Garrafa Térmica', 'Tapete de Yoga', 'Halteres 10kg', 'Corda de Pular', 'Bicicleta Ergométrica'],
  'cat-7': ['Clean Code', 'O Senhor dos Anéis', 'Sapiens', 'O Poder do Hábito', 'Mindset', 'Pai Rico Pai Pobre', 'Arquitetura Limpa', 'Domain-Driven Design'],
  'cat-8': ['Kit Skincare', 'Perfume Importado', 'Sérum Vitamina C', 'Protetor Solar FPS50', 'Paleta de Sombras', 'Shampoo Profissional', 'Creme Hidratante', 'Escova Elétrica'],
}

// Stable image seeds per product index (picsum uses seed for deterministic images)
const picsumUrl = (seed, w = 400, h = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

let _productPool = null

/**
 * Build a deterministic pool of products once.
 * Calling this multiple times returns the same array.
 */
export const getProductPool = () => {
  if (_productPool) return _productPool

  const products = []
  let globalIndex = 1

  CATEGORY_DEFS.forEach((cat) => {
    const names = PRODUCT_NAMES[cat.id]
    names.forEach((nome, i) => {
      const seed = `prod-${cat.id}-${i}`
      // Use a local faker instance re-seeded per product for stable values
      faker.seed(globalIndex * 7 + 13)

      const precoBase = faker.number.float({ min: 49.9, max: 2499.9, fractionDigits: 2 })
      const temDesconto = faker.datatype.boolean({ probability: 0.35 })
      const precoPromocional = temDesconto
        ? parseFloat((precoBase * faker.number.float({ min: 0.6, max: 0.9, fractionDigits: 2 })).toFixed(2))
        : null
      const estoque = faker.helpers.weightedArrayElement([
        { weight: 5, value: faker.number.int({ min: 10, max: 200 }) },
        { weight: 2, value: faker.number.int({ min: 1, max: 5 }) },
        { weight: 1, value: 0 },
      ])
      const novo = globalIndex <= 8 // first 8 products are "novo"
      const destaque = faker.datatype.boolean({ probability: 0.25 })
      const avaliacao = faker.number.int({ min: 3, max: 5 })
      const numeroAvaliacoes = faker.number.int({ min: 4, max: 840 })
      const vendidos = faker.number.int({ min: 0, max: 3200 })

      products.push({
        id: `prod-${globalIndex}`,
        nome,
        descricao: faker.commerce.productDescription(),
        preco: precoBase,
        precoPromocional,
        urlImagem: picsumUrl(seed),
        imagens: [
          picsumUrl(seed),
          picsumUrl(`${seed}-b`),
          picsumUrl(`${seed}-c`),
        ],
        quantidadeEstoque: estoque,
        categoria: { id: cat.id, nome: cat.nome, slug: cat.slug },
        categoriaNome: cat.nome,
        ativo: true,
        novo,
        destaque,
        avaliacao,
        numeroAvaliacoes,
        vendidos,
        emPromocao: temDesconto,
        dataCriacao: faker.date.recent({ days: 120 }).toISOString(),
      })

      globalIndex++
    })
  })

  _productPool = products
  return products
}

// ─── Orders ───────────────────────────────────────────────────────────────────

const ORDER_STATUSES = ['PENDENTE', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO']

export const createOrder = (index) => {
  faker.seed(index * 31 + 7)

  const pool = getProductPool()
  const numItems = faker.number.int({ min: 1, max: 3 })
  const itens = Array.from({ length: numItems }, (_, j) => {
    const produto = faker.helpers.arrayElement(pool)
    const quantidade = faker.number.int({ min: 1, max: 3 })
    const precoUnitario = produto.precoPromocional ?? produto.preco
    return {
      id: `item-${index}-${j}`,
      produto: {
        id: produto.id,
        nome: produto.nome,
        imagem: picsumUrl(`prod-${index}-${j}`, 100, 100),
      },
      quantidade,
      precoUnitario,
      precoOriginal: produto.preco,
      subtotal: parseFloat((precoUnitario * quantidade).toFixed(2)),
    }
  })

  const subtotal = parseFloat(itens.reduce((s, i) => s + i.subtotal, 0).toFixed(2))
  const desconto = faker.datatype.boolean({ probability: 0.3 })
    ? parseFloat((subtotal * faker.number.float({ min: 0.05, max: 0.15, fractionDigits: 2 })).toFixed(2))
    : 0
  const frete = subtotal >= 200 ? 0 : 19.9
  const total = parseFloat((subtotal - desconto + frete).toFixed(2))

  const daysAgo = faker.number.int({ min: 1, max: 60 })
  const dataCriacao = new Date()
  dataCriacao.setDate(dataCriacao.getDate() - daysAgo)

  const status = faker.helpers.arrayElement(ORDER_STATUSES)

  return {
    id: `PED${String(index).padStart(6, '0')}`,
    dataCriacao: dataCriacao.toISOString(),
    status,
    itens,
    endereco: {
      rua: faker.location.street(),
      numero: String(faker.number.int({ min: 1, max: 999 })),
      bairro: faker.location.county(),
      cidade: faker.location.city(),
      estado: faker.location.state({ abbreviated: true }),
      cep: faker.location.zipCode('#####-###'),
    },
    pagamento: {
      metodo: faker.helpers.arrayElement(['PIX', 'CARTÃO DE CRÉDITO', 'BOLETO']),
      status: ['PAGO', 'ENVIADO', 'ENTREGUE'].includes(status) ? 'PAGO' : 'PENDENTE',
    },
    valores: { subtotal, desconto, frete, total },
    quantidadeItens: itens.reduce((s, i) => s + i.quantidade, 0),
    usuario: {
      id: '1',
      nome: faker.person.fullName(),
      email: faker.internet.email(),
    },
  }
}

export const generateMockOrders = (count = 8) =>
  Array.from({ length: count }, (_, i) => createOrder(i + 1))
