
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Columna 1: Logo y descripción */}
        <div className="footer-col-brand">
          <div className="footer-logo">
            <span className="logo-aqua">Nenufares en </span><span className="logo-flora">el Jardín</span>
          </div>
          <p className="footer-brand-desc">
            Especialistas en jardines acuáticos desde 2008. Cultivamos vida en el agua con respeto por los ecosistemas naturales.
          </p>
        </div>

        {/* Columna 2: Enlaces de Navegación */}
        <div className="footer-col-links">
          <h4>NAVEGACIÓN</h4>
          <ul>
            <li><a href="#productos">Productos</a></li>
            <li><a href="#eventos">Eventos</a></li>
            <li><a href="#promociones">Promociones</a></li>
            <li><a href="#reservar">Reservar</a></li>
            <li><a href="#ubicacion">Ubicacion</a></li>
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div className="footer-col-contact">
          <h4>CONTACTO</h4>
          <p>Av. del Lago 248, Xochimilco</p>
          <p>Ciudad de México, 16000</p>
          <p className="footer-contact-spacing">+52 55 1234 5678</p>
          <p>hola@aquaflora.mx</p>
        </div>

      </div>

      {/* Línea divisoria y barra inferior */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-content">
          <span className="footer-copy">© 2026 Nenufares en el Jardín · TODOS LOS DERECHOS RESERVADOS</span>
          <div className="footer-badges"><a href="/creditos-imagenes.html" target="_blank" rel="noreferrer">Créditos de imágenes</a>
            <span>CULTIVO RESPONSABLE</span>
            <span>·</span>
            <span>ESPECIE CERTIFICADA</span>
            <span>·</span>
            <span>AGUA TRATADA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
