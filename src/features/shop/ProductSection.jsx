import { useState } from 'react';
import { X, Minus, Plus, Truck, Plane, Store, Search, Clock, Calendar } from 'lucide-react'; // <-- Añadido Plane
import './ProductSection.css';

const productsData = [
  {
    id: 1,
    name: 'Nenúfar Rosa Gigante',
    category: 'Nenúfar',
    price: 28.50,
    oldPrice: 38.00,
    stock: 12,
    badge: 'OFERTA',
    unit: 'planta',
    description: 'Victoria amazonica. Hojas de hasta 1.5 m de diámetro. Florece al atardecer con aroma dulce.',
    characteristics: ['Victoria amazonica', 'Hojas gigantes flotantes', 'Aroma dulce nocturno', 'Variedad de exhibición'],
    image: 'img-nenufar-rosa'
  },
  {
    id: 2,
    name: 'Loto Sagrado Blanco',
    category: 'Loto',
    price: 32.00,
    oldPrice: 40.00,
    stock: 8,
    badge: null,
    unit: 'rizoma',
    description: "Nelumbo nucifera 'Alba'. Símbolo de pureza. Crece en contenedores de 40–80 cm de profundidad.",
    characteristics: ['Nelumbo nucifera "Alba"', 'Flores blancas de gran tamaño', 'Símbolo tradicional de pureza', 'Hojas flotantes y aéreas'],
    image: 'img-loto-blanco'
  },
  {
    id: 3,
    name: 'Carpa Koi Kohaku',
    category: 'Pez',
    price: 85.00,
    oldPrice: 95.00,
    stock: 6,
    badge: 'PREMIUM',
    unit: 'ejemplar',
    description: 'Koi Kohaku seleccionado de 15–20 cm. Patrón rojo sobre blanco. Criado en agua limpia certificada.',
    characteristics: ['Variedad Kohaku (Blanco y Rojo)', 'Tamaño de 15 a 20 cm', 'Excelente salud y vitalidad', 'Se entrega en bolsa de oxígeno'],
    image: 'img-koi-kohaku'
  },
  {
    id: 4,
    name: 'Loto Rosa Tailandés',
    category: 'Loto',
    price: 26.00,
    oldPrice: 32.00,
    stock: 15,
    badge: 'OFERTA',
    discountBadge: '-19% OFF',
    unit: 'rizoma',
    description: 'Nelumbo nucifera variedad tailandesa. Florece todo el verano con pétalos rosados intensos.',
    characteristics: [
      'Nelumbo nucifera variedad tailandesa',
      'Flores rosa intenso, 15–20 cm',
      'Floración prolongada todo el verano',
      'Rizoma resistente y productivo',
      'Ideal para macetas de 50 cm+'
    ],
    colors: [
      { name: 'Rosa intenso', hex: '#eb5e8d', available: true, stock: 12 },
      { name: 'Coral', hex: '#f07e71', available: true, stock: 3 },
      { name: 'Rosa medio', hex: '#f4b7cc', available: false, stock: 0 },
      { name: 'Rosa claro', hex: '#fad4e1', available: true, stock: 8 },
      { name: 'Lila pálido', hex: '#d6c4de', available: false, stock: 0 }
    ],
    image: 'img-loto-rosa'
  },
  {
    id: 5,
    name: 'Nenúfar Morado Tropical',
    category: 'Nenúfar',
    price: 22.00,
    oldPrice: 30.00,
    stock: 20,
    badge: null,
    unit: 'planta',
    description: 'Nymphaea colorata. Flores de color violeta intenso. Ideal para estanques y fuentes decorativas.',
    characteristics: ['Nymphaea colorata', 'Flores violeta intenso, 8–12 cm', 'Hoja redondeada verde oscuro', 'Variedad tropical'],
    image: 'img-nenufar-morado'
  },
  {
    id: 6,
    name: 'Carpa Koi Sanke',
    category: 'Pez',
    price: 98.00,
    oldPrice: 110.00,
    stock: 9,
    badge: null,
    unit: 'ejemplar',
    description: 'Koi Taisho Sanke con patrón tricolor (blanco, rojo y negro profundo). Alta calidad genética.',
    characteristics: ['Variedad Tricolor (Sanke)', 'Tamaño de 18 a 22 cm', 'Patrones definidos de alta calidad', 'Se entrega en bolsa de oxígeno'],
    image: 'img-koi-sanke'
  },
  {
    id: 7,
    name: 'Nenúfar Amarillo',
    category: 'Nenúfar',
    price: 25.00,
    oldPrice: 32.00,
    stock: 14,
    badge: null,
    unit: 'planta',
    description: 'Nymphaea mexicana. Hermosas flores amarillas brillantes que abren con los primeros rayos de sol.',
    characteristics: ['Nymphaea mexicana', 'Floración amarilla brillante', 'Adaptabilidad excelente en estanques templados'],
    image: 'img-nenufar-amarillo'
  },
  {
    id: 8,
    name: 'Loto Azul Sagrado',
    category: 'Loto',
    price: 40.00,
    oldPrice: 50.00,
    stock: 5,
    badge: 'EXCLUSIVO',
    unit: 'rizoma',
    description: 'Nymphaea caerulea. El legendario loto azul de la cultura egipcia con aroma relajante.',
    characteristics: ['Nymphaea caerulea', 'Flores azuladas celestes únicas', 'Aroma suave y calmante'],
    image: 'img-loto-azul'
  },
  {
    id: 9,
    name: 'Semillas Loto Sagrado Blanco',
    category: 'Semillas',
    price: 12.00,
    oldPrice: 15.00,
    stock: 45,
    badge: null,
    unit: 'sobre 10u',
    description: 'Paquete con 10 semillas escarificadas de Nelumbo nucifera "Alba", listas para germinar en agua.',
    characteristics: ['Alta tasa de germinación (85%+)', 'Escarificadas mecánicamente', 'Germina en 7-14 días en agua a 25°C', 'Ideal para iniciar desde cero'],
    image: 'img-semillas-loto-1'
  },
  {
    id: 10,
    name: 'Semillas Loto Rosa Mix',
    category: 'Semillas',
    price: 11.50,
    oldPrice: null,
    stock: 30,
    badge: 'NUEVO',
    unit: 'sobre 10u',
    description: 'Mix de semillas de lotos rosados y rojizos. Excelentes para cultivar en recipientes medianos.',
    characteristics: ['Mix de variedades rosadas', 'Paquete sellado al vacío', 'Incluye instructivo de germinación'],
    image: 'img-semillas-loto-2'
  }
];

