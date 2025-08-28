# Shop-in-Widget Embeddable

An embeddable Shopify product widget that displays as an Intercom-like floating button on any website.

## Features

- 🚀 **Easy Integration**: Just add a script tag to your website
- 🎨 **Theming**: Support for light and dark themes
- 📱 **Responsive**: Works on desktop and mobile devices
- 🎯 **Positioning**: Multiple positioning options (corners)
- 🛡️ **CSS Isolation**: Prevents styling conflicts with your site
- ⚡ **Auto-init**: Automatic initialization via data attributes
- 🎮 **Manual Control**: Programmatic API for advanced use cases

## Quick Start

### Method 1: Auto-initialization (Recommended)

Add this script tag to your HTML page:

```html
<script src="https://your-cdn.com/widget.js" 
        data-shop-domain="your-shop.myshopify.com"
        data-token="your-storefront-access-token"
        data-product-ids="123,456,789"
        data-position="bottom-right"
        data-theme="light">
</script>
```

### Method 2: Manual Initialization

```html
<script src="https://your-cdn.com/widget.js"></script>
<script>
const widget = Popup({
  shopDomain: 'your-shop.myshopify.com',
  token: 'your-storefront-access-token',
  productIds: ['123', '456', '789'],
  position: 'bottom-right',
  theme: 'light'
});
</script>
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `shopDomain` | string | ✅ | - | Your Shopify shop domain (e.g., 'mystore.myshopify.com') |
| `token` | string | ✅ | - | Storefront API access token |
| `productIds` | string[] | ✅ | - | Array of product IDs to display |
| `position` | string | ❌ | 'bottom-right' | Widget position: 'bottom-right', 'bottom-left', 'top-right', 'top-left' |
| `theme` | string | ❌ | 'light' | Theme: 'light' or 'dark' |
| `containerId` | string | ❌ | auto-generated | Custom container element ID |

## API Methods

When using manual initialization, you get a widget instance with these methods:

```javascript
const widget = Popup(config);

// Open the widget panel
widget.open();

// Close the widget panel
widget.close();

// Remove the widget from the page
widget.destroy();
```

## Data Attributes

For auto-initialization, use these data attributes on the script tag:

- `data-shop-domain`: Your Shopify domain
- `data-token`: Storefront API token
- `data-product-ids`: Comma-separated product IDs
- `data-position`: Widget position (optional)
- `data-theme`: Widget theme (optional)

## Shopify Setup

To use this widget, you need:

1. **Storefront API Access Token**: Create a private app in your Shopify admin with Storefront API access
2. **Product IDs**: Get the product IDs you want to display (numeric IDs, not GIDs)

### Getting Product IDs

You can find product IDs in your Shopify admin URL when viewing a product, or via the Admin API:

```graphql
query {
  products(first: 10) {
    edges {
      node {
        id
        legacyResourceId  # This is the numeric ID you need
        title
      }
    }
  }
}
```

## Development

### Build the Widget

```bash
npm install
npm run build
```

This creates `dist/widget.js` - a single file containing the entire widget.

### Development Mode

```bash
npm run dev
```

This watches for changes and rebuilds automatically.

### Testing

Open `test.html` in your browser to see a demo of the widget.

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## CSS Isolation

The widget uses scoped CSS with `!important` declarations to prevent conflicts with your site's styles. All widget styles are prefixed with `.shop-in-widget`.

## Security

- Uses HTTPS for all Shopify API calls
- No sensitive data is stored in the widget
- Safe to embed on any website

## License

MIT License - see LICENSE file for details.