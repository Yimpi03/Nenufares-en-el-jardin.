import { useState, useEffect } from 'react';
import { downloadTicketPdf, downloadTicketImage } from '../../features/events/ReservationModal';
import { Ticket, Download, Image as ImageIcon } from 'lucide-react';
import { X, User, MapPin, Package, Truck, CheckCircle, Edit2, Save, LogOut } from 'lucide-react';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, userEmail, userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [reservations, setReservations] = useState([]);
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const refresh = () => {
      try {
        const data = JSON.parse(localStorage.getItem('nenufares_reservaciones_demo_v1') || '[]');
        setReservations(Array.isArray(data) ? data.filter(ticket => ticket.email === (userEmail || '').trim().toLowerCase()) : []);
      } catch { setReservations([]); }
    };
    refresh();
    window.addEventListener('nenufares:reservations-updated', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.removeEventListener('nenufares:reservations-updated', refresh); window.removeEventListener('storage', refresh); };
  }, [isOpen, userEmail]); // 'orders' o 'address'

  // Estado para la dirección de envío (permite editarla)
  const [address, setAddress] = useState({
    street: 'Av. del Lago 248',
    colony: 'Col. La Guadalupana',
    city: 'Xochimilco, CDMX',
    zip: '16000'
  });

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [successMsg, setSuccessMsg] = useState('');

  // Simulación de pedidos realizados por el usuario con seguimiento de recorrido
  const [orders] = useState([
    {
      id: 'AF-2026-891',
      date: '25 de Agosto, 2026',
      items: '3x Nenúfar Rosa Gigante, 2x Carpa Koi Kohaku',
      total: '$253.50',
      status: 'En camino',
      step: 2,
      trackingDetails: 'Repartidor asignado: Carlos M. · Ruta Xochimilco-Centro'
    },
    {
      id: 'AF-2026-742',
      date: '10 de Agosto, 2026',
      items: '1x Estanque Completo (Paquete Fundador)',
      total: '$229.00',
      status: 'Entregado',
      step: 3,
      trackingDetails: 'Entregado con éxito en domicilio.'
    }
  ]);

  if (!isOpen) return null;

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddress(tempAddress);
    setIsEditingAddress(false);
    setSuccessMsg('¡Dirección actualizada correctamente!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleLogoutClick = () => {
    onLogout && onLogout();
    onClose();
  };

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Encabezado del Perfil */}
        <div className="profile-header">
          <div className="profile-avatar-icon">
            <User size={28} />
          </div>
          <div className="profile-header-info">
            <h2>{userName || 'Marisa'}</h2>
            <p className="profile-email-sub">{userEmail || 'correo@ejemplo.com'}</p>
          </div>
          {/* Botón de Cerrar Sesión en el Encabezado */}
          <button className="btn-logout-header" onClick={handleLogoutClick} title="Cerrar sesión">
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>

        {successMsg && <div className="profile-alert-success">{successMsg}</div>}

        {/* Pestañas de navegación interna */}
        <div className="profile-tabs">
          <button 
            className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Package size={16} /> Mis Pedidos
          </button>
          <button type="button" className={`profile-tab-btn ${activeTab === 'reservations' ? 'active' : ''}`} onClick={() => setActiveTab('reservations')}>
            <Ticket size={16} /> Mis reservaciones
          </button>
          <button 
            className={`profile-tab-btn ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            <MapPin size={16} /> Dirección de Envío
          </button>
        </div>

        {/* --- CONTENIDO DE LA PESTAÑA: MIS PEDIDOS Y SEGUIMIENTO --- */}
        {activeTab === 'orders' && (
          <div className="profile-tab-pane">
            <h3 className="pane-title">Historial y Seguimiento de Pedidos</h3>
            
            {orders.length === 0 ? (
              <p className="no-orders-text">Aún no has realizado ningún pedido.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <span className="order-id">Pedido #{order.id}</span>
                      <span className="order-date">{order.date}</span>
                    </div>

                    <p className="order-items-desc">{order.items}</p>
                    
                    <div className="order-card-footer">
                      <span className="order-total-price">Total: {order.total}</span>
                      <span className={`order-status-badge status-${order.step}`}>
                        {order.status === 'En camino' ? <Truck size={14} /> : <CheckCircle size={14} />}
                        {order.status}
                      </span>
                    </div>

                    {/* Barra de progreso de recorrido */}
                    <div className="tracking-section">
                      <p className="tracking-info-text">📍 {order.trackingDetails}</p>
                      <div className="tracking-steps">
                        <div className={`t-step ${order.step >= 1 ? 'completed' : ''}`}>
                          <span>1</span> Preparación
                        </div>
                        <div className={`t-step ${order.step >= 2 ? 'completed' : ''}`}>
                          <span>2</span> En camino
                        </div>
                        <div className={`t-step ${order.step >= 3 ? 'completed' : ''}`}>
                          <span>3</span> Entregado
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'reservations' && (
          <div className="profile-tab-pane">
            <h3 className="pane-title">Mis reservaciones y códigos QR</h3>
            <p style={{ marginBottom: '1rem', color: '#67746e' }}>Reservaciones de demostración almacenadas en este navegador. Los pagos simulados no acreditan un cobro real.</p>
            {downloadError && <p role="alert" style={{ color: '#b73737' }}>{downloadError}</p>}
            {reservations.length === 0 ? <p className="no-orders-text">Todavía no tienes reservaciones en este navegador con este correo.</p> : (
              <div className="orders-list">
                {reservations.map(ticket => (
                  <div key={ticket.folio} className="order-card">
                    <div className="order-card-header">
                      <strong className="order-id">{ticket.folio}</strong>
                      <span className="order-date">{ticket.date}</span>
                    </div>
                    <p className="order-items-desc"><strong>{ticket.eventTitle}</strong></p>
                    <p className="order-items-desc">Titular: {ticket.holder} · Boleto {ticket.position}/{ticket.quantity}</p>
                    <p className="order-items-desc">Estado: {ticket.paymentStatus === 'gratuito' ? 'Registro gratuito' : 'Pago simulado (DEMO)'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginTop: '.8rem' }}>
                      <button type="button" className="btn-save-addr" onClick={() => downloadTicketPdf([ticket]).catch(() => setDownloadError('No fue posible descargar el PDF.'))}><Download size={14}/> PDF</button>
                      <button type="button" className="btn-edit-address" onClick={() => downloadTicketImage(ticket).catch(() => setDownloadError('No fue posible descargar la imagen.'))}><ImageIcon size={14}/> Imagen PNG</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- CONTENIDO DE LA PESTAÑA: DIRECCIÓN DE ENVÍO --- */}
        {activeTab === 'address' && (
          <div className="profile-tab-pane">
            <div className="address-header-row">
              <h3 className="pane-title">Dirección de Entrega Principal</h3>
              {!isEditingAddress && (
                <button className="btn-edit-address" onClick={() => setIsEditingAddress(true)}>
                  <Edit2 size={14} /> Editar dirección
                </button>
              )}
            </div>

            {!isEditingAddress ? (
              <div className="address-display-box">
                <MapPin size={20} className="addr-pin-icon" />
                <div>
                  <p><strong>Calle:</strong> {address.street}</p>
                  <p><strong>Colonia:</strong> {address.colony}</p>
                  <p><strong>Ciudad/Estado:</strong> {address.city}</p>
                  <p><strong>Código Postal:</strong> {address.zip}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="address-edit-form">
                <div className="addr-field">
                  <label>CALLE Y NÚMERO</label>
                  <input 
                    type="text" 
                    value={tempAddress.street} 
                    onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })} 
                    required 
                  />
                </div>
                <div className="addr-field">
                  <label>COLONIA</label>
                  <input 
                    type="text" 
                    value={tempAddress.colony} 
                    onChange={(e) => setTempAddress({ ...tempAddress, colony: e.target.value })} 
                    required 
                  />
                </div>
                <div className="addr-row-double">
                  <div className="addr-field">
                    <label>CIUDAD / ESTADO</label>
                    <input 
                      type="text" 
                      value={tempAddress.city} 
                      onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })} 
                      required 
                    />
                  </div>
                  <div className="addr-field">
                    <label>CÓDIGO POSTAL</label>
                    <input 
                      type="text" 
                      value={tempAddress.zip} 
                      onChange={(e) => setTempAddress({ ...tempAddress, zip: e.target.value })} 
                      required 
                    />
                  </div>
                </div>

                <div className="addr-buttons-row">
                  <button type="button" className="btn-cancel-addr" onClick={() => setIsEditingAddress(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save-addr">
                    <Save size={14} /> Guardar Cambios
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfileModal;