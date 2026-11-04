import { useState } from 'react';
import { MapPin, Clock, Phone, Mail, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import './LocationSection.css';

// Lista de proveedores con su dirección incluida
const suppliersData = [
  {
    id: 1,
    name: 'AquaLoto Labs',
    category: 'Nutrientes & Sustratos',
    address: 'Carretera Mérida-Teya Km 4, Mérida, Yuc.',
    logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Nippon Koi Farm',
    category: 'Genética & Ejemplares',
    address: 'Tablaje Catastral #452, Conkal, Yuc.',
    logo: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'BioFlora Cerámica',
    category: 'Macetas & Filtros Artesanales',
    address: 'Calle 60 Norte #312, Col. Centro, Mérida, Yuc.',
    logo: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 4,
    name: 'Sistemas HidroZen',
    category: 'Bombas & Aireadores',
    address: 'Av. Tecnológico #805, Mérida, Yuc.',
    logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 5,
    name: 'Vivero Tailandia Botánica',
    category: 'Rizomas & Híbridos',
    address: 'Km 12 Carretera Mérida-Progreso, Yuc.',
    logo: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 6,
    name: 'Oase AquaTech',
    category: 'Iluminación Sumergible',
    address: 'Calle 21 #104 x 22 y 24, Umán, Yuc.',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=200&auto=format&fit=crop'
  }
];

const ITEMS_PER_PAGE = 3;

const LocationSection = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const addressQuery = encodeURIComponent('Av. del Lago 248, Col. La Guadalupana, Xochimilco, CDMX 16000');
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;

  // Lógica de paginación
  const totalPages = Math.ceil(suppliersData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSuppliers = suppliersData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <section className="location-section" id="ubicacion">
      <div className="location-header">
        <p className="location-kicker">DÓNDE ENCONTRARNOS</p>
        <h2 className="location-title">
          Nuestra <span className="italic-pink">Ubicación</span>
        </h2>
      </div>

      <div className="location-body-grid">
        {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
        <div className="location-info-col">
          <div className="loc-info-block">
            <div className="loc-icon-wrap"><MapPin size={18} /></div>
            <div className="loc-text-wrap">
              <span className="loc-label">DIRECCIÓN</span>
              <p>Av. del Lago 248</p>
              <p>Col. La Guadalupana</p>
              <p>Xochimilco, CDMX 16000</p>
            </div>
          </div>

          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Clock size={18} /></div>
            <div className="loc-text-wrap">
              <span className="loc-label">HORARIOS</span>
              <p>Lun – Vie: 9:00 – 18:00</p>
              <p>Sáb: 8:00 – 17:00</p>
              <p>Dom: 10:00 – 15:00</p>
            </div>
          </div>

          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Phone size={18} /></div>
            <div className="loc-text-wrap">
              <span className="loc-label">TELÉFONO</span>
              <p>+52 55 1234 5678</p>
              <p className="sub-text">WhatsApp disponible</p>
            </div>
          </div>

          <div className="loc-info-block">
            <div className="loc-icon-wrap"><Mail size={18} /></div>
            <div className="loc-text-wrap">
              <span className="loc-label">CORREO</span>
              <p>hola@aquaflora.mx</p>
              <p>ventas@aquaflora.mx</p>
            </div>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-google-maps"
          >
            <ExternalLink size={16} />
            <span>Abrir en Google Maps</span>
          </a>
        </div>

        {/* COLUMNA DERECHA: MAPA */}
        <div className="location-map-wrapper">
          <div className="custom-dark-map">
            <div className="map-compass" title="Norte">
              <div className="compass-needle" />
              <span>N</span>
            </div>

            <div className="map-block mb-1" />
            <div className="map-block mb-2" />
            <div className="map-block mb-3" />
            <div className="map-block mb-4" />
            <div className="map-block mb-5" />
            <div className="map-block mb-6" />
            <div className="map-block mb-7" />
            <div className="map-block mb-8" />

            <div className="street street-h main-lake-street">
              <span className="street-label-h">Av. del Lago</span>
            </div>
            <div className="street street-v floral-street">
              <span className="street-label-v">Calle Floricultura</span>
            </div>
            <div className="street street-v secondary-v-street" />

            <div className="map-ref-point pt-1" />
            <div className="map-ref-point pt-2" />

            <div className="main-location-pin-area">
              <div className="pin-halo" />
              <div className="map-marker-pin">
                <MapPin size={22} color="#0d2320" />
              </div>
              <div className="pin-popup-tag">
                <strong>AquaFlora</strong>
                <small>Av. del Lago 248</small>
              </div>
            </div>

            <div className="map-scale-bar">
              <span>200 m</span>
              <div className="scale-line" />
            </div>

            <div className="map-region-badge">XOCHIMILCO · CDMX</div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PROVEEDORES CON ENLACE A GOOGLE MAPS */}
      <div className="suppliers-section">
        <div className="suppliers-header">
          <span className="suppliers-kicker">RED DE COLABORADORES</span>
          <h3 className="suppliers-title">Nuestros Distribuidores Certificados</h3>
        </div>

        <div className="suppliers-grid">
          {currentSuppliers.map((supplier) => {
            const supplierMapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${supplier.name},${supplier.address}`)}`;
            
            return (
              <a
                key={supplier.id}
                href={supplierMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="supplier-card supplier-card-link"
              >
                <div 
                  className="supplier-logo" 
                  style={{ backgroundImage: `url(${supplier.logo})` }}
                />
                <div className="supplier-meta">
                  <h4 className="supplier-name">{supplier.name}</h4>
                  <span className="supplier-category">{supplier.category}</span>
                  {supplier.address && (
                    <p className="supplier-address">
                      <MapPin size={12} className="supplier-address-icon" />
                      <span>{supplier.address}</span>
                    </p>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* CONTROLES DE PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="suppliers-pagination">
            <button
              type="button"
              className="pagination-arrow"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              aria-label="Página anterior"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-num ${currentPage === page ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="pagination-arrow"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              aria-label="Página siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LocationSection;