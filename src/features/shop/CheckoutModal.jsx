import { useState } from 'react';
import { X, CreditCard, CheckCircle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartItems = [], setCartItems, onOrderComplete }) => {
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expDate: '',
    cvv: '',
    street: '',
    colony: '',
    city: '',
    zipCode: '',
    phone: ''
  });

  if (!isOpen) return null;

  // --- CÁLCULO DINÁMICO DE SUBTOTAL, ENVÍO Y TOTAL ---
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Detectar el costo de envío guardado en los items del carrito
  const shippingCost = cartItems.reduce((maxCost, item) => {
    const cost = item.shippingCost || (item.reception === 'delivery' ? 18 : 0);
    return Math.max(maxCost, cost);
  }, 0);

  const shippingLabel = cartItems.some(i => i.shippingType === 'pickup' || i.reception === 'pickup')
    ? 'Gratis (En Vivero)'
    : shippingCost > 0 
      ? `$${shippingCost.toFixed(2)} MXN` 
      : 'Gratis';

  const total = subtotal + shippingCost;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    onOrderComplete?.();

    setTimeout(() => {
      setIsSuccess(false);
      setStep(1);
      setCartItems([]);
      onClose();
    }, 3500);
  };

  return (
    <div className="checkout-overlay" onClick={onClose}>
      <div className="checkout-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="checkout-close-btn" onClick={onClose} type="button">
          <X size={20} />
        </button>

        {isSuccess ? (
          <div className="checkout-success-view">
            <CheckCircle size={60} className="success-icon-anim" />
            <h2>¡Pago Exitoso!</h2>
            <p>Gracias por tu compra. Tu pedido ha sido procesado correctamente y ya está en preparación.</p>
            <span className="success-order-id">Folio de seguimiento: #NJ-2026-993</span>
          </div>
        ) : (
          <div className="checkout-main-grid">
            {/* RESUMEN DE COMPRA */}
            <div className="checkout-summary-pane">
              <h3>Resumen de Compra</h3>
              <div className="checkout-items-list">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="checkout-item-row">
                    <span>{item.quantity}x {item.title || item.name}</span>
                    <span className="chk-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="checkout-totals-box">
                <div className="chk-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="chk-row">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? "chk-free" : ""}>{shippingLabel}</span>
                </div>
                <div className="chk-row chk-total">
                  <span>Total a Pagar</span>
                  <span style={{ color: '#0d2320', fontWeight: 'bold' }}>${total.toFixed(2)} MXN</span>
                </div>
              </div>

              <div className="checkout-secure-badge">
                <ShieldCheck size={16} /> <span>Transacción 100% segura y cifrada</span>
              </div>
            </div>

            {/* FORMULARIO POR PASOS */}
            <div className="checkout-form-pane">
              <h2>Finalizar Pedido</h2>
              <p className="chk-subtitle">Paso {step} de 2: {step === 1 ? 'Método de Pago' : 'Dirección de Envío'}</p>

              {/* BARRA DE PASOS */}
              <div className="checkout-steps-bar" style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem' }}>
                <span style={{ flex: 1, height: '4px', backgroundColor: step >= 1 ? '#dcb358' : '#e0dfd5', borderRadius: '2px' }} />
                <span style={{ flex: 1, height: '4px', backgroundColor: step === 2 ? '#dcb358' : '#e0dfd5', borderRadius: '2px' }} />
              </div>

              {/* PASO 1: TARJETA DE CRÉDITO/DÉBITO */}
              {step === 1 && (
                <form onSubmit={handleNextStep}>
                  <div className="payment-methods-tabs">
                    <div className="pay-tab active" style={{ cursor: 'default', width: '100%', justifyContent: 'center' }}>
                      <CreditCard size={18} /> Pago con Tarjeta
                    </div>
                  </div>

                  <div className="card-fields-container">
                    <div className="chk-field">
                      <label>NOMBRE EN LA TARJETA</label>
                      <input 
                        type="text" 
                        name="cardName" 
                        placeholder="Marisa Ramirez" 
                        value={formData.cardName} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div className="chk-field">
                      <label>NÚMERO DE TARJETA</label>
                      <input 
                        type="text" 
                        name="cardNumber" 
                        placeholder="4532 •••• •••• 8920" 
                        maxLength="19"
                        value={formData.cardNumber} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div className="chk-row-double">
                      <div className="chk-field">
                        <label>VENCIMIENTO</label>
                        <input 
                          type="text" 
                          name="expDate" 
                          placeholder="MM/AA" 
                          maxLength="5"
                          value={formData.expDate} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="chk-field">
                        <label>CVV</label>
                        <input 
                          type="password" 
                          name="cvv" 
                          placeholder="123" 
                          maxLength="4"
                          value={formData.cvv} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-confirm-payment" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '1.5rem' }}>
                    <span>Siguiente: Datos de Envío</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}

              {/* PASO 2: DIRECCIÓN DE ENVÍO */}
              {step === 2 && (
                <form onSubmit={handleCheckoutSubmit}>
                  <div className="address-fields-container">
                    <div className="chk-field">
                      <label>CALLE Y NÚMERO</label>
                      <input 
                        type="text" 
                        name="street" 
                        placeholder="Av. del Lago 248, Int 4" 
                        value={formData.street} 
                        onChange={handleChange} 
                        required 
                      />
                    </div>

                    <div className="chk-row-double">
                      <div className="chk-field">
                        <label>COLONIA</label>
                        <input 
                          type="text" 
                          name="colony" 
                          placeholder="La Guadalupana" 
                          value={formData.colony} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="chk-field">
                        <label>CÓDIGO POSTAL</label>
                        <input 
                          type="text" 
                          name="zipCode" 
                          placeholder="16000" 
                          maxLength="5"
                          value={formData.zipCode} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="chk-row-double">
                      <div className="chk-field">
                        <label>CIUDAD / MUNICIPIO</label>
                        <input 
                          type="text" 
                          name="city" 
                          placeholder="Xochimilco, CDMX" 
                          value={formData.city} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                      <div className="chk-field">
                        <label>TELÉFONO DE CONTACTO</label>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="55 1234 5678" 
                          value={formData.phone} 
                          onChange={handleChange} 
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* BOTONES COMPACTOS DE PASO 2 */}
                  <div className="step-actions-row" style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', alignItems: 'center' }}>
                    <button 
                      type="button" 
                      onClick={handlePrevStep} 
                      title="Volver a datos de pago"
                      style={{
                        background: '#fdfcf8',
                        border: '1px solid #dcb358',
                        color: '#0d2320',
                        width: '45px',
                        height: '45px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <ArrowLeft size={18} />
                    </button>

                    <button 
                      type="submit" 
                      className="btn-confirm-payment" 
                      style={{ flex: 1, margin: 0, height: '45px' }}
                    >
                      Pagar ${total.toFixed(2)} MXN
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;