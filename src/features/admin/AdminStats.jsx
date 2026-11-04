import { DollarSign, ShoppingBag, TrendingUp, Calendar } from 'lucide-react';

const AdminStats = ({ ordersData, productsData }) => {
  // 1. Calcular dinero total generado por los pedidos
  const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total || 0), 0);

  // 2. Total de pedidos realizados
  const totalOrdersCount = ordersData.length;

  // 3. Ticket promedio por pedido
  const averageTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // 4. Productos totales en inventario
  const totalProducts = productsData.reduce((sum, prod) => sum + Number(prod.stock || 0), 0);

  return (
    <div style={{ padding: '2.5rem 3rem', fontFamily: 'Inter, sans-serif', color: '#1a3c35', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.72rem', letterSpacing: '2px', color: '#889995', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>FINANZAS Y RENDIMIENTO</span>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#1a3c35', margin: 0, fontWeight: 400 }}>Panel de <span style={{ fontStyle: 'italic', color: '#dcb358' }}>Estadísticas</span></h1>
        <p style={{ fontSize: '0.88rem', color: '#6c7c79', marginTop: '0.4rem' }}>Resumen de ingresos, ventas y métricas clave del vivero.</p>
      </div>

      {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Ingresos Totales */}
        <div style={{ background: 'white', padding: '1.8rem', borderRadius: '8px', border: '1px solid #e0dfd5', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#889995', textTransform: 'uppercase' }}>Dinero Generado</span>
            <div style={{ width: '38px', height: '38px', background: '#e6fcf5', color: '#0ca678', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', color: '#1a3c35', margin: 0 }}>
            ${totalRevenue.toFixed(2)} <span style={{ fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#889995' }}>MXN</span>
          </h2>
          <span style={{ fontSize: '0.78px', color: '#0ca678', fontWeight: 500 }}>Calculado en tiempo real de los pedidos</span>
        </div>

        {/* Total de Pedidos */}
        <div style={{ background: 'white', padding: '1.8rem', borderRadius: '8px', border: '1px solid #e0dfd5', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#889995', textTransform: 'uppercase' }}>Pedidos Recibidos</span>
            <div style={{ width: '38px', height: '38px', background: '#e7f5ff', color: '#1971c2', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', color: '#1a3c35', margin: 0 }}>
            {totalOrdersCount}
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#1971c2', fontWeight: 500 }}>Órdenes registradas en plataforma</span>
        </div>

        {/* Ticket Promedio */}
        <div style={{ background: 'white', padding: '1.8rem', borderRadius: '8px', border: '1px solid #e0dfd5', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#889995', textTransform: 'uppercase' }}>Ticket Promedio</span>
            <div style={{ width: '38px', height: '38px', background: '#fff3bf', color: '#f08c00', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', color: '#1a3c35', margin: 0 }}>
            ${averageTicket.toFixed(2)} <span style={{ fontSize: '1rem', fontFamily: 'Inter, sans-serif', color: '#889995' }}>MXN</span>
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#f08c00', fontWeight: 500 }}>Valor medio por cada compra</span>
        </div>

        {/* Productos en inventario */}
        <div style={{ background: 'white', padding: '1.8rem', borderRadius: '8px', border: '1px solid #e0dfd5', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#889995', textTransform: 'uppercase' }}>Productos en Inventario</span>
            <div style={{ width: '38px', height: '38px', background: '#f3f0ff', color: '#7048e8', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={20} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.2rem', fontFamily: 'Playfair Display, serif', color: '#1a3c35', margin: 0 }}>
            {totalProducts}
          </h2>
          <span style={{ fontSize: '0.78rem', color: '#7048e8', fontWeight: 500 }}>Unidades disponibles en stock</span>
        </div>

      </div>

      {/* SECCIÓN DE ÚLTIMOS INGRESOS REGISTRADOS */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e0dfd5', padding: '2rem' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.4rem', color: '#1a3c35', marginTop: 0, marginBottom: '1.2rem' }}>
          Historial de <span style={{ fontStyle: 'italic', color: '#dcb358' }}>Transacciones</span>
        </h3>
        
        {ordersData.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {ordersData.map((order, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#fcfbf9', borderRadius: '6px', border: '1px solid #f0eee4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '32px', height: '32px', background: '#1a3c35', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                    #{order.id.slice(-3)}
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: '#1a3c35', display: 'block' }}>{order.customerName || 'Cliente General'}</strong>
                    <span style={{ fontSize: '0.78rem', color: '#889995', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={11} /> {order.date} • Estatus: <strong style={{ color: '#0ca678' }}>{order.status}</strong>
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1a3c35' }}>+${Number(order.total).toFixed(2)} MXN</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#889995', fontStyle: 'italic', textAlign: 'center', padding: '2rem 0' }}>Aún no hay transacciones registradas.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStats;