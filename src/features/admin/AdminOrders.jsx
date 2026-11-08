import { useState } from "react";
import { api, updated } from "../../api";
import { money } from "../../../shared/commerce";
export default function AdminOrders({ ordersData = [] }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const change = async (id, status) => {
    setBusy(true);
    setError("");
    try {
      await api("/manage/orders", {
        method: "PUT",
        body: { upserts: [{ id, status }] },
      });
      updated();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="commerce-panel">
      <h2>Pedidos, pagos y entregas</h2>
      <p>
        El total incluye los envíos. Despacha únicamente pagos verificados. Un
        cambio de estado no genera reembolsos.
      </p>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
      {ordersData.length === 0 && <p>No hay pedidos.</p>}
      {ordersData.map((o) => (
        <fieldset key={o.id}>
          <legend>
            Pedido #{o.id} · {o.customerName} · {money(o.total)}
          </legend>
          <div className="commerce-grid">
            <div>
              <p>
                {o.customerEmail} · {o.address?.phone}
              </p>
              <p>
                Compra:{" "}
                {o.purchasedAt
                  ? new Date(o.purchasedAt).toLocaleString("es-MX")
                  : o.date}
              </p>
              <p>
                Pago: <strong>{o.paymentStatus || "pendiente"}</strong> ·{" "}
                {o.paymentId || "Sin comprobante de Mercado Pago"}
              </p>
              {o.items.map((l, i) => (
                <p key={i}>
                  {l.quantity} × {l.title} ·{" "}
                  {money(Number(l.price) * l.quantity)}
                </p>
              ))}
              <p>
                Productos: {money(o.subtotal ?? o.total)} · Envíos:{" "}
                {money(o.shippingCost)} · Total: {money(o.total)}
              </p>
            </div>
            <div>
              {o.shipping?.map((m) => (
                <p key={m.id}>
                  {m.label} · {m.carrier} · {money(m.cost)}
                </p>
              ))}
              <p>
                {o.address &&
                  Object.values(o.address).filter(Boolean).join(", ")}
              </p>
              {o.estimatedDelivery && (
                <p>
                  Entrega aproximada: {o.estimatedDelivery.from} a{" "}
                  {o.estimatedDelivery.to}. Contada desde pago confirmado.
                </p>
              )}
              <label>
                Estado
                <select
                  disabled={busy || o.status === "Cancelado"}
                  value={o.status}
                  onChange={(e) => change(o.id, e.target.value)}
                >
                  {[
                    "Pendiente",
                    "Procesando",
                    "Enviado",
                    "Entregado",
                    "Cancelado",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </fieldset>
      ))}
    </section>
  );
}
