import { useState } from 'react';
import { Trash2, Edit3, Plus, X, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';
import './AdminEvents.css';

const AdminEvents = ({ eventsData, setEventsData }) => {
  const [formData, setFormData] = useState({
    title: '', 
    date: '', 
    time: '', 
    location: '', 
    price: '', 
    capacity: '', 
    description: '', 
    image: '',
    badge: 'TALLER',
    day: '25',
    month: 'OCT',
    year: '2026'
  });

  const [editingId, setEditingId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenEdit = (ev) => {
    setEditingId(ev.id);
    setFormData({
      title: ev.title || '',
      date: ev.date || '',
      time: ev.time || '',
      location: ev.location || '',
      price: typeof ev.price === 'string' ? ev.price.replace(' MXN', '').replace('$', '') : (ev.price || ''),
      capacity: ev.capacity || '',
      description: ev.description || '',
      image: ev.image || '',
      badge: ev.badge || 'TALLER',
      day: ev.day || '25',
      month: ev.month || 'OCT',
      year: ev.year || '2026'
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: '', date: '', time: '', location: '', price: '', capacity: '', description: '', image: '',
      badge: 'TALLER', day: '25', month: 'OCT', year: '2026'
    });
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();

    const formattedPrice = String(formData.price).startsWith('$') 
      ? formData.price 
      : (formData.price === 'Gratis' || formData.price === '0' ? 'Gratis' : `$${formData.price} MXN`);

    const eventPayload = {
      id: editingId ? editingId : Date.now(),
      ...formData,
      price: formattedPrice,
      numericPrice: formData.price === 'Gratis' ? 0 : Number(formData.price) || 0,
      capacity: Number(formData.capacity) || 15,
      image: formData.image || 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop'
    };

    if (editingId) {
      const updatedEvents = eventsData.map(ev => ev.id === editingId ? eventPayload : ev);
      setEventsData(updatedEvents);
      setEditingId(null);
    } else {
      const updatedEvents = [...eventsData, eventPayload];
      setEventsData(updatedEvents);
    }

    setFormData({
      title: '', date: '', time: '', location: '', price: '', capacity: '', description: '', image: '',
      badge: 'TALLER', day: '25', month: 'OCT', year: '2026'
    });
  };

  const handleDelete = (id) => {
    const updatedEvents = eventsData.filter(event => event.id !== id);
    setEventsData(updatedEvents);
    if (editingId === id) handleCancelEdit();
  };

  return (
    <div className="admin-events-wrapper">
      <div className="admin-page-header">
        <span className="admin-kicker">PUBLICACIÓN Y CONTROL</span>
        <h1 className="admin-title">
          Gestión de <span className="italic-pink">Eventos</span>
        </h1>
      </div>

      <div className="admin-events-grid-container">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="admin-card-box">
          <div className="form-header-row">
            <h3>{editingId ? 'Editar Evento' : 'Publicar Nuevo Evento'}</h3>
            {editingId && (
              <button type="button" className="btn-cancel-edit" onClick={handleCancelEdit}>
                <X size={14} /> Cancelar
              </button>
            )}
          </div>

          <form onSubmit={handleSaveEvent} className="ae-form">
            <div className="ae-field">
              <label>Título del Evento</label>
              <input type="text" name="title" placeholder="Ej: Taller de Lotos" value={formData.title} onChange={handleChange} required />
            </div>
            
            <div className="ae-row">
              <div className="ae-field">
                <label>Fecha</label>
                <input type="text" name="date" placeholder="Ej: 25 Oct 2026" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="ae-field">
                <label>Hora</label>
                <input type="text" name="time" placeholder="Ej: 10:00 hrs" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="ae-row">
              <div className="ae-field">
                <label>Ubicación</label>
                <input type="text" name="location" placeholder="Ej: Vivero Pomuch" value={formData.location} onChange={handleChange} required />
              </div>
              <div className="ae-field">
                <label>Precio (MXN)</label>
                <input type="text" name="price" placeholder="Ej: 500 o Gratis" value={formData.price} onChange={handleChange} required />
              </div>
            </div>

            <div className="ae-row">
              <div className="ae-field">
                <label>Cupo Máximo</label>
                <input type="number" name="capacity" placeholder="Ej: 15" value={formData.capacity} onChange={handleChange} required />
              </div>
              <div className="ae-field">
                <label>Categoría</label>
                <input type="text" name="badge" placeholder="Ej: TALLER" value={formData.badge} onChange={handleChange} required />
              </div>
            </div>

            <div className="ae-field">
              <label>URL de Imagen</label>
              <div className="img-input-wrap">
                <input type="url" name="image" placeholder="https://..." value={formData.image} onChange={handleChange} />
                <ImageIcon size={16} className="img-ico" />
              </div>
            </div>

            <div className="ae-field">
              <label>Descripción</label>
              <textarea name="description" placeholder="Detalles del evento..." value={formData.description} onChange={handleChange} required rows="3"></textarea>
            </div>
            
            <button type="submit" className={`ae-submit-btn ${editingId ? 'is-editing' : ''}`}>
              {editingId ? <><Edit3 size={16} /> Guardar Cambios</> : <><Plus size={16} /> Publicar Evento</>}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: LISTA DE EVENTOS */}
        <div className="admin-card-box">
          <h3>Eventos Registrados ({eventsData.length})</h3>
          
          <div className="ae-list-scroll">
            {eventsData.length === 0 ? (
              <p className="ae-empty">No hay eventos publicados.</p>
            ) : (
              eventsData.map(ev => (
                <div key={ev.id} className={`ae-item-card ${editingId === ev.id ? 'highlight-edit' : ''}`}>
                  <img src={ev.image} alt={ev.title} className="ae-thumb" />
                  <div className="ae-info">
                    <h4>{ev.title}</h4>
                    <span><Calendar size={11} /> {ev.date} · {ev.time}</span>
                    <span><MapPin size={11} /> {ev.location}</span>
                  </div>
                  <div className="ae-actions">
                    <button type="button" className="ae-btn-edit" onClick={() => handleOpenEdit(ev)} title="Editar">
                      <Edit3 size={14} />
                    </button>
                    <button type="button" className="ae-btn-delete" onClick={() => handleDelete(ev.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;