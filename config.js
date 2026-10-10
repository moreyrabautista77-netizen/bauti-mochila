// Editá estos datos. Es lo único que necesitás tocar (además de data/products.json).
window.STORE_CONFIG = {
  name: "Bauti Store",
  tagline: "Envíos a todo el país",
  currency: "ARS",
  // Número en formato internacional, sin + ni espacios. Ej: 5491112345678
  whatsapp: "5491100000000",
  instagram: "stockstore.arg",
  freeShippingFrom: 80000,
  payments: {
    whatsapp: true,
    transfer: {
      enabled: true,
      alias: "TU.ALIAS.AQUI",
      holder: "Nombre Apellido",
      discountPercent: 10 // descuento por transferencia: sube la conversión y te ahorra la comisión de MP
    },
    // Requiere desplegar en Vercel con la variable MP_ACCESS_TOKEN (ver README)
    mercadoPago: false
  }
};
