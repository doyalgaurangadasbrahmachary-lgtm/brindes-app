# Protocolo de Adecuación Responsiva (Mobile)

## 🚨 Regla de Oro: Versión Desktop Intocable
**Bajo ninguna circunstancia** los cambios orientados a adaptar la responsividad móvil deben alterar, desplazar o romper el diseño, estructura o funcionalidad de la versión actual de Escritorio (Desktop).

* **Uso estricto de Breakpoints:** Todo cambio visual para pantallas pequeñas debe aislarse utilizando la filosofía de Tailwind CSS. Las clases base aplicarán a móvil, y el diseño de escritorio original debe protegerse utilizando los prefijos `md:`, `lg:` o `xl:`.
* *Ejemplo correcto:* `<div className="w-full px-4 md:w-[380px] md:px-0">` (en móvil toma ancho completo, en desktop mantiene su ancho original de 380px).

## 🛑 Política de Intervención: Cero Backend
Las tareas de esta fase son **estrictamente visuales y de interfaz de usuario (UI)** orientadas al CSS/Tailwind y reordenamiento de componentes.
* **PARE INMEDIATO:** Si un requerimiento visual exige:
  * Cambios en la lógica del backend o enrutamiento.
  * Modificaciones a modelos de datos o estados globales complejos.
  * Rediseño profundo de hooks de React que afecten el ciclo de vida general.
* El agente **suspenderá la implementación**, no realizará ningún cambio en el código y reportará el hallazgo al Director para solicitar autorización o reevaluar la viabilidad.

## 📋 Flujo de Trabajo: Detalle a Detalle

1. **Aislamiento del Objetivo:** 
   El Director asigna un único componente o área específica (ej. "Header", "Grilla de productos"). No se realizan cambios en masa.
2. **Auditoría de Componente:**
   El agente revisa el código fuente actual buscando medidas absolutas o layouts rígidos que rompen el móvil (ej. anchos fijos `w-[500px]`, elementos ocultos `hidden` sin justificación en móvil, flexbox sin envoltura `flex-nowrap`).
3. **Propuesta Aislada:**
   Se formulan las correcciones usando prefijos reactivos. Se documentan mentalmente o explícitamente las clases `md:` necesarias para que la vista desktop quede *exactamente* igual que antes del cambio.
4. **Implementación Quirúrgica:**
   Se aplican las clases en el código. No se refactorizan lógicas ajenas a la responsividad durante este paso.
5. **Prueba y Validación del Director:**
   El agente espera a que el Director valide visualmente en `localhost` reduciendo la ventana o inspeccionando en móvil antes de pasar a la siguiente tarea.

## 💡 Mejores Prácticas y Adecuación Visual en Móvil

* **Prevención de Overflows:** Asegurar elementos con `overflow-x-hidden` en contenedores maestros o usar `max-w-full` y `break-words` en tipografías largas.
* **Touch Targets (Zonas de Clic):** Botones y enlaces en móvil deben tener dimensiones más amigables para el dedo (padding o áreas de al menos `44x44px`), previniendo clics accidentales.
* **Ocultar lo Secundario:** En pantallas < 640px, componentes accesorios (como barras de búsqueda muy grandes o descripciones extensas) deben comprimirse detrás de menús tipo "Hamburguesa", Modales o Drawers.
* **Safe Areas (Zonas Seguras):** En dispositivos iOS y Android modernos, respetar los insets (paddings) inferiores y superiores para evitar que componentes (como barras de navegación inferiores) colisionen con los indicadores de sistema del dispositivo.
