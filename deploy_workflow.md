# Workflow de Preparación para Deploy: Motta Brindes App

Este documento detalla el análisis profundo de los bloqueadores de despliegue ("deploy") detectados, la validación de errores, y el flujo de trabajo a seguir para estabilizar la aplicación en Next.js 15 y React 19.

> **Directiva del Director:** La responsividad móvil ha sido pospuesta ("standby"). La prioridad exclusiva es estabilizar el core para un deploy exitoso; las optimizaciones visuales para móvil se abordarán en post-producción.

---

## 1. Validación de Bloqueadores Reportados y Análisis

### 🔴 Bloqueador 1: `SearchBar` apuntando a ruta inexistente
* **Análisis:** Validado. En `components/SearchBar.tsx:27`, el componente cliente utiliza `fetch('/assets/data/maestra.json')`. Según la bitácora, este archivo JSON (que contiene ~2700 productos) fue movido a `src/data/maestra.json` por motivos de seguridad en entorno SSR. Por ende, la carpeta `public/assets/data/` ya no lo contiene.
* **Impacto en Prod:** Error `404 Not Found` en la consola del cliente. El buscador fallará silenciosamente o lanzará una excepción al no poder procesar el JSON.
* **Práctica Recomendada (Next.js 15):** 
  * *Opción A (Recomendada):* Proveer un "API Route Handler" en `app/api/search/route.ts` que lea de `src/data/maestra.json` en el servidor y responda a consultas. El `SearchBar` pasaría a hacer `fetch('/api/search?q=query')`. Esto evita descargar todo el JSON al cliente.
  * *Opción B:* Reintroducir el `maestra.json` en `public` (menos seguro, alto badwidth ~500KB iniciales al cliente).

### 🔴 Bloqueador 2: Ausencia de `remotePatterns` para Imágenes Externas
* **Análisis:** Validado. El archivo `next.config.ts` solo contiene `formats: ['image/webp', 'image/avif']`. El componente `ProductCard` (línea 32) renderiza `next/image` con URLs remotas del servidor en Brasil (ej. `mottabrindes.com.br`).
* **Impacto en Prod:** Next.js devolverá un error `500` en producción al intentar optimizar una imagen de un hostname no registrado preventivamente.
* **Práctica Recomendada (Next.js 15):** Actualizar `next.config.ts` añadiendo el esquema estricto.

### 🟡 Problema Serio 1: React RC (Release Candidate)
* **Análisis:** Validado. `package.json` está forzando `^19.0.0-rc-66855b96-20241106` en `dependencies`, `overrides` y `resolutions`.
* **Impacto en Prod:** Posibles memory leaks, incompatibilidades de paquetes de terceros (como `react-virtuoso` o `gsap` si utilizan hooks antiguos), y comportamientos inesperados en builds Vercel.
* **Práctica Recomendada:** Next.js 15.0.x y superior ya es plenamente compatible con React 19 estable. Actualizar las dependencias a `"react": "^19.0.0"` y regenerar el lockfile (`yarn install`).

---

## 2. Flujo de Trabajo (Disección de Tareas)

El siguiente flujo está diseñado para delegarse a los agentes especializados (ej. *Hive Architecture Agent* o similares):

### Paso 1: Estabilización de Dependencias (Core Agent)
- [ ] Modificar `package.json`: Eliminar bloque `overrides/resolutions` si ya no es necesario o reemplazar explícitamente `"^19.0.0-rc..."` con `^19.0.0`.
- [ ] Ejecutar `yarn config set strict-ssl false` si existen fallos locales y correr `yarn install` para actualizar `yarn.lock`.
- [ ] Ejecutar `yarn build` en local para asegurar que Next no choca con tipos de React 19 estable.

### Paso 2: Corrección del Buscador y API (Backend Agent)
- [ ] Crear el endpoint: `brindes-app/app/api/search/route.ts`. Este endpoint leerá el fs usando `fs.readFileSync(path.join(process.cwd(), 'src/data/maestra.json'))`, aplicará el filtrado (*slug/id/tags*) y devolverá los resultados top 10.
- [ ] Refactorizar `brindes-app/components/SearchBar.tsx`: Cambiar la carga masiva en `useEffect` inicial por un fetch reactivo o "Debounced Fetch" directo al nuevo endpoint `/api/search`.

### Paso 3: Optimización del Next Config (Config Agent)
- [ ] Editar `next.config.ts` y añadir el host correcto para las miniaturas en `remotePatterns` usando la matriz:
  ```typescript
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.mottabrindes.com.br' }
    ]
  }
  ```

### Paso 4: Validaciones Pre-Deploy (QA Agent)
- [ ] Ejecutar simulación local de producción: `yarn build && yarn start`.
- [ ] Navegar y validar que las imágenes cargan (`next-image` sin error 500).
- [ ] Escribir query en el buscador y validar carga de resultados sin arrojar error 404 de Assets.

---
*Nota: Al finalizar la ejecución de estas tareas, el sistema estará robusto y garantizado para una compilación exitosa (`green build`) en la infraestructura de Vercel.*
