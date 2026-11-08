import process from "node:process";
import { Buffer } from "node:buffer";
import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  POLICY_VERSION,
  policySections,
  family,
  sizes,
  cents,
  effectivePrice,
} from "../shared/commerce.js";
const digest = (s) => createHash("sha256").update(s).digest("hex");
const fail = (m, s = 400) => {
  throw Object.assign(new Error(m), { status: s });
};
const number = (n, min = 0, max = 1000000) =>
  typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
const int = (n, min = 0, max = 1000000) =>
  number(n, min, max) && Number.isInteger(n);
const str = (s, max = 200) =>
  typeof s === "string" && s.trim().length > 0 && s.length <= max;
const imageOK = (s) =>
  typeof s === "string" &&
  s.length <= 2000 &&
  (/^https:\/\//.test(s) || /^\/images\/[a-zA-Z0-9_./-]+$/.test(s));
export const paymentReady = () =>
  Boolean(
    process.env.MERCADOPAGO_ACCESS_TOKEN &&
    process.env.MERCADOPAGO_WEBHOOK_SECRET &&
    /^https:\/\//.test(
      process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL || "",
    ),
  );
const publicURL = () =>
  process.env.RENDER_EXTERNAL_URL || process.env.PUBLIC_URL;
export async function migrateCommerce(db) {
  await db.query(
    await readFile(new URL("./commerce-schema.sql", import.meta.url), "utf8"),
  );
}
const shippingRow = (r) => ({
  id: r.id,
  label: r.label,
  families: r.families,
  cost: Number(r.cost),
  minDays: r.min_days,
  maxDays: r.max_days,
  quoteRequired: r.quote_required,
  enabled: r.enabled,
  carrier: r.carrier,
  notes: r.notes,
});
const packageRow = (r) => ({
  ...r.datos,
  id: r.id,
  price: r.datos.promotionPrice ?? r.datos.basePrice,
  stock: r.stock,
  active: r.activo,
});
export const productRow = (r) => ({
  ...r.datos,
  id: Number(r.id),
  title: r.titulo,
  name: r.titulo,
  category: r.categoria,
  description: r.descripcion || "",
  basePrice: Number(r.precio),
  discountPercent: Number(r.datos?.discountPercent) || 0,
  price: effectivePrice(r.precio, r.datos?.discountPercent),
  stock: r.stock,
  image: r.imagen_url || "",
  gallery: r.datos?.gallery || [],
  characteristics: r.datos?.characteristics || [],
  unit: r.datos?.unit || "unidad",
});
function businessDate(days) {
  const d = new Date();
  d.setUTCHours(12, 0, 0, 0);
  for (let n = 0; n < days;) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (d.getUTCDay() !== 0 && d.getUTCDay() !== 6) n++;
  }
  return d.toISOString().slice(0, 10);
}
async function quote(db, items, lock = false) {
  if (!Array.isArray(items) || !items.length || items.length > 100)
    fail("Carrito inválido.");
  const methods = (
    await db.query("SELECT * FROM shipping_methods WHERE enabled")
  ).rows.map(shippingRow);
  const lines = [],
    groups = new Map(),
    neededProducts = new Map(),
    neededPackages = new Map();
  let subtotal = 0;
  for (const i of items) {
    if (!int(i.quantity, 1, 1000)) fail("Cantidad inválida.");
    let p,
      pid = null,
      pkg = null,
      families,
      price;
    const id = String(i.id);
    if (id.startsWith("promo-")) {
      const r = (
        await db.query(
          `SELECT * FROM paquetes WHERE id=$1 AND activo${lock ? " FOR UPDATE" : ""}`,
          [id],
        )
      ).rows[0];
      if (!r) fail("Paquete no disponible.");
      p = packageRow(r);
      pkg = id;
      families = p.families;
      price = p.price;
      neededPackages.set(id, (neededPackages.get(id) || 0) + i.quantity);
      if (r.stock < neededPackages.get(id))
        fail(`Paquete agotado: ${p.title}.`, 409);
    } else {
      if (!/^\d+$/.test(id)) fail("Producto inválido.");
      const r = (
        await db.query(
          `SELECT * FROM productos WHERE id=$1 AND activo${lock ? " FOR UPDATE" : ""}`,
          [id],
        )
      ).rows[0];
      if (!r) fail("Producto no disponible.");
      p = productRow(r);
      pid = r.id;
      families = [family(p.category)];
      let extra = 0;
      if (families[0] === "waterlily") {
        const size = sizes.find((s) => s.id === (i.size || "mediano"));
        if (!size) fail("Tamaño inválido.");
        extra = size.priceExtra;
      }
      price = effectivePrice(r.precio, p.discountPercent, extra);
      neededProducts.set(id, (neededProducts.get(id) || 0) + i.quantity);
      if (r.stock < neededProducts.get(id))
        fail(`Stock insuficiente: ${p.title}.`, 409);
    }
    const mode = i.shippingType || "pickup";
    const method = methods.find((m) => m.id === mode);
    if (
      !method ||
      !families?.length ||
      !families.every((f) => method.families.includes(f))
    )
      fail(`El método de envío no es compatible con ${p.title}.`);
    groups.set(mode, method);
    const line = {
      id,
      pid,
      packageId: pkg,
      title: p.title,
      quantity: i.quantity,
      size: i.size || null,
      unitPrice: price,
      shippingType: mode,
      amount: (cents(price) * i.quantity) / 100,
    };
    lines.push(line);
    subtotal += cents(price) * i.quantity;
  }
  const shipping = [...groups.values()];
  const shippingCost = shipping.reduce((s, m) => s + cents(m.cost), 0);
  const requiresQuote = shipping.some((m) => m.quoteRequired);
  const min = Math.max(...shipping.map((m) => m.minDays)),
    max = Math.max(...shipping.map((m) => m.maxDays));
  return {
    lines,
    subtotal: subtotal / 100,
    shippingCost: shippingCost / 100,
    total: (subtotal + shippingCost) / 100,
    shipping,
    requiresQuote,
    purchasedAt: new Date().toISOString(),
    estimatedDelivery: {
      from: businessDate(min),
      to: businessDate(max),
      basis:
        "Estimación en días hábiles desde la confirmación del pago; sujeta a coordinación.",
    },
    policyVersion: POLICY_VERSION,
  };
}
export function installCommerce(app, { pool, wrap, signedIn, admin }) {
  const tx = async (fn) => {
    const db = await pool.connect();
    try {
      await db.query("BEGIN");
      await db.query("SELECT pg_advisory_xact_lock(972614)");
      const result = await fn(db);
      await db.query("COMMIT");
      return result;
    } catch (e) {
      await db.query("ROLLBACK");
      throw e;
    } finally {
      db.release();
    }
  };
  app.get(
    "/api/store",
    wrap(async (req, res) => {
      const settings = (
        await pool.query("SELECT datos FROM store_settings WHERE id=1")
      ).rows[0].datos;
      res.json({
        settings,
        policyVersion: POLICY_VERSION,
        policies: policySections,
        shipping: (
          await pool.query(
            "SELECT * FROM shipping_methods WHERE enabled ORDER BY id",
          )
        ).rows.map(shippingRow),
        packages: (
          await pool.query("SELECT * FROM paquetes WHERE activo ORDER BY id")
        ).rows.map(packageRow),
        paymentsEnabled: paymentReady(),
      });
    }),
  );
  app.post(
    "/api/quote",
    signedIn,
    wrap(async (req, res) => res.json(await quote(pool, req.body.items))),
  );
  app.post(
    "/api/orders",
    signedIn,
    wrap(async (req, res) => {
      const { items, address, acceptedTerms, policyVersion, checkoutKey } =
        req.body;
      if (acceptedTerms !== true || policyVersion !== POLICY_VERSION)
        fail("Acepta los términos y el aviso de privacidad vigentes.");
      if (!/^[0-9a-f-]{36}$/i.test(checkoutKey || ""))
        fail("Identificador de compra inválido.");
      if (
        !address ||
        !["street", "city", "zipCode", "phone"].every((k) =>
          str(address[k], 200),
        )
      )
        fail("Completa dirección, código postal y teléfono.");
      const result = await tx(async (db) => {
        const old = (
          await db.query(
            "SELECT id,total,datos FROM pedidos WHERE usuario_id=$1 AND checkout_key=$2",
            [req.user.id, checkoutKey],
          )
        ).rows[0];
        if (old)
          return { id: String(old.id), total: Number(old.total), ...old.datos };
        const q = await quote(db, items, true);
        if (q.requiresQuote)
          fail(
            "Este envío requiere cotización. Contacta al vendedor o elige recolección; no se realizó ningún cobro.",
          );
        for (const l of q.lines) {
          if (l.pid)
            await db.query("UPDATE productos SET stock=stock-$1 WHERE id=$2", [
              l.quantity,
              l.pid,
            ]);
          else
            await db.query("UPDATE paquetes SET stock=stock-$1 WHERE id=$2", [
              l.quantity,
              l.packageId,
            ]);
        }
        const a = Object.fromEntries(
          ["street", "colony", "city", "zipCode", "phone", "postalBranch"].map(
            (k) => [k, String(address[k] || "").slice(0, 200)],
          ),
        );
        if (
          q.shipping.some((m) => m.id === "correos_sucursal") &&
          !a.postalBranch.trim()
        )
          fail("Indica la sucursal postal de destino.");
        const meta = {
          ...q,
          address: a,
          paymentStatus: "pendiente",
          shippingType: q.shipping.map((m) => m.id).join(", "),
          consent: {
            version: POLICY_VERSION,
            at: new Date().toISOString(),
            settings: (
              await db.query("SELECT datos FROM store_settings WHERE id=1")
            ).rows[0].datos,
          },
          paymentReference: randomUUID(),
        };
        const r = (
          await db.query(
            "INSERT INTO pedidos(usuario_id,nombre_cliente,email_cliente,total,datos,checkout_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
            [
              req.user.id,
              `${req.user.nombre} ${req.user.apellido}`,
              req.user.email,
              q.total,
              meta,
              checkoutKey,
            ],
          )
        ).rows[0];
        for (const l of q.lines)
          await db.query(
            "INSERT INTO pedido_detalles(pedido_id,producto_id,titulo_producto,cantidad,precio_unitario) VALUES($1,$2,$3,$4,$5)",
            [r.id, l.pid, l.title, l.quantity, l.unitPrice],
          );
        return { id: String(r.id), total: q.total, ...meta };
      });
      res.status(201).json(result);
    }),
  );
  app.get(
    "/api/admin/clients",
    admin,
    wrap(async (req, res) =>
      res.json(
        (
          await pool.query(
            "SELECT u.id,u.nombre,u.apellido,u.email,u.rol,u.creado_en,u.consentimiento,(SELECT COUNT(*) FROM pedidos p WHERE p.usuario_id=u.id) AS pedidos FROM usuarios u ORDER BY u.creado_en DESC LIMIT 2000",
          )
        ).rows,
      ),
    ),
  );
  app.get(
    "/api/admin/commerce",
    admin,
    wrap(async (req, res) =>
      res.json({
        shipping: (
          await pool.query("SELECT * FROM shipping_methods ORDER BY id")
        ).rows.map(shippingRow),
        packages: (
          await pool.query("SELECT * FROM paquetes ORDER BY id")
        ).rows.map(packageRow),
        settings: (
          await pool.query("SELECT datos FROM store_settings WHERE id=1")
        ).rows[0].datos,
        paymentsEnabled: paymentReady(),
      }),
    ),
  );
  app.put(
    "/api/admin/shipping/:id",
    admin,
    wrap(async (req, res) => {
      const x = req.body;
      if (
        !str(x.label, 150) ||
        !number(x.cost) ||
        !int(x.minDays, 0, 365) ||
        !int(x.maxDays, x.minDays, 365) ||
        typeof x.enabled !== "boolean" ||
        typeof x.quoteRequired !== "boolean"
      )
        fail("Revisa tarifa, días y disponibilidad.");
      const q = await pool.query(
        "UPDATE shipping_methods SET label=$1,cost=$2,min_days=$3,max_days=$4,quote_required=$5,enabled=$6,carrier=$7,notes=$8 WHERE id=$9 RETURNING id",
        [
          x.label,
          x.cost,
          x.minDays,
          x.maxDays,
          x.quoteRequired,
          x.enabled,
          String(x.carrier || "").slice(0, 150),
          String(x.notes || "").slice(0, 1000),
          req.params.id,
        ],
      );
      if (!q.rowCount) fail("Método no encontrado.", 404);
      res.json({ success: true });
    }),
  );
  app.put(
    "/api/admin/packages/:id",
    admin,
    wrap(async (req, res) => {
      const x = req.body;
      if (
        !/^promo-[a-z0-9-]{1,60}$/.test(req.params.id) ||
        !str(x.title, 150) ||
        !number(x.basePrice) ||
        !(
          x.promotionPrice === null || number(x.promotionPrice, 0, x.basePrice)
        ) ||
        !int(x.stock) ||
        !Array.isArray(x.families) ||
        !x.families.length ||
        x.families.some(
          (f) => !["fish", "lotus", "waterlily", "seeds", "other"].includes(f),
        )
      )
        fail("Paquete inválido.");
      const data = {
        title: x.title,
        subtitle: String(x.subtitle || "").slice(0, 150),
        description: String(x.description || "").slice(0, 4000),
        basePrice: x.basePrice,
        promotionPrice: x.promotionPrice,
        families: x.families,
        theme: ["card-green", "card-teal", "card-dark"].includes(x.theme)
          ? x.theme
          : "card-green",
      };
      await pool.query(
        "INSERT INTO paquetes(id,datos,stock,activo) VALUES($1,$2,$3,$4) ON CONFLICT(id) DO UPDATE SET datos=EXCLUDED.datos,stock=EXCLUDED.stock,activo=EXCLUDED.activo",
        [req.params.id, data, x.stock, x.active !== false],
      );
      res.json({ success: true });
    }),
  );
  app.put(
    "/api/admin/settings",
    admin,
    wrap(async (req, res) => {
      const data = {};
      for (const k of [
        "sellerName",
        "sellerLegalName",
        "sellerAddress",
        "contactEmail",
        "contactPhone",
        "shippingNotes",
        "returnNotes",
        "privacyNotes",
      ])
        data[k] = String(req.body[k] || "")
          .trim()
          .slice(0, 2000);
      if (!str(data.sellerName) || !/^\S+@\S+\.\S+$/.test(data.contactEmail))
        fail("Completa nombre comercial y correo de contacto.");
      await pool.query("UPDATE store_settings SET datos=$1 WHERE id=1", [data]);
      res.json({ success: true });
    }),
  );
  // Products preserve base prices; promotions and gallery are validated server-side.
  app.put(
    "/api/manage/products",
    admin,
    wrap(async (req, res) => {
      const { upserts = [], deleted = [] } = req.body;
      if (
        !Array.isArray(upserts) ||
        !Array.isArray(deleted) ||
        upserts.length > 500 ||
        deleted.length > 500
      )
        fail("Cambios inválidos.");
      await tx(async (db) => {
        for (const x of upserts) {
          const base = x.basePrice ?? x.price,
            discount = x.discountPercent ?? 0,
            gallery = x.gallery || [];
          if (
            !int(Number(x.id), 1, Number.MAX_SAFE_INTEGER) ||
            !str(x.title, 150) ||
            !str(x.category, 50) ||
            !number(base) ||
            !number(discount, 0, 90) ||
            !int(x.stock) ||
            !Array.isArray(gallery) ||
            gallery.length > 12 ||
            gallery.some((s) => !imageOK(s)) ||
            (x.image && !imageOK(x.image))
          )
            fail("Revisa producto, descuento o URLs de imágenes HTTPS.");
          await db.query(
            `INSERT INTO productos(id,titulo,categoria,descripcion,precio,stock,imagen_url,datos) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET titulo=EXCLUDED.titulo,categoria=EXCLUDED.categoria,descripcion=EXCLUDED.descripcion,precio=EXCLUDED.precio,stock=EXCLUDED.stock,imagen_url=EXCLUDED.imagen_url,datos=EXCLUDED.datos,activo=TRUE`,
            [
              x.id,
              x.title,
              x.category,
              String(x.description || "").slice(0, 4000),
              base,
              x.stock,
              x.image || "",
              {
                unit: String(x.unit || "unidad").slice(0, 50),
                characteristics: Array.isArray(x.characteristics)
                  ? x.characteristics.slice(0, 20)
                  : [],
                discountPercent: discount,
                gallery,
              },
            ],
          );
        }
        for (const id of deleted) {
          if (!int(Number(id), 1, Number.MAX_SAFE_INTEGER))
            fail("Identificador inválido.");
          await db.query("UPDATE productos SET activo=FALSE WHERE id=$1", [id]);
        }
      });
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/reservations",
    signedIn,
    wrap(async (req, res) => {
      const { eventId, tickets, nombre, telefono } = req.body;
      if (
        !int(Number(eventId), 1, Number.MAX_SAFE_INTEGER) ||
        !int(tickets, 1, 100) ||
        !str(nombre)
      )
        fail("Reserva inválida.");
      const result = await tx(async (db) => {
        const e = (
          await db.query(
            "SELECT * FROM eventos WHERE id=$1 AND activo FOR UPDATE",
            [eventId],
          )
        ).rows[0];
        if (!e) fail("Evento no disponible.");
        const n = Number(
          (
            await db.query(
              "SELECT COALESCE(SUM(lugares),0) AS n FROM reservas WHERE evento_id=$1",
              [eventId],
            )
          ).rows[0].n,
        );
        if (e.capacidad !== null && n + tickets > e.capacidad)
          fail("No hay lugares suficientes.", 409);
        const id = randomUUID(),
          total = Number(e.precio) * tickets;
        await db.query(
          "INSERT INTO reservas(id,evento_id,usuario_id,nombre,email,telefono,lugares,total,estado) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
          [
            id,
            eventId,
            req.user.id,
            nombre,
            req.user.email,
            String(telefono || "").slice(0, 40),
            tickets,
            total,
            total === 0 ? "confirmada" : "pendiente",
          ],
        );
        const tokens = [];
        for (let i = 1; i <= tickets; i++) {
          const token = randomBytes(32).toString("hex");
          tokens.push(token);
          await db.query(
            "INSERT INTO entradas(token_hash,reserva_id,ordinal) VALUES($1,$2,$3)",
            [digest(token), id, i],
          );
        }
        return {
          id,
          ticketIds: tokens,
          total,
          paymentStatus: total === 0 ? "approved" : "pendiente",
        };
      });
      res.status(201).json(result);
    }),
  );
  app.get(
    "/api/my-reservations",
    signedIn,
    wrap(async (req, res) =>
      res.json(
        (
          await pool.query(
            "SELECT r.id,r.lugares,r.total,r.estado,e.titulo,e.inicio,(SELECT COUNT(*) FROM entradas t WHERE t.reserva_id=r.id AND t.usado_en IS NOT NULL) AS usados FROM reservas r JOIN eventos e ON e.id=r.evento_id WHERE r.usuario_id=$1 ORDER BY r.creado_en DESC",
            [req.user.id],
          )
        ).rows,
      ),
    ),
  );
  app.post(
    "/api/reservations/:id/tickets",
    signedIn,
    wrap(async (req, res) => {
      const tokens = await tx(async (db) => {
        const r = (
          await db.query(
            "SELECT * FROM reservas WHERE id=$1 AND usuario_id=$2 FOR UPDATE",
            [req.params.id, req.user.id],
          )
        ).rows[0];
        if (!r) fail("Reserva no encontrada.", 404);
        const out = [];
        for (let i = 1; i <= r.lugares; i++) {
          const old = (
            await db.query(
              "SELECT usado_en FROM entradas WHERE reserva_id=$1 AND ordinal=$2",
              [r.id, i],
            )
          ).rows[0];
          if (old?.usado_en) continue;
          const token = randomBytes(32).toString("hex");
          await db.query(
            "INSERT INTO entradas(token_hash,reserva_id,ordinal) VALUES($1,$2,$3) ON CONFLICT(reserva_id,ordinal) DO UPDATE SET token_hash=EXCLUDED.token_hash",
            [digest(token), r.id, i],
          );
          out.push(token);
        }
        return out;
      });
      res.json({ ticketIds: tokens });
    }),
  );
  app.post(
    "/api/admin/tickets/consume",
    admin,
    wrap(async (req, res) => {
      const { token, eventId } = req.body;
      if (
        !/^[a-f0-9]{64}$/.test(token || "") ||
        !int(Number(eventId), 1, Number.MAX_SAFE_INTEGER)
      )
        fail("Selecciona el evento y escanea un QR de entrada válido.");
      const result = await tx(async (db) => {
        const r = (
          await db.query(
            "SELECT t.*,r.estado,r.evento_id,r.nombre,r.total,e.titulo FROM entradas t JOIN reservas r ON r.id=t.reserva_id JOIN eventos e ON e.id=r.evento_id WHERE t.token_hash=$1 FOR UPDATE OF t",
            [digest(token)],
          )
        ).rows[0];
        if (!r) fail("Entrada no válida.", 404);
        if (String(r.evento_id) !== String(eventId))
          fail("La entrada corresponde a otro evento.", 409);
        if (r.usado_en) fail("Este QR ya fue utilizado.", 409);
        if (Number(r.total) > 0 && r.estado !== "confirmada")
          fail("Reserva con pago pendiente. No permite el acceso.", 409);
        const q = await db.query(
          "UPDATE entradas SET usado_en=NOW(),usado_por=$1 WHERE token_hash=$2 AND usado_en IS NULL RETURNING usado_en",
          [req.user.id, digest(token)],
        );
        if (!q.rowCount) fail("Este QR ya fue utilizado.", 409);
        await db.query(
          "INSERT INTO commerce_audit(actor,accion,referencia) VALUES($1,$2,$3)",
          [req.user.id, "entrada_utilizada", r.reserva_id],
        );
        return {
          name: r.nombre,
          event: r.titulo,
          usedAt: q.rows[0].usado_en,
          ordinal: r.ordinal,
        };
      });
      res.json(result);
    }),
  );
  // A new preference can be retried for the same pending order; only a verified payment authorizes fulfilment.
  app.post(
    "/api/payments/:kind/:id",
    signedIn,
    wrap(async (req, res) => {
      if (!paymentReady())
        fail(
          "Mercado Pago aún no está configurado. No se realizó ningún cobro.",
          503,
        );
      const kind = req.params.kind;
      if (!["order", "reservation"].includes(kind))
        fail("Referencia inválida.");
      const r = (
        await pool.query(
          kind === "order"
            ? "SELECT id,total,datos,estado FROM pedidos WHERE id=$1 AND usuario_id=$2"
            : "SELECT id,total,estado FROM reservas WHERE id=$1 AND usuario_id=$2",
          [req.params.id, req.user.id],
        )
      ).rows[0];
      if (!r) fail("Compra no encontrada.", 404);
      if (
        r.estado === "cancelado" ||
        r.datos?.paymentStatus === "approved" ||
        (kind === "reservation" && r.estado === "confirmada") ||
        Number(r.total) <= 0
      )
        fail("Esta operación no admite un nuevo pago.");
      const reference = `${kind}:${r.id}`,
        base = publicURL();
      const mp = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": digest(reference),
          },
          body: JSON.stringify({
            items: [
              {
                id: reference,
                title: `Nenúfares · ${kind === "order" ? "pedido" : "reserva"} ${r.id}`,
                currency_id: "MXN",
                quantity: 1,
                unit_price: Number(r.total),
              },
            ],
            external_reference: reference,
            payer: { email: req.user.email },
            notification_url: `${base}/api/payments/webhook`,
            back_urls: {
              success: `${base}/?payment=review`,
              pending: `${base}/?payment=review`,
              failure: `${base}/?payment=review`,
            },
            auto_return: "approved",
          }),
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!mp.ok)
        fail("Mercado Pago no pudo iniciar el pago. Intenta más tarde.", 502);
      const data = await mp.json();
      const url = data.init_point;
      if (
        !/^https:\/\/([a-z0-9-]+\.)?mercadopago\.(com(\.(mx|ar|br|co|pe|uy))?|cl|com\.ve)\//i.test(
          url || "",
        )
      )
        fail("Respuesta de pago inválida.", 502);
      res.json({ url });
    }),
  );
  app.post(
    "/api/payments/webhook",
    wrap(async (req, res) => {
      if (!paymentReady()) fail("Pago no configurado.", 503);
      const id = String(req.query["data.id"] || "");
      const requestId = req.get("x-request-id") || "";
      const parts = Object.fromEntries(
        String(req.get("x-signature") || "")
          .split(",")
          .map((x) => x.split("=")),
      );
      const ts = parts.ts || "",
        sig = parts.v1 || "";
      if (
        !/^\d{1,40}$/.test(id) ||
        !str(requestId, 200) ||
        !/^\d{10,13}$/.test(ts) ||
        !/^\w{64}$/.test(sig)
      )
        fail("Firma inválida.", 401);
      const expected = createHmac(
        "sha256",
        process.env.MERCADOPAGO_WEBHOOK_SECRET,
      )
        .update(`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`)
        .digest("hex");
      if (!timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
        fail("Firma inválida.", 401);
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
          signal: AbortSignal.timeout(15000),
        },
      );
      if (!response.ok) fail("No fue posible verificar el pago.", 502);
      const p = await response.json();
      if (
        String(p.id) !== id ||
        p.currency_id !== "MXN" ||
        !/^((order:\d+)|(reservation:[a-f0-9-]{36}))$/.test(
          p.external_reference || "",
        )
      )
        fail("Pago no reconocido.", 400);
      const [kind, target] = p.external_reference.split(":");
      await tx(async (db) => {
        const r = (
          await db.query(
            kind === "order"
              ? "SELECT id,total,datos,estado FROM pedidos WHERE id=$1 FOR UPDATE"
              : "SELECT id,total,estado,payment_id FROM reservas WHERE id=$1 FOR UPDATE",
            [target],
          )
        ).rows[0];
        if (!r || cents(r.total) !== cents(p.transaction_amount))
          fail("El pago no coincide con el total.", 409);
        if (r.estado === "cancelado")
          fail(
            "Pedido cancelado: revisar y reembolsar el pago en Mercado Pago.",
            409,
          );
        const prior = (
          await db.query(
            "SELECT reference,estado,datos FROM payment_receipts WHERE payment_id=$1",
            [id],
          )
        ).rows[0];
        if (prior && prior.reference !== p.external_reference)
          fail("Pago ya asociado.", 409);
        const currentId = kind === "order" ? r.datos?.paymentId : r.payment_id;
        const currentlyPaid =
          kind === "order"
            ? r.datos?.paymentStatus === "approved"
            : r.estado === "confirmada";
        if (currentlyPaid && currentId && currentId !== id) {
          if (p.status === "approved")
            fail("Pago duplicado: requiere revisión y reembolso.", 409);
          return; // A failed alternative attempt must never replace an approved payment.
        }
        const previousTime = Date.parse(prior?.datos?.updatedAt || "");
        const incomingTime = Date.parse(p.date_last_updated || "");
        if (
          Number.isFinite(previousTime) &&
          Number.isFinite(incomingTime) &&
          incomingTime < previousTime
        )
          return;
        if (
          prior?.estado === "approved" &&
          !["approved", "refunded", "charged_back"].includes(p.status)
        )
          return;
        await db.query(
          "INSERT INTO payment_receipts(payment_id,reference,estado,datos) VALUES($1,$2,$3,$4) ON CONFLICT(payment_id) DO UPDATE SET estado=EXCLUDED.estado,datos=EXCLUDED.datos,actualizado_en=NOW()",
          [
            id,
            p.external_reference,
            p.status,
            {
              amount: p.transaction_amount,
              currency: p.currency_id,
              updatedAt: p.date_last_updated || null,
            },
          ],
        );
        if (kind === "order") {
          const data = { ...r.datos, paymentStatus: p.status, paymentId: id };
          if (
            p.status === "approved" &&
            r.datos?.paymentStatus !== "approved" &&
            r.datos?.shipping?.length
          ) {
            data.estimatedDelivery = {
              from: businessDate(
                Math.max(...r.datos.shipping.map((m) => m.minDays)),
              ),
              to: businessDate(
                Math.max(...r.datos.shipping.map((m) => m.maxDays)),
              ),
              basis: "Desde confirmación de pago; estimación en días hábiles.",
            };
          }
          await db.query("UPDATE pedidos SET datos=$1 WHERE id=$2", [
            data,
            target,
          ]);
        } else
          await db.query(
            "UPDATE reservas SET estado=$1,payment_id=$2 WHERE id=$3",
            [p.status === "approved" ? "confirmada" : "pendiente", id, target],
          );
      });
      res.json({ success: true });
    }),
  );
}
