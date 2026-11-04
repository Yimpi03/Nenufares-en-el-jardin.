import  { useState } from 'react';
import { Calendar, Users, Mail, Ticket, Search } from 'lucide-react';
import './AdminAttendees.css';

// Base de datos simulada de asistentes registrados (puedes conectarla con tus compras reales después)
const initialAttendees = [
  {
    id: 'FF-X8K9-1',
    name: 'Marisa Ramirez',
    email: 'marisaramh.09@gmail.com',
    eventTitle: 'Taller de Diseño de Estanques en Teya',
    date: '25 Oct 2026',
    places: 2,
    totalPaid: '$1,000 MXN'
  },
  {
    id: 'FF-A4T2-1',
    name: 'Carlos Mendoza',
    email: 'carlos@ejemplo.com',
    eventTitle: 'Taller de Diseño de Estanques en Teya',
    date: '25 Oct 2026',
    places: 1,
    totalPaid: '$500 MXN'
  },
  {
    id: 'FF-M9L1-2',
    name: 'Jessica Canche',
    email: 'jessica@ejemplo.com',
    eventTitle: 'Masterclass: Jardín Zen con Lotos',
    date: '04 Nov 2026',
    places: 3,
    totalPaid: '$1,800 MXN'
  }
];

const AdminAttendees = () => {
  const [attendees] = useState(initialAttendees);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('Todas');

  // Extraemos fechas únicas para los botones de filtro
  const uniqueDates = ['Todas', ...new Set(attendees.map(a => a.date))];

  // Filtramos por fecha y barra de búsqueda
  const filteredAttendees = attendees.filter(attendee => {
    const matchesDate = selectedDate === 'Todas' || attendee.date === selectedDate;
    const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          attendee.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDate && matchesSearch;
  });

  // Agrupamos por día para mostrar contadores rápidos
  const totalPeopleForDate = (date) => {
    if (date === 'Todas') return attendees.reduce((sum, a) => sum + a.places, 0);
    return attendees.filter(a => a.date === date).reduce((sum, a) => sum + a.places, 0);
  };

  return (
    <div className="admin-attendees-wrapper">
      <div className="admin-page-header">
        <span className="admin-kicker">CONTROL DE ASISTENCIA</span>
        <h1 className="admin-title">
          Lista de <span className="italic-pink">Asistentes por Día</span>
        </h1>
        <p className="admin-subtitle">
          Consulta qué clientes asistirán a cada taller o evento organizado cronológicamente.
        </p>
      </div>

      {/* FILTROS POR DÍA Y BÚSQUEDA */}
      <div className="attendees-controls">
        <div className="date-filter-group">
          {uniqueDates.map(date => (
            <button
              key={date}
              className={`date-pill-btn ${selectedDate === date ? 'active' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <Calendar size={14} /> {date}
              <span className="count-badge">{totalPeopleForDate(date)}</span>
            </button>
          ))}
        </div>

        <div className="admin-search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por cliente o evento..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA DE ASISTENTES ORGANIZADA */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Folio / Boleto</th>
              <th>Asistente</th>
              <th>Evento Reservado</th>
              <th>Fecha del Evento</th>
              <th>Lugares</th>
              <th>Pago Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendees.length > 0 ? (
              filteredAttendees.map(att => (
                <tr key={att.id}>
                  <td>
                    <span className="ticket-folio"><Ticket size={13} /> {att.id}</span>
                  </td>
                  <td>
                    <div className="table-client-info">
                      <span className="client-name">{att.name}</span>
                      <span className="client-email"><Mail size={11} /> {att.email}</span>
                    </div>
                  </td>
                  <td><strong>{att.eventTitle}</strong></td>
                  <td>
                    <span className="date-tag"><Calendar size={12} /> {att.date}</span>
                  </td>
                  <td>
                    <span className="places-badge"><Users size={12} /> {att.places} {att.places === 1 ? 'persona' : 'personas'}</span>
                  </td>
                  <td><strong>{att.totalPaid}</strong></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">No se encontraron registros de asistentes con ese criterio.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAttendees;