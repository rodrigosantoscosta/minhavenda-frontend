import { useState, useEffect } from 'react'
import type { Product } from '../types'
import productService from '../services/productService'

export default function TestAPI() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const raw = await productService.getProdutos() as any
        setProducts(raw.content || raw || [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Erro: {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        Teste de API - Produtos
      </h1>
      
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-gray-600 mb-4">
          Total de produtos: {products.length}
        </p>
        
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-b pb-2"
            >
              <h3 className="font-semibold">{product.nome}</h3>
              <p className="text-sm text-gray-600">
                R$ {(product.preco as any)?.valor || product.preco}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}