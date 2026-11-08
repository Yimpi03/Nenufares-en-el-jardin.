import { useEffect, useState } from "react";
import { useStore } from "./useStore";
export function PolicyLink({ children = "Términos, privacidad y políticas" }) {
  return (
    <button
      type="button"
      className="policy-link"
      onClick={() =>
        window.dispatchEvent(new CustomEvent("nenufares:policies"))
      }
    >
      {children}
    </button>
  );
}
export default function Policies() {
  const [open, setOpen] = useState(false);
  const { store, error } = useStore();
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("nenufares:policies", show);
    return () => window.removeEventListener("nenufares:policies", show);
  }, []);
  if (!open) return null;
  return (
    <div className="commerce-overlay policies-overlay">
      <section
        role="dialog"
        aria-modal="true"
        aria-label="Políticas de la tienda"
        className="commerce-dialog"
      >
        <button
          className="commerce-close"
          onClick={() => setOpen(false)}
          aria-label="Cerrar políticas"
        >
          ×
        </button>
        <h2>Compra con información clara</h2>
        {error && <p role="alert">{error}</p>}
        {store && (
          <>
            <p>Versión {store.policyVersion} · Precios en MXN</p>
            <h3>Responsable y contacto</h3>
            <p>
              {store.settings.sellerLegalName ||
                "Identidad legal pendiente de completar por el vendedor"}
              <br />
              {store.settings.sellerAddress ||
                "Domicilio pendiente de completar por el vendedor"}
              <br />
              <a href={`mailto:${store.settings.contactEmail}`}>
                {store.settings.contactEmail}
              </a>{" "}
              · {store.settings.contactPhone}
            </p>
            {store.policies.map((s) => (
              <section key={s.id}>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </section>
            ))}
            {["shippingNotes", "returnNotes", "privacyNotes"].map(
              (k) => store.settings[k] && <p key={k}>{store.settings[k]}</p>,
            )}
          </>
        )}
      </section>
    </div>
  );
}
