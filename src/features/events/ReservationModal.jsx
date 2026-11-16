import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { X, Minus, Plus, CheckCircle, Calendar, Clock, MapPin, Download, Image as ImageIcon } from 'lucide-react';
import './ReservationModal.css';

const STORAGE_KEY = 'nenufares_reservaciones_demo_v1';
const createFolio = () => `FF-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
const getStoredReservations = () => {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};
const getDateLabel = event => [event.day, event.month, event.year].filter(Boolean).join(' ') || event.date || 'Por confirmar';
const buildQrValue = ticket => JSON.stringify({
  type: 'nenufares_reserva_demo', folio: ticket.folio, eventId: ticket.eventId,
  event: ticket.eventTitle, date: ticket.date, holder: ticket.holder,
  paymentStatus: ticket.paymentStatus,
});

export const downloadTicketImage = async ticket => {
  const qr = await QRCode.toDataURL(buildQrValue(ticket), { width: 650, margin: 3, errorCorrectionLevel: 'M' });
  const canvas = document.createElement('canvas');
  canvas.width = 1050;
  canvas.height = 1250;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fffdf8'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#10382e'; ctx.fillRect(0, 0, canvas.width, 200);
  ctx.fillStyle = '#f0cc75'; ctx.font = 'bold 47px sans-serif';
  ctx.fillText('Nenúfares en el Jardín', 60, 90);
  ctx.fillStyle = '#ffffff'; ctx.font = '31px sans-serif'; ctx.fillText('Comprobante de reservación · DEMO', 60, 148);
  ctx.fillStyle = '#173a32'; ctx.font = 'bold 34px sans-serif';
  const cut = (value, max = 46) => String(value || '').slice(0, max);
  ctx.fillText(cut(ticket.eventTitle), 60, 255);
  ctx.font = '27px sans-serif';
  ctx.fillText('Folio: ' + ticket.folio, 60, 320);
  ctx.fillText('Titular: ' + cut(ticket.holder), 60, 369);
  ctx.fillText('Fecha: ' + cut(ticket.date), 60, 418);
  ctx.fillText('Lugar: ' + cut(ticket.location), 60, 467);
  ctx.fillText('Boleto: ' + ticket.position + '/' + ticket.quantity, 60, 516);
  ctx.fillText('Estado: ' + (ticket.paymentStatus === 'gratuito' ? 'Registro gratuito' : 'Pago simulado'), 60, 565);
  const img = new Image();
  img.src = qr;
  await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
  ctx.drawImage(img, 255, 595, 540, 540);
  ctx.fillStyle = '#6a756e'; ctx.font = '23px sans-serif';
  ctx.fillText('Demostración: no acredita un pago real.', 60, 1195);
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `Reserva-${ticket.folio}.png`;
  link.click();
};

export const downloadTicketPdf = async tickets => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  for (let i = 0; i < tickets.length; i++) {
    if (i) pdf.addPage();
    const ticket = tickets[i];
    const qr = await QRCode.toDataURL(buildQrValue(ticket), { width: 650, margin: 2 });
    pdf.setFillColor(13, 49, 40); pdf.rect(0, 0, 210, 46, 'F');
    pdf.setTextColor(238, 207, 140); pdf.setFontSize(21);
    pdf.text('Nenúfares en el Jardín', 16, 21);
    pdf.setTextColor(255); pdf.setFontSize(12);
    pdf.text('Comprobante de reservación · DEMO', 16, 35);
    pdf.setTextColor(28, 56, 47); pdf.setFontSize(15);
    pdf.text(pdf.splitTextToSize(ticket.eventTitle || '', 175), 16, 62);
    pdf.setFontSize(11);
    const lines = [
      `Folio: ${ticket.folio}`,
      `Titular: ${ticket.holder}`,
      `Fecha: ${ticket.date}`,
      `Lugar: ${ticket.location}`,
      `Boleto: ${ticket.position} de ${ticket.quantity}`,
      `Estado: ${ticket.paymentStatus === 'gratuito' ? 'Registro gratuito' : 'Pago simulado'}`,
    ];
    let y = 84;
    for (const line of lines) {
      const wrapped = pdf.splitTextToSize(line, 176);
      pdf.text(wrapped, 16, y);
      y += 7 * wrapped.length;
    }
    pdf.addImage(qr, 'PNG', 57, Math.max(140, y + 5), 96, 96);
    pdf.setTextColor(110, 110, 110); pdf.setFontSize(9);
    pdf.text('Documento de demostración. No acredita un pago real.', 16, 281);
  }
  pdf.save(`Reservacion-${tickets[0].folio}.pdf`);
};

export default function ReservationModal({ isOpen, onClose, event }) {
  const [step, setStep] = useState(1);
  const [tickets, setTickets] = useState(1);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '' });
  const [issuedTickets, setIssuedTickets] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(isOpen);

  if (isOpen !== previousOpen) {
    setPreviousOpen(isOpen);
    if (isOpen) {
      setStep(1); setTickets(1); setFormData({ nombre: '', email: '', telefono: '' });
      setIssuedTickets([]); setError(''); setBusy(false);
    }
  }
  if (!isOpen || !event) return null;

  const price = Number(event.numericPrice) || 0;
  const total = price * tickets;
  const maxTickets = typeof event.capacity === 'number' ? Math.max(0, event.capacity) : 10;

  const issueTickets = (paymentStatus) => {
    const groupId = crypto.randomUUID();
    const now = new Date().toISOString();
    const records = Array.from({ length: tickets }, (_, index) => ({
      folio: createFolio(), groupId, eventId: event.id, eventTitle: event.title,
      date: getDateLabel(event), location: event.location || 'Por confirmar',
      holder: formData.nombre.trim(), email: formData.email.trim().toLowerCase(),
      phone: formData.telefono.trim(), position: index + 1, quantity: tickets,
      paymentStatus, createdAt: now,
    }));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...getStoredReservations(), ...records]));
      window.dispatchEvent(new Event('nenufares:reservations-updated'));
      setIssuedTickets(records);
      setStep(3);
      setError('');
    } catch {
      setError('No se pudo guardar la reservación en este navegador. Libera espacio e inténtalo de nuevo.');
    }
  };

  const handleRegistration = e => {
    e.preventDefault();
    if (maxTickets < tickets) { setError('No quedan suficientes lugares disponibles.'); return; }
    if (total > 0) setStep(2);
    else issueTickets('gratuito');
  };

  const download = async (task) => {
    setError(''); setBusy(true);
    try { await task(); }
    catch { setError('No se pudo generar el archivo. Inténtalo nuevamente.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="res-modal-overlay" onClick={onClose}>
      <div className="res-modal-container" onClick={e => e.stopPropagation()}>
        <button type="button" className="res-close-btn" onClick={onClose} aria-label="Cerrar"><X size={24}/></button>
        <div className="res-info-side">
          <div className="ev-modal-img" style={{ backgroundImage: `url(${event.image})` }} />
          <div className="ev-modal-details">
            <span className="ev-modal-badge">{event.badge}</span>
            <h2 className="ev-modal-title">{event.title}</h2>
            <div className="ev-modal-meta">
              <p><Calendar size={16}/> {getDateLabel(event)}</p>
              <p><Clock size={16}/> {event.time}</p>
              <p><MapPin size={16}/> {event.location || 'Por confirmar'}</p>
            </div>
            <p className="ev-modal-desc">{event.description}</p>
            <div className="ev-modal-price-tag">{event.price} <small>{price > 0 ? '/ persona' : ''}</small></div>
          </div>
        </div>
        <div className="res-form-side">
          {error && <p role="alert" className="res-error-msg">{error}</p>}
          {step === 1 && <>
            <span className="res-form-kicker">1. REGISTRO Y LUGARES</span>
            <form onSubmit={handleRegistration} className="res-form">
              <div className="tickets-selector">
                <label>¿Cuántos lugares necesitas?</label>
                <div className="tickets-counter">
                  <button type="button" onClick={() => setTickets(Math.max(1, tickets - 1))} aria-label="Quitar un boleto"><Minus size={16}/></button>
                  <span>{tickets}</span>
                  <button type="button" disabled={tickets >= maxTickets} onClick={() => setTickets(Math.min(maxTickets, tickets + 1))} aria-label="Agregar un boleto"><Plus size={16}/></button>
                </div>
              </div>
              <div className="form-group"><label>NOMBRE DEL TITULAR *</label><input type="text" required maxLength={100} value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })}/></div>
              <div className="form-group"><label>CORREO ELECTRÓNICO *</label><input type="email" required maxLength={150} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}/></div>
              <div className="form-group"><label>TELÉFONO</label><input type="tel" maxLength={25} value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })}/></div>
              <div className="checkout-summary"><span>Total:</span><strong>${total.toFixed(2)} MXN</strong></div>
              <button className="btn-submit-reserva" type="submit" disabled={maxTickets < 1}>{maxTickets < 1 ? 'Sin lugares' : total > 0 ? 'Continuar al pago de demostración' : 'Confirmar registro gratuito'}</button>
            </form>
          </>}
          {step === 2 && <>
            <span className="res-form-kicker">2. PAGO DE DEMOSTRACIÓN</span>
            <div className="payment-total-banner"><span>Importe de prueba</span><h2>${total.toFixed(2)} MXN</h2></div>
            <p className="res-demo-disclaimer">Esta página todavía no cuenta con una pasarela bancaria. Al confirmar se registra una <strong>reservación de prueba</strong>, sin realizar ningún cargo. No ingreses datos de tarjeta.</p>
            <div className="form-actions-row">
              <button type="button" className="btn-back" onClick={() => setStep(1)}>Atrás</button>
              <button type="button" className="btn-submit-reserva" onClick={() => issueTickets('simulado')}>Confirmar prueba y generar QR</button>
            </div>
          </>}
          {step === 3 && <div className="success-step-container">
            <CheckCircle size={45} color="#dcb358" className="success-icon"/>
            <h2 className="success-title">¡Reservación registrada!</h2>
            <p className="success-msg">Tus boletos de {total > 0 ? 'demostración' : 'registro gratuito'} están guardados en este navegador. Puedes encontrarlos en tu perfil si inicias sesión con <strong>{formData.email}</strong>.</p>
            <div className="qr-tickets-scroll-area">
              {issuedTickets.map(ticket => (
                <TicketPreview key={ticket.folio} ticket={ticket} onDownload={() => download(() => downloadTicketImage(ticket))} busy={busy}/>
              ))}
            </div>
            <div className="res-download-actions">
              <button type="button" disabled={busy} onClick={() => download(() => downloadTicketPdf(issuedTickets))} className="btn-download-qr"><Download size={16}/> Descargar boletos en PDF</button>
            </div>
            <p className="res-demo-disclaimer">No se ha procesado ningún pago bancario. Para emitir entradas válidas tras un cobro real se requiere integrar una pasarela de pagos y validarla desde el servidor.</p>
          </div>}
        </div>
      </div>
    </div>
  );
}

function TicketPreview({ ticket, onDownload, busy }) {
  const [src, setSrc] = useState('');
  // Render QR locally: the reservation details never need to be sent to a QR API.
  useEffect(() => {
    let active = true;
    QRCode.toDataURL(buildQrValue(ticket), { width: 240, margin: 2 })
      .then(value => { if (active) setSrc(value); })
      .catch(() => { if (active) setSrc(''); });
    return () => { active = false; };
  }, [ticket]);
  return <div className="qr-ticket-card">
    {src ? <img src={src} alt={`QR boleto ${ticket.position}`} className="qr-img"/> : <div className="qr-img"/>}
    <div className="qr-ticket-info">
      <h4>Boleto {ticket.position} de {ticket.quantity}</h4>
      <p><strong>Folio:</strong> {ticket.folio}</p>
      <p><strong>Titular:</strong> {ticket.holder}</p>
      <p><strong>Evento:</strong> {ticket.eventTitle}</p>
      <button type="button" className="res-image-download" disabled={busy} onClick={onDownload}><ImageIcon size={14}/> Guardar PNG</button>
    </div>
  </div>;
}
