import { useState } from "react";
import { api, updated } from "../../api";
import { money } from "../../../shared/commerce";
export default function AdminInventory({ productsData = [] }) {
  const [draft, setDraft] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
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
      setDraft(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const edit = (p) =>
    setDraft({
      ...p,
      basePrice: p.basePrice ?? p.price,
      discountPercent: p.discountPercent || 0,
      galleryText: (p.gallery || []).join("\n"),
    });
  return (
    <section className="commerce-panel">
      <h2>Productos y descuentos</h2>
      <button
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
        Nuevo producto
      </button>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Normal / oferta</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productsData.map((p) => (
            <tr key={p.id}>
              <td>
                {p.title}
                <small>{p.category}</small>
              </td>
              <td>
                {money(p.basePrice ?? p.price)} / {money(p.price)}
                <small>{p.discountPercent || 0}% de descuento</small>
              </td>
              <td>{p.stock}</td>
              <td>
                <button onClick={() => edit(p)}>Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {draft && (
        <form onSubmit={save}>
          <h3>{draft.title || "Nuevo producto"}</h3>
          {[
            ["title", "Nombre"],
            ["description", "Descripción"],
            ["unit", "Unidad"],
            ["basePrice", "Precio normal MXN"],
            ["discountPercent", "Descuento % (0 a 90)"],
            ["stock", "Stock"],
            ["image", "Imagen principal (HTTPS o /images/…)"],
          ].map(([k, label]) => (
            <label key={k}>
              {label}
              <input
                required={k !== "image"}
                type={
                  ["basePrice", "discountPercent", "stock"].includes(k)
                    ? "number"
                    : "text"
                }
                min="0"
                max={k === "discountPercent" ? 90 : undefined}
                step={k === "stock" ? 1 : ".01"}
                value={draft[k] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [k]: ["basePrice", "discountPercent", "stock"].includes(k)
                      ? Number(e.target.value)
                      : e.target.value,
                  })
                }
              />
            </label>
          ))}
          <label>
            Categoría
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {["Nenúfar", "Loto", "Pez", "Semillas"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Galería: una URL HTTPS o ruta /images/ por línea (hasta 12)
            <textarea
              value={draft.galleryText}
              onChange={(e) =>
                setDraft({ ...draft, galleryText: e.target.value })
              }
            />
          </label>
          <button disabled={busy}>Guardar producto</button>{" "}
          <button type="button" onClick={() => setDraft(null)}>
            Cancelar
          </button>
        </form>
      )}
    </section>
  );
}
