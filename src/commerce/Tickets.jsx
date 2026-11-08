import { useEffect, useState } from "react";
import QRCode from "qrcode";
export default function Tickets({ tokens }) {
  const [images, setImages] = useState([]);
  useEffect(() => {
    let live = true;
    Promise.all(
      tokens.map((t) => QRCode.toDataURL(`NJ:${t}`, { width: 280, margin: 2 })),
    ).then((a) => {
      if (live) setImages(a);
    });
    return () => {
      live = false;
    };
  }, [tokens]);
  return (
    <div>
      {images.map((src, i) => (
        <div key={tokens[i]} className="ticket-card">
          <img src={src} alt={`QR de entrada ${i + 1}`} />
          <a href={src} download={`entrada-${i + 1}.png`}>
            Guardar entrada {i + 1}
          </a>
          <details>
            <summary>Código para lector manual</summary>
            <code>{tokens[i]}</code>
          </details>
        </div>
      ))}
      <p>Guarda los QR en privado. Solo pueden utilizarse una vez.</p>
    </div>
  );
}
