import { render } from 'preact'
import { Widget } from './components/Widget'
import './styles/widget.css'

export interface PopupConfig {
  shopDomain: string
  token: string
  productIds: string[]
  containerId?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark'
}

class ShopInWidget {
  private config: PopupConfig
  private container: HTMLElement | null = null
  private isOpen = false

  constructor(config: PopupConfig) {
    this.config = {
      position: 'bottom-right',
      theme: 'light',
      ...config
    }
  }

  init() {
    // Create the widget container
    this.createContainer()
    
    // Render the widget
    if (this.container) {
      render(<Widget config={this.config} onToggle={this.handleToggle} />, this.container)
    }
  }

  private createContainer() {
    // Use custom container ID if provided, otherwise create default
    const containerId = this.config.containerId || 'shop-in-widget-container'
    
    let container = document.getElementById(containerId)
    
    if (!container) {
      container = document.createElement('div')
      container.id = containerId
      container.className = `shop-in-widget shop-in-widget-${this.config.position} shop-in-widget-${this.config.theme}`
      document.body.appendChild(container)
    }
    
    this.container = container
  }

  private handleToggle = (isOpen: boolean) => {
    this.isOpen = isOpen
  }

  open() {
    this.isOpen = true
    // Re-render to update state
    if (this.container) {
      render(<Widget config={this.config} onToggle={this.handleToggle} isOpen={true} />, this.container)
    }
  }

  close() {
    this.isOpen = false
    // Re-render to update state
    if (this.container) {
      render(<Widget config={this.config} onToggle={this.handleToggle} isOpen={false} />, this.container)
    }
  }

  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
    }
  }
}

// Global initialization function
function Popup(config: PopupConfig): ShopInWidget {
  const widget = new ShopInWidget(config)
  widget.init()
  return widget
}

// Auto-initialize if script has data attributes
function autoInit() {
  const script = document.querySelector('script[data-shop-domain]') as HTMLScriptElement
  
  if (script) {
    const shopDomain = script.getAttribute('data-shop-domain')
    const token = script.getAttribute('data-token')
    const productIds = script.getAttribute('data-product-ids')?.split(',') || []
    const position = script.getAttribute('data-position') as PopupConfig['position'] || 'bottom-right'
    const theme = script.getAttribute('data-theme') as PopupConfig['theme'] || 'light'
    
    if (shopDomain && token && productIds.length > 0) {
      Popup({
        shopDomain,
        token,
        productIds,
        position,
        theme
      })
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit)
} else {
  autoInit()
}

// Export for manual initialization
;(window as any).Popup = Popup

export default Popup