import { useState } from "react";
import CatalogImage from "../components/common/CatalogImage";
export default function Gallery({ product }) {
  const [index, setIndex] = useState(0);
  const urls = [
    ...new Set([product.image, ...(product.gallery || [])].filter(Boolean)),
  ];
  const current = urls[index] || urls[0];
  return (
    <section aria-label="Galería del producto">
      <div className="gallery-stage">
        <CatalogImage
          image={current}
          title={`${product.name || product.title} · imagen ${index + 1}`}
          category={product.category}
        />
      </div>
      {urls.length > 0 ? (
        <>
          <div className="gallery-controls">
            <button
              type="button"
              disabled={urls.length < 2}
              aria-label="Imagen anterior"
              onClick={() => setIndex((index + urls.length - 1) % urls.length)}
            >
              ←
            </button>
            <span>
              {index + 1} / {urls.length}
            </span>
            <button
              type="button"
              disabled={urls.length < 2}
              aria-label="Imagen siguiente"
              onClick={() => setIndex((index + 1) % urls.length)}
            >
              →
            </button>
          </div>
          <div className="gallery-thumbs">
            {urls.map((url, i) => (
              <button
                type="button"
                key={url}
                aria-label={`Ver imagen ${i + 1}`}
                aria-pressed={index === i}
                onClick={() => setIndex(i)}
              >
                <img src={url} alt="" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p>
          Imagen de referencia. Consulta al vendedor para fotografías del
          ejemplar.
        </p>
      )}
    </section>
  );
}
