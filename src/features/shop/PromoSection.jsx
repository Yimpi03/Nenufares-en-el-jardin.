import { useStore } from "../../commerce/useStore";
import { money } from "../../../shared/commerce";
import "./PromoSection.css";
export default function PromoSection({ onAddToCart }) {
  const { store, error } = useStore();
  return (
    <section className="promo-section" id="promociones">
      <div className="promo-header">
        <div>
          <p className="promo-kicker">SELECCIÓN DEL VIVERO</p>
          <h2 className="promo-title">
            Paquetes &amp; <span className="italic-pink">Promociones</span>
          </h2>
        </div>
        <p className="promo-header-desc">
          Precios y disponibilidad actualizados por el vendedor.
        </p>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="promo-cards-grid">
        {store?.packages.map((p) => (
          <article key={p.id} className={`promo-card ${p.theme}`}>
            <div className="promo-card-top">
              <span className="promo-badge">
                {p.promotionPrice !== null && p.basePrice > 0
                  ? `${Math.round((1 - p.price / p.basePrice) * 100)}% de descuento`
                  : "Precio de paquete"}
              </span>
              <h3 className="promo-card-title">{p.title}</h3>
              <p className="promo-card-subtitle">{p.subtitle}</p>
              <p className="promo-card-desc">{p.description}</p>
              <p>{p.stock} paquetes disponibles</p>
            </div>
            <div className="promo-card-bottom">
              <div className="promo-pricing-row">
                <span className="promo-price">{money(p.price)}</span>
                {p.price < p.basePrice && <del>{money(p.basePrice)}</del>}
              </div>
              <button
                className="btn-solicitar"
                disabled={p.stock === 0}
                onClick={() =>
                  onAddToCart(
                    {
                      ...p,
                      name: p.title,
                      category: "Paquete",
                      shippingType: "pickup",
                      unit: "paquete",
                    },
                    1,
                  )
                }
              >
                {p.stock === 0 ? "Por confirmar existencias" : "Añadir paquete"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