// Opciones de horarios para recolección
const timeSlots = [
  { id: 't1', label: '10:00 AM - 12:00 PM', available: true },
  { id: 't2', label: '12:00 PM - 02:00 PM', available: false },
  { id: 't3', label: '02:00 PM - 04:00 PM', available: true },
  { id: 't4', label: '04:00 PM - 06:00 PM', available: true }
];

const ProductSection = ({ onAddToCart }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');

  const sizesList = [
    { id: 'mediano', name: 'MEDIANO', icon: '🌸', desc: 'Ø 30-40 cm', priceExtra: 0 },
    { id: 'grande', name: 'GRANDE', icon: '🌺', desc: 'Ø 40-70 cm', priceExtra: 8 },
    { id: 'extragrande', name: 'EXTRA GRANDE', icon: '🌺', desc: 'Ø 70-100 cm', priceExtra: 18 },
    { id: 'gigante', name: 'GIGANTE', icon: '🌷', desc: 'Ø 100+ cm', priceExtra: 30 }
  ];

  const [selectedSize, setSelectedSize] = useState(sizesList[1]);
  const [selectedColor, setSelectedColor] = useState(null);
  
  // Opciones de envío ampliadas (Los precios y tiempos podrían venir de la administración)
  const [shippingMethod, setShippingMethod] = useState('truck'); // 'truck', 'plane', 'pickup'
  
  const shippingRates = {
    truck: { name: 'Camión (Terrestre)', price: 180.00, time: '3 a 5 días hábiles' },
    plane: { name: 'Avión (Aéreo Exprés)', price: 450.00, time: '24 a 48 horas' },
    pickup: { name: 'Recoger en sucursal', price: 0.00, time: 'Inmediato' }
  };

  const todayDate = new Date().toISOString().split('T')[0];
  const [pickupDate, setPickupDate] = useState(todayDate); 
  const [pickupTime, setPickupTime] = useState('10:00 AM - 12:00 PM');
  
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('chars');

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setSelectedSize(sizesList[1]);
    if (product.colors) setSelectedColor(product.colors[0]);
    setQuantity(1);
    setActiveTab('chars');

    if (product.category === 'Pez') {
      setShippingMethod('pickup');
    } else {
      setShippingMethod('truck');
    }
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const filteredProducts = productsData.filter(product => {
    const matchesCategory = filter === 'Todo' || product.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const isNenufar = selectedProduct && selectedProduct.category === 'Nenúfar';
  const isPez = selectedProduct && selectedProduct.category === 'Pez';

  const basePrice = selectedProduct ? selectedProduct.price : 0;
  let currentUnitPrice = basePrice;
  if (isNenufar) currentUnitPrice += selectedSize.priceExtra;
  
  const currentShippingCost = shippingRates[shippingMethod].price;
  const finalTotalPrice = (currentUnitPrice * quantity) + currentShippingCost;

  const handleConfirmAdd = () => {
    if (!selectedProduct) return;
    
    let finalName = selectedProduct.name;
    if (isNenufar) finalName = `${selectedProduct.name} (${selectedSize.name})`;
    if (selectedProduct.colors && selectedColor) finalName += ` - Color: ${selectedColor.name}`;

    const productToAdd = {
      ...selectedProduct,
      name: finalName,
      price: currentUnitPrice,
      shippingType: shippingMethod,
      shippingCost: currentShippingCost,
      pickupDate: shippingMethod === 'pickup' ? pickupDate : null,
      pickupTime: shippingMethod === 'pickup' ? pickupTime : null 
    };

    onAddToCart(productToAdd, quantity);
    handleCloseModal();
  };

  return (
    <section className="product-section" id="productos">
      <div className="product-header-top">
        <p className="prod-kicker">CATÁLOGO 2026</p>
        <h2 className="prod-main-title">Nuestra <span className="italic-pink">Colección</span></h2>
      </div>

      <div className="product-filters-row">
        <div className="filter-buttons-group">
          <button className={`filter-btn ${filter === 'Todo' ? 'active' : ''}`} onClick={() => setFilter('Todo')}>✦ Todo</button>
          <button className={`filter-btn ${filter === 'Nenúfar' ? 'active' : ''}`} onClick={() => setFilter('Nenúfar')}>🌸 Nenúfares</button>
          <button className={`filter-btn ${filter === 'Loto' ? 'active' : ''}`} onClick={() => setFilter('Loto')}>🌺 Lotos</button>
          <button className={`filter-btn ${filter === 'Pez' ? 'active' : ''}`} onClick={() => setFilter('Pez')}>🐟 Peces</button>
          <button className={`filter-btn ${filter === 'Semillas' ? 'active' : ''}`} onClick={() => setFilter('Semillas')}>🌱 Semillas</button>
        </div>

        <div className="product-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar nenúfares, lotos, peces..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="products-grid-layout">
        {filteredProducts.map((product) => (
          <article key={product.id} className="product-card-item" onClick={() => handleOpenModal(product)}>
            <div className={`product-card-img ${product.image}`}>
              {product.badge && <span className="card-badge-pill">{product.badge}</span>}
              <span className="card-stock-pill">{product.stock} disponibles</span>
            </div>
            
            <div className="product-card-body">
              <span className="card-category-label">{product.category}</span>
              <h3 className="card-product-title">{product.name}</h3>
              <p className="card-product-desc">{product.description}</p>
              
              <div className="card-footer-flex">
                <span className="card-price-txt">
                  ${product.price.toFixed(2)} <small>/ {product.unit}</small>
                </span>
                <button className="btn-add-catalog" onClick={(e) => { e.stopPropagation(); handleOpenModal(product); }}>
                  Añadir
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedProduct && (
        <div className="product-modal-overlay" onClick={handleCloseModal}>
          <div className="product-modal-container-exact" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseModal}>
              <X size={20} />
            </button>

            <div className={`modal-img-column ${selectedProduct.image}`}>
              {selectedProduct.badge && <span className="modal-badge-top">{selectedProduct.badge}</span>}
              {selectedProduct.discountBadge && <span className="modal-badge-bottom">{selectedProduct.discountBadge}</span>}
            </div>

            <div className="modal-content-column">
              <div className="modal-category-kicker">{selectedProduct.category}</div>
              <h2 className="modal-title-big">{selectedProduct.name}</h2>
              <p className="modal-desc-text">{selectedProduct.description}</p>

              <div className="modal-top-price-row">
                <span className="modal-main-price">${currentUnitPrice.toFixed(2)}</span>
                <span className="modal-unit-label">MXN / {selectedProduct.unit}</span>
                {selectedProduct.oldPrice && <span className="modal-old-price">${selectedProduct.oldPrice.toFixed(2)}</span>}
                <span className="modal-stock-label">{selectedProduct.stock} disponibles</span>
              </div>

              <div className="modal-tabs-line">
                <button type="button" className={`tab-item-btn ${activeTab === 'chars' ? 'active' : ''}`} onClick={() => setActiveTab('chars')}>
                  CARACTERÍSTICAS
                </button>
                <button type="button" className={`tab-item-btn ${activeTab === 'care' ? 'active' : ''}`} onClick={() => setActiveTab('care')}>
                  CUIDADOS
                </button>
              </div>

              <div className="modal-chars-container">
                {activeTab === 'chars' ? (
                  selectedProduct.characteristics?.map((char, index) => (
                    <div key={index} className="char-line">
                      <span className="char-diamond">◆</span> <span>{char}</span>
                    </div>
                  ))
                ) : (
                  <div className="char-line">
                    <span className="char-diamond">◆</span> 
                    <span>
                      {selectedProduct.category === 'Pez' ? 'Agua limpia y oxigenada, alimentación balanceada.' 
                      : selectedProduct.category === 'Semillas' ? 'Remojar en agua tibia y cambiar diariamente hasta germinar.' 
                      : 'Exposición a pleno sol y agua limpia sin cloro.'}
                    </span>
                  </div>
                )}
              </div>

              {isNenufar && (
                <div className="size-selector-section">
                  <div className="size-header-bar">
                    <span className="sz-title-txt">TAMAÑO DEL NENÚFAR</span>
                    <span className="sz-measure-txt">{selectedSize.desc} <span className="sz-extra-price">+{selectedSize.priceExtra > 0 ? `$${selectedSize.priceExtra}` : 'incluido'}</span></span>
                  </div>
                  <div className="sizes-buttons-grid">
                    {sizesList.map((sz) => (
                      <button
                        type="button"
                        key={sz.id}
                        className={`size-box-btn ${selectedSize.id === sz.id ? 'active' : ''}`}
                        onClick={() => setSelectedSize(sz)}
                      >
                        <span className="sz-flower-icon">{sz.icon}</span>
                        <span className="sz-label-txt">{sz.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN DE MÉTODOS DE ENVÍO / RECEPCIÓN AMPLIADA */}
              <div className="reception-section-block">
                <div className="size-header-bar">
                    <span className="sz-title-txt">MÉTODO DE ENVÍO Y RECEPCIÓN</span>
                </div>
                
                <div className="reception-options-row" style={{ display: 'grid', gridTemplateColumns: isPez ? '1fr' : 'repeat(3, 1fr)', gap: '8px' }}>
                  {!isPez && (
                    <>
                      {/* Envío Camión */}
                      <div className={`rec-card-item ${shippingMethod === 'truck' ? 'selected' : ''}`} onClick={() => setShippingMethod('truck')}>
                        <div className="rec-title-line"><Truck size={15} /> <strong>Camión (Terrestre)</strong></div>
                        <span className="rec-sub-txt">${shippingRates.truck.price.toFixed(2)} · {shippingRates.truck.time}</span>
                      </div>

                      {/* Envío Avión */}
                      <div className={`rec-card-item ${shippingMethod === 'plane' ? 'selected' : ''}`} onClick={() => setShippingMethod('plane')}>
                        <div className="rec-title-line"><Plane size={15} /> <strong>Avión (Aéreo)</strong></div>
                        <span className="rec-sub-txt">${shippingRates.plane.price.toFixed(2)} · {shippingRates.plane.time}</span>
                      </div>
                    </>
                  )}

                  {/* Recoger en sucursal */}
                  <div 
                    className={`rec-card-item ${shippingMethod === 'pickup' ? 'selected' : ''}`} 
                    onClick={() => setShippingMethod('pickup')}
                  >
                    <div className="rec-title-line"><Store size={15} /> <strong>Recoger en sucursal</strong></div>
                    <span className="rec-sub-txt">Gratis · En vivero</span>
                  </div>
                </div>

                {isPez && (
                  <span className="pez-warning-text">
                    * Por el bienestar de los ejemplares vivos, las carpas Koi solo están disponibles para recolección en nuestras instalaciones.
                  </span>
                )}

                {/* SELECTOR DE FECHA Y HORA (SOLO SI ES RECOLECCIÓN) */}
                {shippingMethod === 'pickup' && (
                  <div className="pickup-datetime-container">
                    <label className="pickup-label"><Calendar size={14} color="#dcb358" /> 1. Elige el día de recolección:</label>
                    <input
                      type="date"
                      className="pickup-date-input"
                      value={pickupDate}
                      min={todayDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                    />

                    <label className="pickup-label"><Clock size={14} color="#dcb358" /> 2. Elige la hora:</label>
                    <div className="pickup-time-grid">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={!slot.available}
                          className={`time-slot-btn ${pickupTime === slot.label ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                          onClick={() => setPickupTime(slot.label)}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer-actions">
                <div className="quantity-stepper">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus size={14} /></button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)}><Plus size={14} /></button>
                </div>
                <button type="button" className="btn-gold-action" onClick={handleConfirmAdd}>
                  Añadir al carrito · ${finalTotalPrice.toFixed(2)}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductSection;