# Operación de la tienda

## Antes de vender

1. En **Políticas y contacto**, completa nombre legal, domicilio real, correo y teléfono del responsable; revisa los procedimientos de devolución y privacidad para tu operación. Los textos incluidos son una base de trabajo, no una certificación de cumplimiento legal. No se inventó un domicilio comercial. La aceptación de términos no sustituye obligaciones legales del vendedor.
2. En **Costos de envío**, confirma transportista, cobertura, costo y días hábiles. Las tarifas local/aérea/nacional/postales comienzan **por cotizar**, sin costo inventado. El checkout rechaza esos métodos hasta fijar tarifa y quitar esa marca. Recolección comienza en $0, a coordinar con el vendedor.
3. Para peces se permite local, aéreo y recolección. Plantas: local, nacional y recolección. Semillas: las anteriores más Correos de México nacional o retiro postal. Estos métodos no garantizan que un transportista acepte cualquier especie: el vendedor debe verificar por escrito los requisitos de transporte, embalaje y permisos aplicables antes del despacho. Paquetes mixtos exigen compatibilidad de todas sus categorías.
4. En **Productos**, configura precio normal, descuento (0–90 %), existencias y galería de hasta 12 fotos adicionales. Las fotos iniciales son ilustrativas; agrega fotografías propias del producto para mostrar más ángulos. Tamaños de nenúfar son las referencias existentes del catálogo, no mediciones verificadas de cada ejemplar. Confirma qué se mide y las dimensiones reales antes de vender.
5. En **Paquetes**, confirma contenido, precio normal, precio de promoción y stock de paquetes completos. El inventario de paquetes es **independiente** del inventario individual. Inicialmente es cero para evitar anunciar existencias no confirmadas. Las categorías de contenido determinan las opciones de envío.

## Compras y envíos

El visitante puede explorar y agregar al carrito. Para pasar al checkout debe iniciar sesión o registrarse. El servidor también exige sesión, aceptación de condiciones vigentes y dirección/teléfono. El registro guarda versión, fecha y una copia de los datos del vendedor mostrados; el pedido guarda la aceptación y las condiciones de envío/precios. No se solicita consentimiento de publicidad junto con el necesario para operar la cuenta.

El servidor vuelve a calcular precios, variantes, descuentos, cantidades y tarifas. Usa centavos enteros para sumas y redondeos. Se cobra **una tarifa por método** utilizado, sumando métodos distintos; no se multiplica por cada producto. Cambiar precios o envíos en el navegador no cambia el cálculo de la compra. El pedido conserva un snapshot, de modo que una edición administrativa no altera pedidos anteriores.

Se muestra fecha de compra y un rango aproximado de entrega. El rango inicial supone que se paga en ese momento; al confirmar Mercado Pago se recalcula desde la fecha de verificación. Se excluyen sábados y domingos, **sin calendario de festivos**. No es una promesa de entrega. Recolección requiere coordinar domicilio/horario; retiro postal requiere identificar sucursal.

Crear un pedido descuenta stock y deja el pago pendiente. Los pendientes **no caducan automáticamente**: revísalos y cancélalos si no se concretan para liberar existencias. El mismo identificador de checkout devuelve el mismo pedido, sin descontar dos veces. Los pedidos no se eliminan. Cancelar restaura productos y paquetes una sola vez. Un pedido pagado no puede cancelarse hasta gestionar el reembolso en Mercado Pago y recibir su actualización; cambiar el estado no devuelve dinero. No se permite despachar pedidos pendientes de pago.

## Mercado Pago (Checkout Pro)

Esta integración utiliza la API de preferencias de Checkout Pro, que continúa documentada por Mercado Pago. Es un redirect a su checkout, sin campos de tarjeta en la tienda.

En **Environment** del servicio web de Render agrega:

