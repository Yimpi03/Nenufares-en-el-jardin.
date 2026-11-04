import { useState } from 'react';
import { User, Calendar, Clock, Store, Truck, Plane } from 'lucide-react';
import './AdminOrders.css';

const AdminOrders = ({ ordersData = [], setOrdersData }) => {
  const [statusFilter, setStatusFilter] = useState('Todos');

  const handleStatusChange = (orderId, newStatus) => {
    const updated = ordersData.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrdersData(updated);
  };

  const filteredOrders = ordersData.filter(order => {
    if (statusFilter === 'Todos') return true;
    if (statusFilter === 'Recolección') {
      return order.shippingType === 'pickup' || order.reception === 'pickup';
    }
    return order.status === statusFilter;
  });

  return (
    <div className="admin-orders-wrapper">
      <div className="admin-page-header">
        <span className="admin-kicker">CONTROL DE VENTAS</span>
        <h1 className="admin-title">Gestión de <span className="italic-pink">Pedidos</span></h1>
        <p className="admin-subtitle">Monitorea las compras realizadas y programa las entregas o recolecciones en vivero.</p>
      </div>

      {/* FILTROS DE ESTATUS Y TIPO DE ENTREGA */}
      <div className="orders-filters-row">
        {['Todos', 'Procesando', 'Enviado', 'Entregado', 'Recolección'].map(st => (
          <button
            key={st}
            className={`order-filter-pill ${statusFilter === st ? 'active' : ''}`}
            onClick={() => setStatusFilter(st)}
          >
            {st === 'Recolección' ? '🏪 Recolección en Vivero' : st}
          </button>
        ))}
      </div>

      {/* TABLA DE PEDIDOS */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Tipo de Entrega / Horario</th>
              <th>Total</th>
              <th>Fecha Compra</th>
              <th>Estatus</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => {
                const isPickup = order.shippingType === 'pickup' || order.reception === 'pickup';

                return (
                  <tr key={order.id}>
                    <td><strong className="order-id-tag">#{order.id}</strong></td>
                    
                    {/* CLIENTE Y TELÉFONO */}
                    <td>
                      <div className="client-info-cell">
                        <span className="c-name"><User size={13} /> {order.customerName || 'Cliente General'}</span>
                        <span className="c-email">{order.customerEmail || order.phone || 'Sin datos de contacto'}</span>
                      </div>
                    </td>

                    {/* PRODUCTOS */}
                    <td>
                      <ul className="order-items-list">
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            {item.quantity}x {item.title || item.name}
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* NUEVO: MÉTODOS Y DATOS DE RECOLECCIÓN */}
                    <td>
                      {isPickup ? (
                        <div className="pickup-details-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="type-badge pickup" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dcb358', fontWeight: 'bold', fontSize: '0.78rem' }}>
                            <Store size={14} /> Recoge en Vivero
                          </span>
                          {order.pickupDate && (
                            <span style={{ fontSize: '0.75rem', color: '#4a5a55', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={12} color="#889995" /> <strong>Día:</strong> {order.pickupDate}
                            </span>
                          )}
                          {order.pickupTime && (
                            <span style={{ fontSize: '0.75rem', color: '#4a5a55', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} color="#889995" /> <strong>Hora:</strong> {order.pickupTime}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="delivery-details-cell" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="type-badge delivery" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6c7c79', fontSize: '0.78rem' }}>
                            {order.shippingType === 'plane' ? <Plane size={14} /> : <Truck size={14} />} 
                            {order.shippingType === 'plane' ? 'Envío Aéreo (Avión)' : 'Envío Terrestre (Camión)'}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#889995' }}>
                            {order.shippingAddress || 'Dirección no provista'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* TOTAL */}
                    <td><strong>${Number(order.total).toFixed(2)} MXN</strong></td>

                    {/* FECHA */}
                    <td>
                      <span className="date-tag"><Calendar size={12} /> {order.date}</span>
                    </td>

                    {/* ESTATUS */}
                    <td>
                      <span className={`status-pill ${order.status?.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* ACCIONES */}
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        <option value="Procesando">Procesando</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="empty-state">No hay pedidos registrados con este estatus.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;