import { useState } from 'react';
import { ShoppingBag, User } from 'lucide-react';
import AuthModal from './AuthModal';
import UserProfileModal from './UserProfileModal';
import './Navbar.css';

const Navbar = ({ onOpenCart, cartCount, userSession, setUserSession }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Recibe el correo y el rol ('admin' o 'client') desde el modal de Auth
  const handleLoginSuccess = (email, role) => {
    setUserSession({ email, role });
  };

  const handleLogout = () => {
    setUserSession(null);
  };

  return (
    <>
      <nav className="navbar">
        <div className="logo">
          <span className="logo-aqua">Nenufares en el </span><span className="logo-flora">Jardín</span>
        </div>
        
        <ul className="nav-links">
          <li><a href="#productos">Productos</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#promociones">Promociones</a></li>
          <li><a href="#ubicacion">Ubicación</a></li>
        </ul>

        <div className="navbar-actions">
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