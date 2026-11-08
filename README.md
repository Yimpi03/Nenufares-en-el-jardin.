# Nenúfares en el Jardín

Tienda React + Vite y API Node.js/Express con PostgreSQL. El servidor publica también el frontend en producción. El código desplegado en Render está en la rama `render-postgres`.

## Ejecutar localmente

```bash
npm ci
npm --prefix Backend ci
```

Copia `Backend/.env.example` a `Backend/.env` y configura tu PostgreSQL local. El archivo `.env` no se publica. Inicia el backend y el frontend en dos terminales:

```bash
npm --prefix Backend run dev
npm run dev
```

Abre la URL de Vite (normalmente http://localhost:5173). No uses `ng serve`: el frontend es React. `/api/health` verifica PostgreSQL. El esquema se actualiza automáticamente de forma aditiva al iniciar; no se borran usuarios, productos ni pedidos.

## Administración

Registra tu cuenta y, desde una terminal con acceso a la base correcta, ejecuta `npm --prefix Backend run admin -- correo@ejemplo.com`. El script solo promueve una cuenta existente; nunca solicita publicar contraseñas. En el panel encontrarás productos, descuentos, galería, paquetes, clientes, tarifas de envío, contacto/políticas, pedidos y control de entradas QR.

Consulta [Operación, pagos y envíos](docs/COMERCIO.md) antes de habilitar ventas.

## Verificación

```bash
npm run lint
npm test
npm run build
```

La prueba usa PostgreSQL embebido (PGlite) en memoria. No usa ni cambia tu base local o de Render. Verifica migraciones, consentimiento, autorización, descuentos, tarifas, stock, idempotencia, QR y pagos con respuestas simuladas de Mercado Pago. No realiza cobros reales.

## Render

- Rama: `render-postgres`; directorio raíz vacío.
- Build: `npm ci && npm run build && npm --prefix Backend ci`.
- Start: `node Backend/index.js`.
- Variables: `NODE_ENV=production` y `DATABASE_URL` interna de Render Postgres, en la misma región.
- `RENDER_EXTERNAL_URL` y `PORT` son provistas por Render.
- Para pagos, configura las credenciales privadas indicadas en `docs/COMERCIO.md`.

Los datos de PostgreSQL local y Render son independientes. Subir código no copia clientes ni contraseñas entre bases.
