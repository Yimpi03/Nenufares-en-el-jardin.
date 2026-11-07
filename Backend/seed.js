const products=[
  {
    id: 1,
    name: 'Nenúfar Rosa Gigante',
    category: 'Nenúfar',
    price: 28.50,
    oldPrice: 38.00,
    stock: 12,
    badge: 'OFERTA',
    unit: 'planta',
    description: 'Victoria amazonica. Hojas de hasta 1.5 m de diámetro. Florece al atardecer con aroma dulce.',
    characteristics: ['Victoria amazonica', 'Hojas gigantes flotantes', 'Aroma dulce nocturno', 'Variedad de exhibición'],
    image: 'img-nenufar-rosa'
  },
  {
    id: 2,
    name: 'Loto Sagrado Blanco',
    category: 'Loto',
    price: 32.00,
    oldPrice: 40.00,
    stock: 8,
    badge: null,
    unit: 'rizoma',
    description: "Nelumbo nucifera 'Alba'. Símbolo de pureza. Crece en contenedores de 40–80 cm de profundidad.",
    characteristics: ['Nelumbo nucifera "Alba"', 'Flores blancas de gran tamaño', 'Símbolo tradicional de pureza', 'Hojas flotantes y aéreas'],
    image: 'img-loto-blanco'
  },
  {
    id: 3,
    name: 'Carpa Koi Kohaku',
    category: 'Pez',
    price: 85.00,
    oldPrice: 95.00,
    stock: 6,
    badge: 'PREMIUM',
    unit: 'ejemplar',
    description: 'Koi Kohaku seleccionado de 15–20 cm. Patrón rojo sobre blanco. Criado en agua limpia certificada.',
    characteristics: ['Variedad Kohaku (Blanco y Rojo)', 'Tamaño de 15 a 20 cm', 'Excelente salud y vitalidad', 'Se entrega en bolsa de oxígeno'],
    image: 'img-koi-kohaku'
  },
  {
    id: 4,
    name: 'Loto Rosa Tailandés',
    category: 'Loto',
    price: 26.00,
    oldPrice: 32.00,
    stock: 15,
    badge: 'OFERTA',
    discountBadge: '-19% OFF',
    unit: 'rizoma',
    description: 'Nelumbo nucifera variedad tailandesa. Florece todo el verano con pétalos rosados intensos.',
    characteristics: [
      'Nelumbo nucifera variedad tailandesa',
      'Flores rosa intenso, 15–20 cm',
      'Floración prolongada todo el verano',
      'Rizoma resistente y productivo',
      'Ideal para macetas de 50 cm+'
    ],
    colors: [
      { name: 'Rosa intenso', hex: '#eb5e8d', available: true, stock: 12 },
      { name: 'Coral', hex: '#f07e71', available: true, stock: 3 },
      { name: 'Rosa medio', hex: '#f4b7cc', available: false, stock: 0 },
      { name: 'Rosa claro', hex: '#fad4e1', available: true, stock: 8 },
      { name: 'Lila pálido', hex: '#d6c4de', available: false, stock: 0 }
    ],
    image: 'img-loto-rosa'
  },
  {
    id: 5,
    name: 'Nenúfar Morado Tropical',
    category: 'Nenúfar',
    price: 22.00,
    oldPrice: 30.00,
    stock: 20,
    badge: null,
    unit: 'planta',
    description: 'Nymphaea colorata. Flores de color violeta intenso. Ideal para estanques y fuentes decorativas.',
    characteristics: ['Nymphaea colorata', 'Flores violeta intenso, 8–12 cm', 'Hoja redondeada verde oscuro', 'Variedad tropical'],
    image: 'img-nenufar-morado'
  },
  {
    id: 6,
    name: 'Carpa Koi Sanke',
    category: 'Pez',
    price: 98.00,
    oldPrice: 110.00,
    stock: 9,
    badge: null,
    unit: 'ejemplar',
    description: 'Koi Taisho Sanke con patrón tricolor (blanco, rojo y negro profundo). Alta calidad genética.',
    characteristics: ['Variedad Tricolor (Sanke)', 'Tamaño de 18 a 22 cm', 'Patrones definidos de alta calidad', 'Se entrega en bolsa de oxígeno'],
    image: 'img-koi-sanke'
  },
  {
    id: 7,
    name: 'Nenúfar Amarillo',
    category: 'Nenúfar',
    price: 25.00,
    oldPrice: 32.00,
    stock: 14,
    badge: null,
    unit: 'planta',
    description: 'Nymphaea mexicana. Hermosas flores amarillas brillantes que abren con los primeros rayos de sol.',
    characteristics: ['Nymphaea mexicana', 'Floración amarilla brillante', 'Adaptabilidad excelente en estanques templados'],
    image: 'img-nenufar-amarillo'
  },
  {
    id: 8,
    name: 'Loto Azul Sagrado',
    category: 'Loto',
    price: 40.00,
    oldPrice: 50.00,
    stock: 5,
    badge: 'EXCLUSIVO',
    unit: 'rizoma',
    description: 'Nymphaea caerulea. El legendario loto azul de la cultura egipcia con aroma relajante.',
    characteristics: ['Nymphaea caerulea', 'Flores azuladas celestes únicas', 'Aroma suave y calmante'],
    image: 'img-loto-azul'
  },
  {
    id: 9,
    name: 'Semillas Loto Sagrado Blanco',
    category: 'Semillas',
    price: 12.00,
    oldPrice: 15.00,
    stock: 45,
    badge: null,
    unit: 'sobre 10u',
    description: 'Paquete con 10 semillas escarificadas de Nelumbo nucifera "Alba", listas para germinar en agua.',
    characteristics: ['Alta tasa de germinación (85%+)', 'Escarificadas mecánicamente', 'Germina en 7-14 días en agua a 25°C', 'Ideal para iniciar desde cero'],
    image: 'img-semillas-loto-1'
  },
  {
    id: 10,
    name: 'Semillas Loto Rosa Mix',
    category: 'Semillas',
    price: 11.50,
    oldPrice: null,
    stock: 30,
    badge: 'NUEVO',
    unit: 'sobre 10u',
    description: 'Mix de semillas de lotos rosados y rojizos. Excelentes para cultivar en recipientes medianos.',
    characteristics: ['Mix de variedades rosadas', 'Paquete sellado al vacío', 'Incluye instructivo de germinación'],
    image: 'img-semillas-loto-2'
  }
];
const events=[
  {
    id: 1,
    badge: 'TALLER',
    day: '25',
    month: 'OCT',
    year: '2026',
    title: 'Taller de Diseño de Estanques en Teya',
    description: 'Aprende desde cero cómo planificar y plantar tu propio ecosistema acuático. Edición especial en Teya.',
    time: '10:00 - 14:00 hrs',
    capacity: 15,
    price: '$500 MXN',
    numericPrice: 500,
    location: 'Hacienda Teya, Yucatán',
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 2,
    badge: 'EVENTO',
    day: '12',
    month: 'NOV',
    year: '2026',
    title: 'Exhibición Anual de Koi',
    description: 'Ven a conocer a nuestros mejores ejemplares campeones. Habrá charlas sobre nutrición y salud de los peces.',
    time: '09:00 - 18:00 hrs',
    capacity: 'Entrada libre',
    price: 'Gratis',
    numericPrice: 0,
    location: 'Vivero Flores Finas, Pomuch',
    image: 'https://images.unsplash.com/photo-1511516246830-1c6ce4b38d38?q=80&w=800&auto=format&fit=crop'
  }
];
const suppliers=[
  {
    id: 1,
    name: 'Vivero Acuático Teya',
    contactPerson: 'Lic. Carmen Uc',
    phone: '999 456 7890',
    email: 'ventas@teyaacuarios.mx',
    category: 'Plantas y Nenúfares',
    address: 'Hacienda Teya, Yucatán'
  },
  {
    id: 2,
    name: 'Peces Ornamentales del Mayab',
    contactPerson: 'Don Jacinto Tun',
    phone: '988 789 1234',
    email: 'koi.mayab@gmail.com',
    category: 'Fauna y Carpas Koi',
    address: 'Calkiní, Campeche'
  }
];
export async function seed(db){
 // Seed once, never repopulate catalog after an administrator intentionally empties it.
 await db.query('CREATE TABLE IF NOT EXISTS app_migrations (id TEXT PRIMARY KEY)');
 if((await db.query("SELECT id FROM app_migrations WHERE id='local-v1'")).rowCount)return;
 for(const p of products)await db.query(`INSERT INTO productos(id,titulo,categoria,descripcion,precio,stock,imagen_url,datos) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO NOTHING`,[p.id,p.name,p.category,p.description,p.price,p.stock,p.image,p]);
 for(const e of events){const months={OCT:10,NOV:11};await db.query(`INSERT INTO eventos(id,titulo,descripcion,tipo,inicio,ubicacion,capacidad,precio,imagen_url,datos) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(id) DO NOTHING`,[e.id,e.title,e.description,e.badge,`${e.year}-${months[e.month]}-${e.day}T12:00:00-06:00`,e.location,typeof e.capacity==='number'?e.capacity:null,e.numericPrice,e.image,e]);}
 for(const s of suppliers)await db.query(`INSERT INTO proveedores(id,nombre,persona_contacto,telefono,email,categoria,direccion) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(id) DO NOTHING`,[s.id,s.name,s.contactPerson,s.phone,s.email,s.category,s.address]);
 await db.query("INSERT INTO app_migrations(id) VALUES('local-v1')");
}