- `MERCADOPAGO_ACCESS_TOKEN`: Access Token privado de tu propia aplicación/comercio.
- `MERCADOPAGO_WEBHOOK_SECRET`: firma secreta generada al configurar Webhooks de esa aplicación.
- Render ya proporciona `RENDER_EXTERNAL_URL`. Si alojas en otro entorno, configura `PUBLIC_URL` con la URL HTTPS de esta tienda.

En Mercado Pago → Tus integraciones → aplicación → Webhooks, habilita notificaciones de **pagos** hacia:

```
https://nenufares-en-el-jardin-3ikt.onrender.com/api/payments/webhook
```

No publiques credenciales en GitHub, en el frontend ni en capturas. Prueba primero con usuarios/credenciales de prueba de Mercado Pago en un entorno de pruebas separado. No mezcles credenciales de prueba con pedidos reales.

El botón abre Mercado Pago después de registrar el pedido; también aparece en **Mis compras y entradas** para reintentar. El servidor consulta el importe y propietario del pedido, crea la preferencia y usa una referencia propia. El regreso al sitio no marca el pedido pagado. El webhook valida HMAC SHA-256 (`x-signature` y `x-request-id`) y consulta el pago con el Access Token. Comprueba ID, MXN, importe y referencia; conserva un recibo por ID y rechaza pagos duplicados aprobados de otra operación. Los estados se actualizan únicamente desde el proveedor. Revisa manualmente cualquier pago duplicado o cobro recibido para un pedido cancelado; la tienda no emite reembolsos automáticos.

Sin ambas credenciales y una URL pública HTTPS, el sitio indica que Mercado Pago está pendiente de configuración. Registrar un pedido **no realiza ningún cobro**.

Referencias oficiales:

- https://www.mercadopago.com.mx/developers/es/reference/online-payments/checkout-pro-preferences/create-preference/post
- https://www.mercadopago.com.mx/developers/en/docs/checkout-pro-preferences/payment-notifications
- https://www.mercadopago.com.mx/developers/en/docs/checkout-pro-preferences/additional-content/notifications/webhooks

## Entradas QR

Cada lugar reservado obtiene un token aleatorio de 256 bits; solo se guarda su hash en PostgreSQL. El QR no contiene nombre ni correo. El cliente puede guardar su imagen y regenerar entradas sin utilizar desde su cuenta; regenerar invalida los códigos anteriores sin utilizar. Las reservas antiguas también pueden generar QR.

El administrador selecciona el evento y abre la cámara (requiere permiso del navegador y HTTPS o localhost), o pega el código desde un lector de teclado. **Abrir cámara y registrar al escanear** consume la entrada automáticamente al leer un QR válido; el formulario manual lo hace al enviar. La operación es atómica: el mismo QR se admite una vez. Un código de otro evento, ya utilizado, o de una reserva con pago pendiente se rechaza. Los eventos gratuitos no requieren pago.

“Cancelar el lugar al escanear” se implementa como **entrada utilizada**: no se borra la reserva ni se vuelve a vender ese lugar. Se guarda cuándo y qué administrador realizó la lectura. Un cliente no tiene acceso a la función de consumo.

## Seguridad y datos

Las contraseñas se guardan con bcrypt, nunca en claro. La sesión usa token aleatorio, hash en base, cookie HttpOnly/SameSite y Secure en producción. Hay control de origen para mutaciones y permisos de administrador verificados por el backend. Los intentos de autenticación se limitan por IP y los fallos por cuenta/IP persisten en PostgreSQL con una espera de 15 minutos tras 10 fallos; no es autenticación de dos factores. La recuperación automática por correo continúa sin configurar y se indica expresamente.

La tabla de clientes es exclusiva del administrador y no expone hashes ni tokens. El aviso describe finalidades operativas, cookie necesaria, proveedores y canal para derechos de acceso, rectificación, cancelación y oposición. Completa los datos reales del responsable y revisa plazos/procesos aplicables antes de utilizarlo comercialmente.

Referencia legal primaria consultada: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf
