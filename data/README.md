# Catálogo — cómo actualizarlo

`mockProducts.ts` es un **archivo generado**. La fuente real es `catalog.csv`.

## Columnas de `catalog.csv`

Mismas columnas que la planilla compartida que llena cada tienda piloto (ver `docs/plan.md`):

| Columna | Obligatoria | Notas |
| --- | --- | --- |
| `id` | Sí | Única por fila (ej. `mp-001`). |
| `title` | Sí | |
| `category` | Sí | Debe matchear las categorías que entiende `utils/similarity.ts`. |
| `subcategory` | No | |
| `color` | Sí | |
| `material` | No | |
| `style` | No | |
| `brand` | No | |
| `price` | Sí | Número, sin símbolo de moneda. |
| `sizeAvailable` | Sí | Talles separados por `;` (no `,`), ej. `S;M;L;XL`. |
| `storeName` | Sí | |
| `address` | Sí | Puede tener comas — va entre comillas en el CSV. |
| `latitude` / `longitude` | Sí | Decimal. |
| `imageUri` | No | URL de imagen. |

## Flujo

1. Tienda piloto actualiza su planilla (Google Sheet).
2. Exportar esa hoja como CSV y pisar `data/catalog.csv`.
3. Correr `npm run build:catalog` — regenera `mockProducts.ts`.
4. Commitear ambos archivos juntos.

Nunca editar `mockProducts.ts` a mano — se pisa en el próximo `build:catalog`.
