# Catálogo y Mapa Arquitectónico de Código
**App:** Motta Brindes (`brindes-app`)
**Uso:** Extracción y reciclaje rápido de bloques de código y UI (Copy-Paste de layouts).

Este documento presenta un modelo mental de la aplicación en formato de árbol jerárquico. Facilita la navegación para no re-escribir lógica (ej. filtros, cards, layout grid).

---

## 🌳 Árbol Estructural (Mental Map)

```text
brindes-app/
├── app/                  # Next.js App Router (Páginas y API)
│   ├── layout.tsx        # Layout Principal (Inyecta Navbar, Contextos, Metadatos)
│   ├── page.tsx          # Homepage. Muestra Hero Video (PingPong) y lista de categorías A-Z.
│   │                     # 🎯 [Clave] Contiene la lógica fs/path para leer 'maestra.json' en SSR.
│   ├── api/
│   │   └── product/      # Endpoint SSR para servir items específicos sin agobiar el frontend.
│   └── categoria/
│       └── [slug]/       # Rutas Dinámicas (ej: /categoria/mochilas). Renderiza ProductGrid.
│
├── components/           # Bloques reciclables de UI
│   ├── Header.tsx        # Barra Superior global. Incluye logo y llama al SearchBar.
│   ├── SearchBar.tsx     # ⚠️ Input para autocompletar búsquedas (Client-side, utiliza Context).
│   ├── NavDropdowns.tsx  # Navegación extendida (Desktop/Móvil menus).
│   ├── ProductCard.tsx   # Tarjeta atómica.
│   │                     # 🎯 [Clave] Renderiza next/image, botón de QuickSend/Notepad.
│   ├── ProductGrid.tsx   # Sistema de renderizado virtualizado (React Virtuoso).
│   ├── QuickSendCard.tsx # Modal pequeño embebido en el Card para envío a WhatsApp.
│   └── Notepad.tsx       # "Bloc de Notas" de presupuesto, slider lateral derecho.
│
├── context/              # Estado Global (Zustand context-like)
│   └── NotepadContext.tsx # Maneja los ítems agregados al presupuesto ("carrito").
│
├── src/data/             # Capa de Persistencia Backend
│   └── maestra.json      # Base de Datos JSON principal (2700+ SKUs).
│
├── public/assets/        # Estáticos públicos
│   ├── hero_pingpong.webm # Video principal optimizado.
│   └── hero_poster.webp   # Poster frame.
│
└── utils/                # Utilidades puras
    └── slugify.ts        # Función vital: Convierte "Canetas Ecológicas" -> "canetas-ecologicas".
```

---

## 🧩 Bloques de Código Reciclables (Highlights)

### 1. Extracción de JSON Segura en Server (Para usar en Server Components)
Ubicación: `app/page.tsx`
**Qué hace:** Extrae dinámicamente etiquetas (`tags`) únicas de una BD JSON para armar un menú de navegación.
**Ideal para:** Crear dashboards o reportes SSR basados en un archivo local sin fetch web.

### 2. Animación de Image Loading + Hover
Ubicación: `components/ProductCard.tsx`
**Qué hace:** Encapsula la imagen de producto en un aspect ratio cuadrado (`aspect-square`), con escalado visual suave al pasar el mouse por encima.
**Ideal para:** Tarjetas de catálogo, avatares y miniaturas de posts. Todo componente que necesite sentirse "premium" con tailwind.

### 3. Highlight de Scroll hacia un Elemento (Targeted Scroll)
Ubicación: `components/SearchBar.tsx` (Lógica `jumpToProduct`)
**Qué hace:** Busca un ID en la estructura HTML, hace un "smooth scroll" para centrar el producto seleccionado e inyecta una clase de resaltado parpadeante mediante timeout.
**Ideal para:** Acciones desde una barra de notificaciones, bookmarks, o anchors dentro de long-form pages.

### 4. Componente Modal de Video en Bucle (Hero Video)
Ubicación: `app/page.tsx` (Hero Section)
**Qué hace:** Carga un `webm` silenciado y auto-reproducido bajo una capa gradiente (`absolute inset-0 bg-gradient`). Soporta fallback `mp4`.
**Ideal para:** Landing pages minimalistas, Headers o Backgrounds artísticos.

---

> *Este catálogo debe utilizarse por el agente de desarrollo para ubicar funciones nativas antes de escribir reinventos con dependencias exóticas.*

---

## 🚨 Mapeo de Riesgos para Vercel (Action Plan - Fase Deploy)

Tras un análisis profundo del código, se han detectado los siguientes riesgos y optimizaciones de alto impacto para el paso a producción en Vercel:

### 1. Riesgo Crítico: Límites de Optimización de Imágenes de Vercel
**Estado Actual:** `next.config.ts` tiene `unoptimized: false` por defecto. El componente `<Image>` redimensiona imágenes al vuelo.
**El Riesgo:** Vercel cobra por "Source Images" optimizadas (el plan Hobby tiene un límite de 1,000; el Pro 5,000). Tenemos **2,700+ productos**. Si Next.js procesa dinámicamente estas imágenes, agotarás el límite de Vercel en días, lo que puede causar cargos extra o el bloqueo de las imágenes.
**La Ventaja Oculta:** Las imágenes en `maestra.json` ya vienen pre-optimizadas en formato `.webp` (`/assets/products/...webp`). ¡Ya son hiper-ligeras!
**Decisión Estratégica (Acción):** Desactivar la optimización dinámica en `next.config.ts` (`unoptimized: true`). Vercel servirá los archivos `.webp` estáticos desde su Edge CDN (ultrarrápido y **gratis**, sin consumir cuota de "Image Optimization"). 

### 2. Riesgo Menor: Metadatos "Localhost"
**Estado Actual:** En `app/layout.tsx`, el título global es `Catálogo Magazine Brindes (Localhost)` y la descripción dice `offline`.
**El Riesgo:** Pésimo SEO y presentación profesional al compartir el link de Vercel por WhatsApp o redes sociales.
**Decisión Estratégica (Acción):** Cambiar los metadatos a valores de producción reales.

### 3. Veredicto sobre Funciones Activas
*   **Virtualización (ProductGrid):** Funciona perfectamente con `react-virtuoso`. Sin riesgo. Manejar 2700 nodos en el DOM sería catastrófico, pero la virtualización lo previene. No tocar.
*   **Lectura de JSON (`fs.promises.readFile`):** Ya se migró de síncrono a asíncrono. En Vercel, esto se ejecutará en la función Serverless sin problemas porque los archivos locales (`src/data`) se empaquetan junto a la función. Sin riesgo.
*   **API Route de Búsqueda:** Perfectamente optimizada para devolver hasta 100 resultados rápidos sin asfixiar la red. Sin riesgo.

**En resumen:** El código es robusto. El único bloqueador logístico/financiero para Vercel es desactivar el Image Optimization dado que ya tienes las imágenes en `.webp`.
