import { useState, useEffect } from 'preact/hooks'
import type { PopupConfig } from '../index'
import { ProductGrid } from './ProductGrid'
import { FloatingButton } from './FloatingButton'

interface WidgetProps {
  config: PopupConfig
  onToggle: (isOpen: boolean) => void
  isOpen?: boolean
}

interface Product {
  id: string
  title: string
  handle: string
  images: {
    edges: Array<{
      node: {
        url: string
      }
    }>
  }
  priceRange: {
    minVariantPrice: {
      amount: string
      currencyCode: string
    }
  }
}

export function Widget({ config, onToggle, isOpen: controlledIsOpen }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(controlledIsOpen || false)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (controlledIsOpen !== undefined) {
      setIsOpen(controlledIsOpen)
    }
  }, [controlledIsOpen])

  useEffect(() => {
    if (isOpen && products.length === 0) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)

    try {
      const query = `
        query getProducts($ids: [ID!]!) {
          nodes(ids: $ids) {
            ... on Product {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      `

      const productGids = config.productIds.map(id => `gid://shopify/Product/${id}`)

      const response = await fetch(`https://${config.shopDomain}/api/2023-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': config.token
        },
        body: JSON.stringify({
          query,
          variables: { ids: productGids }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      
      if (data.errors) {
        throw new Error(data.errors[0].message)
      }

      setProducts(data.data.nodes.filter(Boolean))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    onToggle(newIsOpen)
  }

  const handleProductClick = (product: Product) => {
    // Open product page in new tab
    window.open(`https://${config.shopDomain}/products/${product.handle}`, '_blank')
  }

  return (
    <div className="shop-in-widget-wrapper">
      <FloatingButton 
        isOpen={isOpen} 
        onClick={handleToggle}
        theme={config.theme}
      />
      
      {isOpen && (
        <div className="shop-in-widget-panel">
          <div className="shop-in-widget-header">
            <h3>Featured Products</h3>
            <button 
              className="shop-in-widget-close"
              onClick={handleToggle}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          
          <div className="shop-in-widget-content">
            {loading ? (
              <div className="shop-in-widget-loading">
                <div className="shop-in-widget-spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : error ? (
              <div className="shop-in-widget-error">
                <p>Error: {error}</p>
                <button onClick={fetchProducts}>Retry</button>
              </div>
            ) : (
              <ProductGrid 
                products={products} 
                onProductClick={handleProductClick}
                theme={config.theme}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}