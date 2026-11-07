import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { useCatalogCollection } from './useCatalogCollection';
// Componentes globales (common)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ShippingBanner from './components/common/ShippingBanner';

// Módulos de la tienda y carrito (features)
import ProductSection from './features/shop/ProductSection';
import CartDrawer from './features/shop/CartDrawer';
import PromoSection from './features/shop/PromoSection';
import AdminDashboard from './features/admin/AdminDashboard';
import EventsSection from './features/events/EventsSection';

import Hero from "./components/pages/Hero"; // o la ruta que tuviera
import LocationSection from "./components/pages/LocationSection";

import './App.css';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userSession, setUserSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [productsData, setProductsData, loadProducts] = useCatalogCollection('products', setError);
  const [eventsData, setEventsData, loadEvents] = useCatalogCollection('events', setError);
  const [suppliersData, setSuppliersData, loadSuppliers] = useCatalogCollection('suppliers', setError);
  const [ordersData, setOrdersData, loadOrders] = useCatalogCollection('orders', setError);
  const refresh = useCallback(async () => {
    const catalog = await api('/catalog'); loadProducts(catalog.products); loadEvents(catalog.events);
    const {user} = await api('/me'); setUserSession(user);
    if(user) loadOrders(await api('/orders')); else loadOrders([]);
    if(user?.role === 'admin') loadSuppliers(await api('/suppliers')); else loadSuppliers([]);
  }, [loadProducts, loadEvents, loadSuppliers, loadOrders]);
  useEffect(() => { Promise.resolve().then(refresh).catch(e=>setError(e.message)).finally(()=>setReady(true)); }, [refresh]);
  useEffect(() => {
    const update=()=>refresh().catch(e=>setError(e.message));
    window.addEventListener('nenufares:updated', update);
    window.addEventListener('focus', update);
    return ()=>{window.removeEventListener('nenufares:updated',update);window.removeEventListener('focus',update);};
  }, [refresh]);
  const logout = async () => {try {await api('/logout',{method:'POST'});await refresh();} catch(e){setError(e.message);}};
  if(!ready) return <p role="status">Conectando con el servidor local…</p>;
  if(error) return <div role="alert" style={{padding:32}}><p>{error}</p><button onClick={()=>{setError('');refresh().catch(e=>setError(e.message));}}>Volver a cargar datos</button></div>;

  const handleAddToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id && item.size === product.size && item.shippingType === product.shippingType);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.size === product.size && item.shippingType === product.shippingType ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevItems, { ...product, lineId: crypto.randomUUID(), quantity: qty }];
    });
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // VISTA DEL ADMINISTRADOR
  if (userSession && userSession.role === 'admin') {
    return (
      <AdminDashboard 
        adminEmail={userSession.email} 
        onLogout={logout} 
        eventsData={eventsData} 
        setEventsData={setEventsData}
        productsData={productsData}
        setProductsData={setProductsData}
        ordersData={ordersData}
        setOrdersData={setOrdersData}
        suppliersData={suppliersData}
        setSuppliersData={setSuppliersData}
      />
    );
  }

  // VISTA PÚBLICA DEL CLIENTE
  return (
    <>
      <ShippingBanner />
      <Navbar 
        onOpenCart={() => setIsCartOpen(true)} 
        cartCount={totalItemsCount} 
        userSession={userSession} 
        onSessionChange={refresh}
        onLogout={logout} 
      />
      <Hero />
      
      <ProductSection productsData={productsData} onAddToCart={handleAddToCart} />
      <EventsSection eventsData={eventsData} />
      
      <PromoSection onAddToCart={handleAddToCart} />
      <LocationSection />
      <Footer />
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </>
  );
}

export default App;
