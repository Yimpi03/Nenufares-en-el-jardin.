import { useState } from 'react';
import { X, Minus, Plus, Truck, Plane, Store, Search, Clock, Calendar } from 'lucide-react'; // <-- Añadido Plane
import './ProductSection.css';


// Opciones de horarios para recolección
const timeSlots = [
  { id: 't1', label: '10:00 AM - 12:00 PM', available: true },
  { id: 't2', label: '12:00 PM - 02:00 PM', available: false },
  { id: 't3', label: '02:00 PM - 04:00 PM', available: true },
  { id: 't4', label: '04:00 PM - 06:00 PM', available: true }
];

const ProductSection = ({ onAddToCart, productsData = [] }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filter, setFilter] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');

  const sizesList = [
    { id: 'mediano', name: 'MEDIANO', icon: '🌸', desc: 'Ø 30-40 cm', priceExtra: 0 },
    { id: 'grande', name: 'GRANDE', icon: '🌺', desc: 'Ø 40-70 cm', priceExtra: 8 },
    { id: 'extragrande', name: 'EXTRA GRANDE', icon: '🌺', desc: 'Ø 70-100 cm', priceExtra: 18 },
    { id: 'gigante', name: 'GIGANTE', icon: '🌷', desc: 'Ø 100+ cm', priceExtra: 30 }
  ];

  const [selectedSize, setSelectedSize] = useState(sizesList[0]);
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
    setSelectedSize(sizesList[0]);
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
      size: selectedSize.id,
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
            <div className={`product-card-img ${product.image}`} style={{ backgroundImage: /^https?:/.test(product.image) ? `url(${product.image})` : undefined }}>
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

            <div className={`modal-img-column ${selectedProduct.image}`} style={{ backgroundImage: /^https?:/.test(selectedProduct.image) ? `url(${selectedProduct.image})` : undefined }}>
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
