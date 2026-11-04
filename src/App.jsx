import { useState, useEffect } from 'react';
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

// Base de datos inicial por defecto para Eventos
const initialEvents = [
  {
    id: 1,
    badge: 'TALLER',
    day: '25',
    month: 'OCT',
    year: '2026',
    title: 'Taller de Diseño de Estanques en Teya',
    description: 'Aprende desde cero cómo planificar y plantar tu propio ecosistema acuático. Edición especial en Teya.',
    time: '10:00 - 14:00 hrs',
    capacity: 15,
    price: '$500 MXN',
    numericPrice: 500,
    location: 'Hacienda Teya, Yucatán',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    badge: 'EVENTO',
    day: '12',
    month: 'NOV',
    year: '2026',
    title: 'Exhibición Anual de Koi',
    description: 'Ven a conocer a nuestros mejores ejemplares campeones. Habrá charlas sobre nutrición y salud de los peces.',
    time: '09:00 - 18:00 hrs',
    capacity: 'Entrada libre',
    price: 'Gratis',
    numericPrice: 0,
    location: 'Vivero Flores Finas, Pomuch',
    image: 'https://images.unsplash.com/photo-1511516246830-1c6ce4b38d38?q=80&w=800&auto=format&fit=crop'
  }
];

// Base de datos inicial por defecto para Productos / Inventario
const initialProducts = [
  {
    id: 1,
    title: 'Nenúfar Rosa Gigante',
    category: 'NENÚFAR',
    price: 28.50,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
    description: 'Hermoso ejemplar de floración rosada amplia, ideal para estanques medianos y grandes.'
  },
  {
    id: 2,
    title: 'Loto Sagrado Blanco',
    category: 'LOTO',
    price: 32.00,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop',
    description: 'Loto tradicional de pétalos blancos impuros y gran significado ornamental.'
  },
  {
    id: 3,
    title: 'Carpa Koi Kohaku',
    category: 'PEZ',
    price: 85.00,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1511516246830-1c6ce4b38d38?q=80&w=800&auto=format&fit=crop',
    description: 'Pez ornamental de patrones rojos vibrantes sobre base blanca pura.'
  },
  {
    id: 4,
    title: 'Loto Rosa Tailandés',
    category: 'LOTO',
    price: 26.00,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1543455242-4dc21df2650b?q=80&w=800&auto=format&fit=crop',
    description: 'Variedad exótica de loto en tonos rosados intensos.'
  }
];

// Pedidos iniciales por defecto para el Admin
const initialOrders = [
  {
    id: '172001',
    customerName: 'Marisa Ramirez',
    customerEmail: '8490@itescam.edu.mx',
    items: [{ title: 'Nenúfar Rosa Gigante', quantity: 2 }],
    total: 57.00,
    date: '16 Sep 2026',
    status: 'Procesando'
  }
];

// Proveedores iniciales por defecto
const initialSuppliers = [
  {
    id: 1,
    name: 'Vivero Acuático Teya',
    contactPerson: 'Lic. Carmen Uc',
    phone: '999 456 7890',
    email: 'ventas@teyaacuarios.mx',
    category: 'Plantas y Nenúfares',
    address: 'Hacienda Teya, Yucatán'
  },
  {
    id: 2,
    name: 'Peces Ornamentales del Mayab',
    contactPerson: 'Don Jacinto Tun',
    phone: '988 789 1234',
    email: 'koi.mayab@gmail.com',
    category: 'Fauna y Carpas Koi',
    address: 'Calkiní, Campeche'
  }
];

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [userSession, setUserSession] = useState(null);
  
  // Sincronización de Eventos con localStorage
  const [eventsData, setEventsData] = useState(() => {
    const saved = localStorage.getItem('nenufares_events_real');
    return saved ? JSON.parse(saved) : initialEvents;
  });

  useEffect(() => {
    localStorage.setItem('nenufares_events_real', JSON.stringify(eventsData));
  }, [eventsData]);

  // Sincronización de Productos / Inventario con localStorage
  const [productsData, setProductsData] = useState(() => {
    const saved = localStorage.getItem('nenufares_products_real');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('nenufares_products_real', JSON.stringify(productsData));
  }, [productsData]);

  // Sincronización de Pedidos con localStorage
  const [ordersData, setOrdersData] = useState(() => {
    const saved = localStorage.getItem('nenufares_orders_real');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('nenufares_orders_real', JSON.stringify(ordersData));
  }, [ordersData]);

  // Sincronización de Proveedores con localStorage
  const [suppliersData, setSuppliersData] = useState(() => {
    const saved = localStorage.getItem('nenufares_suppliers_real');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  useEffect(() => {
    localStorage.setItem('nenufares_suppliers_real', JSON.stringify(suppliersData));
  }, [suppliersData]);

  const handleAddToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prevItems, { ...product, quantity: qty }];
    });
  };

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // VISTA DEL ADMINISTRADOR
  if (userSession && userSession.role === 'admin') {
    return (
      <AdminDashboard 
        adminEmail={userSession.email} 
        onLogout={() => setUserSession(null)} 
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
        setUserSession={setUserSession} 
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