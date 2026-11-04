import { useState } from 'react';
import { X, Minus, Plus, CreditCard, CheckCircle, Calendar, Clock, MapPin, Download } from 'lucide-react';
import './ReservationModal.css';

const ReservationModal = ({ isOpen, onClose, event }) => {
  const [step, setStep] = useState(1); 
  const [tickets, setTickets] = useState(1);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [cardData, setCardData] = useState({ numero: '', nombre: '', vencimiento: '', cvv: '' });
  const [ticketIds, setTicketIds] = useState([]);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  if (isOpen !== previousIsOpen) {
    setPreviousIsOpen(isOpen);
    if (isOpen) {
      setStep(1);
      setTickets(1);
      setFormData({ nombre: '', email: '', telefono: '' });
      setCardData({ numero: '', nombre: '', vencimiento: '', cvv: '' });
      setTicketIds([]);
    }
  }

  if (!isOpen || !event) return null;

  const total = event.numericPrice * tickets;

  // Lógica para limitar lugares. Si capacity es texto ('Entrada libre'), le damos un tope alto por defecto (ej. 10).
  const maxTickets = typeof event.capacity === 'number' ? event.capacity : 10;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (total > 0) {
      setStep(2); 
    } else {
      setTicketIds(Array.from({ length: tickets }, () => `FF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`));
      setStep(3); 
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setTicketIds(Array.from({ length: tickets }, () => `FF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`));
    setStep(3); 
  };

  const getQRCodeUrl = (index) => {
    const uniqueId = `${ticketIds[index]}-${index + 1}`;
    const location = event.location || 'Vivero Flores Finas, Pomuch';
    const qrText = `Evento: ${event.title}\nLugar: ${location}\nFecha: ${event.day} ${event.month} ${event.year}\nTitular: ${formData.nombre}\nBoleto: ${index + 1}/${tickets}\nID: ${uniqueId}`;
    const encodedData = encodeURIComponent(qrText);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodedData}`;
  };

  return (
    <div className="res-modal-overlay" onClick={onClose}>
      <div className="res-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="res-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        {/* COLUMNA IZQUIERDA */}
        <div className="res-info-side">
          <div className="ev-modal-img" style={{ backgroundImage: `url(${event.image})` }}></div>
          <div className="ev-modal-details">
            <span className="ev-modal-badge">{event.badge}</span>
            <h2 className="ev-modal-title">{event.title}</h2>
            
            <div className="ev-modal-meta">
              <p><Calendar size={16} /> {event.day} {event.month} {event.year}</p>
              <p><Clock size={16} /> {event.time}</p>
              <p><MapPin size={16} /> {event.location || 'Vivero Flores Finas, Pomuch'}</p>
            </div>
            
            <p className="ev-modal-desc">{event.description}</p>
            <div className="ev-modal-price-tag">{event.price} <small>{event.numericPrice > 0 ? '/ persona' : ''}</small></div>
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div className="res-form-side">
          
          {step === 1 && (
            <>
              <span className="res-form-kicker">1. REGISTRO Y LUGARES</span>
              <form onSubmit={handleFormSubmit} className="res-form">
                
                <div className="tickets-selector">
                  <label>¿Cuántos lugares necesitas?</label>
                  <div className="tickets-counter">
                    <button type="button" onClick={() => setTickets(Math.max(1, tickets - 1))}><Minus size={16} /></button>
                    <span>{tickets}</span>
                    {/* BOTÓN PLUS CON TOPE MATEMÁTICO */}
                    <button type="button" onClick={() => setTickets(Math.min(maxTickets, tickets + 1))}><Plus size={16} /></button>
                  </div>
                </div>

                <div className="form-group">
                  <label>NOMBRE DEL TITULAR *</label>
                  <input type="text" required placeholder="Tu nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>CORREO ELECTRÓNICO *</label>
                  <input type="email" required placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>TELÉFONO</label>
                  <input type="tel" placeholder="+52 000 000 0000" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
                </div>

                <div className="checkout-summary">
                  <span>Total a pagar:</span>
                  <strong>${total.toFixed(2)} MXN</strong>
                </div>

                <button type="submit" className="btn-submit-reserva">
                  {total > 0 ? 'Proceder al Pago' : 'Confirmar Registro Gratuito'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <span className="res-form-kicker">2. DETALLES DE PAGO</span>
              <form onSubmit={handlePaymentSubmit} className="res-form payment-form">
                
                <div className="payment-total-banner">
                  <span>Total a cobrar</span>
                  <h2>${total.toFixed(2)} MXN</h2>
                </div>

                <div className="form-group">
                  <label>NOMBRE EN LA TARJETA *</label>
                  <input type="text" required placeholder="Nombre como aparece en la tarjeta" value={cardData.nombre} onChange={(e) => setCardData({...cardData, nombre: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label>NÚMERO DE TARJETA *</label>
                  <div className="card-input-wrapper">
                    <CreditCard size={18} className="input-icon" />
                    <input type="text" required placeholder="0000 0000 0000 0000" maxLength="19" value={cardData.numero} onChange={(e) => setCardData({...cardData, numero: e.target.value})} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>VENCIMIENTO *</label>
                    <input type="text" required placeholder="MM/YY" maxLength="5" value={cardData.vencimiento} onChange={(e) => setCardData({...cardData, vencimiento: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input type="password" required placeholder="123" maxLength="4" value={cardData.cvv} onChange={(e) => setCardData({...cardData, cvv: e.target.value})} />
                  </div>
                </div>

                <div className="form-actions-row">
                  <button type="button" className="btn-back" onClick={() => setStep(1)}>Atrás</button>
                  <button type="submit" className="btn-submit-reserva">Pagar ${total.toFixed(2)}</button>
                </div>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="success-step-container">
              <CheckCircle size={45} color="#dcb358" className="success-icon" />
              <h2 className="success-title">¡Reserva Confirmada!</h2>
              <p className="success-msg">Muestra este código en la entrada. Se ha enviado una copia a <strong>{formData.email}</strong>.</p>
              
              <div className="qr-tickets-scroll-area">
                {Array.from({ length: tickets }).map((_, index) => (
                  <div key={index} className="qr-ticket-card">
                    <img src={getQRCodeUrl(index)} alt={`QR Boleto ${index + 1}`} className="qr-img" />
                    <div className="qr-ticket-info">
                      <h4>Boleto {index + 1} de {tickets}</h4>
                      <p><strong>Titular:</strong> {formData.nombre || 'Invitado'}</p>
                      <p><strong>Evento:</strong> {event.title}</p>
                      <p><strong>Lugar:</strong> {event.location || 'Vivero Flores Finas, Pomuch'}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => window.print()} className="btn-download-qr">
                <Download size={16} /> Guardar Boletos (PDF)
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ReservationModal;