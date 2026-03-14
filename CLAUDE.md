# G-Living Platform — Contexto Persistente para Claude

## Identidad de Marca: REGLA ABSOLUTA

**G-Living es la marca. Los proveedores aportan SOLO CONTENIDO.**

- Colores, tipografías, estilos visuales, UX → siempre identidad G-Living
- Dorado G-Living (`#C9A96E` o equivalente) → color de acento universal en TODOS los catálogos
- Elementos UI fijos en todos los catálogos: botón carrito (dorado), botón Aa (arriba-izquierda), botón GIFT, modal de producto con flechas + miniaturas + bolita compartir
- El proveedor cambia → el contenido (productos, imágenes, descripciones) cambia
- El proveedor cambia → el diseño NO cambia

---

## División de Responsabilidades — Irrompible

| Tú (dueño del proyecto)             | Claude (copiloto técnico)               |
|-------------------------------------|-----------------------------------------|
| Conocimiento del mercado colombiano | Arquitectura y código                   |
| Criterio visual y comercial         | Construcción de catalog-data.js         |
| Auditoría de fotos del proveedor    | Lógica modal, cart, API, CSS            |
| Decisión de qué productos entran    | Implementación completa                 |
| Testing y feedback de usuario       | Diagnóstico y correcciones              |

**Claude no propone trabajo que no fue pedido. Ejecuta con precisión lo que se pide.**

---

## Regla #1: Leer antes de responder

Antes de cada respuesta Claude DEBE:

1. **Leer todos los mensajes del usuario en la sesión** — no solo el último
2. **Analizar URLs/archivos compartidos** — si el usuario comparte un link o ruta, es contexto crítico. Siempre fetchearlo o leerlo antes de responder
3. **Conectar con la meta mayor** — ¿qué impacto tiene esta tarea en el roadmap G-Living?
4. **No proponer trabajo extra** — responder solo lo que se preguntó o pidió

**Si el usuario comparte un URL de GitHub, una ruta de archivo o una imagen → leerlo/fetchearlo INMEDIATAMENTE, no al final ni como tarea opcional.**

---

## Protocolo de Trabajo — Flujo Obligatorio (4 Fases)

**Lógica primero, código después. Nunca al revés.**

### Fase 1 — ESCANEO (siempre antes de cualquier propuesta)
- Scan del repo: leer los archivos clave del catálogo activo
- Leer TODOS los mensajes del usuario en la sesión — no solo el último
- Si hay URL, ruta o imagen compartida → leerla/fetchearla PRIMERO
- Recolectar incoherencias, datos faltantes, conflictos de lógica
- **Output obligatorio**: tabla o sketch visual de hallazgos — nunca texto largo sin estructura

### Fase 2 — LÓGICA CONJUNTA (sin código)
- Presentar análisis como tabla / diagrama ASCII / sketch visual
- Proponer opciones claras con pros/contras cuando hay decisión del dueño
- **Esperar confirmación explícita antes de pasar a Fase 3**
- Opciones de implementación técnica → responsabilidad de Claude
- Decisiones de negocio / diseño / qué construir → dueño del proyecto

### Fase 3 — GENERACIÓN (solo con aprobación explícita)
- Producir código completo **sin interrupciones**
- **Backtest obligatorio**: verificar coherencia contra todos los `*.css`, `*.js`, `*.html` del directorio de trabajo — no solo el archivo modificado
- Si backtest detecta inconsistencia → resolver antes de commitear
- Si no se puede resolver → reportar con sketch visual y esperar instrucción

### Fase 4 — ENTREGA
- Commit solo si R1–R8 del pre-commit hook pasan al 100%
- **Mejoras post-testeo: ESPERADAS pero NO BIENVENIDAS** → hacerlo bien la primera vez es el estándar
- Error en producción después del testeo → análisis de causa raíz, no parche rápido

---

## Estructura del Proyecto

```
multiplatform/
├── arte-de-la-mesa/
│   ├── arte-de-la-mesa-main-index.html   ← índice de colecciones arte de mesa
│   ├── imolarte/          ← Catálogo de referencia MASTER (más maduro)
│   ├── mlg/               ← Catálogo #2
│   └── ttt/               ← Catálogo #3 (Tessitura Toscana Telerie)
├── acabados/
├── indoor/
├── outdoor/
├── main-index.html        ← índice principal multiplatform
└── landing.html
```

**Link de retorno en catálogos de arte-de-la-mesa:**
`../arte-de-la-mesa-main-index.html` — NO `../main-index.html` (eso es 404)

---

## Catálogo de Referencia: Imolarte

Cuando se crea o clona un catálogo nuevo, **Imolarte es el template maestro**.

Checklist obligatorio al clonar:
- [ ] `catalog-data.js` termina con `window.XXXX_PRODUCTS = XXXX_PRODUCTS` (línea final crítica)
- [ ] `variables.css` usa colores G-Living (`#C9A96E` dorado, no color propio del proveedor)
- [ ] HTML incluye botón GIFT (comparar línea a línea con imolarte/index.html)
- [ ] HTML incluye botón Aa con posición `top: 14px; left: 14px` (arriba-izquierda)
- [ ] Modal de producto: flechas simétricas, miniaturas, bolita compartir al pie de foto
- [ ] Back link apunta a `../arte-de-la-mesa-main-index.html`
- [ ] `images/placeholder.jpg` (o .svg) existe en el catálogo
- [ ] Probar en local antes de commit: grid carga productos, modal abre, filtros funcionan

---

## Arquitectura TTT (Tessitura Toscana Telerie)

TTT es un catálogo de textiles italianos — arquitectura diferente a MLG.

**Grid principal: 6 family cards estáticas**

