# G-Living Platform — Contexto Persistente para Claude

## Identidad de Marca: REGLA ABSOLUTA

**G-Living es la marca. Los proveedores aportan SOLO CONTENIDO.**

- Colores, tipografías, estilos visuales, UX → siempre identidad G-Living
- Dorado G-Living (`#C9A96E` o equivalente) → color de acento universal en TODOS los catálogos
- Elementos UI fijos en todos los catálogos: botón carrito (dorado), botón Aa (arriba-izquierda), botón GIFT, modal de producto con flechas + miniaturas + bolita compartir
- El proveedor cambia → el contenido (productos, imágenes, descripciones) cambia
- El proveedor cambia → el diseño NO cambia

## Estructura del Proyecto

```
multiplatform/
├── arte-de-la-mesa/
│   ├── imolarte/          ← Catálogo de referencia MASTER (más maduro)
│   ├── mlg/               ← Catálogo #2
│   └── ttt/               ← Catálogo #3 (Tessitura Toscana Telerie)
├── acabados/
├── indoor/
├── outdoor/
└── landing.html
```

## Catálogo de Referencia: Imolarte

Cuando se crea o clona un catálogo nuevo, **Imolarte es el template maestro**.

Checklist obligatorio al clonar:
- [ ] `catalog-data.js` termina con `window.XXXX_PRODUCTS = XXXX_PRODUCTS` (línea final crítica)
- [ ] `variables.css` usa colores G-Living (dorado, no color propio del proveedor)
- [ ] HTML incluye botón GIFT (comparar línea a línea con imolarte/index.html)
- [ ] HTML incluye botón Aa con posición `top: 14px; left: 14px` (arriba-izquierda)
- [ ] Modal de producto: flechas simétricas, miniaturas, bolita compartir al pie de foto
- [ ] Probar en local antes de commit: grid carga productos, modal abre, filtros funcionan

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
- **Step 1** ✅ Primeros catálogos funcionales
- **Step 2** 🔄 Claude como copiloto de programación — entregas testeadas desde primer deploy
- **Step 3** 🎯 Automatización máxima + integraciones: Vercel, Semrush, HubSpot, Zapier, Amazon SES, Supabase
- **Visión final**: Plataforma multibrand bajo sombrilla G-Living

## Estándares de Entrega

**Principio**: Micro tarea perfecta → micro tarea perfecta → objetivo grande.
La bigger picture siempre presente, nunca perdida en el detalle.

### Antes de cualquier commit Claude debe:
1. Leer el archivo HTML/CSS/JS de referencia (Imolarte) completo
2. Comparar output generado contra referencia — no recrear de memoria
3. Verificar la línea final de cada archivo JS
4. Confirmar que variables.css usa identidad G-Living, no identidad de proveedor
5. Documentar qué cambió y por qué en el commit message

### Nunca:
- Suponer posiciones CSS — copiar del original y ajustar
- Recrear lógica de memoria cuando existe un archivo de referencia
- Asignar colores propios a catálogos nuevos sin confirmación explícita
- Hacer commit sin haber verificado el checklist de clonación

## Notas de Sesión

- 2026-03-14: Regla de identidad G-Living hardcodeada. Los proveedores son solo fuente de contenido.
