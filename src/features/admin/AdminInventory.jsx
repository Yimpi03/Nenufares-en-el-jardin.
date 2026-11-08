import { useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Package,
  Layers,
  Tag,
  ArrowUpRight,
  Pencil,
  Image as ImageIcon,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, updated } from "../../api";
import { money, family, effectivePrice } from "../../../shared/commerce";
import CatalogImage from "../../components/common/CatalogImage";
const categories = [
  ["all", "Todas las categorías"],
  ["waterlily", "Nenúfares"],
  ["lotus", "Lotos"],
  ["fish", "Peces"],
  ["seeds", "Semillas"],
];
const fold = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const categoryName = {
  waterlily: "Nenúfar",
  lotus: "Loto",
  fish: "Pez",
  seeds: "Semillas",
};
export default function AdminInventory({ productsData = [] }) {
  const [draft, setDraft] = useState(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [status, setStatus] = useState("all");
  const filtered = productsData.filter(
    (p) =>
      (category === "all" || family(p.category) === category) &&
      fold(`${p.title} ${p.category}`).includes(fold(query)) &&
      (status === "all" ||
        (status === "low" && p.stock > 0 && p.stock <= 5) ||
        (status === "out" && p.stock === 0) ||
        (status === "sale" && p.discountPercent > 0)),
  );
  const units = productsData.reduce((sum, p) => sum + p.stock, 0),
    onSale = productsData.filter((p) => p.discountPercent > 0).length;
  const edit = (p) => {
    setError("");
    setDraft({
      ...p,
      category: categoryName[family(p.category)] || "Nenúfar",
      basePrice: p.basePrice ?? p.price,
      discountPercent: p.discountPercent || 0,
      galleryText: (p.gallery || []).join("\n"),
    });
  };
  const field = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const save = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await api("/manage/products", {
        method: "PUT",
        body: {
          upserts: [
            {
              ...draft,
              gallery: draft.galleryText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean),
            },
          ],
        },
      });
      updated();
      setNotice(`“${draft.title}” se guardó correctamente.`);
      setDraft(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="inv-products">
      <div className="inv-metrics">
        {[
          [
            Package,
            "Productos en catálogo",
            productsData.length,
            "Referencias publicadas",
          ],
          [
            Layers,
            "Unidades disponibles",
            units,
            "Existencias del inventario individual",
          ],
          [
            Tag,
            "Productos en promoción",
            onSale,
            "Descuentos activos en el catálogo",
          ],
        ].map(([Icon, label, value, hint]) => (
          <div className="inv-metric" key={label}>
            <span className="inv-metric-icon">
              <Icon size={19} strokeWidth={1.6} />
            </span>
            <div>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{hint}</small>
            </div>
          </div>
        ))}
      </div>
      <section className="commerce-panel inv-product-panel">
        <div className="inv-section-heading">
          <div>
            <p className="inv-eyebrow">CATÁLOGO DEL VIVERO</p>
            <h2>Productos y descuentos</h2>
            <p>Gestiona cada ejemplar, su precio y sus existencias.</p>
          </div>
          <button
            className="inv-primary-button"
            onClick={() =>
              edit({
                id: Date.now(),
                title: "",
                category: "Nenúfar",
                basePrice: 0,
                stock: 0,
                image: "",
                description: "",
                unit: "unidad",
              })
            }
          >
            <Plus size={16} /> Nuevo producto
          </button>
        </div>
        {notice && (
          <div className="inv-notice" role="status">
            <CheckCircle2 size={16} />
            {notice}
            <button
              type="button"
              aria-label="Ocultar confirmación"
              onClick={() => setNotice("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {error && !draft && (
          <p role="alert" className="commerce-error">
            {error}
          </p>
        )}
        <div className="inv-toolbar">
          <label className="inv-search">
            <Search size={16} />
            <input
              aria-label="Buscar productos del inventario"
              placeholder="Buscar producto o categoría…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="inv-filter">
            <SlidersHorizontal size={15} />
            <select
              aria-label="Filtrar por categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <select
            className="inv-status-filter"
            aria-label="Filtrar por estado"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {[
              ["all", "Todos los estados"],
              ["low", "Pocas existencias"],
              ["out", "Agotados"],
              ["sale", "Con promoción"],
            ].map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="inv-table-scroll">
          <table className="inv-product-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio de venta</th>
                <th>Promoción</th>
                <th>Existencias</th>
                <th>
                  <span className="inv-sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="inv-product-cell">
                      <span className="inv-product-thumb">
                        <CatalogImage
                          image={p.image}
                          title={p.title}
                          category={p.category}
                          compact
                        />
                      </span>
                      <span>
                        <strong>{p.title}</strong>
                        <small>
                          {p.category} <span aria-hidden="true">·</span>{" "}
                          {p.unit || "unidad"}
                        </small>
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="inv-price">{money(p.price)}</span>
                    {p.discountPercent > 0 && (
                      <del className="inv-old-price">{money(p.basePrice)}</del>
                    )}
                  </td>
                  <td>
                    {p.discountPercent > 0 ? (
                      <span className="inv-badge sale">
                        <Tag size={11} /> −{p.discountPercent}%
                      </span>
                    ) : (
                      <span className="inv-muted">Precio regular</span>
                    )}
                  </td>
                  <td>
                    <span
                      className={`inv-badge ${p.stock === 0 ? "out" : p.stock <= 5 ? "low" : "available"}`}
                    >
                      <span className="inv-dot" />
                      {p.stock === 0 ? "Agotado" : `${p.stock} disponibles`}
                    </span>
                  </td>
                  <td>
                    <button
                      className="inv-edit-button"
                      onClick={() => edit(p)}
                      aria-label={`Editar ${p.title}`}
                    >
                      <Pencil size={14} />
                      <span>Editar</span>
                      <ArrowUpRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="inv-empty">
              <Search size={26} strokeWidth={1.3} />
              <h3>No encontramos productos</h3>
              <p>Prueba otro nombre o ajusta los filtros.</p>
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setStatus("all");
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
        <footer className="inv-table-footer">
          <span>
            Mostrando <strong>{filtered.length}</strong> de{" "}
            {productsData.length} productos
          </span>
          <span>
            <span className="inv-dot" /> Datos de tu catálogo
          </span>
        </footer>
      </section>
      {draft && (
        <div
          className="inv-editor-overlay"
          onKeyDown={(e) => {
            if (e.key === "Escape" && !busy) setDraft(null);
          }}
        >
          <section
            className="commerce-panel inv-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inv-editor-title"
          >
            <header className="inv-editor-header">
              <div>
                <p className="inv-eyebrow">FICHA DEL PRODUCTO</p>
                <h2 id="inv-editor-title">
                  {productsData.some((p) => p.id === draft.id)
                    ? "Editar producto"
                    : "Nuevo producto"}
                </h2>
              </div>
              <button
                className="inv-icon-button"
                onClick={() => setDraft(null)}
                disabled={busy}
                aria-label="Cerrar editor de producto"
              >
                <X size={20} />
              </button>
            </header>
            <form onSubmit={save}>
              <div className="inv-editor-body">
                <aside className="inv-preview">
                  <div className="inv-preview-image">
                    <CatalogImage
                      image={draft.image}
                      title={draft.title || "Vista previa del producto"}
                      category={draft.category}
                    />
                  </div>
                  <span className="inv-preview-caption">
                    <ImageIcon size={13} /> Vista previa de imagen
                  </span>
                  <h3>{draft.title || "Nombre del producto"}</h3>
                  <p>{draft.category}</p>
                  <strong>
                    {money(
                      effectivePrice(draft.basePrice, draft.discountPercent),
                    )}
                  </strong>
                  <small>Precio con promoción, sin envío.</small>
                </aside>
                <div className="inv-editor-fields">
                  {error && (
                    <p className="commerce-error" role="alert">
                      <AlertCircle size={14} /> {error}
                    </p>
                  )}
                  <fieldset>
                    <legend>
                      <span>01</span> Información del producto
                    </legend>
                    <label>
                      Nombre del producto
                      <input
                        required
                        maxLength={150}
                        autoFocus
                        value={draft.title}
                        onChange={(e) => field("title", e.target.value)}
                        placeholder="Ej. Nenúfar Rosa Gigante"
                      />
                    </label>
                    <div className="inv-form-grid">
                      <label>
                        Categoría
                        <select
                          value={draft.category}
                          onChange={(e) => field("category", e.target.value)}
                        >
                          {["Nenúfar", "Loto", "Pez", "Semillas"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Unidad de venta
                        <input
                          required
                          maxLength={50}
                          value={draft.unit || "unidad"}
                          onChange={(e) => field("unit", e.target.value)}
                          placeholder="Planta, rizoma, ejemplar…"
                        />
                      </label>
                    </div>
                    <label>
                      Descripción
                      <textarea
                        required
                        maxLength={4000}
                        rows={3}
                        value={draft.description}
                        onChange={(e) => field("description", e.target.value)}
                        placeholder="Cuidados, características y presentación."
                      />
                    </label>
                  </fieldset>
                  <fieldset>
                    <legend>
                      <span>02</span> Precio y existencias
                    </legend>
                    <div className="inv-form-grid three">
                      {[
                        ["basePrice", "Precio normal · MXN"],
                        ["discountPercent", "Descuento · %"],
                        ["stock", "Unidades disponibles"],
                      ].map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            required
                            type="number"
                            min="0"
                            max={key === "discountPercent" ? 90 : 1000000}
                            step={key === "stock" ? 1 : ".01"}
                            value={draft[key]}
                            onChange={(e) => field(key, Number(e.target.value))}
                          />
                        </label>
                      ))}
                    </div>
                    <p className="inv-form-hint">
                      El descuento se aplica al guardar; los precios se
                      verifican al comprar.
                    </p>
                  </fieldset>
                  <fieldset>
                    <legend>
                      <span>03</span> Fotografías y galería
                    </legend>
                    <label>
                      Imagen principal
                      <input
                        value={draft.image || ""}
                        onChange={(e) => field("image", e.target.value)}
                        placeholder="https://… o /images/…"
                      />
                    </label>
                    <label>
                      Fotografías adicionales
                      <textarea
                        rows={3}
                        value={draft.galleryText}
                        onChange={(e) => field("galleryText", e.target.value)}
                        placeholder="Una dirección de imagen por línea"
                      />
                    </label>
                    <p className="inv-form-hint">
                      Hasta 12 imágenes adicionales. Usa enlaces HTTPS o rutas
                      /images/.
                    </p>
                  </fieldset>
                </div>
              </div>
              <footer className="inv-editor-footer">
                <span>Los cambios se publican al guardar.</span>
                <div>
                  <button
                    className="inv-secondary-button"
                    type="button"
                    disabled={busy}
                    onClick={() => setDraft(null)}
                  >
                    Cancelar
                  </button>
                  <button className="inv-primary-button" disabled={busy}>
                    <Save size={15} />
                    {busy ? "Guardando…" : "Guardar producto"}
                  </button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
