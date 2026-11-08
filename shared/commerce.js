export const POLICY_VERSION = "2026-11-08.1";
export const sizes = [
  {
    id: "mediano",
    name: "Mediano",
    desc: "Referencia Ø 30–40 cm",
    priceExtra: 0,
  },
  {
    id: "grande",
    name: "Grande",
    desc: "Referencia Ø 40–70 cm",
    priceExtra: 8,
  },
  {
    id: "extragrande",
    name: "Extra grande",
    desc: "Referencia Ø 70–100 cm",
    priceExtra: 18,
  },
  {
    id: "gigante",
    name: "Gigante",
    desc: "Referencia Ø 100+ cm",
    priceExtra: 30,
  },
];
export const family = (value) => {
  const s = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return /pez|peces|koi/.test(s)
    ? "fish"
    : /semilla/.test(s)
      ? "seeds"
      : /nenufar/.test(s)
        ? "waterlily"
        : /loto/.test(s)
          ? "lotus"
          : "other";
};
export const cents = (n) => Math.round(Number(n) * 100);
export const money = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n) || 0,
  );
export function effectivePrice(base, discount = 0, extra = 0) {
  return (
    Math.round(
      ((cents(base) + cents(extra)) * (100 - Number(discount || 0))) / 100,
    ) / 100
  );
}
export const policySections = [
  {
    id: "terms",
    title: "Términos y condiciones",
    body: "Para comprar o reservar debes crear una cuenta e iniciar sesión. Proporciona datos correctos y mantén privada tu contraseña. Antes de confirmar verás los productos, descuentos, envío y total en MXN. La existencia y el precio se verifican en el servidor. Un pedido pendiente no acredita un pago. Las imágenes y medidas de referencia pueden variar por tratarse de organismos vivos; solicita al vendedor las medidas del ejemplar antes de comprar. Estas condiciones no limitan tus derechos como consumidor.",
  },
  {
    id: "shipping",
    title: "Envíos y fechas aproximadas",
    body: "Peces: entrega local acordada con el vendedor, envío aéreo sujeto a confirmación del transportista o recolección en sucursal. Lotos y nenúfares: entrega local, recolección y envío nacional. Semillas: entrega local, recolección y envío nacional; se contempla Correos de México y retiro postal cuando esté habilitado. No se envían peces por correo postal. La disponibilidad de rutas, el embalaje y los requisitos del transportista deben confirmarse antes del despacho. Los métodos sujetos a cotización no se cobran en línea hasta que el administrador configure su tarifa. Las fechas mostradas son estimaciones en días hábiles desde la confirmación del pago; no garantizan una fecha de llegada. Los paquetes mixtos solo admiten métodos compatibles con todo su contenido.",
  },
  {
    id: "returns",
    title: "Devoluciones, incidencias y cancelaciones",
    body: "Para solicitar cancelación, devolución, aclaración o reportar daños, contacta al vendedor con el folio del pedido y una descripción; las fotografías ayudan a revisar el caso. El vendedor confirmará por escrito las instrucciones, el domicilio de devolución y los costos que correspondan, sin limitar los derechos legales del consumidor. No envíes organismos vivos de vuelta sin coordinar las condiciones de transporte. Los reembolsos de pagos hechos con Mercado Pago se gestionan mediante ese proveedor y su acreditación depende del medio de pago. Cancelar un pedido en la tienda no equivale a efectuar un reembolso. Conserva tus comprobantes.",
  },
  {
    id: "payments",
    title: "Pagos y promociones",
    body: "Los precios y el envío se expresan en pesos mexicanos. Los descuentos se aplican al precio vigente y se muestran antes de confirmar. Mercado Pago abre su sitio de pago seguro; esta tienda no pide ni guarda números de tarjeta, NIP ni códigos de seguridad. El pago solo se confirma después de verificarlo con Mercado Pago desde el servidor. Regresar a la tienda después del pago no acredita por sí mismo la operación. Si el servicio de pago no está configurado, solo puede registrarse un pedido pendiente y no se realiza ningún cobro.",
  },
  {
    id: "privacy",
    title: "Aviso de privacidad y uso de información",
    body: "Recabamos nombre, apellido, correo, contraseña protegida mediante hash, dirección, teléfono y los datos de pedidos y reservas para crear tu cuenta, autenticarte, atender compras, entregar pedidos y controlar entradas. No utilizamos estos datos para publicidad ni los vendemos. Solo se comparten los datos necesarios con el proveedor de pago y el transportista que intervengan en tu operación. Usamos una cookie de sesión necesaria, con acceso restringido, y conservamos constancias de aceptación de estas condiciones. Puedes solicitar acceso, rectificación, cancelación, oposición o revocación del consentimiento mediante el contacto del responsable indicado aquí, identificándote y describiendo tu solicitud. Podremos conservar comprobantes durante los plazos legales aplicables. Los cambios al aviso se publican en esta sección; el consentimiento para nuevas finalidades se solicitará por separado. El administrador debe completar la identidad y el domicilio del responsable antes de operar comercialmente.",
  },
];
