# bauti-mochila

Tienda online estática (HTML/CSS/JS, sin dependencias). El cliente arma el pedido y lo envía por WhatsApp.

## Editar la tienda
Todo se cambia en `config.js`:
- `STORE.whatsapp`: tu número con código de país (ej. `5491122334455`).
- `PRODUCTS`: nombre, colección, precio, foto y stock de cada remera.
- `SIZES`: talles disponibles.

Las fotos van en `img/` con el nombre indicado en `image`. Si falta una, se muestra "Foto próximamente".

## Ver en tu compu
```
python3 -m http.server 8000
```
y abrí http://localhost:8000

## Publicar gratis
GitHub Pages (Settings → Pages → rama y carpeta raíz), Netlify o Vercel: subí la carpeta tal cual.
