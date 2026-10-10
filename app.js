(() => {
  const $ = (id) => document.getElementById(id);
  const money = (n) => "$" + n.toLocaleString("es-AR");
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  // ---------- Carrito (persistido en el navegador) ----------
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("cart") || "[]").filter((i) => byId[i.id]); } catch {}
  const save = () => { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch {} };

  // ---------- Textos de la tienda ----------
  document.title = STORE.name;
  $("brand").textContent = STORE.name;
  $("shippingNote").textContent = STORE.shippingNote;
  $("igLink").textContent = "@" + STORE.instagram;
  $("igLink").href = "https://instagram.com/" + STORE.instagram;

  // Marca la foto como faltante si no carga.
  const setImg = (el, src) => {
    el.style.backgroundImage = `url("${src}")`;
    el.classList.remove("missing");
    const probe = new Image();
    probe.onerror = () => { el.style.backgroundImage = ""; el.classList.add("missing"); };
    probe.src = src;
  };

  // ---------- Catálogo ----------
  let filter = "ALL";
  function renderGrid() {
    const grid = $("grid");
    grid.innerHTML = "";
    PRODUCTS.filter((p) => filter === "ALL" || p.collection === filter).forEach((p) => {
      const card = document.createElement("button");
      card.className = "card";
      card.innerHTML = `
        <div class="thumb"><span class="tag">${p.collection}</span>${p.stock ? "" : '<span class="soldout">Agotado</span>'}</div>
        <div class="card-info">
          <div><h3>${p.name}</h3><p>Remera ${p.color.toLowerCase()} oversize</p></div>
          <strong>${money(p.price)}</strong>
        </div>`;
      setImg(card.querySelector(".thumb"), p.image);
      card.onclick = () => openProduct(p);
      grid.appendChild(card);
    });
  }
  $("filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    filter = chip.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === chip));
    renderGrid();
  });

  // ---------- Modal de producto ----------
  const modal = $("productModal");
  let current = null, size = null, qty = 1;
  function openProduct(p) {
    current = p; size = null; qty = 1;
    setImg($("mImg"), p.image);
    $("mCollection").textContent = `${p.collection} · Remera ${p.color.toLowerCase()}`;
    $("mName").textContent = p.name;
    $("mPrice").textContent = money(p.price);
    $("mQty").textContent = qty;
    $("mHint").textContent = p.stock ? "" : "Agotado por ahora.";
    $("mSizes").innerHTML = "";
    SIZES.forEach((s) => {
      const b = document.createElement("button");
      b.className = "size"; b.textContent = s;
      b.onclick = () => {
        size = s;
        document.querySelectorAll(".size").forEach((x) => x.classList.toggle("active", x === b));
        updateAdd();
      };
      $("mSizes").appendChild(b);
    });
    updateAdd();
    modal.showModal();
  }
  function updateAdd() {
    $("mAdd").disabled = !current.stock || !size;
    $("mAdd").textContent = current.stock && !size ? "Elegí un talle" : "Agregar al carrito";
  }
  $("mMinus").onclick = () => { qty = Math.max(1, qty - 1); $("mQty").textContent = qty; };
  $("mPlus").onclick = () => { qty = Math.min(10, qty + 1); $("mQty").textContent = qty; };
  $("mAdd").onclick = () => {
    const line = cart.find((i) => i.id === current.id && i.size === size);
    if (line) line.qty += qty; else cart.push({ id: current.id, size, qty });
    save(); renderCart(); modal.close(); openCart();
  };
  modal.querySelector("[data-close]").onclick = () => modal.close();
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

  // ---------- Carrito ----------
  const drawer = $("drawer"), scrim = $("scrim");
  const openCart = () => { drawer.classList.add("open"); scrim.classList.add("show"); drawer.setAttribute("aria-hidden", "false"); };
  const closeCart = () => { drawer.classList.remove("open"); scrim.classList.remove("show"); drawer.setAttribute("aria-hidden", "true"); };
  $("cartOpen").onclick = openCart;
  $("cartClose").onclick = closeCart;
  scrim.onclick = closeCart;

  const total = () => cart.reduce((s, i) => s + byId[i.id].price * i.qty, 0);
  function renderCart() {
    const list = $("cartList");
    list.innerHTML = "";
    $("cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
    if (!cart.length) list.innerHTML = '<li class="empty">Todavía no agregaste nada.</li>';
    cart.forEach((i, idx) => {
      const p = byId[i.id];
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="pic" style="background-image:url('${p.image}')"></div>
        <div><h4>${p.name}</h4><p>Talle ${i.size} · x${i.qty}</p><button class="rm">Quitar</button></div>
        <strong>${money(p.price * i.qty)}</strong>`;
      li.querySelector(".rm").onclick = () => { cart.splice(idx, 1); save(); renderCart(); };
      list.appendChild(li);
    });
    $("cartTotal").textContent = money(total());
    $("checkout").disabled = !cart.length;
  }

  $("cDelivery").onchange = (e) => { $("cAddressWrap").style.display = e.target.value === "Retiro" ? "none" : ""; };

  $("checkout").onclick = () => {
    const lines = cart.map((i) => `• ${byId[i.id].name} — talle ${i.size} x${i.qty} (${money(byId[i.id].price * i.qty)})`);
    const delivery = $("cDelivery").value;
    const msg = [
      `Hola ${STORE.name}! Quiero hacer este pedido:`,
      "",
      ...lines,
      "",
      `Total: ${money(total())}`,
      `Nombre: ${$("cName").value.trim() || "-"}`,
      `Entrega: ${delivery}${delivery === "Retiro" ? "" : " — " + ($("cAddress").value.trim() || "a coordinar")}`,
    ].join("\n");
    window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  renderGrid();
  renderCart();
})();
