import { useState } from 'react';
import { api } from '../../api';
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
  const changeMode = (mode) => { setMessage(''); setAuthMode(mode); };

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (e.currentTarget.dataset.busy) return;
    const form=e.currentTarget;form.dataset.busy='yes';setMessage('Conectando…');
    try {
      if(authMode === 'forgot') {setMessage('El envío de correos no está configurado en local. Contacta al administrador.');return;}
      if(authMode === 'register') {
        const result=await api('/register',{method:'POST',body:formData});
        setMessage(result.message);setAuthMode('login');setFormData({...formData,password:''});
      } else {
        const result=await api('/login',{method:'POST',body:{email:formData.email,password:formData.password}});
        await onLoginSuccess(result.user.email,result.user.role);setMessage('');setFormData({...formData,password:''});onClose();
      }
    } catch(error) {setMessage(error.message);} finally {delete form.dataset.busy;}
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
                <span className="forgot-link" onClick={() => changeMode('forgot')}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>

              <button type="submit" className="auth-submit-btn">Ingresar</button>
            </form>

            <div className="auth-switch-prompt">
              ¿No tienes una cuenta? <span onClick={() => changeMode('register')}>Regístrate aquí</span>
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
                    placeholder="Mínimo 8 caracteres" minLength={8} 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn">Crear cuenta</button>
            </form>

            <div className="auth-switch-prompt">
              ¿Ya tienes una cuenta? <span onClick={() => changeMode('login')}>Inicia sesión</span>
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
              <span onClick={() => changeMode('login')}>← Volver al inicio de sesión</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
