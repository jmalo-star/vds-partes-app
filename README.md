# VDS · Partes de campo

Prototipo navegable de la app de tablet de **Vientos del Sur** para gestionar partes de servicio con las operadoras.

Circuito: **Planificación → Parte diario → Aprobación (planner) → Certificación con firma del cliente**.

> Es un prototipo de interfaz: no tiene backend. Los datos son de ejemplo y se guardan en el navegador (`localStorage`). El botón "Reiniciar demo" vuelve a los datos iniciales.

## Usuarios de prueba

Clave para todos: `vds2026`

| Rol | Usuario | Qué hace |
|---|---|---|
| Administrador | `sherrera` | Ve y cambia todo, gestiona permisos y ve el registro de actividad |
| Planner con permisos de administración | `lmendez` | Planifica, aprueba partes y además puede corregir partes, habilitaciones y catálogos, y ver el registro |
| Planner | `jdiaz` | Planifica los trabajos (Gantt, por recurso, mes), aprueba o devuelve los partes y aprueba pedidos de más días |
| Operador | `darce` | Completa el parte diario en campo (Cuadrilla 03) y cierra el trabajo |
| Cliente | `grivas` | Austral Petróleo: dashboard del servicio, exportación a Excel y certificación de partes con firma |

Los permisos de administración de cada planner se activan o quitan en **Configuración → Usuarios y permisos**.

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
- Horarios en pasos de 5 minutos (hora y minutos por separado).
- El permiso de trabajo marcado como firmado se puede deshacer.
- Dashboard del cliente con filtros por contrato, imputación y rango de fechas: horas hombre, tiempos, horas por imputación, esperas por motivo, producción, recursos y estado de partes y trabajos.
- Exportación a Excel del dashboard con los filtros aplicados: hojas de resumen, partes, producción, tiempos, personal y equipos.
- Registro de actividad: ingresos (incluidos los fallidos), cambios en partes, trabajos, habilitaciones, catálogos y permisos, y exportaciones. Toda modificación hecha con permisos de administración pide un motivo, que queda en el registro y en el historial del parte o trabajo. Se puede filtrar y exportar a Excel.
- Listado de partes con filtros por cliente, contrato, recurso, estado y búsqueda.
- Habilitaciones con búsqueda y filtro de vencidas o por vencer.
- Resumen del parte y descarga en PDF.
- Menú lateral que se contrae.
- Modo sin señal simulado.

## Cargar los datos reales (datos maestros)

La app arranca con datos de ejemplo. Los datos reales de la empresa (clientes, contratos, centros de costo, imputaciones, ubicaciones, tareas, cuadrillas, personal, equipos y habilitaciones) **no se guardan en este repositorio**: se cargan desde un archivo en **Configuración → Datos maestros → Importar archivo**, y quedan guardados solo en el navegador de quien los importa.

Formatos aceptados:

- **Plantilla Excel** (`.xlsx`): una hoja por tabla (Clientes, Contratos, Centros de costo, Imputaciones, Ubicaciones, Tareas, Equipos, Personal, Cuadrillas, Habilitaciones, Responsables). Se descarga desde el mismo panel con "Descargar plantilla Excel con los datos actuales" y trae instrucciones.
- **JSON** con esta estructura (todo es opcional salvo `contratos`):
  - `clientes[]`: `codigo`, `nombre`, `supervisor`.
  - `contratos[]`: `numero_contrato`, `cliente` (código o nombre), `descripcion`, `centros_costo` (lista `"30 - MANTENIMIENTO"`; también acepta `centro_costo`), `imputaciones`, `ubicaciones`, `tareas` (texto, o `{nombre, unidad, equipo}` donde `equipo` es la categoría de equipo que la hace) y `equipos[]` (`categoria`, `interno`, `km`).
  - `personal_nominado[]`: `nombre`, `rol`, `legajo`.
  - `cuadrillas[]`: `codigo`, `nombre`, `personal[]`, `equipos[]` (internos), `contratos[]`.
  - `habilitaciones_por_defecto` (`vence`, se aplica a cada persona y equipo para los clientes de sus contratos) y `habilitaciones[]` (`sujeto`, `cliente`, `vence`) para las excepciones.
  - `responsables`: `supervisores[]` y `tecnicos[]`.
  - `metadatos.notas[]`: se muestran como avisos al importar.
  - Cualquier tarea, ubicación, equipo, persona o cuadrilla puede llevar `"origen": "inventado"`: se marca con la etiqueta "inventado" en Configuración para no confundirlo con datos reales.

Un contrato puede tener varios centros de costo: al planificar se elige cuál usar, y la app propone el que coincide con el nombre de la cuadrilla (por ejemplo, Cuadrilla Mantenimiento → 30 - MANTENIMIENTO). El centro de costo queda en el trabajo, en cada parte, en el PDF y en el Excel.

Antes de aplicar, la app muestra un resumen y avisa de lo que hay que revisar: contratos con dos números, imputaciones que no parecen códigos, tareas sin unidad, legajos que coinciden con internos de equipos, semis compartidos, cuadrillas sin personal, etc. Si el archivo no trae cuadrillas, crea una provisoria por contrato. Si no trae habilitaciones, se muestran como "Sin dato" y no bloquean el parte.

Al aplicar se genera una planificación de ejemplo sobre esos datos para probar los flujos. El usuario Operador pasa a ser el primero de la primera cuadrilla, y el Cliente, el cliente con más contratos. "Reiniciar demo" la vuelve a generar sin perder los datos importados; "Volver a los datos de ejemplo" vuelve al estado inicial.

Los archivos con datos reales están excluidos en `.gitignore` (`datos/`, `*maestros*.json`, `*datos_maestros*.xlsx`).

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

Las librerías de PDF (jsPDF y jspdf-autotable), de Excel (SheetJS) y las fuentes se cargan desde CDN.

## Cómo modificar

- **Datos de ejemplo** (contratos con imputaciones, cuadrillas, personal, equipos, habilitaciones, trabajos): en `index.html`, constantes `CONTRATOS0`, `D_RECURSOS`, `D_CREW`, `D_EQ` y las funciones `demoCat()`, `seedHab()` y `seedTrabajos()`.
- **Catálogos activos**: `S.cat` y `S.contratos`; `applyCat()` arma las listas que usa la app.
- **Importación**: `fromJson()`, `fromXlsx()`, `finishCat()` (validaciones) y `templateBlob()` (plantilla Excel).
- **Categorías de tiempo y motivos de espera**: constantes `TCAT` y `ESP`.
- **Reglas del parte**: función `checks(p)`.
- **Pantallas**: funciones `vPlan`, `vGantt`, `vWeek`, `vMonth`, `vDay`, `vEdit`, `vInbox`, `detail`, `vDash` y `vConf`.
- **PDF**: función `buildPdf(p)`.
- **Excel**: funciones `exportDash()` y `exportLog()`.
- **Usuarios y permisos**: constante `USERS` y `S.adm` (qué planners tienen permisos de administración).
- **Registro de actividad**: función `logA(...)` para registrar un evento y `vLog()` para la pantalla.

Si cambiás la estructura de los datos, subí la versión en la constante `KEY` para que los navegadores no carguen datos viejos guardados.
