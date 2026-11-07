-- Normalize legacy CSS image aliases and missing images, preserving custom URLs.
UPDATE productos SET imagen_url = CASE
 WHEN LOWER(categoria || ' ' || titulo) LIKE '%semilla%' THEN '/images/catalogo/semillas.jpg'
 WHEN LOWER(categoria || ' ' || titulo) ~ 'pez|peces|koi|carpa' THEN '/images/catalogo/koi.jpg'
 WHEN LOWER(categoria || ' ' || titulo) ~ 'loto|lotus' THEN '/images/catalogo/loto.jpg'
 WHEN LOWER(titulo) LIKE '%blanc%' THEN '/images/catalogo/nenufar-blanco.jpg'
 ELSE '/images/catalogo/nenufar.jpg' END
WHERE imagen_url IS NULL OR BTRIM(imagen_url) = '' OR imagen_url LIKE 'img-%';
UPDATE eventos SET imagen_url = CASE
 WHEN LOWER(titulo) ~ 'koi|pez|peces|carpa' THEN '/images/catalogo/koi.jpg'
 WHEN LOWER(titulo) ~ 'loto|lotus' THEN '/images/catalogo/loto.jpg'
 ELSE '/images/catalogo/nenufar.jpg' END
WHERE imagen_url IS NULL OR BTRIM(imagen_url) = '' OR imagen_url LIKE 'img-%'
 OR imagen_url LIKE 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae%'
 OR imagen_url LIKE 'https://images.unsplash.com/photo-1511516246830-1c6ce4b38d38%';
