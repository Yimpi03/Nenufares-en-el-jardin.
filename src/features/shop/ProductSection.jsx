import { useState } from "react";
import CatalogImage from "../../components/common/CatalogImage";
import Gallery from "../../commerce/Gallery";
import { PolicyLink } from "../../commerce/Policies";
import { useStore } from "../../commerce/useStore";
import { family, sizes, money, effectivePrice } from "../../../shared/commerce";
import "./ProductSection.css";
export default function ProductSection({ productsData = [], onAddToCart }) {
  const [product, setProduct] = useState(null),
    [filter, setFilter] = useState("Todo"),
    [search, setSearch] = useState(""),
    [size, setSize] = useState("mediano"),
    [quantity, setQuantity] = useState(1),
    [method, setMethod] = useState("pickup");
  const { store, error } = useStore();
  const open = (p) => {
    setProduct(p);
    setQuantity(1);
    setSize("mediano");
    setMethod("pickup");
  };
  const matches = productsData.filter(
    (p) =>
      (filter === "Todo" || family(p.category) === filter) &&
      `${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  const unit = product
    ? effectivePrice(
        product.basePrice ?? product.price,
        product.discountPercent,
        family(product.category) === "waterlily"
          ? sizes.find((s) => s.id === size).priceExtra
          : 0,
      )
    : 0;
  return (
    <section className="product-section" id="productos">
      <div className="product-header-top">
        <p className="prod-kicker">CATÁLOGO</p>
        <h2 className="prod-main-title">
          Nuestra <span className="italic-pink">Colección</span>
        </h2>
      </div>
      <div className="product-filters-row">
        <div className="filter-buttons-group">
          {[
            ["Todo", "✦ Todo"],
            ["waterlily", "🌸 Nenúfares"],
            ["lotus", "🌺 Lotos"],
            ["fish", "🐟 Peces"],
            ["seeds", "🌱 Semillas"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`filter-btn ${filter === id ? "active" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="product-search-box">
          <input
            aria-label="Buscar productos"
            placeholder="Buscar nenúfares, lotos, peces…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="products-grid-layout">
        {matches.map((p) => (
          <article key={p.id} className="product-card-item">
            <button
              type="button"
              className="product-card-img"
              style={{ padding: 0, border: 0, width: "100%" }}
              onClick={() => open(p)}
              aria-label={`Ver ${p.name}`}
            >
              <CatalogImage
                image={p.image}
                title={p.name}
                category={p.category}
              />
              {p.discountPercent > 0 && (
                <span className="card-badge-pill">−{p.discountPercent}%</span>
              )}
              <span className="card-stock-pill">{p.stock} disponibles</span>
            </button>
            <div className="product-card-body">
              <span className="card-category-label">{p.category}</span>
              <h3 className="card-product-title">{p.name}</h3>
              <p className="card-product-desc">{p.description}</p>
              <div className="card-footer-flex">
                <span className="card-price-txt">
                  {p.discountPercent > 0 && (
                    <del className="product-sale-price">
                      {money(p.basePrice)}{" "}
                    </del>
                  )}
                  {money(p.price)}
                  <small> / {p.unit}</small>
                </span>
                <button className="btn-add-catalog" onClick={() => open(p)}>
                  Ver detalle
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!matches.length && <p>No hay productos en esta selección.</p>}
      {product && (
        <div className="commerce-overlay">
          <section
            className="commerce-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
          >
            <button
              className="commerce-close"
              onClick={() => setProduct(null)}
              aria-label="Cerrar producto"
            >
              ×
            </button>
            <div className="commerce-grid">
              <Gallery key={product.id} product={product} />
              <div>
                <p>{product.category}</p>
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                {family(product.category) === "waterlily" && (
                  <>
                    <h3>Elige el tamaño</h3>
                    <div className="size-options">
                      {sizes.map((s) => (
                        <button
                          type="button"
                          key={s.id}
                          className={`size-option ${size === s.id ? "selected" : ""}`}
                          aria-pressed={size === s.id}
                          onClick={() => setSize(s.id)}
                        >
                          <strong>{s.name}</strong>
                          <span>{s.desc}</span>
                          <span>
                            {money(
                              effectivePrice(
                                product.basePrice ?? product.price,
                                product.discountPercent,
                                s.priceExtra,
                              ),
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p>
                      <small>
                        Dimensiones de referencia del catálogo; confirma con el
                        vendedor si corresponden a hoja, planta o recipiente y
                        la medida del ejemplar.
                      </small>
                    </p>
                  </>
                )}
                <label>
                  Entrega
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    {(store?.shipping || [])
                      .filter((m) =>
                        m.families.includes(family(product.category)),
                      )
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.label} ·{" "}
                          {m.quoteRequired ? "Por cotizar" : money(m.cost)}
                        </option>
                      ))}
                  </select>
                </label>
                {error && <p role="alert">{error}</p>}
                <label>
                  Cantidad
                  <input
                    type="number"
                    min="1"
                    max={Math.max(1, product.stock)}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                  />
                </label>
                <h3>
                  {money(unit * quantity)}{" "}
                  <small>+ envío calculado al finalizar</small>
                </h3>
                <button
                  disabled={
                    !store ||
                    product.stock < quantity ||
                    quantity < 1 ||
                    !Number.isInteger(quantity)
                  }
                  onClick={() => {
                    onAddToCart(
                      { ...product, price: unit, size, shippingType: method },
                      quantity,
                    );
                    setProduct(null);
                  }}
                >
                  Añadir al carrito
                </button>
                <p>
                  <PolicyLink>
                    Envíos, devoluciones, pagos y privacidad
                  </PolicyLink>
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
