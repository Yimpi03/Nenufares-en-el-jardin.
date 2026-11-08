ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS consentimiento JSONB;
CREATE TABLE IF NOT EXISTS store_settings (id INTEGER PRIMARY KEY CHECK(id=1), datos JSONB NOT NULL);
INSERT INTO store_settings VALUES(1,'{"sellerName":"Nenúfares en el Jardín","sellerLegalName":"","sellerAddress":"","contactEmail":"admisariteyaflores@gmail.com","contactPhone":"","shippingNotes":"Coordina la entrega con el vendedor antes del despacho.","returnNotes":"","privacyNotes":""}') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS shipping_methods(id TEXT PRIMARY KEY,label TEXT NOT NULL,families JSONB NOT NULL,cost NUMERIC(12,2) NOT NULL CHECK(cost>=0),min_days INTEGER NOT NULL CHECK(min_days>=0),max_days INTEGER NOT NULL CHECK(max_days>=min_days),quote_required BOOLEAN NOT NULL DEFAULT TRUE,enabled BOOLEAN NOT NULL DEFAULT TRUE,carrier TEXT NOT NULL DEFAULT '',notes TEXT NOT NULL DEFAULT '');
INSERT INTO shipping_methods VALUES
 ('pickup','Recoger en sucursal','["fish","waterlily","lotus","seeds","other"]',0,1,3,false,true,'Sucursal del vendedor','Confirmar domicilio y horario con el vendedor.'),
 ('local','Envío local','["fish","waterlily","lotus","seeds","other"]',0,1,3,true,true,'Acordar con el vendedor','Solo dentro de la ciudad; requiere cotización.'),
 ('air','Envío aéreo de peces','["fish"]',0,1,3,true,true,'Por confirmar','Requiere confirmación de ruta, transportista y embalaje de organismos vivos.'),
 ('national','Envío nacional','["waterlily","lotus","seeds"]',0,3,8,true,true,'Por confirmar','Tarifa y cobertura por confirmar; no admite peces.'),
 ('correos_nacional','Correos de México · nacional','["seeds"]',0,5,15,true,true,'Correos de México','Solo semillas; cobertura y tarifa por confirmar.'),
 ('correos_sucursal','Correos de México · retiro en sucursal postal','["seeds"]',0,5,15,true,true,'Correos de México','Solo semillas; indicar sucursal postal y confirmar disponibilidad.') ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS paquetes(id TEXT PRIMARY KEY,datos JSONB NOT NULL,stock INTEGER NOT NULL DEFAULT 0 CHECK(stock>=0),activo BOOLEAN NOT NULL DEFAULT TRUE);
INSERT INTO paquetes VALUES
 ('promo-1','{"title":"Estanque Completo","subtitle":"Paquete Fundador","description":"3 nenúfares + 2 lotos + 4 peces koi + asesoría de 1 hora. Contenido sujeto a confirmación del vendedor.","basePrice":320,"promotionPrice":229,"families":["fish","waterlily","lotus"],"theme":"card-green"}',0,true),
 ('promo-2','{"title":"Jardín Zen","subtitle":"Edición Verano","description":"5 lotos sagrados + sustrato y macetas. Confirma contenido con el vendedor.","basePrice":210,"promotionPrice":159,"families":["lotus"],"theme":"card-teal"}',0,true),
 ('promo-3','{"title":"Colección Koi","subtitle":"3 ejemplares","description":"Selección de tres peces koi; confirma variedades y condiciones con el vendedor.","basePrice":280,"promotionPrice":220,"families":["fish"],"theme":"card-dark"}',0,true) ON CONFLICT DO NOTHING;
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS checkout_key UUID;
CREATE UNIQUE INDEX IF NOT EXISTS pedidos_checkout_key ON pedidos(usuario_id,checkout_key) WHERE checkout_key IS NOT NULL;
ALTER TABLE reservas ADD COLUMN IF NOT EXISTS estado TEXT NOT NULL DEFAULT 'pendiente';
CREATE TABLE IF NOT EXISTS entradas(token_hash TEXT PRIMARY KEY,reserva_id UUID NOT NULL REFERENCES reservas(id) ON DELETE CASCADE,ordinal INTEGER NOT NULL,usado_en TIMESTAMPTZ,usado_por BIGINT REFERENCES usuarios(id),UNIQUE(reserva_id,ordinal));
CREATE TABLE IF NOT EXISTS payment_receipts(payment_id TEXT PRIMARY KEY,reference TEXT NOT NULL,estado TEXT NOT NULL,datos JSONB NOT NULL,actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS login_failures (key TEXT PRIMARY KEY,attempts INTEGER NOT NULL,until_at TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS commerce_audit(id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,actor BIGINT REFERENCES usuarios(id),accion TEXT NOT NULL,referencia TEXT NOT NULL,creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW());

ALTER TABLE reservas ADD COLUMN IF NOT EXISTS payment_id TEXT;
