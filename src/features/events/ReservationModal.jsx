import {useState} from 'react';
import {X} from 'lucide-react';
import {api,updated} from '../../api';
import './ReservationModal.css';
export default function ReservationModal({isOpen,onClose,event}){
 const [tickets,setTickets]=useState(1);const [nombre,setNombre]=useState('');const [telefono,setTelefono]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [result,setResult]=useState(null);
 if(!isOpen||!event)return null;
 const close=()=>{if(busy)return;setTickets(1);setResult(null);setError('');onClose();};
 const submit=async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');try{const r=await api('/reservations',{method:'POST',body:{eventId:event.id,tickets,nombre,telefono}});setResult(r);updated();}catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div className="res-modal-overlay"><div className="res-modal-container"><button className="res-close-btn" disabled={busy} onClick={close}><X/></button><div className="res-info-side"><h2>{event.title}</h2><p>{event.date||`${event.day} ${event.month} ${event.year}`}</p><p>{event.location}</p><p>{event.time}</p><p>{event.price}</p><p>Lugares disponibles: {event.remaining??'Entrada libre'}</p></div><div className="res-form-side">
 {result?<><h2>Reserva registrada</h2><p>Guarda estos folios:</p>{result.ticketIds.map(id=><p key={id} style={{overflowWrap:'anywhere'}}>{id}</p>)}<p>{event.numericPrice>0?'Pago pendiente. No se realizó ningún cobro.':'Evento gratuito.'}</p><button onClick={close}>Cerrar</button></>:
 <form className="res-form" onSubmit={submit}><h2>Reservar lugares</h2><p>Inicia sesión antes de reservar. Usaremos el correo de tu cuenta.</p>{error&&<p role="alert">{error}</p>}<div className="form-group"><label>Nombre del titular</label><input required maxLength={200} value={nombre} onChange={e=>setNombre(e.target.value)}/></div><div className="form-group"><label>Teléfono</label><input maxLength={40} value={telefono} onChange={e=>setTelefono(e.target.value)}/></div><div className="form-group"><label>Lugares</label><input type="number" min={1} max={Math.min(100,event.remaining??100)} required value={tickets} onChange={e=>setTickets(Number(e.target.value))}/></div><p>Total: ${(event.numericPrice*tickets).toFixed(2)} MXN</p><button className="btn-submit-reserva" disabled={busy||event.remaining===0}>{busy?'Guardando…':'Registrar reserva'}</button></form>}
 </div></div></div>;
}
