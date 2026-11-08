import { useEffect, useState } from "react";
import Tickets from "./Tickets";
import { api } from "../api";
import { money } from "../../shared/commerce";
export default function CustomerPurchases({ user }) {
  const [orders, setOrders] = useState([]),
    [reservations, setReservations] = useState([]),
    [error, setError] = useState(""),
    [tokens, setTokens] = useState([]),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    let live = true;
    const load = () =>
      Promise.all([api("/orders"), api("/my-reservations")])
        .then(([o, r]) => {
          if (live) {
            setOrders(o);
            setReservations(r);
          }
        })
        .catch((e) => {
          if (live) setError(e.message);
        });
    load();
    window.addEventListener("nenufares:updated", load);
    return () => {
      live = false;
      window.removeEventListener("nenufares:updated", load);
    };
  }, [user]);
  if (!user) return null;
  const action = async (fn) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const pay = (kind, id) =>
    action(async () => {
      const r = await api(`/payments/${kind}/${id}`, { method: "POST" });
      window.location.assign(r.url);
    });
  return (
    <section className="commerce-panel" id="mis-compras">
      <h2>Mis compras y entradas</h2>
      <p>
        El estado se confirma con el proveedor de pago. Si acabas de pagar,
        vuelve a actualizar.
      </p>
      <button
        onClick={() =>
          window.dispatchEvent(new CustomEvent("nenufares:updated"))
        }
      >
        Actualizar estado
      </button>
      {error && (
        <p role="alert" className="commerce-error">
          {error}
        </p>
      )}
      {orders.map((o) => (
        <details key={o.id}>
          <summary>
            Pedido #{o.id} · {money(o.total)} · Pago:{" "}
            {o.paymentStatus || "pendiente"}
          </summary>
          <p>
            Compra:{" "}
            {o.purchasedAt
              ? new Date(o.purchasedAt).toLocaleString("es-MX")
              : o.date}{" "}
            · {o.status}
          </p>
          <p>
            Envío: {money(o.shippingCost)}. Total incluido: {money(o.total)}
          </p>
          {o.estimatedDelivery && (
            <p>
              Entrega aproximada desde el pago: {o.estimatedDelivery.from} a{" "}
              {o.estimatedDelivery.to}
            </p>
          )}
          {o.items.map((l, i) => (
            <p key={i}>
              {l.quantity} × {l.title}
            </p>
          ))}
          {o.paymentStatus !== "approved" && o.status !== "Cancelado" && (
            <button disabled={busy} onClick={() => pay("order", o.id)}>
              Pagar con Mercado Pago ↗
            </button>
          )}
        </details>
      ))}
      {reservations.map((r) => (
        <details key={r.id}>
          <summary>
            {r.titulo} · {r.lugares} entradas · {r.estado}
          </summary>
          <p>
            {r.usados} entradas utilizadas. Total: {money(r.total)}
          </p>
          {r.estado !== "confirmada" && Number(r.total) > 0 && (
            <button disabled={busy} onClick={() => pay("reservation", r.id)}>
              Pagar reserva con Mercado Pago ↗
            </button>
          )}
          <p>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  const t = await api(`/reservations/${r.id}/tickets`, {
                    method: "POST",
                  });
                  setTokens(t.ticketIds);
                })
              }
            >
              Generar QR de entradas sin usar
            </button>
          </p>
          <small>
            Generar nuevos QR invalida los anteriores que no se hayan utilizado.
          </small>
        </details>
      ))}
      {tokens.length > 0 && <Tickets tokens={tokens} />}
    </section>
  );
}
