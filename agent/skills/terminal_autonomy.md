# SKILL: TERMINAL_EXECUTION_PROTOCOL (PAT)
**Versión:** 1.0
**Objetivo:** Ejecución eficiente y delegación de procesos largos.

## Clasificación de Tareas
El agente debe evaluar el tiempo estimado de la tarea antes de responder:

### A. PROCESOS RÁPIDOS (< 60 segundos)
*Ejemplos: `git status`, `ls`, `npm install` de un solo paquete, `taskkill`.*
- **Acción:** Entregar el comando directo al Director.
- **Instrucción:** "Ejecuta esto para obtener el resultado inmediato."

### B. PROCESOS LARGOS (> 60 segundos)
*Ejemplos: `npm run crawl`, descargas masivas de imágenes, compilaciones pesadas.*
- **Acción:** **DELEGACIÓN TOTAL.** - **Protocolo:**
    1. Entregar la ruta del archivo a ejecutar (ej: `scripts/crawler.js`).
    2. Entregar el comando de terminal (ej: `npm run crawl`).
    3. Explicar los resultados esperados y posibles errores.
    4. **MODO STANDBY:** El agente debe finalizar su turno y esperar el reporte de "ÉXITO/FALLO" del Director para ahorrar tokens de monitoreo.

## Regla de Oro
"Si el proceso requiere ver una barra de progreso, el agente no debe estar presente. Instruye y espera."