| Familia (`cat`)  | Label ES         | Productos |
|------------------|------------------|-----------|
| `tovaglie`       | Manteles         | 69        |
| `runner`         | Caminos de mesa  | 69        |
| `tovaglioli`     | Servilletas      | 29        |
| `tovaglietta`    | Individuales     | 39        |
| `mezzero`        | Paños deco       | 34        |
| `cuscini`        | Cojines          | 27        |

- Cada card rota imágenes de todos los productos de esa familia (máx 20)
- Click en card → `Modal.openProduct(primerProducto)` → flechas navegan los N productos de esa categoría
- Búsqueda por patrón → filtra qué productos verá el modal al abrir
- `TTT_PRODUCTS` tiene 490 productos totales · 147 patrones únicos · 3 zonas (letto, tavola e cucina, home decor)
- Imágenes: `arte-de-la-mesa/ttt/images/products/TT1000XXXXXX.jpg`

**NO usar filterZona/filterCat en el grid TTT** — las 6 family cards ya son la categorización.

---

## Arquitectura MLG

**Grid principal: familias de productos (Copas y Vasos, Alzadas, etc.)**

- `MLG_FAMILIES` → dict de familias → grid de family cards rotatorias
- `MLG_PRODUCT_TYPES` → productos individuales dentro de cada familia
- Click → `Modal.openFamily(familyName)` → navega entre productos de esa familia con medidas

---

## Modelo de Negocio (Bigger Picture)

### Layer 1 — Venta directa de productos
- Productos de alta gama / alto costo → filtra naturalmente el cliente target
- Clientes: alto poder adquisitivo + cultura de compra premium

### Layer 2 — El negocio de mayor margen (objetivo real)
- **Alquiler de plataforma** a pequeños productores colombianos sin acceso a cliente directo
- **Pool de clientes top** construido con Layer 1 → activo más valioso
- Posibilidad futura: vender productos a precio de costo para bloquear competidores, rentabilizando por Layer 2
- Base de datos de clientes premium = el verdadero activo a largo plazo

### Diferenciadores vs Shopify y competencia
1. Identidad de marca fuerte y coherente (G-Living)
2. UX nativa — siente como app, no como e-commerce genérico
3. Tono cálido, alegre, transparente en toda comunicación
4. Atención al cliente como centro: reporte de compra detallado, páginas de agradecimiento, comunicación honesta
5. Catálogos de categorías ultra-específicas (arte de mesa, acabados, indoor, outdoor)

### Roadmap tecnológico
- **Step 1** ✅ Primeros catálogos funcionales (Imolarte, MLG, TTT)
- **Step 2** 🔄 Claude como copiloto de programación — entregas testeadas desde primer deploy
- **Step 3** 🎯 Automatización máxima + integraciones: Vercel, Semrush, HubSpot, Zapier, Amazon SES, Supabase
- **Visión final**: Plataforma multibrand bajo sombrilla G-Living

---

## Estándares de Entrega

**Principio**: Micro tarea perfecta → micro tarea perfecta → objetivo grande.
La bigger picture siempre presente, nunca perdida en el detalle.

### Antes de cualquier commit Claude debe:
1. Leer el HTML/CSS/JS de referencia (Imolarte) completo — no recrear de memoria
2. Comparar output generado contra referencia
3. Verificar la línea final de cada archivo JS (`window.XXXX = XXXX`)
4. Confirmar que variables.css usa identidad G-Living (`#C9A96E`)
5. Confirmar que back links apuntan a `../arte-de-la-mesa-main-index.html`
6. Confirmar que `images/placeholder.*` existe en el catálogo
7. Documentar qué cambió y por qué en el commit message

El pre-commit hook valida R1–R8 automáticamente y bloquea el commit si fallan.
- **R7**: coherencia JS ↔ HTML (cada `.js` staged debe estar referenciado en el `*-index.html`)
- **R8**: calidad de datos — tolerancia cero: sin `medidas:[]` vacíos ni descriptores italianos en campo `medida`

### Nunca:
- Suponer posiciones CSS — copiar del original y ajustar
- Recrear lógica de memoria cuando existe un archivo de referencia
- Asignar colores propios a catálogos nuevos sin confirmación explícita
- Hacer commit sin haber verificado el checklist de clonación
- Proponer trabajo que no fue pedido (hooks, refactors, "mejoras")
- Ignorar URLs o archivos que el usuario compartió en el mensaje

---

## Notas de Sesión

- 2026-03-14: Regla de identidad G-Living hardcodeada. Los proveedores son solo fuente de contenido.
- 2026-03-14: División de roles documentada. Claude ejecuta, no decide ni propone agenda.
- 2026-03-14: TTT arquitectura 6 familias documentada. Grid → family cards → modal con medidas.
- 2026-03-14: Back link correcto: `../arte-de-la-mesa-main-index.html` (no `../main-index.html`).
- 2026-03-14: Pre-commit hook instalado en `.git/hooks/pre-commit` — valida back links, exports JS, colores G-Living, placeholder.
- 2026-03-14: Protocolo 4 fases documentado (Escaneo → Lógica → Generación → Entrega). Lógica primero, código después.
- 2026-03-14: Pre-commit R7 añadido — coherencia JS ↔ HTML (archivo JS staged debe estar referenciado en *-index.html).
- 2026-03-14: Pre-commit R8 añadido — calidad de datos tolerancia 0%: sin medidas vacías, sin descriptores italianos en campo medida.
- 2026-03-14: TTT variables.css corregido `#C9A961` → `#C9A96E` (dorado G-Living canónico). Opción A aprobada por dueño.
- 2026-03-14: R5 confirmado por dueño: imolarte/mlg 100% protegidos. Cambios requieren solicitud formal con pros/contras.
