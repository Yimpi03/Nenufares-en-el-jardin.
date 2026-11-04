import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import './PromoSection.css';

const promosData = [
  {
    id: 'promo-1',
    badge: '28% OFF',
    title: 'Estanque Completo',
    subtitle: 'Paquete Fundador',
    description: '3 nenúfares + 2 lotos + 4 peces koi + asesoría gratuita de 1 hora',
    price: 229,
    oldPrice: 320,
    theme: 'card-green',
    iconType: 'leaf'
  },
  {
    id: 'promo-2',
    badge: '24% OFF',
    title: 'Jardín Zen',
    subtitle: 'Edición Verano',
    description: '5 lotos sagrados + sustrato especial + macetas de cerámica artesanal',
    price: 159,
    oldPrice: 210,
    theme: 'card-teal',
    iconType: 'lotus'
  },
  {
    id: 'promo-3',
    badge: '21% OFF',
    title: 'Colección Koi',
    subtitle: '3 Ejemplares',
    description: 'Koi Kohaku + Showa + Ogon. Certificado de salud, transporte en bolsa de oxígeno.',
    price: 220,
    oldPrice: 280,
    theme: 'card-dark',
    iconType: 'fish'
  }
];

const PromoSection = ({ onAddToCart }) => {
  const [copied, setCopied] = useState(false);
  const couponCode = 'AQUAFLORA10';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSolicitar = (promo) => {
    if (onAddToCart) {
      onAddToCart({
        id: promo.id,
        name: `${promo.title} (${promo.subtitle})`,
        price: promo.price,
        category: 'Paquete',
        reception: promo.title.includes('Koi') ? 'pickup' : 'delivery'
      }, 1);
    }
  };

  return (
    <section className="promo-section" id="promociones">
      <div className="promo-header">
        <div>
          <p className="promo-kicker">TEMPORADA 2026</p>
          <h2 className="promo-title">
            Paquetes <span>&amp;</span> <span className="italic-pink">Promociones</span>
          </h2>
        </div>
        <p className="promo-header-desc">
          Combinaciones seleccionadas para crear ecosistemas acuáticos completos.
        </p>
      </div>

      <div className="promo-cards-grid">
        {promosData.map((promo) => (
          <article key={promo.id} className={`promo-card ${promo.theme}`}>
            {/* Marca de agua decorativa */}
            <div className={`promo-watermark ${promo.iconType}`} aria-hidden="true" />

            <div className="promo-card-top">
              <span className="promo-badge">{promo.badge}</span>
              <h3 className="promo-card-title">{promo.title}</h3>
              <p className="promo-card-subtitle">{promo.subtitle}</p>
              <p className="promo-card-desc">{promo.description}</p>
            </div>

            <div className="promo-card-bottom">
              <div className="promo-pricing-row">
                <span className="promo-currency">$</span>
                <span className="promo-price">{promo.price}</span>
                <span className="promo-old-price">${promo.oldPrice}</span>
              </div>
              <button
                type="button"
                className="btn-solicitar"
                onClick={() => handleSolicitar(promo)}
              >
                Solicitar Paquete
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Banner inferior de Oferta Flash */}
      <div className="promo-flash-banner">
        <div className="flash-info">
          <span className="flash-badge">OFERTA FLASH · 48 HORAS</span>
          <p className="flash-text">
            10% adicional en tu primera compra con el código: <strong className="flash-code">{couponCode}</strong>
          </p>
        </div>
        <button type="button" className="btn-copy-code" onClick={handleCopyCode}>
          {copied ? (
            <>
              <Check size={16} /> Código copiado
            </>
          ) : (
            <>
              <Copy size={16} /> Copiar código
            </>
          )}
        </button>
      </div>
    </section>
  );
};

export default PromoSection;