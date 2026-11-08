import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { api } from "../../api";
export default function AdminAttendees({ eventsData = [] }) {
  const [rows, setRows] = useState([]),
    [eventId, setEventId] = useState(""),
    [token, setToken] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [camera, setCamera] = useState(false),
    [busy, setBusy] = useState(false);
  const video = useRef(null),
    stream = useRef(null),
    frame = useRef(null),
    busyRef = useRef(false),
    eventRef = useRef(eventId),
    scanRef = useRef(null);
  useEffect(() => {
    eventRef.current = eventId;
  }, [eventId]);
  useEffect(() => {
    let live = true;
    api("/attendees")
      .then((r) => {
        if (live) setRows(r);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    return () => {
      live = false;
    };
  }, []);
  const stop = () => {
    if (frame.current) cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    setCamera(false);
  };
  useEffect(
    () => () => {
      if (frame.current) cancelAnimationFrame(frame.current);
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  const consume = async (raw) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    stop();
    const value = raw.trim().replace(/^NJ:/, "");
    try {
      const r = await api("/admin/tickets/consume", {
        method: "POST",
        body: { eventId: Number(eventRef.current), token: value },
      });
      setMessage(
        `Entrada ${r.ordinal} registrada: ${r.name} · ${r.event}. El QR ya no se puede reutilizar.`,
      );
      setToken("");
    } catch (e) {
      setError(e.message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  useEffect(() => {
    scanRef.current = consume;
  });
  const start = async () => {
    if (!eventId) {
      setError("Selecciona el evento primero.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.current = media;
      setCamera(true);
      setTimeout(() => {
        const v = video.current;
        if (!v) {
          media.getTracks().forEach((t) => t.stop());
          return;
        }
        v.srcObject = media;
        v.play().catch(() => {});
        const canvas = document.createElement("canvas"),
          ctx = canvas.getContext("2d", { willReadFrequently: true });
        const tick = () => {
          if (!stream.current) return;
          if (v.readyState >= 2) {
            canvas.width = Math.min(v.videoWidth, 1000);
            canvas.height = Math.round(
              (v.videoHeight * canvas.width) / v.videoWidth,
            );
            if (canvas.width && canvas.height) {
              ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
              const code = jsQR(
                ctx.getImageData(0, 0, canvas.width, canvas.height).data,
                canvas.width,
                canvas.height,
              );
              if (code && /^NJ:[a-f0-9]{64}$/.test(code.data)) {
                scanRef.current(code.data);
                return;
              }
            }
          }
          frame.current = requestAnimationFrame(tick);
        };
        tick();
      }, 100);
    } catch {
      setError(
        "No se pudo abrir la cámara. Permite su uso o utiliza un lector y pega el código.",
      );
      stop();
    }
  };
  return (
    <section className="commerce-panel">
      <h2>Asistentes y control de entradas</h2>
      <p>
        El lector marca la entrada como utilizada. Una segunda lectura se
        rechaza. La reserva y el cupo quedan conservados para el historial.
      </p>
      <label>
        Evento que estás controlando
        <select
          value={eventId}
          disabled={camera || busy}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">Selecciona un evento</option>
          {eventsData.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title}
            </option>
          ))}
        </select>
      </label>
      {camera ? (
        <>
          <video ref={video} playsInline muted />
          <p>
            <button onClick={stop}>Detener cámara</button>
          </p>
        </>
      ) : (
        <button disabled={busy || !eventId} onClick={start}>
          Abrir cámara y registrar al escanear
        </button>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          consume(token);
        }}
      >
        <label>
          Código QR o lector de teclado
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="NJ:…"
            required
          />
        </label>
        <button disabled={busy || !eventId}>
          Validar y marcar entrada utilizada
        </button>
      </form>
      {error && (
        <p className="commerce-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="commerce-success" role="status">
          {message}
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>Asistente</th>
            <th>Correo</th>
            <th>Evento</th>
            <th>Lugares</th>
            <th>Pago</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.eventTitle}</td>
              <td>{r.places}</td>
              <td>{r.totalPaid}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
