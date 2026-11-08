import { useState } from 'react';
import { Clock, Users, MapPin } from 'lucide-react';
import ReservationModal from './ReservationModal';
import './EventsSection.css';
import CatalogImage from '../../components/common/CatalogImage';

const EventsSection = ({ eventsData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleOpenReservation = (eventObj) => {
    setSelectedEvent(eventObj);
    setIsModalOpen(true);
  };

  return (
    <section className="events-section" id="eventos">
      <div className="events-top-bar">
        <div>
          <p className="events-kicker">AGENDA 2026</p>
          <h2 className="events-title">
            Eventos <span>&amp;</span> <span className="italic-serif">Talleres</span>
          </h2>
        </div>
        <p className="events-top-desc">
          Aprende, explora y conecta con la comunidad de jardines acuáticos.
        </p>
      </div>

      <div className="events-cards-grid">
        {eventsData && eventsData.length > 0 ? (
          eventsData.map((ev) => {
            // Si el evento viene del administrador y solo tiene 'date' en texto, 
            // creamos un día y mes genéricos o usamos los que tenga.
            const displayDay = ev.day || '15';
            const displayMonth = ev.month || 'NOV';
            const displayYear = ev.year || '2026';

            return (
              <article key={ev.id} className="event-item-card">
                <div className="event-img-wrap"><CatalogImage image={ev.image} title={ev.title} kind="event" />
                  <span className={`event-badge-tag ${(ev.badge || 'EVENTO').toLowerCase()}`}>
                    {ev.badge || 'EVENTO'}
                  </span>
                </div>

                <div className="event-content-wrap">
                  <div className="event-header-row">
                    <div className="event-date-box">
                      <span className="ev-day">{displayDay}</span>
                      <span className="ev-month">{displayMonth}</span>
                      <span className="ev-year">{displayYear}</span>
                    </div>
                    <h3 className="ev-heading">{ev.title}</h3>
                  </div>

                  <p className="ev-summary">{ev.description}</p>

                  <div className="ev-meta-row">
                    <span><Clock size={13} /> {ev.time || '10:00 hrs'}</span>
                    
                    <span>
                      <Users size={13} /> 
                      {typeof ev.capacity === 'number' ? `${ev.remaining ?? ev.capacity} disponibles` : (ev.capacity || 'Entrada libre')}
                    </span>

                    <span><MapPin size={13} /> {ev.location}</span>
                  </div>

                  <div className="ev-footer-row">
                    <span className="ev-price-tag">
                      {typeof ev.price === 'number' ? `$${ev.price} MXN` : (ev.price || 'Gratis')}
                    </span>
                    <button
                      type="button"
                      className="btn-reserve-dark"
                      onClick={() => handleOpenReservation(ev)} 
                    >
                      Reservar →
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#889995', fontStyle: 'italic' }}>
            No hay eventos programados en este momento.
          </p>
        )}
      </div>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
      />
    </section>
  );
};

export default EventsSection;
