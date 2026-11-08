import { useState } from 'react';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import CheckoutModal from './CheckoutModal'; // <-- Importamos el modal de pago
import './CartDrawer.css';
import CatalogImage from '../../components/common/CatalogImage';

const CartDrawer = ({ isOpen, onClose, cartItems, setCartItems, userSession }) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false); // Estado para abrir la pasarela de pagos

  const updateQuantity = (id, change) => {
    setCartItems(items => 
      items.map(item => {
        if (item.lineId === id) {
          const newQuantity = Math.max(1, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.lineId !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      
      <aside className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <header className="cart-header">
          <div>
            <h2>Tu Carrito</h2>
            <span className="cart-count">{cartItems.length} ARTÍCULOS</span>
          </div>
          <button className="btn-close-cart" onClick={onClose}>
            <X size={20} strokeWidth={1.5} />
          </button>
        </header>

        <div className="cart-items-container">
          {cartItems.length === 0 ? (
            <p className="empty-cart-text">Tu carrito está vacío</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.lineId} className="cart-item">
                <div className="item-image"><CatalogImage image={item.image} title={item.name || item.title} category={item.category} compact /></div>
                
                <div className="item-details">
                  <div className="item-title-row">
                    <h4>{item.name || item.title}</h4>
                    <button className="btn-remove-item" onClick={() => removeItem(item.lineId)}>
                      <X size={14} />
                    </button>
                  </div>
                  <p className="item-price-unit">${item.price.toFixed(2)}/{item.unit}</p>
                  
                  <div className="item-controls-row">
                    <div className="quantity-selector">
                      <button onClick={() => updateQuantity(item.lineId, -1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.lineId, 1)}><Plus size={14} /></button>
                    </div>
                    <span className="item-total-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="cart-footer">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Envío</span>
            <span>Se calcula al finalizar</span>
          </div>
          <div className="summary-row total-row">
            <span>Productos (sin envío)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <button 
            className="btn-checkout" 
            onClick={() => {if(!userSession){onClose();window.dispatchEvent(new CustomEvent('nenufares:auth-required'));}else setIsCheckoutOpen(true);}}
            disabled={cartItems.length === 0}
            style={{ opacity: cartItems.length === 0 ? 0.6 : 1, cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            Proceder al pago <ArrowRight size={16} />
          </button>
        </footer>
      </aside>

      {/* Modal de Pasarela de Pagos */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </>
  );
};

export default CartDrawer;
