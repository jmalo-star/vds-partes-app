# VDS · Partes de campo

Prototipo navegable de la app de tablet de **Vientos del Sur** para gestionar partes de servicio con las operadoras.

Circuito: **Planificación → Parte diario → Aprobación (planner) → Certificación con firma del cliente**.

> Es un prototipo de interfaz: no tiene backend. Los datos son de ejemplo y se guardan en el navegador (`localStorage`). El botón "Reiniciar demo" vuelve a los datos iniciales.

## Usuarios de prueba

Clave para todos: `vds2026`

| Rol | Usuario | Qué hace |
|---|---|---|
| Administrador | `sherrera` | Ve y cambia todo: trabajos, estados de partes, habilitaciones, imputaciones y catálogo de tareas |
| Planner | `lmendez` | Planifica los trabajos (Gantt, por recurso, mes), aprueba o devuelve los partes y aprueba pedidos de más días |
| Operador | `darce` | Completa el parte diario en campo (Cuadrilla 03) y cierra el trabajo |
| Cliente | `grivas` | Austral Petróleo: dashboard del servicio y certificación de partes con firma |

## Qué incluye

- **Planificación por contrato e imputación**: el contrato define cliente, centro de costos, recursos y catálogo de tareas. Cada contrato puede tener varias imputaciones de cuenta del cliente, y el trabajo se carga en una.
- **Personas y equipos por separado** en cada trabajo, con su habilitación de ingreso al yacimiento y aviso si ya están asignados a otro trabajo esas fechas.
- Indicador de si el trabajo requiere permiso de trabajo firmado por el supervisor de la operadora.
- Vistas Gantt, calendario por recurso y calendario mensual, con ocupación en % y **filtro por cliente y contrato**.
- Trabajos de varios días: un parte por día. El último día (o antes, si se terminó) el jefe de cuadrilla hace el cierre total. Si necesita más días, lo pide desde el parte y el planner lo aprueba.
- En el Gantt los trabajos se estiran, acortan o mueven arrastrando la barra.
- Parte diario estándar en 5 pasos: inicio (llegada a instalación, permiso, clima y checklist), personal (ingreso a base, llegada a zona y salida), equipos (km actual y observación), tareas y tiempos en una sola hoja, y cierre.
- Tareas y tiempos: operativo, traslado, espera de operadora (con motivo: permiso de trabajo, responsable operadora, espera de un tercero, almacén), parada por viento (con velocidad en km/h), standby y refrigerio.
- Controles automáticos: los bloqueantes impiden enviar; las tareas no realizadas o los km faltantes son alertas que dejan continuar.
- Aprobación de partes por el planner, con filtro por cliente.
- Certificación del cliente con firma en pantalla.
- Dashboard del cliente con filtros por contrato e imputación: horas hombre, tiempos, horas por imputación, esperas por motivo, producción, recursos y estado de partes y trabajos.
- Listado de partes con filtros por cliente, contrato, recurso, estado y búsqueda.
- Habilitaciones con búsqueda y filtro de vencidas o por vencer.
- Resumen del parte y descarga en PDF.
- Menú lateral que se contrae.
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

- **Datos de ejemplo** (contratos con imputaciones, recursos, personal, equipos, habilitaciones, trabajos): en `index.html`, constantes `CONTRATOS0`, `RECURSOS`, `CREW`, `EQ` y las funciones `seedHab()` y `seedTrabajos()`.
- **Categorías de tiempo y motivos de espera**: constantes `TCAT` y `ESP`.
- **Reglas del parte**: función `checks(p)`.
- **Pantallas**: funciones `vPlan`, `vGantt`, `vWeek`, `vMonth`, `vDay`, `vEdit`, `vInbox`, `detail`, `vDash` y `vConf`.
- **PDF**: función `buildPdf(p)`.

Si cambiás la estructura de los datos, subí la versión en la constante `KEY` para que los navegadores no carguen datos viejos guardados.
