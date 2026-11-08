import { useState, useEffect } from 'react';
import { ShoppingBag, User, Menu, X, Sprout } from 'lucide-react';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import './Navbar.css';

const Navbar = ({ onOpenCart, cartCount, userSession, onSessionChange, onLogout }) => {
  const [menuOpen,setMenuOpen]=useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(()=>{const open=()=>setIsAuthOpen(true);window.addEventListener('nenufares:auth-required',open);return()=>window.removeEventListener('nenufares:auth-required',open);},[]);
  // Recibe el correo y el rol ('admin' o 'client') desde el modal de Auth
  const handleLoginSuccess = async () => { await onSessionChange(); };

  const handleLogout = () => {
    onLogout();
  };

  return (
    <>
      <nav className="navbar">
        <a className="logo atelier-wordmark" href="#" aria-label="Nenúfares en el Jardín, inicio"><span className="atelier-brand-icon"><Sprout size={26} strokeWidth={1.3}/></span><span className="atelier-brand-name">Nenúfares<small>EN EL JARDÍN</small></span></a>
        
        <ul id="store-navigation" className={`nav-links ${menuOpen?'is-mobile-open':''}`} onClick={()=>setMenuOpen(false)}>
          <li><a href="#productos">Productos</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#promociones">Promociones</a></li>
          <li><a href="#ubicacion">Ubicación</a></li>
        </ul>

        <div className="navbar-actions"><button className="atelier-menu-toggle" aria-label={menuOpen?'Cerrar menú':'Abrir menú'} aria-expanded={menuOpen} aria-controls="store-navigation" onClick={()=>setMenuOpen(!menuOpen)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
          {/* Si hay una sesión activa de cliente, muestra su nombre y abre el perfil */}
          {userSession ? (
            <div className="user-logged-box" onClick={() => setIsProfileOpen(true)} title="Ver mi perfil y pedidos">
              <User size={16} />
              <span className="user-email-text">{userSession.email.split('@')[0]}</span>
            </div>
          ) : (
            <button className="btn-auth-login" onClick={() => setIsAuthOpen(true)}>
              <User size={16} /> Ingresar
            </button>
          )}

          {/* Botón del Carrito */}
          <div className="cart-btn-wrapper">
            <button className="btn-carrito" onClick={onOpenCart}>
              <ShoppingBag size={18} /> Carrito
            </button>
            {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
          </div>
        </div>
      </nav>

      {/* Modal de Autenticación (Login, Registro, Admin) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Modal de Perfil de Usuario (Solo si es cliente) */}
      {userSession && userSession.role === 'client' && (
        <UserProfileModal 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          userEmail={userSession.email}
          userName={userSession.email.split('@')[0]}
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

export default Navbar;
