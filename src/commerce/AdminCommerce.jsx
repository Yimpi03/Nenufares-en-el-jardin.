import { useEffect, useState } from "react";
import { api, updated } from "../api";
import { money } from "../../shared/commerce";
const sellerLabels = {
  sellerName: "Nombre comercial",
  sellerLegalName: "Nombre legal del responsable",
  sellerAddress: "Domicilio completo del responsable",
  contactEmail: "Correo de atención y privacidad",
  contactPhone: "Teléfono",
  shippingNotes: "Información adicional de envíos",
  returnNotes: "Información adicional de devoluciones",
  privacyNotes: "Información adicional de privacidad",
};
export default function AdminCommerce({ tab }) {
  const [data, setData] = useState(null),
    [clients, setClients] = useState([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    const run =
      tab === "clientes"
        ? api("/admin/clients").then((r) => {
            if (live) setClients(r);
          })
        : api("/admin/commerce").then((r) => {
            if (live) setData(r);
          });
    run.catch((e) => {
      if (live) setError(e.message);
    });
    return () => {
      live = false;
    };
  }, [tab]);
  const save = async (path, body) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(path, { method: "PUT", body });
      updated();
      setNotice("Cambios guardados.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const edit = (kind, index, key, value) =>
    setData((d) => ({
      ...d,
      [kind]: d[kind].map((x, i) => (i === index ? { ...x, [key]: value } : x)),
    }));
  return (
    <section className="commerce-panel">
      <h2>
        {
          {
            clientes: "Clientes registrados",
            envios: "Tarifas y métodos de envío",
            paquetes: "Paquetes y promociones",
            politicas: "Datos del vendedor y políticas",
          }[tab]
        }
      </h2>
      {error && (
        <p role="alert" className="commerce-error">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="commerce-success">
          {notice}
        </p>
      )}
      {tab === "clientes" ? (
        <>
          <p>
            Solo el administrador puede consultar esta información. No se
            incluyen contraseñas ni tokens.
          </p>
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Correo electrónico</th>
                <th>Rol</th>
                <th>Pedidos</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    {c.nombre} {c.apellido}
                  </td>
                  <td>{c.email}</td>
                  <td>{c.rol}</td>
                  <td>{c.pedidos}</td>
                  <td>{new Date(c.creado_en).toLocaleDateString("es-MX")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : !data ? (
        <p>Cargando…</p>
      ) : tab === "envios" ? (
        <>
          <p>
            Una tarifa por método utilizado en cada pedido. Las categorías
            permitidas están restringidas para evitar envíos de peces por correo
            postal. Desactiva «Por cotizar» únicamente después de confirmar
            costo, ruta y transportista.
          </p>
          {data.shipping.map((m, i) => (
            <form
              key={m.id}
              onSubmit={(e) => {
                e.preventDefault();
                save(`/admin/shipping/${m.id}`, m);
              }}
            >
              <fieldset>
                <legend>{m.label}</legend>
                <div className="commerce-grid">
                  {[
                    ["label", "Nombre"],
                    ["carrier", "Transportista"],
                    ["cost", "Costo MXN"],
                    ["minDays", "Días hábiles mínimos"],
                    ["maxDays", "Días hábiles máximos"],
                  ].map(([k, label]) => (
                    <label key={k}>
                      {label}
                      <input
                        required
                        type={
                          ["cost", "minDays", "maxDays"].includes(k)
                            ? "number"
                            : "text"
                        }
                        min="0"
                        max={k === "cost" ? 1000000 : undefined}
                        step={k === "cost" ? ".01" : 1}
                        value={m[k]}
                        onChange={(e) =>
                          edit(
                            "shipping",
                            i,
                            k,
                            ["cost", "minDays", "maxDays"].includes(k)
                              ? Number(e.target.value)
                              : e.target.value,
                          )
                        }
                      />
                    </label>
                  ))}
                </div>
                <label>
                  Condiciones
                  <textarea
                    value={m.notes}
                    onChange={(e) =>
                      edit("shipping", i, "notes", e.target.value)
                    }
                  />
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={m.quoteRequired}
                    onChange={(e) =>
                      edit("shipping", i, "quoteRequired", e.target.checked)
                    }
                  />{" "}
                  Por cotizar: impide cobrar sin precio confirmado
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={m.enabled}
                    onChange={(e) =>
                      edit("shipping", i, "enabled", e.target.checked)
                    }
                  />{" "}
                  Disponible
                </label>
                <small>Categorías: {m.families.join(", ")}</small>
                <button disabled={busy}>Guardar tarifa</button>
              </fieldset>
            </form>
          ))}
        </>
      ) : tab === "paquetes" ? (
        <>
          <p>
            El stock es por paquete completo, separado del inventario
            individual. Confirma que cuentas con todos los componentes antes de
            habilitar existencias.
          </p>
          <button
            onClick={() =>
              setData((d) => ({
                ...d,
                packages: [
                  ...d.packages,
                  {
                    id: `promo-${crypto.randomUUID()}`,
                    title: "Nuevo paquete",
                    subtitle: "",
                    description: "",
                    basePrice: 0,
                    promotionPrice: null,
                    families: ["lotus"],
                    stock: 0,
                    active: false,
                    theme: "card-green",
                  },
                ],
              }))
            }
          >
            Nuevo paquete
          </button>
          {data.packages.map((p, i) => (
            <form
              key={p.id}
              onSubmit={(e) => {
                e.preventDefault();
                save(`/admin/packages/${p.id}`, p);
              }}
            >
              <fieldset>
                <legend>
                  {p.title} · {money(p.promotionPrice ?? p.basePrice)}
                </legend>
                {[
                  ["title", "Nombre"],
                  ["subtitle", "Subtítulo"],
                  ["description", "Contenido y descripción"],
                  ["basePrice", "Precio normal MXN"],
                  ["promotionPrice", "Precio promoción (vacío: sin promoción)"],
                  ["stock", "Paquetes completos disponibles"],
                ].map(([k, label]) => (
                  <label key={k}>
                    {label}
                    <input
                      required={k !== "promotionPrice"}
                      type={
                        ["basePrice", "promotionPrice", "stock"].includes(k)
                          ? "number"
                          : "text"
                      }
                      min="0"
                      step={k === "stock" ? 1 : ".01"}
                      value={p[k] ?? ""}
                      onChange={(e) =>
                        edit(
                          "packages",
                          i,
                          k,
                          ["basePrice", "promotionPrice", "stock"].includes(k)
                            ? k === "promotionPrice" && e.target.value === ""
                              ? null
                              : Number(e.target.value)
                            : e.target.value,
                        )
                      }
                    />
                  </label>
                ))}
                <label>
                  Contenido para envío (selección múltiple)
                  <select
                    multiple
                    value={p.families}
                    onChange={(e) =>
                      edit(
                        "packages",
                        i,
                        "families",
                        [...e.target.selectedOptions].map((o) => o.value),
                      )
                    }
                  >
                    {[
                      ["fish", "Peces"],
                      ["waterlily", "Nenúfares"],
                      ["lotus", "Lotos"],
                      ["seeds", "Semillas"],
                      ["other", "Otros"],
                    ].map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="consent">
                  <input
                    type="checkbox"
                    checked={p.active}
                    onChange={(e) =>
                      edit("packages", i, "active", e.target.checked)
                    }
                  />{" "}
                  Publicado
                </label>
                <button disabled={busy}>Guardar paquete</button>
              </fieldset>
            </form>
          ))}
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save("/admin/settings", data.settings);
          }}
        >
          <p className="commerce-note">
            Completa identidad legal, domicilio y procedimientos reales antes de
            vender. Los textos son una base editable de operación y deben
            revisarse para tu negocio. No agregues condiciones que reduzcan los
            derechos del consumidor.
          </p>
          {Object.entries(sellerLabels).map(([k, label]) => (
            <label key={k}>
              {label}
              <textarea
                value={data.settings[k]}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    settings: { ...d.settings, [k]: e.target.value },
                  }))
                }
              />
            </label>
          ))}
          <p>
            Mercado Pago:{" "}
            {data.paymentsEnabled
              ? "credenciales configuradas"
              : "pendiente de configurar en Render"}
          </p>
          <p>
            Configura MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_WEBHOOK_SECRET y
            notificaciones de pagos hacia /api/payments/webhook. Las
            credenciales se guardan únicamente en Render.
          </p>
          <button disabled={busy}>Guardar información</button>
        </form>
      )}
    </section>
  );
}
