# bauti-mochila — tienda online

Tienda estática (HTML/CSS/JS, sin frameworks) con carrito y tres formas de cobro:

| Medio | Cómo funciona | Requiere |
|---|---|---|
| WhatsApp | El carrito arma el pedido y lo abre en tu WhatsApp | Solo tu número en `config.js` |
| Transferencia | Igual que WhatsApp + alias y descuento configurable | Alias en `config.js` |
| Mercado Pago | Checkout real con tarjeta / dinero en cuenta | Desplegar en Vercel + `MP_ACCESS_TOKEN` |

## Qué editar

1. **`config.js`**: nombre, WhatsApp, alias, % de descuento por transferencia, envío gratis, activar Mercado Pago.
2. **`data/products.json`**: tu catálogo. Cada producto tiene `id`, `name`, `category`, `price`, `compareAt` (precio tachado, `0` para ninguno), `description`, `image` (URL o ruta en `assets/`) y `stock`.

## Probar en tu compu

```bash
npm run dev     # abre http://localhost:3000
npm test        # tests de la función de Mercado Pago
```

## Publicar (gratis)

1. Entrá a [vercel.com](https://vercel.com), importá este repo y dale Deploy.
2. Para Mercado Pago:
   - Sacá tu Access Token en Mercado Pago Developers → Tus integraciones → Credenciales de producción.
   - En Vercel → Settings → Environment Variables agregá `MP_ACCESS_TOKEN` (y opcional `STORE_NAME`, `SITE_URL`).
   - En `config.js` poné `mercadoPago: true` y redeployá.

Sin Mercado Pago, la tienda funciona también en GitHub Pages o Netlify.

## Límites actuales

- El stock no se descuenta solo: lo actualizás vos en `products.json` cuando vendés.
- Los pagos de Mercado Pago aprobados no avisan automáticamente; los ves en tu cuenta de MP.
