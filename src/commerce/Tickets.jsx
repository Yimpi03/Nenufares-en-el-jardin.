import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Crea el PDF en el navegador sin servicios externos ni envío de los tokens QR.
function assemblePdf(jpegImages) {
  const encoder = new TextEncoder();
  const parts = [];
  let length = 0;
  const offsets = [0];
  const put = v => {
    const bytes = typeof v === "string" ? encoder.encode(v) : v;
    parts.push(bytes);
    length += bytes.length;
  };
  const obj = (id, contents) => {
    offsets[id] = length;
    put(`${id} 0 obj\n`);
    put(contents);
    put("\nendobj\n");
  };
  put("%PDF-1.4\n");
  const count = jpegImages.length;
  const pageIds = jpegImages.map((_, i) => 3 + 3 * i);
  obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
  obj(2, `<< /Type /Pages /Kids [${pageIds.map(id => id + " 0 R").join(" ")}] /Count ${count} >>`);
  for (let i = 0; i < count; i++) {
    const imageObj = pageIds[i] + 1;
    const streamObj = pageIds[i] + 2;
    const pageObj = pageIds[i];
    const { bytes, width, height } = jpegImages[i];
    const resourceName = "TicketImage" + i;
    obj(pageObj, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /${resourceName} ${imageObj} 0 R >> >> /Contents ${streamObj} 0 R >>`);
    offsets[imageObj] = length;
    put(`${imageObj} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`);
    put(bytes);
    put("\nendstream\nendobj\n");
    const command = `q\n595 0 0 842 0 0 cm\n/${resourceName} Do\nQ\n`;
    obj(streamObj, `<< /Length ${encoder.encode(command).length} >>\nstream\n${command}endstream`);
  }
  const xrefPos = length;
  const totalObjects = 2 + count * 3;
  put(`xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`);
  for (let i = 1; i <= totalObjects; i++) put(`${String(offsets[i]).padStart(10,"0")} 00000 n \n`);
  put(`trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`);
  return new Blob(parts, { type: "application/pdf" });
}

async function ticketPdfImages(images) {
  const results = [];
  for (let i = 0; i < images.length; i++) {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1274;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0, 0, 900, 1274);
    ctx.fillStyle = "#143d34"; ctx.fillRect(0, 0, 900, 180);
    ctx.fillStyle = "#f3d28e"; ctx.font = "bold 43px sans-serif";
    ctx.fillText("Nenufares en el Jardin", 45, 83);
    ctx.fillStyle = "#ffffff"; ctx.font = "28px sans-serif"; ctx.fillText("Entrada de evento", 45, 130);
    ctx.fillStyle = "#164136"; ctx.font = "bold 30px sans-serif";
    ctx.fillText(`Entrada ${i + 1} de ${images.length}`, 45, 265);
    const image = new Image();
    image.src = images[i];
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject; });
    ctx.drawImage(image, 105, 320, 690, 690);
    ctx.fillStyle = "#555f59"; ctx.font = "24px sans-serif";
    ctx.fillText("Presenta el codigo QR en la entrada del evento.", 45, 1100);
    ctx.fillText("Cada codigo es personal y de un solo uso.", 45, 1140);
    const base64 = canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    results.push({ bytes, width: canvas.width, height: canvas.height });
  }
  return results;
}
function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
export default function Tickets({ tokens = [] }) {
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    setImages([]);
    Promise.all(tokens.map(t => QRCode.toDataURL(`NJ:${t}`, { width: 520, margin: 3 })))
      .then(a => { if (live) setImages(a); })
      .catch(() => { if (live) setError("No se pudieron generar los códigos QR."); });
    return () => { live = false; };
  }, [tokens]);
  const savePdf = async () => {
    setBusy(true);
    setError("");
    try { downloadBlob(assemblePdf(await ticketPdfImages(images)), "entradas-nenufares.pdf"); }
    catch { setError("No se pudo descargar el PDF. Puedes guardar cada QR en PNG."); }
    finally { setBusy(false); }
  };
  return <div className="nj-tickets-download">
    {images.length > 0 && <button type="button" disabled={busy} className="nj-ticket-pdf" onClick={savePdf}>
      {busy ? "Preparando PDF…" : "Descargar todas las entradas en PDF"}
    </button>}
    {error && <p role="alert" className="commerce-error">{error}</p>}
    <div className="nj-ticket-cards">
      {images.map((src,i) => <div key={tokens[i]} className="ticket-card">
        <img src={src} alt={`QR de entrada ${i+1}`} />
        <a href={src} download={`entrada-${i+1}.png`}>Descargar imagen PNG {i+1}</a>
        <details><summary>Código para lector manual</summary><code>{tokens[i]}</code></details>
      </div>)}
    </div>
    <p>Guarda tus QR en privado. Son personales, de un solo uso y el lector del establecimiento comprobará su validez.</p>
  </div>;
}
