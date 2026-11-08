import { useStore } from "../../commerce/useStore";
import { PolicyLink } from "../../commerce/Policies";
import "./LocationSection.css";
export default function LocationSection() {
  const { store } = useStore();
  const s = store?.settings;
  return (
    <section className="location-section" id="ubicacion">
      <div className="location-header">
        <p className="location-kicker">ENTREGA Y ATENCIÓN</p>
        <h2 className="location-title">
          Coordina tu <span className="italic-pink">Entrega</span>
        </h2>
      </div>
      <div className="location-body-grid">
        <div className="location-info-col">
          <div className="loc-info-block">
            <div className="loc-text-wrap">
              <span className="loc-label">RECOLECCIÓN EN SUCURSAL</span>
              <p>
                {s?.sellerAddress ||
                  "Solicita al vendedor el domicilio y confirma el horario antes de acudir."}
              </p>
            </div>
          </div>
          <div className="loc-info-block">
            <div className="loc-text-wrap">
              <span className="loc-label">CONTACTO</span>
              <p>
                <a href={`mailto:${s?.contactEmail || ""}`}>
                  {s?.contactEmail}
                </a>
              </p>
              <p>{s?.contactPhone}</p>
            </div>
          </div>
          {s?.sellerAddress && (
            <a
              className="btn-google-maps"
              target="_blank"
              rel="noreferrer"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.sellerAddress)}`}
            >
              Ver domicilio en Google Maps ↗
            </a>
          )}
        </div>
        <div className="commerce-note">
          <h3>Antes de elegir tu envío</h3>
          <p>
            Los peces requieren entrega local, envío aéreo confirmado o
            recolección. Para lotos, nenúfares y semillas también puedes
            consultar envíos nacionales.
          </p>
          <p>
            Para semillas se contemplan opciones de Correos de México, sujetas a
            cobertura y tarifa confirmadas.
          </p>
          <p>
            Consulta las opciones y sus costos en el detalle del producto y
            antes de confirmar la compra.
          </p>
          <PolicyLink>Leer políticas de envío y devolución</PolicyLink>
        </div>
      </div>
    </section>
  );
}
