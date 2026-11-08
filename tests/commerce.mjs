import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
process.env.NODE_ENV = "test";
const pg = new PGlite();
await pg.waitReady;
const pool = (await import("../Backend/db.js")).default;
const query = async (sql, params) => {
  const q = await pg.query(sql, params);
  return {
    ...q,
    rowCount: /^\s*(SELECT|WITH)/i.test(sql)
      ? q.rows.length
      : (q.affectedRows ?? q.rows.length),
  };
};
pool.query = query;
pool.connect = async () => ({
  query: async (sql, params) => {
    if (
      sql.includes("CREATE TABLE IF NOT EXISTS usuarios") ||
      sql.includes("-- Normalize legacy CSS") ||
      sql.includes("CREATE TABLE IF NOT EXISTS store_settings")
    ) {
      await pg.exec(sql);
      return { rows: [], rowCount: 0 };
    }
    return query(sql, params);
  },
  release() {},
});
const { app, initialize } = await import("../Backend/index.js");
await initialize();
await initialize();
const server = app.listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/api`,
  httpFetch = globalThis.fetch;
async function call(path, { method = "GET", body, cookie, headers = {} } = {}) {
  const r = await httpFetch(base + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost:5173",
      ...(cookie ? { Cookie: cookie } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie")?.split(";")[0],
  };
}
const check = (r, status) => assert.equal(r.status, status, JSON.stringify(r));
let payment = null;
try {
  const store = (await call("/store")).body;
  assert.equal(store.shipping.length, 6);
  assert.equal(store.paymentsEnabled, false);
  assert.equal(store.packages[0].stock, 0);
  const user = {
    nombre: "Prueba",
    apellido: "Cliente",
    email: "test@example.com",
    password: "Strong-2026-test",
    acceptedTerms: true,
    policyVersion: store.policyVersion,
  };
  check(
    await call("/register", {
      method: "POST",
      body: { ...user, acceptedTerms: false },
    }),
    400,
  );
  check(await call("/register", { method: "POST", body: user }), 201);
  check(await call("/register", { method: "POST", body: user }), 409);
  const c = (await call("/login", { method: "POST", body: user })).cookie;
  assert.ok(c);
  const u = (await query("SELECT * FROM usuarios WHERE email=$1", [user.email]))
    .rows[0];
  assert.ok(u.password_hash.startsWith("$2"));
  assert.equal(u.consentimiento.version, store.policyVersion);
  assert.ok(u.consentimiento.settings);
  check(await call("/orders", { method: "POST", body: {} }), 401);
  check(await call("/admin/clients", { cookie: c }), 403);
  check(
    await call("/admin/shipping/local", { method: "PUT", cookie: c, body: {} }),
    403,
  );
  check(
    await call("/quote", {
      method: "POST",
      cookie: c,
      body: { items: [{ id: 3, quantity: 1, shippingType: "national" }] },
    }),
    400,
  );
  check(
    await call("/quote", {
      method: "POST",
      cookie: c,
      body: { items: [{ id: 2, quantity: 1, shippingType: "air" }] },
    }),
    400,
  );
  const other = { ...user, email: "other@example.com" };
  check(await call("/register", { method: "POST", body: other }), 201);
  const otherCookie = (await call("/login", { method: "POST", body: other }))
    .cookie;
  await query("UPDATE usuarios SET rol='admin' WHERE id=$1", [u.id]);
  const methods = store.shipping;
  for (const id of ["local", "national"]) {
    const m = methods.find((x) => x.id === id);
    check(
      await call("/admin/shipping/" + id, {
        method: "PUT",
        cookie: c,
        body: { ...m, cost: id === "local" ? 20 : 40, quoteRequired: false },
      }),
      200,
    );
  }
  const p = (await call("/catalog")).body.products.find((x) => x.id === 1);
  check(
    await call("/manage/products", {
      method: "PUT",
      cookie: c,
      body: {
        upserts: [
          {
            ...p,
            discountPercent: 10,
            gallery: ["/images/catalogo/nenufar-blanco.jpg"],
          },
        ],
      },
    }),
    200,
  );
  const catalog = (await call("/catalog")).body;
  assert.equal(catalog.products[0].price, 25.65);
  assert.equal(catalog.products[0].basePrice, 28.5);
  assert.equal(catalog.products[0].gallery.length, 1);
  const items = [
      { id: 1, quantity: 2, size: "grande", shippingType: "local", price: 0 },
    ],
    address = {
      street: "Calle 1",
      city: "Tenabo",
      zipCode: "24700",
      phone: "9990000000",
    },
    order = {
      items,
      address,
      acceptedTerms: true,
      policyVersion: store.policyVersion,
      checkoutKey: randomUUID(),
    };
  const q = await call("/quote", {
    method: "POST",
    cookie: otherCookie,
    body: { items },
  });
  check(q, 200);
  assert.equal(q.body.total, 85.7);
  assert.equal(q.body.shippingCost, 20);
  const created = await call("/orders", {
    method: "POST",
    cookie: otherCookie,
    body: order,
  });
  check(created, 201);
  assert.equal(created.body.total, 85.7);
  assert.equal(
    (await query("SELECT stock FROM productos WHERE id=1")).rows[0].stock,
    10,
  );
  const replay = await call("/orders", {
    method: "POST",
    cookie: otherCookie,
    body: order,
  });
  check(replay, 201);
  assert.equal(replay.body.id, created.body.id);
  assert.equal(
    (await query("SELECT stock FROM productos WHERE id=1")).rows[0].stock,
    10,
  );
  check(
    await call("/orders", {
      method: "POST",
      cookie: otherCookie,
      body: {
        ...order,
        checkoutKey: randomUUID(),
        items: [{ id: 3, quantity: 1, shippingType: "air" }],
      },
    }),
    400,
  );
  check(
    await call("/orders", {
      method: "POST",
      cookie: otherCookie,
      body: {
        ...order,
        checkoutKey: randomUUID(),
        items: [
          { id: 1, quantity: 7 },
          { id: 1, quantity: 7 },
        ],
      },
    }),
    409,
  );
  assert.equal(
    (await query("SELECT stock FROM productos WHERE id=1")).rows[0].stock,
    10,
  );
  const mix = await call("/quote", {
    method: "POST",
    cookie: otherCookie,
    body: {
      items: [
        { id: 1, quantity: 1, shippingType: "local" },
        { id: 2, quantity: 1, shippingType: "local" },
        { id: 9, quantity: 1, shippingType: "national" },
      ],
    },
  });
  check(mix, 200);
  assert.equal(mix.body.shippingCost, 60);
  assert.equal((await call("/orders", { cookie: c })).body.length, 1);
  assert.equal((await call("/admin/clients", { cookie: c })).body.length, 2);
  check(
    await call("/manage/orders", {
      method: "PUT",
      cookie: c,
      body: { upserts: [{ id: created.body.id, status: "Enviado" }] },
    }),
    400,
  );
  check(
    await call(`/payments/order/${created.body.id}`, {
      method: "POST",
      cookie: otherCookie,
    }),
    503,
  );
  const pkg = (await call("/admin/commerce", { cookie: c })).body.packages[0];
  check(
    await call("/admin/packages/" + pkg.id, {
      method: "PUT",
      cookie: c,
      body: { ...pkg, stock: 2, promotionPrice: 123 },
    }),
    200,
  );
  const po = await call("/orders", {
    method: "POST",
    cookie: otherCookie,
    body: {
      ...order,
      checkoutKey: randomUUID(),
      items: [{ id: pkg.id, quantity: 1 }],
    },
  });
  check(po, 201);
  assert.equal(po.body.total, 123);
  check(
    await call("/manage/orders", {
      method: "PUT",
      cookie: c,
      body: { upserts: [{ id: po.body.id, status: "Cancelado" }] },
    }),
    200,
  );
  assert.equal(
    (await query("SELECT stock FROM paquetes WHERE id=$1", [pkg.id])).rows[0]
      .stock,
    2,
  );
  const reserve = await call("/reservations", {
    method: "POST",
    cookie: otherCookie,
    body: { eventId: 2, tickets: 1, nombre: "Cliente" },
  });
  check(reserve, 201);
  const token = reserve.body.ticketIds[0];
  assert.match(token, /^[a-f0-9]{64}$/);
  assert.notEqual(
    (await query("SELECT token_hash FROM entradas")).rows[0].token_hash,
    token,
  );
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: otherCookie,
      body: { eventId: 2, token },
    }),
    403,
  );
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: c,
      body: { eventId: 1, token },
    }),
    409,
  );
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: c,
      body: { eventId: 2, token },
    }),
    200,
  );
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: c,
      body: { eventId: 2, token },
    }),
    409,
  );
  assert.equal(
    Number(
      (
        await query("SELECT lugares FROM reservas WHERE id=$1", [
          reserve.body.id,
        ])
      ).rows[0].lugares,
    ),
    1,
  );
  const pr = await call("/reservations", {
    method: "POST",
    cookie: otherCookie,
    body: { eventId: 1, tickets: 1, nombre: "Cliente" },
  });
  check(pr, 201);
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: c,
      body: { eventId: 1, token: pr.body.ticketIds[0] },
    }),
    409,
  );
  process.env.MERCADOPAGO_ACCESS_TOKEN = "TEST-only";
  process.env.MERCADOPAGO_WEBHOOK_SECRET = "test-secret";
  process.env.PUBLIC_URL = "https://shop.example.com";
  globalThis.fetch = async (url, options) => {
    if (
      String(url).startsWith("https://api.mercadopago.com/checkout/preferences")
    ) {
      const data = JSON.parse(options.body);
      assert.equal(data.items[0].unit_price, 85.7);
      assert.equal(data.external_reference, "order:" + created.body.id);
      return new Response(
        JSON.stringify({
          init_point:
            "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=test",
        }),
        { status: 200 },
      );
    }
    if (String(url).startsWith("https://api.mercadopago.com/v1/payments/"))
      return new Response(JSON.stringify(payment), { status: 200 });
    return httpFetch(url, options);
  };
  check(
    await call(`/payments/order/${created.body.id}`, {
      method: "POST",
      cookie: c,
    }),
    404,
  );
  check(
    await call(`/payments/order/${created.body.id}`, {
      method: "POST",
      cookie: otherCookie,
    }),
    200,
  );
  const ts = String(Date.now()),
    id = "123456",
    requestId = "test-request",
    signature = createHmac("sha256", "test-secret")
      .update(`id:${id};request-id:${requestId};ts:${ts};`)
      .digest("hex");
  const headers = {
    "x-request-id": requestId,
    "x-signature": `ts=${ts},v1=${signature}`,
  };
  const webhook = "/payments/webhook?data.id=" + id;
  check(await call(webhook, { method: "POST", body: {} }), 401);
  payment = {
    id: Number(id),
    transaction_amount: 1,
    currency_id: "MXN",
    external_reference: "order:" + created.body.id,
    status: "approved",
  };
  check(await call(webhook, { method: "POST", headers, body: {} }), 409);
  payment.transaction_amount = 85.7;
  check(await call(webhook, { method: "POST", headers, body: {} }), 200);
  check(await call(webhook, { method: "POST", headers, body: {} }), 200);
  assert.equal((await query("SELECT * FROM payment_receipts")).rows.length, 1);
  check(
    await call("/manage/orders", {
      method: "PUT",
      cookie: c,
      body: { upserts: [{ id: created.body.id, status: "Enviado" }] },
    }),
    200,
  );
  check(
    await call("/manage/orders", {
      method: "PUT",
      cookie: c,
      body: { upserts: [{ id: created.body.id, status: "Cancelado" }] },
    }),
    400,
  );
  const o = (await call("/orders", { cookie: otherCookie })).body.find(
    (x) => x.id === created.body.id,
  );
  assert.equal(o.paymentStatus, "approved");
  async function notify(value) {
    payment = value;
    const identifier = String(value.id),
      timestamp = String(Date.now());
    const sig = createHmac("sha256", "test-secret")
      .update(`id:${identifier};request-id:test-request;ts:${timestamp};`)
      .digest("hex");
    return call("/payments/webhook?data.id=" + identifier, {
      method: "POST",
      body: {},
      headers: {
        "x-request-id": "test-request",
        "x-signature": `ts=${timestamp},v1=${sig}`,
      },
    });
  }
  const originalPayment = { ...payment };
  check(
    await notify({ ...originalPayment, id: 654321, status: "rejected" }),
    200,
  );
  assert.equal(
    (await call("/orders", { cookie: otherCookie })).body.find(
      (x) => x.id === created.body.id,
    ).paymentStatus,
    "approved",
  );
  check(
    await notify({ ...originalPayment, id: 654321, status: "approved" }),
    409,
  );
  check(await notify({ ...originalPayment, status: "pending" }), 200);
  assert.equal(
    (await call("/orders", { cookie: otherCookie })).body.find(
      (x) => x.id === created.body.id,
    ).paymentStatus,
    "approved",
  );
  const retry = await call("/orders", {
    method: "POST",
    cookie: otherCookie,
    body: {
      ...order,
      checkoutKey: randomUUID(),
      items: [{ id: 1, quantity: 1 }],
    },
  });
  check(retry, 201);
  const attempt = {
    id: 234567,
    transaction_amount: retry.body.total,
    currency_id: "MXN",
    external_reference: "order:" + retry.body.id,
    status: "rejected",
  };
  check(await notify(attempt), 200);
  check(await notify({ ...attempt, id: 345678, status: "approved" }), 200);
  check(
    await notify({
      id: 456789,
      transaction_amount: 500,
      currency_id: "MXN",
      external_reference: "reservation:" + pr.body.id,
      status: "approved",
    }),
    200,
  );
  check(
    await call("/admin/tickets/consume", {
      method: "POST",
      cookie: c,
      body: { eventId: 1, token: pr.body.ticketIds[0] },
    }),
    200,
  );
  for (let i = 0; i < 10; i++)
    check(
      await call("/login", {
        method: "POST",
        body: { email: other.email, password: "wrong" },
      }),
      401,
    );
  check(await call("/login", { method: "POST", body: other }), 429);
  const bad = await httpFetch(base + "/logout", {
    method: "POST",
    headers: { Origin: "https://evil.example", Cookie: c },
  });
  assert.equal(bad.status, 403);
  console.log(
    "PASS: migrations twice; consent; hash; session/roles; shipping compatibility; configurable rates; integer-cent discounts; gallery; canonical quote; aggregate stock rollback; idempotent orders; package stock/cancellation; private clients; random hashed single-use QR; event/payment restrictions; Mercado Pago redirect, signature, amount, ownership and replay; persistent login limit; origin checks.",
  );
} finally {
  globalThis.fetch = httpFetch;
  server.close();
  await pg.close();
  await pool.end();
}
