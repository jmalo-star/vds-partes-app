# VDS · Partes de campo

Web app de **Vientos del Sur** para gestionar los partes de servicio con las operadoras, pensada para usarse en una tablet de 11" en horizontal (y también desde la PC).

Circuito: **Planificación → Parte diario → Aprobación (planner) → Certificación con firma del cliente**.

> **Versión de evaluación.** Todavía no tiene servidor: los datos se guardan en el dispositivo (`localStorage`). Los usuarios son de prueba. Ver [Próximos pasos para producción](#próximos-pasos-para-producción).

## Usuarios de prueba

Clave para todos: `vds2026`. También se entra con un toque desde "Usuarios de prueba" en la pantalla de ingreso.

| Rol | Usuario | Qué hace |
|---|---|---|
| Administrador | `sherrera` | Ve y cambia todo, gestiona permisos y ve el registro de actividad |
| Planner con permisos de administración | `lmendez` | Planifica, aprueba partes y además puede corregir partes, habilitaciones y catálogos, y ver el registro |
| Planner | `jdiaz` | Planifica los trabajos (Gantt, por recurso, mes), aprueba o devuelve los partes y aprueba pedidos de más días |
| Operador | `darce` | Completa el parte diario en campo y cierra el trabajo |
| Cliente | `grivas` | Dashboard del servicio, exportación a Excel y certificación de partes con firma |

Con datos importados, el Operador pasa a ser el primero de la primera cuadrilla y el Cliente, el cliente con más contratos.

## Cómo está hecha

- **Sin pasos de compilación.** HTML, CSS y JavaScript estáticos: se sirven tal cual (Vercel o cualquier hosting estático).
- **Pantallas sin scroll.** La app se diseña sobre un lienzo de 800 px de alto (y al menos 1180 de ancho) y se escala para llenar la pantalla. En la tablet de 11" (2000 × 1200) cada pantalla entra entera; las listas largas (partes, registro) se desplazan dentro de su panel.
- **Instalable (PWA).** En la tablet, desde Chrome: menú ⋮ → *Agregar a la pantalla principal*. Abre a pantalla completa y en horizontal.
- **Funciona sin señal.** El service worker (`sw.js`) guarda la app, las fuentes y las librerías en la tablet. Lo que se carga sin señal queda guardado y se marca para sincronizar al volver.
- **Fecha real.** Los datos de ejemplo se generan alrededor de la fecha de hoy.
- **Clima real.** "Tomar clima actual" consulta [Open-Meteo](https://open-meteo.com) con la ubicación de la tablet (si se permite) o la de la base de Comodoro Rivadavia.
- **PDF y Excel** se generan en el dispositivo (jsPDF y SheetJS, que se cargan solo al exportar).
- **Modo diurno y nocturno**, a elección (se recuerda en cada dispositivo).

## Estructura

```
index.html            # contenedor de la app
manifest.webmanifest  # instalación como app (nombre, íconos, orientación)
sw.js                 # funcionamiento sin señal
vercel.json           # encabezados para Vercel
css/app.css           # estilos y temas
assets/img/           # fotos de la pantalla de ingreso y del operador
assets/icons/         # íconos de la app
js/
  config.js           # constantes, usuarios de prueba, íconos
  util.js             # textos, horas y fechas
  data.js             # catálogos activos y datos de ejemplo
  import.js           # importación de datos maestros y plantilla Excel
  state.js            # estado, almacenamiento y reglas del parte
  ui.js               # render, ingreso, menú, barra superior, componentes
  views-plan.js       # planificación (Gantt, recurso, mes), partes, habilitaciones
  views-parte.js      # operador: mi jornada y parte diario
  views-review.js     # aprobación, certificación y dashboard del cliente
  views-admin.js      # configuración y registro de actividad
  modals.js           # ventanas: planificación, resumen del parte, importación
  export.js           # PDF y Excel
  actions.js          # acciones de botones y formularios
  main.js             # eventos, escala de pantalla, conexión y arranque
```

Los scripts se cargan en ese orden y comparten el ámbito global.

## Qué incluye

- Planificación por contrato, centro de costo e imputación. Los contratos se listan agrupados por cliente y ordenados por número, uno por número.
- Personas y equipos de cada trabajo con desplegables de búsqueda: se escribe y se elige, con la habilitación de cada uno a la vista.
- Vistas Gantt, por recurso y mes, con ocupación y filtro por cliente y contrato. En el Gantt los trabajos se mueven y estiran arrastrando.
- Parte diario en 5 pasos (inicio, personal, equipos, tareas y tiempos, cierre), con controles automáticos, firma del jefe de cuadrilla, fotos y pedidos de más días.
- Aprobación del planner y certificación del cliente con firma, con el detalle del parte en pestañas.
- Dashboard del cliente con filtros y exportación a Excel.
- Registro de actividad con motivo obligatorio para los cambios de administración.
- Configuración en pestañas: datos maestros, contratos, cuadrillas, usuarios y permisos.

## Cargar los datos reales (datos maestros)

Los datos reales (clientes, contratos, centros de costo, imputaciones, ubicaciones, tareas, cuadrillas, personal, equipos y habilitaciones) **no se guardan en este repositorio**: se cargan en **Configuración → Datos maestros → Importar archivo** y quedan en el dispositivo de quien los importa.

Formatos:

- **Plantilla Excel** (`.xlsx`): una hoja por tabla. Se descarga desde el mismo panel con "Descargar plantilla Excel con los datos actuales" y trae instrucciones.
- **JSON** (todo opcional salvo `contratos`):
  - `clientes[]`: `codigo`, `nombre`, `supervisor`.
  - `contratos[]`: `numero_contrato` (un número por contrato), `cliente`, `descripcion`, `centros_costo` (lista `"30 - MANTENIMIENTO"`), `imputaciones` (`{codigo, descripcion}`), `ubicaciones`, `tareas` (`{nombre, unidad, equipo}`) y `equipos[]` (`categoria`, `interno`, `km`).
  - `personal_nominado[]`, `cuadrillas[]`, `habilitaciones_por_defecto`, `habilitaciones[]`, `responsables`, `metadatos.notas[]`.
  - Cualquier ítem puede llevar `"origen": "inventado"` para marcarlo como dato de prueba.

Si un contrato llega con dos números (`"1000001 / 1000002"`), la importación lo separa en dos contratos y avisa para revisar qué corresponde a cada uno.

Los archivos con datos reales están excluidos en `.gitignore` (`datos/`, `*maestros*.json`, `*datos_maestros*.xlsx`).

## Correrla localmente

Necesita un servidor (el service worker no funciona abriendo el archivo directo):

```bash
python -m http.server 8080
```

y abrir `http://localhost:8080`.

## Publicar

Cada push a `main` publica en Vercel; cada rama tiene su propia dirección de prueba. **En cada publicación subí `VERSION` en `sw.js`**: las tablets ven el aviso "Hay una versión nueva" y se actualizan con un toque.

## Próximos pasos para producción

1. **Servidor y base de datos** (por ejemplo Supabase o una API propia): usuarios reales, datos compartidos entre la tablet, la base y el cliente, y respaldo. El punto de cambio es `load()` / `save()` en `js/state.js`.
2. **Ingreso real** con el directorio de la empresa, reemplazando los usuarios de prueba de `js/config.js` (`EVAL=false` oculta los accesos de prueba).
3. **Sincronización**: cola de envíos sin señal contra el servidor (hoy se marca y se libera al volver la señal).
4. **Fotos y firmas** en un almacenamiento de archivos en lugar del dispositivo.
