# Stockstore Analytics

Un panel propio, estilo Metricool, para ver las estadísticas de **Facebook, Instagram y TikTok** juntas.
Corre en tu propia computadora: los datos y los accesos quedan en tu disco (`data/db.json`) y no pasan por ningún servicio de terceros.

**Qué muestra**

- Seguidores totales y cuánto crecieron en el período (7, 30 o 90 días).
- La curva de seguidores de cada red, con el valor de cada día al pasar el mouse.
- Interacciones, vistas y cantidad de publicaciones, comparadas con el período anterior.
- **Mejor momento para publicar**: un mapa de calor por día y franja horaria.
- **Rendimiento por formato**: Reel, video, carrusel, imagen.
- Todas las publicaciones con vistas, me gusta, comentarios, compartidos, guardados y engagement, ordenables por columna.

Mientras no conectes ninguna cuenta, el panel muestra **datos de ejemplo** (con un aviso) para que veas cómo queda.

## Instalación

Necesitás [Node.js](https://nodejs.org) 20 o más nuevo.

```bash
npm install
cp .env.example .env     # en Windows: copy .env.example .env
npm start
```

Abrí http://localhost:3000.

## Conectar Facebook + Instagram

Requisitos de la cuenta: Instagram tiene que ser **profesional** (Empresa o Creador) y estar **vinculado a una Página de Facebook**.

1. Entrá a https://developers.facebook.com, **Mis apps → Crear app**. Elegí el caso de uso para administrar Páginas / Instagram (o "Otro" → tipo **Empresa**).
2. Agregá el producto **Inicio de sesión con Facebook**. En *Configuración → URI de redireccionamiento de OAuth válidos* poné:
   `http://localhost:3000/auth/meta/callback` (o `TU_PUBLIC_URL/auth/meta/callback`).
3. En *Configuración de la app → Básica* copiá el **Identificador de la app** y la **Clave secreta** a `META_APP_ID` y `META_APP_SECRET` del `.env`.
4. Reiniciá (`npm start`) y en el panel tocá **Cuentas → Conectar Facebook + Instagram**. Elegí la Página y el Instagram.

**No hace falta la revisión de Meta.** Mientras la app esté en *modo desarrollo* funciona para las cuentas que tengan un rol en ella, y vos sos el administrador.

El panel **no pide permisos de mensajes**. El error de Metricool ("tu cuenta no cumple los requisitos para usar la API de Business Messaging") viene justamente de ese permiso.

## Conectar TikTok

1. Entrá a https://developers.tiktok.com y creá una app. Agregá **Login Kit** y los permisos `user.info.basic`, `user.info.profile`, `user.info.stats` y `video.list`.
2. Usá el **Sandbox** y agregá tu cuenta de TikTok como *usuario de prueba*. Así funciona sin revisión.
3. TikTok **no acepta `localhost`**: necesita una dirección `https`. La forma más simple es un túnel gratuito:
   ```bash
   npx cloudflared tunnel --url http://localhost:3000
   ```
   Te da una dirección tipo `https://algo.trycloudflare.com`. Ponela en `PUBLIC_URL` del `.env` y registrá `https://algo.trycloudflare.com/auth/tiktok/callback` como Redirect URI en TikTok. Si usás esa dirección, actualizá también la de Meta.
   Con el túnel el panel queda accesible desde internet: **completá `DASHBOARD_PASSWORD`**.
4. Copiá **Client key** y **Client secret** a `TIKTOK_CLIENT_KEY` y `TIKTOK_CLIENT_SECRET`, reiniciá y tocá **Cuentas → Conectar TikTok**.

## Cómo se actualizan los datos

- Al conectar una cuenta se sincroniza al instante. Después, cada `SYNC_EVERY_HOURS` horas (6 por defecto) mientras el programa esté abierto, o cuando tocás **Sincronizar**.
- **Las APIs devuelven los seguidores de hoy, no los de días anteriores.** El historial se arma guardando una foto por día. Instagram es la excepción: al conectarlo se reconstruyen los últimos 30 días, si la cuenta tiene más de 100 seguidores. Para que la curva no tenga huecos, el panel tiene que estar prendido (o abrirse) todos los días.

## Límites

- **Facebook**: por ahora solo trae reacciones, comentarios y compartidos de cada publicación. Las vistas y el alcance de Páginas no están incluidos porque Meta cambia esas métricas seguido.
- **TikTok**: la API solo trae los videos públicos y sus contadores, sin alcance, tiempo de reproducción ni datos de la audiencia.
- **No programa publicaciones** (todavía). Publicar en Instagram y TikTok desde una app propia requiere permisos que sí pasan por la revisión de Meta y TikTok.

## Desarrollo

```bash
npm run dev   # se reinicia solo al cambiar el código
npm test
```

Estructura: `src/server.js` (servidor y rutas), `src/meta.js` y `src/tiktok.js` (conexión con cada red), `src/sync.js` (actualización periódica), `src/store.js` (guardado en `data/db.json`), `public/` (el panel).
