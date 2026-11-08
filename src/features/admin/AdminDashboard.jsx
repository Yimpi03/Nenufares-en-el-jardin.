import { useState } from 'react';
import { Package, Archive, CalendarPlus, Users, Truck, LogOut } from 'lucide-react';
import AdminInventory from './AdminInventory';
import AdminEvents from './AdminEvents';
import AdminAttendees from './AdminAttendees';
import AdminOrders from './AdminOrders';
import AdminSuppliers from './AdminSuppliers';
import AdminStats from './AdminStats';
import './AdminDashboard.css';
import AdminCommerce from '../../commerce/AdminCommerce';

const AdminDashboard = ({ 
  adminEmail, onLogout, 
  eventsData, setEventsData, 
  productsData, setProductsData, 
  ordersData, setOrdersData,
  suppliersData, setSuppliersData 
}) => {
  const [activeTab, setActiveTab] = useState('pedidos');

  return (
    <div className="admin-layout">
      {/* BARRA LATERAL */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2 className="brand-title">Nenúfares</h2>
          <h2 className="brand-title italic-gold">en el jardín</h2>
          <span className="admin-badge">PANEL DE ADMINISTRACIÓN</span>
        </div>

        <div className="admin-user-info">
          <span className="user-label">Sesión activa:</span>
          <span className="user-email">{adminEmail || 'admin@floresfinas.mx'}</span>
        </div>

        <nav className="admin-nav">

          <button className={`admin-nav-btn ${activeTab === 'pedidos' ? 'active' : ''}`} onClick={() => setActiveTab('pedidos')}>
            <Package size={18} /> Gestión de Pedidos
          </button>
          
          <button className={`admin-nav-btn ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
            <Archive size={18} /> Inventario del Vivero
          </button>
          
          <button className={`admin-nav-btn ${activeTab === 'eventos' ? 'active' : ''}`} onClick={() => setActiveTab('eventos')}>
            <CalendarPlus size={18} /> Publicar Eventos
          </button>

          <button className={`admin-nav-btn ${activeTab === 'asistentes' ? 'active' : ''}`} onClick={() => setActiveTab('asistentes')}>
            <Users size={18} /> Lista de Asistentes
          </button>

          <button className={`admin-nav-btn ${activeTab === 'proveedores' ? 'active' : ''}`} onClick={() => setActiveTab('proveedores')}>
            <Truck size={18} /> Gestión de Proveedores
          </button>
          {['clientes','envios','paquetes','politicas'].map(tab=><button key={tab} className={`admin-nav-btn ${activeTab===tab?'active':''}`} onClick={()=>setActiveTab(tab)}>{({clientes:'Clientes y correos',envios:'Costos de envío',paquetes:'Paquetes y promociones',politicas:'Políticas y contacto'})[tab]}</button>)}
        </nav>

        <button className="admin-logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="admin-main-content">
        {['clientes','envios','paquetes','politicas'].includes(activeTab)&&<AdminCommerce key={activeTab} tab={activeTab}/>}
        {activeTab === 'finanzas' && (
          <AdminStats ordersData={ordersData} productsData={productsData} />
        )}

        {activeTab === 'pedidos' && (
          <AdminOrders ordersData={ordersData} setOrdersData={setOrdersData} />
        )}
        
        {activeTab === 'inventario' && (
          <AdminInventory productsData={productsData} setProductsData={setProductsData} />
        )}
        
        {activeTab === 'eventos' && (
          <AdminEvents eventsData={eventsData} setEventsData={setEventsData} />
        )}

        {activeTab === 'asistentes' && <AdminAttendees eventsData={eventsData}/>}

        {activeTab === 'proveedores' && (
          <AdminSuppliers suppliersData={suppliersData} setSuppliersData={setSuppliersData} />
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
