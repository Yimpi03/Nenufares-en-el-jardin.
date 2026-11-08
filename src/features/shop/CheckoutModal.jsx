import { useEffect, useState } from "react";
import { api, updated } from "../../api";
import { useStore } from "../../commerce/useStore";
import { PolicyLink } from "../../commerce/Policies";
import { family, money, POLICY_VERSION } from "../../../shared/commerce";
export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  setCartItems,
}) {
  const { store } = useStore();
  const [address, setAddress] = useState({
      street: "",
      colony: "",
      city: "",
      zipCode: "",
      phone: "",
      postalBranch: "",
    }),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [order, setOrder] = useState(null),
    [consent, setConsent] = useState(false),
    [key, setKey] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (!isOpen || !cartItems.length) return;
    let live = true;
    Promise.resolve().then(() => {
      if (live) {
        setQuote(null);
        setError("");
      }
    });
    api("/quote", { method: "POST", body: { items: cartItems } })
      .then((q) => {
        if (live) setQuote(q);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, [isOpen, cartItems]);
  if (!isOpen) return null;
  const close = () => {
    if (busy) return;
    setOrder(null);
    setConsent(false);
    setKey(crypto.randomUUID());
    onClose();
  };
  const pay = async () => {
    setBusy(true);
    setError("");
    try {
      const p = await api(`/payments/order/${order.id}`, { method: "POST" });
      window.location.assign(p.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await api("/orders", {
        method: "POST",
        body: {
          items: cartItems,
          address,
          acceptedTerms: consent,
          policyVersion: POLICY_VERSION,
          checkoutKey: key,
        },
      });
      setOrder(r);
      setCartItems([]);
      updated();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="commerce-overlay">
      <section
        className="commerce-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Finalizar compra"
      >
        <button
          className="commerce-close"
          onClick={close}
          disabled={busy}
          aria-label="Cerrar compra"
        >
          ×
        </button>
        {error && (
          <p className="commerce-error" role="alert">
            {error}
          </p>
        )}
        {order ? (
          <>
            <h2>Pedido #{order.id}</h2>
            <p>
              Fecha de compra:{" "}
              {new Date(order.purchasedAt).toLocaleString("es-MX")}
            </p>
            <p>
              Total: <strong>{money(order.total)}</strong>
            </p>
            <p className="commerce-note">
              Pedido pendiente de pago. No se ha realizado ningún cobro.
            </p>
            {store?.paymentsEnabled ? (
              <button disabled={busy} onClick={pay}>
                Pagar con Mercado Pago ↗
              </button>
            ) : (
              <p>
                El vendedor aún debe configurar Mercado Pago. Puedes consultar
                este pedido en tu perfil.
              </p>
            )}
            <button onClick={close}>Volver a la tienda</button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2>Revisa tu compra</h2>
            <div className="commerce-grid">
              <div>
                {cartItems.map((i, n) => {
                  const categories = i.families || [family(i.category)];
                  return (
                    <fieldset key={i.lineId || n}>
                      <legend>
                        {i.quantity} × {i.name || i.title}
                      </legend>
                      <label>
                        Método de envío
                        <select
                          value={i.shippingType || "pickup"}
                          onChange={(e) =>
                            setCartItems((old) =>
                              old.map((l, index) =>
                                index === n
                                  ? { ...l, shippingType: e.target.value }
                                  : l,
                              ),
                            )
                          }
                        >
                          {store?.shipping
                            .filter((m) =>
                              categories.every((f) => m.families.includes(f)),
                            )
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.label} ·{" "}
                                {m.quoteRequired
                                  ? "Requiere cotización"
                                  : money(m.cost)}
                              </option>
                            ))}
                        </select>
                      </label>
                    </fieldset>
                  );
                })}
                {quote && (
                  <>
                    <p>Productos: {money(quote.subtotal)}</p>
                    <p>
                      Envíos:{" "}
                      {quote.requiresQuote
                        ? "Pendiente de cotización"
                        : money(quote.shippingCost)}
                    </p>
                    {quote.shipping.map((m) => (
                      <p key={m.id}>
                        <strong>{m.label}</strong> · {m.carrier}
                        <br />
                        {m.notes}
                      </p>
                    ))}
                    <h3>
                      {quote.requiresQuote
                        ? "Cotiza para conocer el total"
                        : `Total: ${money(quote.total)}`}
                    </h3>
                    <p>
                      Fecha prevista de compra:{" "}
                      {new Date(quote.purchasedAt).toLocaleDateString("es-MX")}
                    </p>
                    <p>
                      Entrega aproximada: {quote.estimatedDelivery.from} a{" "}
                      {quote.estimatedDelivery.to}.{" "}
                      {quote.estimatedDelivery.basis}
                    </p>
                    <p>
                      <small>
                        Se cobra una tarifa por método de envío usado en el
                        pedido, sin multiplicarla por producto.
                      </small>
                    </p>
                  </>
                )}
              </div>
              <div>
                <h3>Datos de entrega o recolección</h3>
                {Object.entries({
                  street: "Calle y número",
                  colony: "Colonia",
                  city: "Ciudad / municipio",
                  zipCode: "Código postal",
                  phone: "Teléfono",
                  postalBranch: "Sucursal postal (si corresponde)",
                }).map(([k, label]) => (
                  <label key={k}>
                    {label}
                    <input
                      required={!["colony", "postalBranch"].includes(k)}
                      maxLength="200"
                      value={address[k]}
                      onChange={(e) =>
                        setAddress({ ...address, [k]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="consent">
                  <input
                    required
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    He leído y acepto <PolicyLink />.
                  </span>
                </label>
                {quote?.requiresQuote && (
                  <p className="commerce-note">
                    Contacta al vendedor en {store?.settings.contactEmail} para
                    cotizar o elige recolección.
                  </p>
                )}
                <button
                  disabled={busy || !quote || quote.requiresQuote || !consent}
                >
                  {busy ? "Registrando…" : "Confirmar pedido"}
                </button>
                <p>
                  <small>
                    Después podrás abrir Mercado Pago para pagar. Nunca
                    introduzcas tu tarjeta aquí.
                  </small>
                </p>
              </div>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
