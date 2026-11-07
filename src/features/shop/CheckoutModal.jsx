import {useState} from 'react';
import {X,CheckCircle} from 'lucide-react';
import {api,updated} from '../../api';
import './CheckoutModal.css';
export default function CheckoutModal({isOpen,onClose,cartItems=[],setCartItems}){
 const [address,setAddress]=useState({street:'',colony:'',city:'',zipCode:'',phone:''});
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [order,setOrder]=useState(null);
 if(!isOpen)return null;
 const subtotal=cartItems.reduce((s,i)=>s+i.price*i.quantity,0);
 const shipping=Math.max(0,...cartItems.map(i=>({pickup:0,truck:180,plane:450}[i.shippingType||'pickup']||0)));
 const close=()=>{if(busy)return;setOrder(null);setError('');onClose();};
 const submit=async e=>{e.preventDefault();if(busy)return;setBusy(true);setError('');try{
   const result=await api('/orders',{method:'POST',body:{items:cartItems.map(({id,quantity,size,shippingType,pickupDate,pickupTime})=>({id,quantity,size,shippingType,pickupDate,pickupTime})),address}});
   setOrder(result);setCartItems([]);updated();
 }catch(e){setError(e.message);}finally{setBusy(false);}};
 return <div className="checkout-overlay"><div className="checkout-modal-content">
 <button className="checkout-close-btn" onClick={close} disabled={busy}><X/></button>
 {order?<div className="checkout-success-view"><CheckCircle/><h2>Pedido registrado</h2><p>Folio #{order.id}</p><p>Total: ${Number(order.total).toFixed(2)} MXN</p><p>Pago pendiente. No se realizó ningún cobro.</p><button onClick={close}>Volver a la tienda</button></div>:
 <div className="checkout-main-grid"><div className="checkout-summary-pane"><h3>Tu pedido</h3>{cartItems.map((i,n)=><p key={n}>{i.quantity}x {i.name||i.title} — ${(i.quantity*i.price).toFixed(2)}</p>)}<p>Envío: ${shipping.toFixed(2)}</p><strong>Total: ${(subtotal+shipping).toFixed(2)} MXN</strong><p>Prueba local: registramos el pedido con pago pendiente. No introduzcas datos de tarjetas.</p></div>
 <form className="checkout-form-pane" onSubmit={submit}><h2>Datos de entrega</h2>{error&&<p role="alert">{error}</p>}{Object.entries({street:'Calle y número',colony:'Colonia',city:'Ciudad / municipio',zipCode:'Código postal',phone:'Teléfono'}).map(([key,label])=><div className="chk-field" key={key}><label>{label}</label><input required maxLength={200} value={address[key]} onChange={e=>setAddress({...address,[key]:e.target.value})}/></div>)}<button className="btn-confirm-payment" disabled={busy||!cartItems.length}>{busy?'Guardando…':'Registrar pedido (pago pendiente)'}</button></form></div>}
 </div></div>;
}
