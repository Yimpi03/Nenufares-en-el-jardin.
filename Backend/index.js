import process from 'node:process';
import { Buffer } from 'node:buffer';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pool from './db.js';
import { seed } from './seed.js';

export const app = express();
const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ origin, credentials: true }));
app.use(express.json({limit:'1mb'}));
app.use((req,res,next)=>{
  if (['POST','PUT','PATCH','DELETE'].includes(req.method) && req.headers.origin && req.headers.origin !== origin) return res.status(403).json({message:'Origen no permitido.'});
  next();
});
const hash = x => createHash('sha256').update(x).digest('hex');
const fail = (message,status=400) => { const e=new Error(message); e.status=status; throw e; };
const text = (v,max=200) => typeof v==='string' && v.trim().length>0 && v.trim().length<=max;
const emailOK = v => text(v,254) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const wrap = fn => (req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
const cookie = (res,token,age=86400) => res.setHeader('Set-Cookie',`nenufares_session=${token}; HttpOnly; SameSite=Lax; Path=/api; Max-Age=${age}`);
// Limit authentication attempts per local client without logging passwords.
const attempts=new Map();
setInterval(()=>{ for(const [k,v] of attempts) if(v.until<Date.now()) attempts.delete(k); },60000).unref();
const authLimit=(req,res,next)=>{ const k=req.ip; let v=attempts.get(k); if(!v||v.until<Date.now()) {v={count:0,until:Date.now()+900000};attempts.set(k,v);} if(++v.count>50)return res.status(429).json({message:'Demasiados intentos. Espera 15 minutos.'});next(); };
app.use('/api',(req,res,next)=>{ (async()=>{
  const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('nenufares_session='))?.split('=')[1];
  if(token){const q=await pool.query(`SELECT u.id,u.nombre,u.apellido,u.email,u.rol AS role FROM sesiones s JOIN usuarios u ON u.id=s.usuario_id WHERE s.token_hash=$1 AND s.vence_en>NOW()`,[hash(token)]); req.user=q.rows[0]; req.sessionHash=hash(token);}
  // This middleware deliberately passes to routes below.
  next();
})().catch(next); });
const signedIn=(req,res,next)=>req.user?next():res.status(401).json({message:'Inicia sesión para continuar.'});
const admin=(req,res,next)=>!req.user?res.status(401).json({message:'Inicia sesión.'}):req.user.role!=='admin'?res.status(403).json({message:'Se requiere administrador.'}):next();
app.get('/api/health',wrap(async(req,res)=>{const q=await pool.query('SELECT current_database() AS database,NOW() AS "serverTime"');res.json({success:true,message:'API funcionando y PostgreSQL conectado',...q.rows[0]});}));
app.post('/api/register',authLimit,wrap(async(req,res)=>{
 const {nombre,apellido,email,password}=req.body;
 if(!text(nombre,100)||!text(apellido,100)||!emailOK(email)||typeof password!=='string'||password.length<8||Buffer.byteLength(password)>72)fail('Completa nombre, apellido y correo; contraseña de 8 caracteres como mínimo y máximo 72 bytes.');
 const h=await bcrypt.hash(password,12);
 const q=await pool.query(`INSERT INTO usuarios(nombre,apellido,email,password_hash) VALUES($1,$2,$3,$4) RETURNING id,nombre,apellido,email,rol AS role`,[nombre.trim(),apellido.trim(),email.trim().toLowerCase(),h]);
 res.status(201).json({user:q.rows[0],message:'Cuenta creada. Ya puedes iniciar sesión.'});
}));
app.post('/api/login',authLimit,wrap(async(req,res)=>{
 const {email,password}=req.body;
 if(!emailOK(email)||typeof password!=='string'||Buffer.byteLength(password)>72)fail('Correo o contraseña incorrectos.',401);
 const q=await pool.query('SELECT * FROM usuarios WHERE LOWER(email)=$1',[email.trim().toLowerCase()]);
 const u=q.rows[0]; if(!u||!await bcrypt.compare(password,u.password_hash))fail('Correo o contraseña incorrectos.',401);
 const token=randomBytes(32).toString('hex');
 await pool.query('DELETE FROM sesiones WHERE vence_en<=NOW()');
 if(req.sessionHash)await pool.query('DELETE FROM sesiones WHERE token_hash=$1',[req.sessionHash]);
 await pool.query("INSERT INTO sesiones(token_hash,usuario_id,vence_en) VALUES($1,$2,NOW()+INTERVAL '1 day')",[hash(token),u.id]);
 cookie(res,token);res.json({user:{id:u.id,nombre:u.nombre,apellido:u.apellido,email:u.email,role:u.rol}});
}));
app.get('/api/me',(req,res)=>res.json({user:req.user||null}));
app.post('/api/logout',wrap(async(req,res)=>{if(req.sessionHash)await pool.query('DELETE FROM sesiones WHERE token_hash=$1',[req.sessionHash]);cookie(res,'',0);res.json({success:true});}));
app.get('/api/address',signedIn,wrap(async(req,res)=>res.json((await pool.query('SELECT direccion FROM usuarios WHERE id=$1',[req.user.id])).rows[0].direccion)));
app.put('/api/address',signedIn,wrap(async(req,res)=>{
 const a={};for(const k of ['street','colony','city','zip']){if(typeof req.body[k]!=='string'||req.body[k].length>200)fail('Dirección inválida.');a[k]=req.body[k].trim();}
 await pool.query('UPDATE usuarios SET direccion=$1 WHERE id=$2',[a,req.user.id]);res.json(a);
}));
const product = r=>({...r.datos,id:Number(r.id),title:r.titulo,name:r.titulo,category:r.categoria,description:r.descripcion||'',price:Number(r.precio),stock:r.stock,image:r.imagen_url||'',characteristics:r.datos?.characteristics||[],unit:r.datos?.unit||'unidad'});
const event = r=>({...r.datos,day:String(new Date(r.inicio).getUTCDate()),month:['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][new Date(r.inicio).getUTCMonth()],year:String(new Date(r.inicio).getUTCFullYear()),id:Number(r.id),title:r.titulo,description:r.descripcion||'',badge:r.tipo,location:r.ubicacion,image:r.imagen_url,numericPrice:Number(r.precio),price:Number(r.precio)===0?'Gratis':`$${r.precio} MXN`,capacity:r.capacidad===null?'Entrada libre':r.capacidad,remaining:r.capacidad===null?null:Math.max(0,r.capacidad-Number(r.reservados||0))});
const supplier=r=>({id:Number(r.id),name:r.nombre,contactPerson:r.persona_contacto||'',phone:r.telefono||'',email:r.email||'',category:r.categoria||'',address:r.direccion||''});
async function catalog(db=pool){const [p,e]=await Promise.all([db.query('SELECT * FROM productos WHERE activo ORDER BY id'),db.query('SELECT e.*,(SELECT COALESCE(SUM(lugares),0) FROM reservas r WHERE r.evento_id=e.id) AS reservados FROM eventos e WHERE activo ORDER BY inicio')]);return {products:p.rows.map(product),events:e.rows.map(event)};}
app.get('/api/catalog',wrap(async(req,res)=>res.json(await catalog())));
const states={pendiente:'Pendiente',procesando:'Procesando',enviado:'Enviado',entregado:'Entregado',cancelado:'Cancelado'};
async function orders(user){
 const q=await pool.query(`SELECT p.*,COALESCE((SELECT json_agg(json_build_object('id',d.producto_id,'title',d.titulo_producto,'quantity',d.cantidad,'price',d.precio_unitario)) FROM pedido_detalles d WHERE d.pedido_id=p.id),'[]'::json) AS items FROM pedidos p WHERE ($1::bigint IS NULL OR usuario_id=$1) ORDER BY p.id DESC`,[user]);
 return q.rows.map(r=>({...r.datos,id:String(r.id),customerName:r.nombre_cliente,customerEmail:r.email_cliente,status:states[r.estado],total:Number(r.total),date:new Date(r.creado_en).toLocaleDateString('es-MX'),items:r.items}));
}
app.get('/api/orders',signedIn,wrap(async(req,res)=>res.json(await orders(req.user.role==='admin'?null:req.user.id))));
app.get('/api/suppliers',admin,wrap(async(req,res)=>res.json((await pool.query('SELECT * FROM proveedores ORDER BY id')).rows.map(supplier))));
app.get('/api/attendees',admin,wrap(async(req,res)=>{
 const q=await pool.query('SELECT r.*,e.titulo,e.datos FROM reservas r JOIN eventos e ON e.id=r.evento_id ORDER BY e.inicio,r.creado_en');res.json(q.rows.map(r=>({id:r.id,name:r.nombre,email:r.email,eventTitle:r.titulo,date:r.datos.date||`${r.datos.day} ${r.datos.month} ${r.datos.year}`,places:r.lugares,totalPaid:`$${r.total} MXN (pendiente)`})));
}));
// Changes are explicit diffs, so a stale administrator view cannot erase new rows.
app.put('/api/manage/:kind',admin,wrap(async(req,res)=>{
 const kind=req.params.kind;const allowed=['products','events','suppliers','orders'];if(!allowed.includes(kind))fail('Módulo no válido.');
 const {upserts=[],deleted=[]}=req.body;if(!Array.isArray(upserts)||!Array.isArray(deleted)||upserts.length>500||deleted.length>500)fail('Cambios inválidos.');
 const db=await pool.connect();try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(972614)');
 for(const x of upserts){
 if(!Number.isSafeInteger(Number(x.id))||Number(x.id)<1)fail('Identificador inválido.');
 if(kind==='orders'){
  const status=Object.keys(states).find(k=>states[k]===x.status);if(!status)fail('Estado inválido.');
  const old=await db.query('SELECT estado FROM pedidos WHERE id=$1 FOR UPDATE',[x.id]);if(!old.rowCount)fail('Pedido no encontrado.',404);
  if(old.rows[0].estado==='cancelado'&&status!=='cancelado')fail('Un pedido cancelado no se puede reactivar.');
  if(status==='cancelado'&&old.rows[0].estado!=='cancelado')await db.query('UPDATE productos p SET stock=p.stock+d.cantidad FROM pedido_detalles d WHERE d.pedido_id=$1 AND d.producto_id=p.id',[x.id]);
  await db.query('UPDATE pedidos SET estado=$1 WHERE id=$2',[status,x.id]);
 }else if(kind==='products'){
  if(!text(x.title,150)||!text(x.category,50)||!Number.isFinite(x.price)||x.price<0||!Number.isSafeInteger(x.stock)||x.stock<0)fail('Producto inválido.');
  await db.query(`INSERT INTO productos(id,titulo,categoria,descripcion,precio,stock,imagen_url,datos) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET titulo=EXCLUDED.titulo,categoria=EXCLUDED.categoria,descripcion=EXCLUDED.descripcion,precio=EXCLUDED.precio,stock=EXCLUDED.stock,imagen_url=EXCLUDED.imagen_url,datos=EXCLUDED.datos,activo=TRUE`,[x.id,x.title,x.category,x.description||'',x.price,x.stock,x.image||'',{unit:x.unit,characteristics:x.characteristics||[]}]);
 }else if(kind==='events'){
  if(!text(x.title,200)||!Number.isFinite(x.numericPrice)||x.numericPrice<0||!Number.isInteger(x.capacity)||x.capacity<1)fail('Evento inválido: revisa título, precio y cupo.');
  // Date is kept in UI metadata and parsed explicitly for the relational timestamp.
  const date=eventDate(x); const used=await db.query('SELECT COALESCE(SUM(lugares),0) AS n FROM reservas WHERE evento_id=$1',[x.id]);if(Number(used.rows[0].n)>x.capacity)fail('El cupo no puede ser menor que las reservas existentes.');
  await db.query(`INSERT INTO eventos(id,titulo,descripcion,tipo,inicio,ubicacion,capacidad,precio,imagen_url,datos) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO UPDATE SET titulo=EXCLUDED.titulo,descripcion=EXCLUDED.descripcion,tipo=EXCLUDED.tipo,inicio=EXCLUDED.inicio,ubicacion=EXCLUDED.ubicacion,capacidad=EXCLUDED.capacidad,precio=EXCLUDED.precio,imagen_url=EXCLUDED.imagen_url,datos=EXCLUDED.datos,activo=TRUE`,[x.id,x.title,x.description||'',x.badge||'EVENTO',date,x.location||'',x.capacity,x.numericPrice,x.image||'',x]);
 }else{
  if(!text(x.name,150))fail('Nombre del proveedor inválido.');
  await db.query(`INSERT INTO proveedores(id,nombre,persona_contacto,telefono,email,categoria,direccion) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO UPDATE SET nombre=EXCLUDED.nombre,persona_contacto=EXCLUDED.persona_contacto,telefono=EXCLUDED.telefono,email=EXCLUDED.email,categoria=EXCLUDED.categoria,direccion=EXCLUDED.direccion`,[x.id,x.name,x.contactPerson||'',x.phone||'',x.email||'',x.category||'',x.address||'']);
 }
 }
 for(const id of deleted){if(!Number.isSafeInteger(Number(id)))fail('Identificador inválido.');if(kind==='orders')fail('Los pedidos se cancelan; no se eliminan.'); if(kind==='suppliers')await db.query('DELETE FROM proveedores WHERE id=$1',[id]);else await db.query(`UPDATE ${kind==='products'?'productos':'eventos'} SET activo=FALSE WHERE id=$1`,[id]);}
 await db.query('COMMIT');res.json({success:true});
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}));
function eventDate(x){
 const months={ene:1,feb:2,mar:3,abr:4,may:5,jun:6,jul:7,ago:8,sep:9,oct:10,nov:11,dic:12};
 let y,m,d;if(/^\d{4}-\d{2}-\d{2}$/.test(x.date||'')){[y,m,d]=x.date.split('-').map(Number);}else{const a=(x.date||`${x.day} ${x.month} ${x.year}`).trim().split(/[\s/]+/);d=Number(a[0]);m=months[a[1]?.toLowerCase().slice(0,3)];y=Number(a[2]);}
 const date=new Date(Date.UTC(y,m-1,d,12));if(!m||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)fail('Fecha inválida. Usa AAAA-MM-DD o 25 Oct 2026.');return date;
}
const promos={'promo-1':{title:'Estanque Completo (Paquete Fundador)',price:229},'promo-2':{title:'Jardín Zen (Edición Verano)',price:159},'promo-3':{title:'Colección Koi (3 Ejemplares)',price:220}};
app.post('/api/orders',signedIn,wrap(async(req,res)=>{
 const {items,address}=req.body;if(!Array.isArray(items)||!items.length||items.length>100)fail('Carrito inválido.');
 if(!address||!text(address.street)||!text(address.city)||!text(address.zipCode,20))fail('Completa la dirección.');
 const db=await pool.connect();try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(972614)');
 let subtotal=0,shipping=0;const lines=[];const modes=new Set();
 for(const item of [...items].sort((a,b)=>String(a.id).localeCompare(String(b.id)))){
  if(!Number.isSafeInteger(item.quantity)||item.quantity<1||item.quantity>1000)fail('Cantidad inválida.');
  const mode=item.shippingType||'pickup';if(!['pickup','truck','plane'].includes(mode))fail('Envío inválido.');modes.add(mode);shipping=Math.max(shipping,{pickup:0,truck:180,plane:450}[mode]);
  let title,price,pid=null;
  if(Object.hasOwn(promos,item.id)){({title,price}=promos[item.id]);}else{
   if(!Number.isSafeInteger(Number(item.id)))fail('Producto inválido.');
   const p=(await db.query('SELECT * FROM productos WHERE id=$1 AND activo FOR UPDATE',[item.id])).rows[0];if(!p)fail('Producto no disponible.');if(p.stock<item.quantity)fail(`Stock insuficiente: ${p.titulo}.`,409);
   const extras={mediano:0,grande:8,extragrande:18,gigante:30};const size=item.size||'mediano';if(!Object.hasOwn(extras,size))fail('Tamaño inválido.');
   price=Number(p.precio)+(p.categoria.toLowerCase()==='nenúfar'?extras[size]:0);title=p.titulo;pid=p.id;
   await db.query('UPDATE productos SET stock=stock-$1 WHERE id=$2',[item.quantity,pid]);
  }
  subtotal+=Math.round(price*100)*item.quantity;lines.push({pid,title,price,quantity:item.quantity});
 }
 const total=(subtotal+shipping*100)/100;
 const meta={address:{street:address.street,colony:String(address.colony||''),city:address.city,zipCode:address.zipCode,phone:String(address.phone||'')},shippingType:modes.size===1?[...modes][0]:'truck',shippingCost:shipping,paymentStatus:'pendiente',pickupDate:String(items[0].pickupDate||''),pickupTime:String(items[0].pickupTime||'')};
 const q=await db.query('INSERT INTO pedidos(usuario_id,nombre_cliente,email_cliente,total,datos) VALUES($1,$2,$3,$4,$5) RETURNING id',[req.user.id,`${req.user.nombre} ${req.user.apellido}`,req.user.email,total,meta]);
 for(const l of lines)await db.query('INSERT INTO pedido_detalles(pedido_id,producto_id,titulo_producto,cantidad,precio_unitario) VALUES($1,$2,$3,$4,$5)',[q.rows[0].id,l.pid,l.title,l.quantity,l.price]);
 await db.query('COMMIT');res.status(201).json({id:q.rows[0].id,total,message:'Pedido registrado. Pago pendiente; no se realizó ningún cobro.'});
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}));
app.post('/api/reservations',signedIn,wrap(async(req,res)=>{
 const {eventId,tickets,nombre,telefono}=req.body;if(!Number.isSafeInteger(Number(eventId))||!Number.isInteger(tickets)||tickets<1||tickets>100||!text(nombre))fail('Reserva inválida.');
 const db=await pool.connect();try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(972614)');const e=(await db.query('SELECT * FROM eventos WHERE id=$1 AND activo FOR UPDATE',[eventId])).rows[0];if(!e)fail('Evento no disponible.');
 const used=Number((await db.query('SELECT COALESCE(SUM(lugares),0) AS n FROM reservas WHERE evento_id=$1',[eventId])).rows[0].n);if(e.capacidad!==null&&used+tickets>e.capacidad)fail('No hay lugares suficientes.',409);
 const id=randomUUID();await db.query('INSERT INTO reservas(id,evento_id,usuario_id,nombre,email,telefono,lugares,total) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[id,eventId,req.user.id,nombre,req.user.email,typeof telefono==='string'?telefono.slice(0,40):'',tickets,Number(e.precio)*tickets]);
 await db.query('COMMIT');res.status(201).json({id,ticketIds:Array.from({length:tickets},(_,i)=>`${id}-${i+1}`)});
 }catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}));
app.use((req,res)=>res.status(404).json({message:'Ruta no encontrada.'}));
app.use((e,req,res,next)=>{void next;console.error(e.message);res.status(e.code==='23505'?409:e.status||500).json({message:e.code==='23505'?'Ese correo ya está registrado.':e.status?e.message:'Error de base de datos. Revisa la terminal del backend.'});});
export async function initialize(){
 const db=await pool.connect();try{await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(972614)');await db.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'));await seed(db);await db.query('COMMIT');}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}
}
if(process.env.NODE_ENV!=='test'){
 initialize().then(()=>{const port=Number(process.env.PORT)||4000;app.listen(port,'127.0.0.1',()=>console.log(`Backend local: http://localhost:${port} | PostgreSQL conectado`));}).catch(e=>{console.error('No se pudo iniciar:',e.message);process.exit(1);});
}
