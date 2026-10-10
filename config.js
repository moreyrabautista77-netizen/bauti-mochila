// ============================================================
//  CONFIGURACIÓN DE LA TIENDA — editá solo este archivo
// ============================================================

const STORE = {
  name: "STOCKSTORE",
  instagram: "stockstore.arg",
  // Número de WhatsApp con código de país, sin "+" ni espacios.
  // Ejemplo Argentina: 549 + característica sin 0 + número sin 15 → "5491122334455"
  whatsapp: "5491100000000",
  currency: "ARS",
  shippingNote: "Envíos a todo el país. Retiro a coordinar.",
};

const SIZES = ["S", "M", "L", "XL", "XXL"];

// price: en pesos, sin puntos. stock: false = aparece como "Agotado".
// image: ruta dentro de /img. Si falta la foto, se muestra un recuadro vacío.
const PRODUCTS = [
  { id: "platinum",     name: "PLATINUM",     collection: "ICONS",   color: "Negra",  price: 25000, image: "img/platinum.jpg",     stock: true },
  { id: "back-to-back", name: "BACK TO BACK", collection: "ICONS",   color: "Negra",  price: 25000, image: "img/back-to-back.jpg", stock: true },
  { id: "red-star",     name: "RED STAR",     collection: "ICONS",   color: "Negra",  price: 25000, image: "img/red-star.jpg",     stock: true },
  { id: "one-on-one",   name: "ONE ON ONE",   collection: "ICONS",   color: "Negra",  price: 25000, image: "img/one-on-one.jpg",   stock: true },
  { id: "the-one",      name: "THE ONE",      collection: "ICONS",   color: "Negra",  price: 25000, image: "img/the-one.jpg",      stock: true },
  { id: "mixtape",      name: "MIXTAPE",      collection: "ICONS",   color: "Negra",  price: 25000, image: "img/mixtape.jpg",      stock: true },
  { id: "dynasty",      name: "DYNASTY",      collection: "VINTAGE", color: "Blanca", price: 25000, image: "img/dynasty.jpg",      stock: true },
];
