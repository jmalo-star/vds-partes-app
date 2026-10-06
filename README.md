# VDS · Partes de campo

Prototipo navegable de la app de tablet de **Vientos del Sur** para gestionar partes de servicio con las operadoras.

Circuito: **Planificación → Parte diario → Revisión VDS → Certificación del cliente**.

> Es un prototipo de interfaz: no tiene backend. Los datos son de ejemplo y se guardan en el navegador (`localStorage`). El botón "Reiniciar demo" vuelve a los datos iniciales.

## Usuarios de prueba

Clave para todos: `vds2026`

| Rol | Usuario | Qué hace |
|---|---|---|
| Planner | `lmendez` | Planifica trabajos por contrato (Gantt, por recurso, mes), prioridades y duración |
| Operador | `darce` | Completa el parte diario en campo (Cuadrilla 03) |
| Validador VDS | `msosa` | Responsable técnico: aprueba o devuelve partes |
| Cliente | `grivas` | Austral Petróleo: certifica u observa partes aprobados |

## Qué incluye

- Planificación por contrato: el contrato define operadora, centro de costos, recursos y catálogo de tareas.
- Vistas Gantt, calendario por recurso y calendario mensual, con ocupación en %.
- Trabajos de varios días: se estiran, acortan o mueven arrastrando la barra en el Gantt.
- Parte diario estándar en 6 pasos: inicio (clima y checklist), personal, equipos, tareas (con cantidades y unidades, incluido m³), tiempos y cierre (supervisor, responsable técnico, fotos y firma).
- Habilitaciones de ingreso a yacimiento por operadora para personal y vehículos.
- Controles automáticos antes de enviar y en la revisión.
- Resumen del parte y descarga en PDF.
- Modo sin señal simulado.

## Correrlo localmente

Es un único archivo estático. Abrí `index.html` en el navegador, o levantá un servidor local:

```bash
npx serve .
```

## Publicarlo en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importá este repositorio.
2. Framework preset: **Other**. Sin comando de build. Output directory: la raíz del repo.
3. **Deploy**. Cada push a `main` vuelve a publicar.

## Estructura

```
index.html   # toda la app: estilos, datos de ejemplo y lógica
README.md
```

Las librerías de PDF (jsPDF y jspdf-autotable) y las fuentes se cargan desde CDN.

## Cómo modificar

- **Datos de ejemplo** (contratos, recursos, personal, habilitaciones, trabajos): en `index.html`, constantes `CONTRATOS`, `RECURSOS`, `CREW`, `EQ`, `HAB` y la función `seedTrabajos()`.
- **Reglas del parte**: función `checks(p)`.
- **Pantallas**: funciones `vPlan`, `vGantt`, `vWeek`, `vMonth`, `vDay`, `vEdit`, `vInbox` y `detail`.
- **PDF**: función `buildPdf(p)`.

Si cambiás la estructura de los datos, subí la versión en la constante `KEY` para que los navegadores no carguen datos viejos guardados.
