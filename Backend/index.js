```javascript
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import pool from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// ==========================================
// CONFIGURACIÓN DEL SERVIDOR
// ==========================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

// ==========================================
// VERIFICAR API Y CONEXIÓN A POSTGRESQL
// ==========================================

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database, NOW() AS server_time'
    );

    return res.status(200).json({
      success: true,
      message: 'API funcionando y PostgreSQL conectado',
      database: result.rows[0].database,
      serverTime: result.rows[0].server_time,
    });
  } catch (error) {
    console.error('Error de conexión con PostgreSQL:', error);

    return res.status(500).json({
      success: false,
      message: 'No se pudo consultar PostgreSQL',
    });
  }
});

// ==========================================
// REGISTRO DE CLIENTES
// ==========================================

app.post('/api/register', async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validar los datos recibidos
    if (
      typeof first_name !== 'string' ||
      !first_name.trim() ||
      typeof last_name !== 'string' ||
      !last_name.trim() ||
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          'Completa todos los campos y utiliza una contraseña de al menos 8 caracteres.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Comprobar si el correo ya existe
    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [normalizedEmail]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        message: 'Ya existe una cuenta con ese correo electrónico.',
      });
    }

    // Cifrar la contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Crear el usuario con el rol permitido por la base de datos
    const result = await pool.query(
      `INSERT INTO users
        (role, first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, first_name, last_name, email, role`,
      [
        'customer',
        first_name.trim(),
        last_name.trim(),
        normalizedEmail,
        passwordHash,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Cuenta creada correctamente.',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Error en registro:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Ya existe una cuenta con esos datos.',
      });
    }

    return res.status(500).json({
      message: 'Error interno al registrar la cuenta.',
    });
  }
});

// ==========================================
// INICIO DE SESIÓN
// ==========================================

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar los datos
    if (
      typeof email !== 'string' ||
      !email.trim() ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        message: 'Ingresa tu correo electrónico y contraseña.',
      });
    }

    // Buscar la cuenta
    const result = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email,
         password_hash,
         role,
         is_active
       FROM users
       WHERE LOWER(email) = $1
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos.',
      });
    }

    const user = result.rows[0];

    // Comprobar si la cuenta está activa
    if (user.is_active !== true) {
      return res.status(403).json({
        message: 'La cuenta está inactiva. Contacta al administrador.',
      });
    }

    // Comparar la contraseña con el hash guardado
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Correo o contraseña incorrectos.',
      });
    }

    // Excluir la contraseña cifrada de la respuesta
    const {
      password_hash,
      is_active,
      ...safeUser
    } = user;

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión correcto.',
      user: safeUser,
    });
  } catch (error) {
    console.error('Error en inicio de sesión:', error);

    return res.status(500).json({
      message: 'Error interno al iniciar sesión.',
    });
  }
});

// ==========================================
// RUTAS NO ENCONTRADAS
// ==========================================

app.use((req, res) => {
  return res.status(404).json({
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================

app.listen(PORT, () => {
  console.log(
    `Servidor backend disponible en http://localhost:${PORT}`
  );
});
```