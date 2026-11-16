import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Navigation, Truck } from "lucide-react";
import { useStore } from "../../commerce/useStore";
import { PolicyLink } from "../../commerce/Policies";
import "./LocationSection.css";

const MAPS_OFFICIAL = "https://maps.app.goo.gl/mwfUtmTn1XcmLdSr7?g_st=aw";

export default function LocationSection() {
  const { store } = useStore();
  const s = store?.settings;
  const track = useRef(null);
  const [suppliers, setSuppliers] = useState([]);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/public-suppliers", { signal: controller.signal })
      .then(r => { if (!r.ok) throw new Error("Proveedores no disponibles"); return r.json(); })
      .then(data => setSuppliers(Array.isArray(data) ? data : []))
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const updateArrows = () => {
    const el = track.current;
    if (!el) return;
    setHasPrev(el.scrollLeft > 3);
    setHasNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 3);
  };
  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [suppliers]);
  const move = dir => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector(".nj-supplier-card");
    el.scrollBy({ left: dir * (card ? card.getBoundingClientRect().width + 20 : el.clientWidth), behavior: "smooth" });
  };

  const embedUrl = s?.sellerAddress?.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(s.sellerAddress)}&z=15&output=embed`
    : null;
  return <section className="location-section" id="ubicacion">
    <div className="location-header">
      <p className="location-kicker">DÓNDE ENCONTRARNOS</p>
      <h2 className="location-title">Nuestra <span className="italic-pink">ubicación</span></h2>
    </div>
    <div className="location-body-grid">
      <div className="location-info-col">
        <div className="loc-info-block"><div className="loc-icon-wrap"><MapPin size={19}/></div>
          <div className="loc-text-wrap">
            <span className="loc-label">RECOLECCIÓN EN SUCURSAL</span>
            <p>{s?.sellerAddress || "Consulta nuestro punto en Google Maps y confirma el horario antes de acudir."}</p>
          </div>
        </div>
        <div className="loc-info-block"><div className="loc-icon-wrap"><Navigation size={19}/></div><div className="loc-text-wrap">
          <span className="loc-label">CONTACTO</span>
          {s?.contactEmail && <p><a href={`mailto:${s.contactEmail}`}>{s.contactEmail}</a></p>}
          {s?.contactPhone && <p>{s.contactPhone}</p>}
        </div></div>
        <a href={MAPS_OFFICIAL} target="_blank" rel="noopener noreferrer" className="btn-google-maps">
          <Navigation size={17}/> Cómo llegar con Google Maps
        </a>
      </div>
      <div className="nj-location-map">
        {embedUrl ? <iframe title="Mapa del establecimiento" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={embedUrl} allowFullScreen/> :
          <div className="nj-location-map-empty"><MapPin size={46}/><h3>Visítanos</h3>
            <p>Consulta nuestra ubicación oficial en Google Maps y obtén indicaciones para llegar.</p>
            <a href={MAPS_OFFICIAL} target="_blank" rel="noopener noreferrer" className="btn-google-maps">Ver ubicación oficial</a>
          </div>}
      </div>
    </div>
    <div className="commerce-note nj-location-shipping">
      <h3>Antes de elegir tu envío</h3>
      <p>Los peces requieren entrega local, envío aéreo confirmado o recolección. Para lotos, nenúfares y semillas consulta las opciones disponibles.</p>
      <p>Consulta las opciones y sus costos antes de confirmar la compra. <PolicyLink>Leer políticas de envío y devolución</PolicyLink></p>
    </div>
    <div className="suppliers-section">
      <div className="suppliers-header">
        <span className="suppliers-kicker">RED DE COLABORADORES</span>
        <h3 className="suppliers-title">Nuestros proveedores</h3>
        <p className="nj-supplier-note">Desliza para descubrir más proveedores.</p>
      </div>
      {suppliers.length ? <div className="nj-supplier-wrap">
        <button type="button" onClick={() => move(-1)} disabled={!hasPrev} aria-label="Proveedor anterior" className="pagination-arrow"><ChevronLeft/></button>
        <div className="nj-supplier-track" ref={track} onScroll={updateArrows} tabIndex={0} aria-label="Listado desplazable de proveedores">
          {suppliers.map((supplier) => <article className="nj-supplier-card" key={supplier.id}>
            <div className="nj-supplier-icon"><Truck size={23}/></div>
            <h4>{supplier.name}</h4><p>{supplier.category || "Proveedor del vivero"}</p>
          </article>)}
        </div>
        <button type="button" onClick={() => move(1)} disabled={!hasNext} aria-label="Siguiente proveedor" className="pagination-arrow"><ChevronRight/></button>
      </div> : <p className="nj-supplier-note">Los proveedores se mostrarán aquí cuando estén registrados.</p>}
    </div>
  </section>;
}
