import { useState } from 'react';
import { X, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); 

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    if (authMode === 'register') {
      setMessage('¡Cuenta creada con éxito! Ya puedes iniciar sesión.');
      setTimeout(() => {
        setMessage('');
        setAuthMode('login');
      }, 2000);
    } else if (authMode === 'login') {
      // --- VALIDACIÓN DE ADMINISTRADOR ---
      if (formData.email.trim().toLowerCase() === 'admin@floresfinas.mx') {
        setMessage('¡Acceso concedido como Administrador!');
        setTimeout(() => {
          setMessage('');
          // Pasamos el rol de admin al componente principal App.jsx
          onLoginSuccess(formData.email, 'admin');
          onClose();
        }, 1200);
        return;
      }

      // --- INICIO DE SESIÓN DE CLIENTE NORMAL ---
      setMessage('¡Bienvenido de nuevo a Flores Finas!');
      setTimeout(() => {
        setMessage('');
        onLoginSuccess(formData.email, 'client');
        onClose();
      }, 1200);

    } else if (authMode === 'forgot') {
      setMessage('Se han enviado las instrucciones de restablecimiento a tu correo.');
      setTimeout(() => {
        setMessage('');
        setAuthMode('login');
      }, 2500);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* --- VISTA 1: INICIAR SESIÓN --- */}
        {authMode === 'login' && (
          <div className="auth-form-container">
            <h2>Iniciar Sesión</h2>
            <p className="auth-subtitle">Accede a tu cuenta o panel de control</p>

            {message && <div className="auth-success-msg">{message}</div>}

            <form onSubmit={handleAuthSubmit}>
              <div className="auth-field">
                <label>CORREO ELECTRÓNICO</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="correo@ejemplo.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>CONTRASEÑA</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="auth-links-row">
                <span className="forgot-link" onClick={() => setAuthMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              <button type="submit" className="auth-submit-btn">Ingresar</button>
            </form>

            <div className="auth-switch-prompt">
              ¿No tienes una cuenta? <span onClick={() => setAuthMode('register')}>Regístrate aquí</span>
            </div>

            <button className="back-to-store-btn" onClick={onClose}>
              <ArrowLeft size={16} /> Volver a la tienda
            </button>
          </div>
        )}

        {/* --- VISTA 2: CREAR CUENTA --- */}
        {authMode === 'register' && (
          <div className="auth-form-container">
            <h2>Crear Cuenta</h2>
            <p className="auth-subtitle">Únete a nuestra comunidad de jardines acuáticos</p>

            {message && <div className="auth-success-msg">{message}</div>}

            <form onSubmit={handleAuthSubmit}>
              <div className="auth-row-double">
                <div className="auth-field">
                  <label>NOMBRE</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input 
                      type="text" 
                      name="nombre" 
                      placeholder="Tu nombre" 
                      value={formData.nombre} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label>APELLIDO</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input 
                      type="text" 
                      name="apellido" 
                      placeholder="Tu apellido" 
                      value={formData.apellido} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label>CORREO ELECTRÓNICO</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="correo@ejemplo.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <div className="auth-field">
                <label>CONTRASEÑA</label>
                <div className="input-with-icon">
                  <Lock size={16} />
                  <input 
                    type="password" 
                    name="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">Crear cuenta</button>
            </form>

            <div className="auth-switch-prompt">
              ¿Ya tienes una cuenta? <span onClick={() => setAuthMode('login')}>Inicia sesión</span>
            </div>

            <button className="back-to-store-btn" onClick={onClose}>
              <ArrowLeft size={16} /> Volver a la tienda
            </button>
          </div>
        )}

        {/* --- VISTA 3: RECUPERAR CONTRASEÑA --- */}
        {authMode === 'forgot' && (
          <div className="auth-form-container">
            <h2>Recuperar Contraseña</h2>
            <p className="auth-subtitle">Ingresa tu correo y te enviaremos las instrucciones.</p>

            {message && <div className="auth-success-msg">{message}</div>}

            <form onSubmit={handleAuthSubmit}>
              <div className="auth-field">
                <label>CORREO ELECTRÓNICO</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="correo@ejemplo.com" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">Enviar instrucciones</button>
            </form>

            <div className="auth-switch-prompt">
              <span onClick={() => setAuthMode('login')}>← Volver al inicio de sesión</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;