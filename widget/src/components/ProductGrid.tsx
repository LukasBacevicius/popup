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

interface ProductGridProps {
  products: Product[]
  onProductClick: (product: Product) => void
  theme?: 'light' | 'dark'
}

export function ProductGrid({ products, onProductClick, theme = 'light' }: ProductGridProps) {
  const formatPrice = (amount: string, currencyCode: string) => {
    const price = parseFloat(amount)
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(price)
  }

  if (products.length === 0) {
    return (
      <div className="shop-in-widget-empty">
        <p>No products available</p>
      </div>
    )
  }

  return (
    <div className="shop-in-widget-grid">
      {products.map(product => (
        <div 
          key={product.id}
          className={`shop-in-widget-product ${theme === 'dark' ? 'dark' : 'light'}`}
          onClick={() => onProductClick(product)}
        >
          <div className="shop-in-widget-product-image">
            {product.images.edges[0] ? (
              <img 
                src={product.images.edges[0].node.url} 
                alt={product.title}
                loading="lazy"
              />
            ) : (
              <div className="shop-in-widget-product-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="21,15 16,10 5,21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
            )}
          </div>
          
          <div className="shop-in-widget-product-info">
            <h4 className="shop-in-widget-product-title">{product.title}</h4>
            <p className="shop-in-widget-product-price">
              {formatPrice(
                product.priceRange.minVariantPrice.amount,
                product.priceRange.minVariantPrice.currencyCode
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}