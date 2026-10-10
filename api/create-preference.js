// Función serverless (Vercel) que crea un checkout de Mercado Pago.
// Los precios se toman del catálogo del servidor, nunca de lo que manda el navegador.
const products = require("../data/products.json");

const MAX_QTY = 20;

function buildItems(requested) {
  if (!Array.isArray(requested) || requested.length === 0) {
    throw new Error("Carrito vacío");
  }
  return requested.map((r) => {
    const p = products.find((x) => x.id === r.id);
    const qty = Number(r.quantity);
    if (!p) throw new Error("Producto inexistente: " + r.id);
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) throw new Error("Cantidad inválida");
    if (qty > p.stock) throw new Error("Sin stock suficiente de " + p.name);
    return {
      id: p.id,
      title: p.name,
      quantity: qty,
      unit_price: p.price,
      currency_id: "ARS"
    };
  });
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return res.status(503).json({ error: "Mercado Pago no está configurado" });
  }

  let items;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    items = buildItems(body.items);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }

  const origin = process.env.SITE_URL || "https://" + req.headers.host;
  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify({
      items,
      back_urls: {
        success: origin + "/?pago=ok",
        pending: origin + "/?pago=pendiente",
        failure: origin + "/?pago=error"
      },
      auto_return: "approved",
      statement_descriptor: (process.env.STORE_NAME || "TIENDA").slice(0, 22)
    })
  });

  const data = await mpRes.json().catch(() => ({}));
  if (!mpRes.ok || !data.init_point) {
    console.error("Mercado Pago error", mpRes.status, data);
    return res.status(502).json({ error: "Mercado Pago rechazó el pedido" });
  }
  return res.status(200).json({ init_point: data.init_point });
}

module.exports = handler;
module.exports.buildItems = buildItems;
