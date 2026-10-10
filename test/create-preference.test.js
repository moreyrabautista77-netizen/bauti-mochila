const test = require("node:test");
const assert = require("node:assert");
const handler = require("../api/create-preference.js");
const products = require("../data/products.json");

const inStock = products.find((p) => p.stock > 0);
const outOfStock = products.find((p) => p.stock <= 0);

test("usa el precio del catálogo, no el del cliente", () => {
  const [item] = handler.buildItems([{ id: inStock.id, quantity: 1, unit_price: 1 }]);
  assert.strictEqual(item.unit_price, inStock.price);
});

test("rechaza productos inexistentes, sin stock y cantidades inválidas", () => {
  assert.throws(() => handler.buildItems([{ id: "nope", quantity: 1 }]));
  assert.throws(() => handler.buildItems([{ id: outOfStock.id, quantity: 1 }]));
  assert.throws(() => handler.buildItems([{ id: inStock.id, quantity: 0 }]));
  assert.throws(() => handler.buildItems([{ id: inStock.id, quantity: 1.5 }]));
  assert.throws(() => handler.buildItems([]));
});

test("responde 503 si falta MP_ACCESS_TOKEN", async () => {
  delete process.env.MP_ACCESS_TOKEN;
  let status;
  const res = {
    setHeader() {},
    status(s) { status = s; return this; },
    json() { return this; }
  };
  await handler({ method: "POST", body: {}, headers: {} }, res);
  assert.strictEqual(status, 503);
});
