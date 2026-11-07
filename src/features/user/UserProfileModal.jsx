import { useState, useEffect } from 'react';
import { api } from '../../api';
import { X, User, MapPin, Package, Truck, CheckCircle, Edit2, Save, LogOut } from 'lucide-react';
import './UserProfileModal.css';

const UserProfileModal = ({ isOpen, onClose, userEmail, userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' o 'address'

  // Estado para la dirección de envío (permite editarla)
  const [address,setAddress]=useState({street:'',colony:'',city:'',zip:''});
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);
  const [successMsg, setSuccessMsg] = useState('');

  const [orders,setOrders]=useState([]);
  useEffect(()=>{if(!isOpen)return;Promise.all([api('/orders'),api('/address')]).then(([orders,a])=>{
   setOrders(orders.map(o=>({...o,total:`$${o.total.toFixed(2)}`,items:o.items.map(i=>`${i.quantity}x ${i.title}`).join(', '),step:o.status==='Entregado'?3:o.status==='Enviado'?2:o.status==='Cancelado'?0:1,trackingDetails:o.status==='Cancelado'?'Pedido cancelado.':'Pago pendiente. Estado: '+o.status})));
   const value={street:'',colony:'',city:'',zip:'',...a};setAddress(value);setTempAddress(value);
  }).catch(e=>setSuccessMsg(e.message));},[isOpen]);
  if(!isOpen)return null;
  const handleSaveAddress=async e=>{e.preventDefault();try{const saved=await api('/address',{method:'PUT',body:tempAddress});setAddress(saved);setIsEditingAddress(false);setSuccessMsg('Dirección guardada.');}catch(e){setSuccessMsg(e.message);}};

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
