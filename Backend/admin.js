import process from 'node:process';
import pool from './db.js';
const email=process.argv[2]?.trim().toLowerCase();
if(!email){console.error('Uso: npm run admin -- tu-correo@ejemplo.com (registra primero la cuenta en la página local)');process.exitCode=1;}else{
 try{const r=await pool.query("UPDATE usuarios SET rol='admin' WHERE LOWER(email)=$1 RETURNING email",[email]);if(!r.rowCount)throw new Error('No existe esa cuenta. Regístrala en la página primero.');console.log('Administrador habilitado:',r.rows[0].email,'Cierra sesión y vuelve a ingresar.');}catch(e){console.error(e.message);process.exitCode=1;}
}await pool.end();
