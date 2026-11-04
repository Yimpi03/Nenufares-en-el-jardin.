import { useState } from 'react';
import { Sprout, Ruler, Truck } from 'lucide-react';
import './ReservationSection.css';

const ReservationSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: '',
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', date: '', time: '', service: '', notes: '' });
    }, 3000);
  };

  return (
    <section className="reservation-section" id="reservar">
      <div className="reservation-container">
        
        {/* Columna Izquierda: Información y Beneficios */}
        <div className="reservation-info-col">
          <h2 className="reservation-main-title">
            Haz tu <span className="italic-pink">Reservación</span>
          </h2>
          <p className="reservation-desc">
            Visita nuestro vivero acuático o agenda una consulta con nuestros expertos para diseñar tu jardín ideal.
          </p>

          <div className="reservation-features">
            <div className="feature-item">
              <div className="feature-icon-box"><Sprout size={20} /></div>
              <div>
                <h4>Visita al Vivero</h4>
                <p>Recorre más de 200 variedades de plantas acuáticas y peces.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box"><Ruler size={20} /></div>
              <div>
                <h4>Diseño de Estanque</h4>
                <p>Consultoría personalizada para estanques desde 0.5 m² hasta proyectos comerciales.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-box"><Truck size={20} /></div>
              <div>
                <h4>Entrega Especializada</h4>
                <p>Coordinamos entrega y plantación en tu hogar con nuestro equipo.</p>
              </div>
            </div>
          </div>

          <div className="reservation-image-preview"></div>
        </div>

        {/* Columna Derecha: Formulario de Reserva */}
        <div className="reservation-form-col">
          <form className="res-form" onSubmit={handleSubmit}>
            <p className="form-kicker">FORMULARIO DE RESERVA</p>

            <div className="form-group">
              <label>NOMBRE COMPLETO *</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Tu nombre" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label>EMAIL *</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="correo@ejemplo.com" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>TELÉFONO</label>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="+52 000 000 0000" 
                  value={formData.phone} 
                  onChange={handleChange} 
                />
              </div>
            </div>

            <div className="form-row-double">
              <div className="form-group">
                <label>FECHA *</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>HORA *</label>
                <select name="time" value={formData.time} onChange={handleChange} required>
                  <option value="">Seleccionar</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>TIPO DE SERVICIO *</label>
              <select name="service" value={formData.service} onChange={handleChange} required>
                <option value="">Seleccionar tipo</option>
                <option value="vivero">Visita al Vivero</option>
                <option value="estanque">Diseño de Estanque</option>
                <option value="entrega">Entrega Especializada</option>
              </select>
            </div>

            <div className="form-group">
              <label>NOTAS ADICIONALES</label>
              <textarea 
                name="notes" 
                rows="3" 
                placeholder="Cuéntanos sobre tu proyecto o consulta..." 
                value={formData.notes} 
                onChange={handleChange}
              ></textarea>
            </div>

            <button type="submit" className="btn-confirm-res">
              {submitted ? '✓ ¡Reservación Confirmada!' : 'Confirmar Reservación'}
            </button>
          </form>
        </div>

      </div>
    </section>
  );
};

export default ReservationSection;