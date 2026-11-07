import process from 'node:process';
import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)), quiet: true });
const pool = new pg.Pool(process.env.DATABASE_URL ? { connectionString:process.env.DATABASE_URL, max:10 } : { host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT) || 5432, database: process.env.DB_NAME || 'nenufares_db', user: process.env.DB_USER || 'postgres', password: process.env.DB_PASSWORD, max: 10 });
pool.on('error', e => console.error('PostgreSQL:', e.message));
export default pool;
