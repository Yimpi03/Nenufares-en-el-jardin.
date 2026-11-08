import { useEffect, useState } from "react";
import {
  Truck,
  Plane,
  Store,
  Package,
  Gift,
  ChevronDown,
  Save,
  Plus,
  CheckCircle2,
  Mail,
  MapPin,
  ShieldCheck,
  Info,
  Eye,
  Phone,
  Tag,
} from "lucide-react";
import { api, updated } from "../api";
import { money } from "../../shared/commerce";
import { PolicyLink } from "./Policies";
import { newIdentifier } from "./identifiers";
const families = [
  ["fish", "Peces"],
  ["waterlily", "Nenúfares"],
  ["lotus", "Lotos"],
  ["seeds", "Semillas"],
  ["other", "Otros"],
];
const familyLabel = (values) =>
  values.map((v) => families.find(([id]) => id === v)?.[1] || v).join(" · ");
export default function AdminCommerce({ tab, embedded = false }) {
  const [data, setData] = useState(null),
    [clients, setClients] = useState([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [newPackageId, setNewPackageId] = useState(null);
  useEffect(() => {
    let live = true;
    const load =
      tab === "clientes"
        ? api("/admin/clients").then((r) => {
            if (live) setClients(r);
          })
        : api("/admin/commerce").then((r) => {
            if (live) setData(r);
          });
    load.catch((e) => {
      if (live) setError(e.message);
    });
    return () => {
      live = false;
    };
  }, [tab]);
  const save = async (path, body) => {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(path, { method: "PUT", body });
      updated();
      setNotice("Cambios guardados correctamente.");
      if (path.startsWith("/admin/packages/")) setNewPackageId(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const edit = (kind, index, key, value) => {
    setNotice("");
    setData((d) => ({
      ...d,
      [kind]: d[kind].map((x, i) => (i === index ? { ...x, [key]: value } : x)),
    }));
  };
  const setting = (key, value) => {
    setNotice("");
    setData((d) => ({ ...d, settings: { ...d.settings, [key]: value } }));
  };
  const heading = {
    clientes: [
      "CLIENTES DE LA TIENDA",
      "Clientes registrados",
      "Consulta tus clientes y su correo de contacto.",
    ],
    envios: [
      "LOGÍSTICA Y ENTREGAS",
      "Costos de envío",
      "Configura las tarifas y condiciones que verá el cliente al comprar.",
    ],
    paquetes: [
      "COMBINACIONES DEL VIVERO",
      "Paquetes y promociones",
      "Diseña tus paquetes, define la oferta y administra sus existencias.",
    ],
    politicas: [
      "INFORMACIÓN DE TU NEGOCIO",
      "Políticas y contacto",
      "Mantén actualizados tus datos y las condiciones de atención.",
    ],
  }[tab];
  return (
    <section
      className={`commerce-panel inv-commerce ${embedded ? "inv-embedded" : ""}`}
    >
      <header className="inv-section-heading">
        <div>
          <p className="inv-eyebrow">{heading[0]}</p>
          <h2>{heading[1]}</h2>
          <p>{heading[2]}</p>
        </div>
        {tab === "paquetes" && data && (
          <button
            className="inv-primary-button"
            onClick={() => {
              setNotice("");
              const newId = `promo-${newIdentifier()}`;
              setNewPackageId(newId);
              setData((d) => ({
                ...d,
                packages: [
                  ...d.packages,
                  {
                    id: newId,
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
              }));
            }}
          >
            <Plus size={16} /> Nuevo paquete
          </button>
        )}
      </header>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="inv-notice" role="status">
          <CheckCircle2 size={16} />
          {notice}
        </p>
      )}
      {tab === "clientes" ? (
        <div className="inv-table-scroll">
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
        </div>
      ) : !data ? (
        <div className="inv-loading" role="status">
          <Package size={24} strokeWidth={1.4} />
          <p>Cargando información del vivero…</p>
        </div>
      ) : tab === "envios" ? (
        <>
          <div className="inv-inline-note">
            <Info size={17} />
            <p>
              Una tarifa por método utilizado en cada pedido. Activa el cobro
              solo después de confirmar la ruta y su precio.
            </p>
          </div>
          <div className="inv-config-grid">
            {data.shipping.map((m, i) => {
              const Icon =
                m.id === "pickup" ? Store : m.id === "air" ? Plane : Truck;
              return (
                <details className="inv-config-card" key={m.id}>
                  <summary>
                    <span className="inv-config-icon">
                      <Icon size={22} strokeWidth={1.5} />
                    </span>
                    <span className="inv-config-title">
                      <strong>{m.label}</strong>
                      <small>{familyLabel(m.families)}</small>
                    </span>
                    <ChevronDown className="inv-chevron" size={16} />
                    <span className="inv-config-bottom">
                      <span
                        className={`inv-badge ${!m.enabled ? "out" : m.quoteRequired ? "low" : "available"}`}
                      >
                        {!m.enabled
                          ? "No disponible"
                          : m.quoteRequired
                            ? "Por cotizar"
                            : "Tarifa activa"}
                      </span>
                      <strong>
                        {m.quoteRequired ? "Por confirmar" : money(m.cost)}
                        <small>
                          {m.minDays}–{m.maxDays} días hábiles
                        </small>
                      </strong>
                    </span>
                  </summary>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      save(`/admin/shipping/${m.id}`, m);
                    }}
                  >
                    <div className="inv-form-grid">
                      {[
                        ["label", "Nombre del método"],
                        ["carrier", "Transportista"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            required
                            value={m[key]}
                            onChange={(e) =>
                              edit("shipping", i, key, e.target.value)
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <div className="inv-form-grid three">
                      {[
                        ["cost", "Costo · MXN"],
                        ["minDays", "Días mínimos"],
                        ["maxDays", "Días máximos"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            required
                            type="number"
                            min={key === "maxDays" ? m.minDays : 0}
                            max={key === "cost" ? 1000000 : 365}
                            step={key === "cost" ? ".01" : 1}
                            value={m[key]}
                            onChange={(e) =>
                              edit("shipping", i, key, Number(e.target.value))
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label>
                      Condiciones de entrega
                      <textarea
                        rows={3}
                        value={m.notes}
                        onChange={(e) =>
                          edit("shipping", i, "notes", e.target.value)
                        }
                      />
                    </label>
                    <label className="inv-toggle-row">
                      <span>
                        <strong>Requiere cotización</strong>
                        <small>Impide pagar hasta confirmar una tarifa.</small>
                      </span>
                      <input
                        type="checkbox"
                        checked={m.quoteRequired}
                        onChange={(e) =>
                          edit("shipping", i, "quoteRequired", e.target.checked)
                        }
                      />
                    </label>
                    <label className="inv-toggle-row">
                      <span>
                        <strong>Método disponible</strong>
                        <small>
                          Mostrar esta opción a categorías compatibles.
                        </small>
                      </span>
                      <input
                        type="checkbox"
                        checked={m.enabled}
                        onChange={(e) =>
                          edit("shipping", i, "enabled", e.target.checked)
                        }
                      />
                    </label>
                    <button className="inv-primary-button" disabled={busy}>
                      <Save size={14} />
                      Guardar tarifa
                    </button>
                  </form>
                </details>
              );
            })}
          </div>
        </>
      ) : tab === "paquetes" ? (
        <>
          <div className="inv-inline-note">
            <Package size={17} />
            <p>
              Las existencias corresponden a paquetes completos y son
              independientes de los productos individuales.
            </p>
          </div>
          <div className="inv-config-grid">
            {data.packages.map((p, i) => (
              <details
                className="inv-config-card inv-package-card"
                key={p.id}
                open={p.id === newPackageId ? true : undefined}
                onToggle={(e) => {
                  if (!e.currentTarget.open && p.id === newPackageId)
                    setNewPackageId(null);
                }}
              >
                <summary>
                  <span className="inv-config-icon">
                    <Gift size={22} strokeWidth={1.5} />
                  </span>
                  <span className="inv-config-title">
                    <strong>{p.title}</strong>
                    <small>{p.subtitle || "Paquete del vivero"}</small>
                  </span>
                  <ChevronDown className="inv-chevron" size={16} />
                  <span className="inv-config-bottom">
                    <span
                      className={`inv-badge ${p.active && p.stock > 0 ? "available" : "low"}`}
                    >
                      {!p.active
                        ? "Sin publicar"
                        : p.stock === 0
                          ? "Sin existencias"
                          : `${p.stock} disponibles`}
                    </span>
                    <strong>
                      {money(p.promotionPrice ?? p.basePrice)}
                      {p.promotionPrice !== null && (
                        <small>
                          <del>{money(p.basePrice)}</del> <Tag size={10} />{" "}
                          Promoción
                        </small>
                      )}
                    </strong>
                  </span>
                </summary>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    save(`/admin/packages/${p.id}`, p);
                  }}
                >
                  <div className="inv-form-grid">
                    {[
                      ["title", "Nombre del paquete"],
                      ["subtitle", "Subtítulo"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          required={key === "title"}
                          maxLength={150}
                          value={p[key]}
                          onChange={(e) =>
                            edit("packages", i, key, e.target.value)
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <label>
                    Contenido y descripción
                    <textarea
                      rows={3}
                      maxLength={4000}
                      value={p.description}
                      onChange={(e) =>
                        edit("packages", i, "description", e.target.value)
                      }
                    />
                  </label>
                  <div className="inv-form-grid three">
                    {[
                      ["basePrice", "Precio normal · MXN"],
                      ["promotionPrice", "Precio promoción · MXN"],
                      ["stock", "Paquetes disponibles"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          required={key !== "promotionPrice"}
                          type="number"
                          min="0"
                          max={key === "promotionPrice" ? p.basePrice : 1000000}
                          step={key === "stock" ? 1 : ".01"}
                          value={p[key] ?? ""}
                          placeholder={
                            key === "promotionPrice"
                              ? "Sin promoción"
                              : undefined
                          }
                          onChange={(e) =>
                            edit(
                              "packages",
                              i,
                              key,
                              key === "promotionPrice" && e.target.value === ""
                                ? null
                                : Number(e.target.value),
                            )
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <p className="inv-form-hint">
                    Deja el precio de promoción vacío para usar el precio
                    normal.
                  </p>
                  <fieldset className="inv-category-checks">
                    <legend>¿Qué contiene el paquete?</legend>
                    <p>
                      Selecciona todas las categorías para ofrecer envíos
                      compatibles.
                    </p>
                    {families.map(([id, label]) => (
                      <label key={id}>
                        <input
                          type="checkbox"
                          checked={p.families.includes(id)}
                          onChange={(e) =>
                            edit(
                              "packages",
                              i,
                              "families",
                              e.target.checked
                                ? [...p.families, id]
                                : p.families.filter((f) => f !== id),
                            )
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                  <label className="inv-toggle-row">
                    <span>
                      <strong>Publicado en la tienda</strong>
                      <small>Los clientes podrán verlo en promociones.</small>
                    </span>
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={(e) =>
                        edit("packages", i, "active", e.target.checked)
                      }
                    />
                  </label>
                  <button className="inv-primary-button" disabled={busy}>
                    <Save size={14} />
                    Guardar paquete
                  </button>
                </form>
              </details>
            ))}
          </div>
        </>
      ) : (
        <form
          className="inv-policies-form"
          onSubmit={(e) => {
            e.preventDefault();
            save("/admin/settings", data.settings);
          }}
        >
          <div className="inv-policies-main">
            <fieldset className="inv-settings-card">
              <legend>
                <Store size={17} /> Identidad del vivero
              </legend>
              <p>
                Esta información aparecerá en la tienda y en el aviso de
                privacidad.
              </p>
              {[
                ["sellerName", "Nombre comercial"],
                ["sellerLegalName", "Nombre legal del responsable"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    required={key === "sellerName"}
                    maxLength={2000}
                    value={data.settings[key]}
                    onChange={(e) => setting(key, e.target.value)}
                  />
                </label>
              ))}
              <label>
                Domicilio del responsable
                <textarea
                  rows={2}
                  maxLength={2000}
                  value={data.settings.sellerAddress}
                  onChange={(e) => setting("sellerAddress", e.target.value)}
                />
              </label>
              <div className="inv-form-grid">
                <label>
                  Correo de atención
                  <input
                    required
                    type="email"
                    value={data.settings.contactEmail}
                    onChange={(e) => setting("contactEmail", e.target.value)}
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    type="tel"
                    value={data.settings.contactPhone}
                    onChange={(e) => setting("contactPhone", e.target.value)}
                  />
                </label>
              </div>
            </fieldset>
            <fieldset className="inv-settings-card">
              <legend>
                <ShieldCheck size={17} /> Condiciones de atención
              </legend>
              <p>
                Complementa las políticas con los procedimientos reales de tu
                negocio.
              </p>
              {[
                ["shippingNotes", "Información de envíos"],
                ["returnNotes", "Devoluciones y aclaraciones"],
                ["privacyNotes", "Privacidad y uso de información"],
              ].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <textarea
                    rows={3}
                    maxLength={2000}
                    value={data.settings[key]}
                    onChange={(e) => setting(key, e.target.value)}
                    placeholder="Escribe aquí la información para tus clientes…"
                  />
                </label>
              ))}
            </fieldset>
            <div className="inv-settings-actions">
              <p>Revisa la información antes de publicarla.</p>
              <button className="inv-primary-button" disabled={busy}>
                <Save size={15} />
                Guardar información
              </button>
            </div>
          </div>
          <aside className="inv-contact-preview">
            <p className="inv-eyebrow">ASÍ TE ENCONTRARÁN</p>
            <span className="inv-preview-brand">
              <Store size={28} strokeWidth={1.2} />
            </span>
            <h3>{data.settings.sellerName || "Tu vivero"}</h3>
            <p>{data.settings.sellerLegalName || "Nombre legal pendiente"}</p>
            <ul>
              <li>
                <MapPin size={16} />
                <span>
                  {data.settings.sellerAddress ||
                    "Completa el domicilio del responsable."}
                </span>
              </li>
              <li>
                <Mail size={16} />
                <span>
                  {data.settings.contactEmail ||
                    "Agrega tu correo de atención."}
                </span>
              </li>
              <li>
                <Phone size={16} />
                <span>
                  {data.settings.contactPhone || "Teléfono por completar"}
                </span>
              </li>
            </ul>
            <div className="inv-preview-status">
              <span
                className={`inv-badge ${data.paymentsEnabled ? "available" : "low"}`}
              >
                {data.paymentsEnabled
                  ? "Pagos configurados"
                  : "Pagos por configurar"}
              </span>
            </div>
            <div className="inv-policy-preview-link">
              <Eye size={14} />
              <PolicyLink>Consultar políticas publicadas</PolicyLink>
            </div>
            <small>
              Los cambios de esta vista previa se publican cuando guardas la
              información.
            </small>
          </aside>
        </form>
      )}
    </section>
  );
}
