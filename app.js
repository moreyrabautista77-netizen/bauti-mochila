(function () {
  "use strict";

  const cfg = window.STORE_CONFIG;
  const CART_KEY = "store-cart-v1";
  const $ = (sel) => document.querySelector(sel);

  let products = [];
  let activeCategory = "Todos";
  let cart = loadCart();

  const money = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: cfg.currency,
    maximumFractionDigits: 0
  });
  const fmt = (n) => money.format(n);

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch {
      /* el carrito sigue funcionando en memoria */
    }
  }

  function waLink(text) {
    return "https://wa.me/" + cfg.whatsapp + "?text=" + encodeURIComponent(text);
  }

  // ---------- Catálogo ----------

  function renderShell() {
    document.title = cfg.name;
    $("#brand").textContent = cfg.name;
    $("#heroTitle").textContent = cfg.name;
    $("#heroTagline").textContent = cfg.tagline;
    const perks = [];
    if (cfg.freeShippingFrom) perks.push("Envío gratis desde " + fmt(cfg.freeShippingFrom));
    if (cfg.payments.transfer.enabled && cfg.payments.transfer.discountPercent) {
      perks.push(cfg.payments.transfer.discountPercent + "% OFF pagando por transferencia");
    }
    $("#heroPerk").textContent = perks.join(" · ");
    $("#waFloat").href = waLink("Hola! Tengo una consulta sobre " + cfg.name);
    $("#footer").innerHTML =
      "© " + new Date().getFullYear() + " " + escapeHtml(cfg.name) +
      (cfg.instagram
        ? ' · <a href="https://instagram.com/' + encodeURIComponent(cfg.instagram) +
          '" target="_blank" rel="noopener">@' + escapeHtml(cfg.instagram) + "</a>"
        : "");
  }

  function renderFilters() {
    const cats = ["Todos", ...new Set(products.map((p) => p.category))];
    $("#filters").innerHTML = cats
      .map((c) =>
        '<button class="chip" data-cat="' + escapeHtml(c) + '" aria-pressed="' +
        (c === activeCategory) + '">' + escapeHtml(c) + "</button>")
      .join("");
  }

  function transferPrice(price) {
    const t = cfg.payments.transfer;
    if (!t.enabled || !t.discountPercent) return null;
    return Math.round(price * (1 - t.discountPercent / 100));
  }

  function renderGrid() {
    const list = products.filter((p) => activeCategory === "Todos" || p.category === activeCategory);
    $("#grid").innerHTML = list.map((p) => {
      const off = p.compareAt > p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
      const tp = transferPrice(p.price);
      const img = p.image
        ? '<img src="' + escapeHtml(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">'
        : escapeHtml(p.name.charAt(0));
      const soldOut = p.stock <= 0;
      return (
        '<article class="card">' +
          '<div class="card__img">' + img + (off ? '<span class="tag">-' + off + "%</span>" : "") + "</div>" +
          '<div class="card__body">' +
            "<h3>" + escapeHtml(p.name) + "</h3>" +
            "<p>" + escapeHtml(p.description) + "</p>" +
            '<div class="price">' + fmt(p.price) +
              (off ? "<s>" + fmt(p.compareAt) + "</s>" : "") +
              (tp ? "<small>" + fmt(tp) + " por transferencia</small>" : "") +
            "</div>" +
            '<button class="btn btn--primary" data-add="' + escapeHtml(p.id) + '"' +
              (soldOut ? " disabled" : "") + ">" + (soldOut ? "Sin stock" : "Agregar al carrito") + "</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  // ---------- Carrito ----------

  function cartLines() {
    return Object.entries(cart)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
      .filter((l) => l.product);
  }

  function selectedPayment() {
    const el = document.querySelector('input[name="pay"]:checked');
    return el ? el.value : "whatsapp";
  }

  function computeTotals() {
    const subtotal = cartLines().reduce((s, l) => s + l.product.price * l.qty, 0);
    const t = cfg.payments.transfer;
    const discount = selectedPayment() === "transfer" && t.enabled && t.discountPercent
      ? Math.round(subtotal * t.discountPercent / 100)
      : 0;
    return { subtotal, discount, total: subtotal - discount };
  }

  function addToCart(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const next = (cart[id] || 0) + 1;
    if (next > p.stock) return;
    cart[id] = next;
    saveCart();
    renderCart();
    openCart();
  }

  function changeQty(id, delta) {
    const p = products.find((x) => x.id === id);
    const next = (cart[id] || 0) + delta;
    if (next <= 0) delete cart[id];
    else if (p && next <= p.stock) cart[id] = next;
    saveCart();
    renderCart();
  }

  function renderPayOptions() {
    const opts = [];
    if (cfg.payments.mercadoPago) opts.push(["mercadopago", "Mercado Pago (tarjeta / dinero en cuenta)"]);
    if (cfg.payments.transfer.enabled) {
      const d = cfg.payments.transfer.discountPercent;
      opts.push(["transfer", "Transferencia" + (d ? " (" + d + "% OFF)" : "")]);
    }
    if (cfg.payments.whatsapp || !opts.length) opts.push(["whatsapp", "Coordinar por WhatsApp"]);
    $("#payOptions").innerHTML = "<legend>Forma de pago</legend>" + opts
      .map(([v, label], i) =>
        '<label><input type="radio" name="pay" value="' + v + '"' + (i === 0 ? " checked" : "") + "> " +
        escapeHtml(label) + "</label>")
      .join("");
  }

  function renderCart() {
    const lines = cartLines();
    const count = lines.reduce((s, l) => s + l.qty, 0);
    $("#cartCount").textContent = count;

    $("#cartItems").innerHTML = lines.length
      ? lines.map(({ product: p, qty }) =>
          '<div class="line">' +
            '<span class="line__name">' + escapeHtml(p.name) + "</span>" +
            "<span>" + fmt(p.price * qty) + "</span>" +
            '<span class="qty">' +
              '<button type="button" data-qty="' + escapeHtml(p.id) + '" data-delta="-1" aria-label="Quitar uno">−</button>' +
              qty +
              '<button type="button" data-qty="' + escapeHtml(p.id) + '" data-delta="1" aria-label="Agregar uno">+</button>' +
            "</span>" +
          "</div>").join("")
      : '<p class="empty">Tu carrito está vacío.</p>';

    const { subtotal, discount, total } = computeTotals();
    const shippingNote = cfg.freeShippingFrom
      ? (subtotal >= cfg.freeShippingFrom
          ? "¡Tenés envío gratis!"
          : "Te faltan " + fmt(cfg.freeShippingFrom - subtotal) + " para envío gratis")
      : "";
    $("#totals").innerHTML =
      '<div class="row"><span>Subtotal</span><span>' + fmt(subtotal) + "</span></div>" +
      (discount ? '<div class="row"><span>Descuento transferencia</span><span>−' + fmt(discount) + "</span></div>" : "") +
      '<div class="row row--total"><span>Total</span><span>' + fmt(total) + "</span></div>" +
      (shippingNote && lines.length ? "<small>" + shippingNote + "</small>" : "");

    $("#checkoutBtn").disabled = !lines.length;
  }

  function openCart() {
    $("#drawer").classList.add("open");
    $("#drawer").setAttribute("aria-hidden", "false");
    $("#overlay").hidden = false;
  }

  function closeCart() {
    $("#drawer").classList.remove("open");
    $("#drawer").setAttribute("aria-hidden", "true");
    $("#overlay").hidden = true;
  }

  // ---------- Checkout ----------

  function orderMessage(form, method) {
    const { subtotal, discount, total } = computeTotals();
    const rows = cartLines().map((l) => "• " + l.qty + " x " + l.product.name + " — " + fmt(l.product.price * l.qty));
    const methodLabel = { transfer: "Transferencia", whatsapp: "A coordinar", mercadopago: "Mercado Pago" }[method];
    const msg = [
      "Hola! Quiero hacer este pedido en " + cfg.name + ":",
      "",
      ...rows,
      "",
      "Subtotal: " + fmt(subtotal),
      discount ? "Descuento: −" + fmt(discount) : null,
      "Total: " + fmt(total),
      "Pago: " + methodLabel,
      "",
      "Nombre: " + form.name.value.trim(),
      "Envío a: " + form.address.value.trim()
    ];
    if (method === "transfer") {
      msg.push("", "Transfiero a alias " + cfg.payments.transfer.alias + " (" + cfg.payments.transfer.holder + ") y envío el comprobante.");
    }
    return msg.filter((x) => x !== null).join("\n");
  }

  async function payWithMercadoPago(form) {
    const res = await fetch("/api/create-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartLines().map((l) => ({ id: l.product.id, quantity: l.qty })),
        buyer: { name: form.name.value.trim(), address: form.address.value.trim() }
      })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.init_point) throw new Error(data.error || "No se pudo iniciar el pago");
    window.location.href = data.init_point;
  }

  async function onCheckout(e) {
    e.preventDefault();
    const form = e.target;
    const method = selectedPayment();
    const err = $("#checkoutError");
    err.hidden = true;

    if (method === "mercadopago") {
      $("#checkoutBtn").disabled = true;
      try {
        await payWithMercadoPago(form);
      } catch (ex) {
        err.textContent = ex.message + ". Probá con otra forma de pago.";
        err.hidden = false;
        $("#checkoutBtn").disabled = false;
      }
      return;
    }

    window.open(waLink(orderMessage(form, method)), "_blank", "noopener");
  }

  // ---------- Init ----------

  function bindEvents() {
    $("#filters").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]");
      if (!b) return;
      activeCategory = b.dataset.cat;
      renderFilters();
      renderGrid();
    });
    $("#grid").addEventListener("click", (e) => {
      const b = e.target.closest("[data-add]");
      if (b) addToCart(b.dataset.add);
    });
    $("#cartItems").addEventListener("click", (e) => {
      const b = e.target.closest("[data-qty]");
      if (b) changeQty(b.dataset.qty, Number(b.dataset.delta));
    });
    $("#payOptions").addEventListener("change", renderCart);
    $("#cartOpen").addEventListener("click", openCart);
    $("#cartClose").addEventListener("click", closeCart);
    $("#overlay").addEventListener("click", closeCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
    $("#checkout").addEventListener("submit", onCheckout);
  }

  async function init() {
    renderShell();
    bindEvents();
    try {
      const res = await fetch("data/products.json", { cache: "no-store" });
      products = await res.json();
    } catch {
      $("#grid").innerHTML = '<p class="empty">No se pudo cargar el catálogo.</p>';
      return;
    }
    // Si se quedó en el carrito algo que ya no existe o superó el stock, se ajusta
    for (const id of Object.keys(cart)) {
      const p = products.find((x) => x.id === id);
      if (!p || p.stock <= 0) delete cart[id];
      else cart[id] = Math.min(cart[id], p.stock);
    }
    saveCart();
    renderFilters();
    renderGrid();
    renderPayOptions();
    renderCart();

    if (new URLSearchParams(location.search).get("pago") === "ok") {
      cart = {};
      saveCart();
      renderCart();
      alert("¡Pago recibido! Te contactamos por WhatsApp para coordinar el envío.");
      history.replaceState(null, "", location.pathname);
    }
  }

  init();
})();
