import { useEffect, useRef, useState } from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, ChevronLeft, ChevronRight } from 'lucide-react';
import './LocationSection.css';

// Enlace compartido por la persona responsable del establecimiento.
// Falta resolver el enlace largo de Google Maps para obtener las coordenadas de incrustación.
const officialGoogleMapsUrl = 'https://maps.app.goo.gl/mwfUtmTn1XcmLdSr7?g_st=aw';

// Datos de muestra heredados del proyecto; sustituir por proveedores confirmados.
const suppliersData = [
  { id: 1, name: 'AquaLoto Labs', category: 'Nutrientes & Sustratos', address: 'Carretera Mérida-Teya Km 4, Mérida, Yuc.', logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=200&auto=format&fit=crop' },
  { id: 2, name: 'Nippon Koi Farm', category: 'Genética & Ejemplares', address: 'Tablaje Catastral #452, Conkal, Yuc.', logo: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=200&auto=format&fit=crop' },
  { id: 3, name: 'BioFlora Cerámica', category: 'Macetas & Filtros Artesanales', address: 'Calle 60 Norte #312, Col. Centro, Mérida, Yuc.', logo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=200&auto=format&fit=crop' },
  { id: 4, name: 'Sistemas HidroZen', category: 'Bombas & Aireadores', address: 'Av. Tecnológico #805, Mérida, Yuc.', logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=200&auto=format&fit=crop' },
  { id: 5, name: 'Vivero Tailandia Botánica', category: 'Rizomas & Híbridos', address: 'Km 12 Carretera Mérida-Progreso, Yuc.', logo: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=200&auto=format&fit=crop' },
  { id: 6, name: 'Oase AquaTech', category: 'Iluminación Sumergible', address: 'Calle 21 #104 x 22 y 24, Umán, Yuc.', logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop' },
];

export default function LocationSection() {
  const supplierTrack = useRef(null);
  const [canBack, setCanBack] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = () => {
    const el = supplierTrack.current;
    if (!el) return;
    setCanBack(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, []);

  const scrollSuppliers = (direction) => {
    const el = supplierTrack.current;
    if (!el) return;
    const item = el.querySelector('.supplier-card');
    const step = item ? item.getBoundingClientRect().width + 24 : el.clientWidth;
    el.scrollBy({ left: direction * step * (window.innerWidth > 900 ? 3 : 1), behavior: 'smooth' });
  };

  return (
    <section className="location-section" id="ubicacion">
      <div className="location-header">
        <p className="location-kicker">DÓNDE ENCONTRARNOS</p>
        <h2 className="location-title">Nuestra <span className="italic-pink">Ubicación</span></h2>
      </div>

      <div className="location-body-grid">
        <div className="location-info-col">
          <div className="loc-info-block">
            <div className="loc-icon-wrap"><MapPin size={18} /></div>
            <div className="loc-text-wrap"><span className="loc-label">DIRECCIÓN</span><p>Consulta la ubicación exacta y las indicaciones en Google Maps.</p></div>
          </div>
          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Clock size={18} /></div>
            <div className="loc-text-wrap"><span className="loc-label">HORARIOS</span><p>Lun – Vie: 9:00 – 18:00</p><p>Sáb: 8:00 – 17:00</p><p>Dom: 10:00 – 15:00</p></div>
          </div>
          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Phone size={18} /></div>
            <div className="loc-text-wrap"><span className="loc-label">TELÉFONO</span><p>+52 55 1234 5678</p><p className="sub-text">WhatsApp disponible</p></div>
          </div>
          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Mail size={18} /></div>
            <div className="loc-text-wrap"><span className="loc-label">CORREO</span><p>hola@aquaflora.mx</p><p>ventas@aquaflora.mx</p></div>
          </div>
          <a href={officialGoogleMapsUrl} className="btn-google-maps" target="_blank" rel="noopener noreferrer">
            <Navigation size={17} /> Cómo llegar con Google Maps
          </a>
        </div>

        <div className="location-map-wrapper location-map-link-wrap">
          <div className="location-map-link-content">
            <MapPin size={52} strokeWidth={1.5}/>
            <h3>Visita nuestro vivero</h3>
            <p>Abre la ubicación que compartimos en Google Maps para consultar el punto exacto y trazar tu ruta.</p>
            <a href={officialGoogleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-google-maps">
              <Navigation size={17}/> Ver ubicación y ruta en Google Maps
            </a>
          </div>
        </div>
      </div>

      <div className="suppliers-section">
        <div className="suppliers-header">
          <span className="suppliers-kicker">RED DE COLABORADORES</span>
          <h3 className="suppliers-title">Nuestros proveedores</h3>
          <p className="suppliers-hint">Desliza para explorar más proveedores</p>
        </div>

        <div className="suppliers-carousel-wrap">
          <button type="button" className="pagination-arrow suppliers-carousel-arrow" onClick={() => scrollSuppliers(-1)} disabled={!canBack} aria-label="Ver proveedores anteriores">
            <ChevronLeft size={20} />
          </button>
          <div className="suppliers-grid suppliers-carousel-track" ref={supplierTrack} onScroll={updateArrows} tabIndex={0} aria-label="Listado desplazable de proveedores">
            {suppliersData.map((supplier) => (
              <a
                key={supplier.id}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.name + ', ' + supplier.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="supplier-card supplier-card-link"
                aria-label={`Buscar ${supplier.name} en Google Maps`}
              >
                <div className="supplier-logo" style={{ backgroundImage: `url(${supplier.logo})` }} />
                <div className="supplier-meta">
                  <h4 className="supplier-name">{supplier.name}</h4>
                  <span className="supplier-category">{supplier.category}</span>
                  <p className="supplier-address"><MapPin size={12} /> {supplier.address}</p>
                </div>
              </a>
            ))}
          </div>
          <button type="button" className="pagination-arrow suppliers-carousel-arrow" onClick={() => scrollSuppliers(1)} disabled={!canNext} aria-label="Ver más proveedores">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
