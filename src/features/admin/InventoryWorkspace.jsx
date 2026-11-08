import { useState } from "react";
import {
  Archive,
  Truck,
  Gift,
  FileText,
  Leaf,
  ChevronRight,
} from "lucide-react";
import AdminInventory from "./AdminInventory";
import AdminCommerce from "../../commerce/AdminCommerce";
import "./InventoryWorkspace.css";
const tabs = [
  {
    id: "productos",
    title: "Productos",
    icon: Archive,
    description: "Catálogo, existencias y descuentos",
  },
  {
    id: "envios",
    title: "Costos de envío",
    icon: Truck,
    description: "Métodos, tarifas y tiempos de entrega",
  },
  {
    id: "paquetes",
    title: "Paquetes y promociones",
    icon: Gift,
    description: "Combinaciones y precios especiales",
  },
  {
    id: "politicas",
    title: "Políticas y contacto",
    icon: FileText,
    description: "Información comercial y atención al cliente",
  },
];
export default function InventoryWorkspace({ productsData = [] }) {
  const [active, setActive] = useState("productos"),
    [visited, setVisited] = useState(["productos"]);
  const select = (id) => {
    setActive(id);
    setVisited((old) => (old.includes(id) ? old : [...old, id]));
  };
  const keyDown = (e, index) => {
    let next;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    select(tabs[next].id);
    document.getElementById(`inventory-tab-${tabs[next].id}`)?.focus();
  };
  return (
    <div className="inventory-workspace">
      <header className="inv-workspace-header">
        <div>
          <div className="inv-breadcrumb">
            Administración <ChevronRight size={12} /> Vivero
          </div>
          <div className="inv-title-row">
            <span className="inv-header-icon">
              <Leaf size={23} strokeWidth={1.5} />
            </span>
            <div>
              <p className="inv-eyebrow">TU VIVERO, EN UN SOLO LUGAR</p>
              <h1>Inventario del Vivero</h1>
            </div>
          </div>
          <p className="inv-intro">
            Todo lo que necesitas para preparar y mantener tu tienda.
          </p>
        </div>
        <div className="inv-workspace-label">
          <span /> Gestión del catálogo
        </div>
      </header>
      <nav
        className="inv-tabs"
        role="tablist"
        aria-label="Secciones de Inventario del Vivero"
      >
        {tabs.map(({ id, title, icon: Icon, description }, i) => (
          <button
            key={id}
            type="button"
            id={`inventory-tab-${id}`}
            role="tab"
            aria-selected={active === id}
            aria-controls={`inventory-panel-${id}`}
            tabIndex={active === id ? 0 : -1}
            onClick={() => select(id)}
            onKeyDown={(e) => keyDown(e, i)}
          >
            <Icon size={17} strokeWidth={1.6} />
            <span>
              {title}
              <small>{description}</small>
            </span>
            {id === "productos" && (
              <span className="inv-tab-count">{productsData.length}</span>
            )}
          </button>
        ))}
      </nav>
      {tabs.map(({ id, title }) => (
        <section
          key={id}
          role="tabpanel"
          id={`inventory-panel-${id}`}
          aria-labelledby={`inventory-tab-${id}`}
          hidden={active !== id}
          tabIndex={0}
          className="inv-tab-panel"
        >
          {visited.includes(id) &&
            (id === "productos" ? (
              <AdminInventory productsData={productsData} />
            ) : (
              <AdminCommerce tab={id} embedded title={title} />
            ))}
        </section>
      ))}
    </div>
  );
}
