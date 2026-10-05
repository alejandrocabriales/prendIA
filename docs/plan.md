# PrendIA — Roadmap y plan de datos

_Última actualización: 2026-10-05_

## Resumen

Este roadmap arranca donde termina el MVP Iteración 1 de PrendIA, que ya corre de punta a punta: foto de la prenda → análisis con IA (o su mock) → búsqueda en un catálogo local → cálculo de distancia → resultados ordenables. Ese MVP no tiene backend, auth ni datos reales — todo vive en el teléfono, con un catálogo mock de 59 productos ficticios.

Para que esto deje de ser una demo faltan dos cosas: que el catálogo tenga tiendas y stock reales, y decidir qué se construye después de eso. Este documento propone 10 tiendas semilla para arrancar, cómo conseguirles el stock sin construir una integración pesada de entrada, y el orden de las siguientes fases — incluyendo la consulta a tienda que pediste, y dejando anotado (sin comprometer fecha) lo de autenticación, planes y suscripciones.

## Tiendas semilla para el MVP

Criterio de selección: cadenas con varias sucursales en los shoppings de más tráfico de Montevideo (Montevideo Shopping, Punta Carretas, Nuevocentro, Tres Cruces), que entre todas cubran las categorías clave (camperas, jeans, calzado, deportiva) y mezclen tiers de precio — sin esa mezcla, el filtro "más barato" del MVP no tiene nada interesante para mostrar. Las cadenas uruguayas, además, son más fáciles de contactar para un piloto manual que una multinacional.

| Tienda | Categoría | Por qué entra en el top 10 | Confianza |
| --- | --- | --- | --- |
| Zara | Moda general (internacional) | Ancla de tráfico alto en los shoppings principales, catálogo amplio | Alta |
| H&M | Moda general (internacional) | Mismo rol que Zara, público similar | Alta |
| Renner | Moda general (regional) | Precio más accesible que Zara/H&M — da contraste real para "más barato" | Alta |
| C&A | Moda general (internacional) | Tercera ancla de precio medio en los mismos shoppings | Alta |
| Stadium | Deportiva/urbana (uruguaya) | Cadena uruguaya grande, fuerte en remeras, buzos y zapatillas | Alta |
| Dexter | Calzado (uruguaya) | Cadena uruguaya de calzado con alcance nacional — clave para zapatillas | Alta |
| Indian | Jeans/casual (uruguaya) | Marca histórica uruguaya, fuerte en jeans y camperas de jean | Media-alta |
| Nike (tienda oficial) | Deportiva (internacional) | Ancla deportiva premium para comparar zapatillas de marca | Alta |
| Adidas (tienda oficial) | Deportiva (internacional) | Segunda ancla deportiva premium, mismo rol que Nike | Alta |
| Daniel Cassin | Moda masculina (uruguaya) | Cadena uruguaya conocida en indumentaria masculina | Media |

Ojo: esta lista es un punto de partida razonable a partir de conocimiento general de las cadenas con presencia en Montevideo, no un relevamiento de campo. Antes de salir a ofrecerles el piloto, confirmar sucursales vigentes y el contacto correcto de cada una — el detalle de quién abre la puerta en cada cadena cambia con el tiempo y no es algo que este documento pueda verificar por vos.

## Cómo conseguir stock real

Empezar con 3 tiendas, no con las 10 de una, y a mano — validar que alguien del lado tienda esté dispuesto a mantener datos actualizados vale más que cualquier integración antes de saber eso.

1. **Planilla compartida (arrancar por acá).** Un Google Sheet con las mismas columnas que `MockProduct` (título, categoría, color, precio, talles, tienda). Alguien del local la actualiza 1-2 veces por semana. Costo técnico casi nulo; sirve para probar si hay interés real antes de construir nada más.
2. **Portal self-service para tiendas.** Un formulario web simple donde suben foto + precio + talle + stock. Próximo paso natural una vez que 2-3 tiendas dijeron que sí a la planilla — les da visibilidad a cambio de mantener los datos.
3. **Scraping de sitios de e-commerce.** Para las tiendas que ya venden online (Zara, H&M, Renner tienen tienda online), leer precio/stock de su sitio. Riesgo real: hay que revisar los términos de uso de cada sitio antes de hacerlo, y es frágil — cualquier cambio de diseño lo rompe. Tiene sentido como respaldo, no como fuente principal.
4. **Monitoreo de redes sociales.** Muchas tiendas locales publican stock nuevo en Instagram. La API oficial de Meta exige cuenta business y permisos específicos, así que al principio esto es más viable como proceso manual (alguien revisa el feed) que como automatización.
5. **Crowdsourcing de usuarios.** Que la persona que saca la foto confirme o corrija precio/talle que ve en el momento. No resuelve el arranque en frío, pero mantiene los datos frescos después prácticamente gratis, porque ya está sacando la foto.
6. **Integración con POS/ERP de la tienda.** La opción más robusta (stock en vivo) y la más cara y lenta de negociar. Tiene sentido recién cuando 1-2 tiendas ya muestran volumen real de uso.

Secuencia recomendada: planilla manual con 3 tiendas → si funciona, subir a las 10 y pasar a portal self-service → scraping y crowdsourcing quedan como complemento para mantener los datos frescos, no como fuente principal → integración POS se evalúa solo cuando el volumen la justifique.

## Roadmap de fases

| Fase | Cuándo | Qué incluye |
| --- | --- | --- |
| Fase 0 (hecho) | Ahora | Core loop del MVP: foto → IA → catálogo mock → distancia → resultados |
| Fase 1 | Próximo | 10 tiendas semilla + stock real cargado a mano (planilla/CSV) |
| Fase 2 | Después | Backend propio: API key de IA server-side + base de datos real del catálogo |
| **Fase 3** | **Más adelante** | **Consulta a tienda: el cliente envía una pregunta antes de ir a verla** |

La fase marcada, consultar a la tienda antes de ir a verla, es el feature nuevo que pediste sumar al roadmap.

## Guardado para más adelante

Mismo scope del producto, pero sin fecha comprometida — queda anotado para no perderlo:

- **Autenticación de usuarios finales**: perfiles, historial de búsquedas, favoritos persistentes. Hoy el MVP no tiene ningún login.
- **Planes y suscripciones para tiendas**: niveles de visibilidad (destacado en resultados), límite de productos cargados, analytics de cuántas personas vieron o compararon su prenda — este es el lado que eventualmente monetiza el producto.
- **Planes para usuarios finales**: si en algún momento hay features premium (alertas de precio, histórico de búsquedas), el modelo de planes se define recién ahí.

Nada de esto se diseña todavía. Tiene sentido retomarlo cuando el catálogo real y la consulta a tienda (fases 1 a 3 arriba) ya estén funcionando y haya tiendas reales pidiendo más.

---

_Versión completa con diagrama interactivo: https://claude.ai/code/artifact/486d900c-2673-4d4c-b151-38bf72baff6f_
