-- VDS · Partes de campo — modelo de datos (PostgreSQL)
-- Módulo de partes diarios sobre la base común de VDS. Al día con la app v0.10.3.
-- Cuando un cambio de la app agrega o cambia un dato que se guarda, este archivo cambia en el mismo commit.
--
-- La base común (la que relaciona las otras plataformas) tiene socios, contratos, centros
-- de costo, imputaciones, personas, empleados, equipos, instalaciones y el control
-- documental. Este módulo no los duplica: los referencia. Los nombres de esas tablas son
-- los del diagrama de la base común y hay que ajustarlos a los definitivos.
--
-- Nombres de las claves
--   · Primero id y después la tabla en singular: id_parte, id_trabajo, id_contrato…
--   · Una clave foránea se llama igual que la clave primaria a la que apunta.
--   · Si una tabla apunta dos veces a la misma, el rol va al final:
--     id_empleado_supervisor e id_empleado_resp_tecnico apuntan las dos a empleados.
--   Las referencias a la base común no nombran la columna (references contratos): funcionan
--   aunque allá la clave primaria siga llamándose id (sección 6 g).
--
-- Claves que genera la tablet
--   parte, parte_tramo, parte_foto, pedido_extension y revision se crean en campo, muchas
--   veces sin señal: usan uuid, que la tablet genera sin pedirle un número a la base, y
--   reintentar una sincronización no duplica filas. El resto usa números de la base.
--
-- 23 tablas propias en 5 áreas: catálogos del módulo, planificación, parte diario,
-- novedades de liquidación y control.
-- Lo que se calcula (horas, km recorridos, producción, vencimientos, montos) no se guarda.

-- 0. Tablas de la base común que usa este módulo (no se crean acá)
--
--   socios                  id_socio · cuit · razon_social · es_cliente · supervisor_permisos (6 h)
--   contratos               id_contrato · codigo (6 h) · nro_contrato · id_socio_cliente · id_centro_costo
--                           · id_empleado_responsable · estado · fecha_inicio · fecha_fin
--   contrato_servicio       (a crear, 6 h) servicios de cada contrato
--   yacimiento_x_contratos  id_contrato · id_yacimiento
--   personal_x_contratos    id_contrato · id_empleado
--   centros_costos          id_centro_costo …
--   imputaciones            id_imputacion · valor · tipo · id_socio_cliente
--   personas                id_persona · cuil · nombre · apellido …
--   empleados               id_empleado · nro_legajo · id_persona · posicion …
--   dc_personal             id_persona (hoy cuil) · tipo · fecha_venc · cd_status · cd_activo_hasta …
--   dc_vehiculos            id_equipo (hoy patente) · tipo · fecha_venc · cd_status · cd_activo_hasta …
--   equipos                 (a crear, 6 e) madre de vehiculos, maquinaria, acoplados…
--   instalaciones           (a crear, 6 f) pozos, satélites, colectores, baterías, plantas
--
-- Ajustes que este módulo necesita en la base común: sección 6, al final.

create type rol_usuario        as enum ('admin','planner','operador','cliente');
create type prioridad          as enum ('urgente','alta','media','baja');
create type estado_trabajo     as enum ('abierto','cerrado');
create type estado_parte       as enum ('en_curso','para_aprobar','observado','para_certificar','certificado');
create type fin_dia            as enum ('continua','terminado','mas_dias');
create type categoria_tramo    as enum ('operativo','traslado','espera','viento','standby','refrigerio');
create type motivo_espera      as enum ('permiso_trabajo','responsable_operadora','tercero','almacen');
create type etapa_revision     as enum ('aprobacion_vds','certificacion_cliente');
create type resultado_revision as enum ('aprobado','observado');
create type estado_pedido      as enum ('pendiente','aprobado','rechazado');
create type tipo_responsable   as enum ('supervisor','resp_tecnico');
create type tipo_novedad       as enum ('liquidacion','ausencia');
-- unidades de las tareas: m³, m², m, t, km, viaje, maniobra, h, día, mes, unidad, punto (texto libre)

-- 1. Catálogos del módulo (lo que la base común no tiene)

create table cuadrilla (                            -- fila del Gantt; hoy salen del diagramador de personal
  id_cuadrilla serial primary key,
  codigo       text not null unique,                -- CU-01
  nombre       text not null,
  tipo         text not null default 'Cuadrilla'    -- cuadrilla, hidrogrúa, camión…
);

create table usuario (                              -- quién entra a la app de partes y con qué rol
  id_usuario         serial primary key,
  login              text not null unique,          -- de 3 a 20 letras o números, sin espacios
  rol                rol_usuario not null,
  cargo              text,                          -- lo que se ve debajo del nombre: Jefe · Cuadrilla 03
  permisos_admin     boolean not null default false,  -- planners con permisos de administración
  id_persona         int  not null references personas,  -- nombre, mail y teléfono vienen de la base común
  id_socio           int  references socios,        -- usuarios del cliente: a qué cliente pertenecen
  id_cuadrilla       int  references cuadrilla,     -- operadores: la cuadrilla que manejan
  clave_hash         text,                          -- solo la huella de la clave, nunca la clave; vacío con el
                                                    -- ingreso de Supabase Auth u otro directorio
  activo             boolean not null default true, -- desactivado: no entra, sus partes quedan
  id_usuario_creador int  references usuario,
  creado_en          timestamptz not null default now(),
  check (rol <> 'cliente'  or id_socio is not null),
  check (rol <> 'operador' or id_cuadrilla is not null),
  check (login ~ '^[a-z0-9._-]{3,20}$')
);

create table responsable (                          -- quiénes aparecen en las listas al planificar
  id_empleado int references empleados,
  tipo        tipo_responsable not null,            -- supervisor o responsable técnico
  primary key (id_empleado, tipo)
);

create table tarea (                                -- catálogo de tareas de cada contrato
  id_tarea          serial primary key,
  id_contrato       int  not null references contratos on delete cascade,
  nombre            text not null,                  -- como sale en el parte
  unidad            text,                           -- ver la lista de unidades arriba
  cantidad_defecto  numeric check (cantidad_defecto between 0 and 999999),  -- se propone al cargar el tramo
  tipo_equipo       text,                           -- mismo valor que equipos.tipo; null = cualquier equipo
  unique (id_contrato, nombre)
);

create table tarea_codigo_facturacion (             -- códigos de la lista de precios del cliente
  id_tarea           int  references tarea on delete cascade,
  codigo_facturacion text not null,                 -- dos códigos pueden ser la misma tarea en el parte
  primary key (id_tarea, codigo_facturacion)
);

create table cuadrilla_empleado (
  id_cuadrilla int references cuadrilla on delete cascade,
  id_empleado  int unique references empleados,     -- un empleado está en una sola cuadrilla;
  es_jefe      boolean not null default false,      -- los relevos quedan sin cuadrilla
  primary key (id_cuadrilla, id_empleado)
);

create table cuadrilla_equipo (
  id_cuadrilla int references cuadrilla on delete cascade,
  id_equipo    int unique references equipos,       -- un equipo está en una sola cuadrilla
  primary key (id_cuadrilla, id_equipo)
);

create table contrato_cuadrilla (                   -- un contrato sin filas acá habilita todas las cuadrillas
  id_contrato  int references contratos on delete cascade,
  id_cuadrilla int references cuadrilla on delete cascade,
  primary key (id_contrato, id_cuadrilla)
);

create table contrato_equipo (                      -- equipos que se ofrecen primero al planificar
  id_contrato int references contratos on delete cascade,
  id_equipo   int references equipos,
  primary key (id_contrato, id_equipo)
);

-- 2. Planificación

create table trabajo (
  id_trabajo               serial primary key,
  codigo                   text not null unique,    -- PL-201
  id_contrato              int  not null references contratos,
  id_imputacion            int  not null references imputaciones,
  id_centro_costo          int  not null references centros_costos,  -- uno de los del contrato
  id_cuadrilla             int  not null references cuadrilla,
  id_instalacion           int  references instalaciones,  -- elegida de la lista (con mapa)…
  ubicacion_texto          text,                    -- …o escrita a mano si no está en la lista
  fecha_inicio             date not null,
  dias                     int  not null check (dias between 1 and 60),
  orden_dia                smallint check (orden_dia between 1 and 5),  -- 1º, 2º… si la cuadrilla tiene varios trabajos el mismo día
  hora_inicio              time,                    -- guía para el operador; no limita la carga
  prioridad                prioridad not null default 'media',
  requiere_permiso         boolean not null default true,
  indicaciones             text,
  id_empleado_supervisor   int  references empleados,  -- de la lista de responsables; el parte
  id_empleado_resp_tecnico int  references empleados,  -- no se envía si falta alguno de los dos
  estado                   estado_trabajo not null default 'abierto',
  cerrado_en               timestamptz,             -- el parte que lo cerró es el de fin_dia = 'terminado'
  id_usuario_cierre        int references usuario,
  cierre_anticipado        boolean not null default false,  -- se cerró antes de los días planificados
  cierre_obs               text,
  id_usuario_creador       int references usuario,
  creado_en                timestamptz not null default now(),
  actualizado_en           timestamptz not null default now(),
  check (id_instalacion is not null or ubicacion_texto is not null)
);

create table trabajo_tarea (                        -- tareas previstas, en orden
  id_trabajo  int references trabajo on delete cascade,
  orden       smallint not null,
  id_tarea    int references tarea,                 -- vacío = "Otra tarea": el operador detalla qué hizo
  descripcion text,
  primary key (id_trabajo, orden)
);

create table trabajo_empleado (
  id_trabajo  int references trabajo on delete cascade,
  id_empleado int references empleados,
  primary key (id_trabajo, id_empleado)
);

create table trabajo_equipo (
  id_trabajo int references trabajo on delete cascade,
  id_equipo  int references equipos,
  primary key (id_trabajo, id_equipo)
);

-- 3. Parte diario

create table parte (
  id_parte          uuid primary key default gen_random_uuid(),   -- lo genera la tablet
  codigo            text unique,                    -- PD-0528: lo asigna la base al sincronizar
  id_trabajo        int  not null references trabajo,              -- sin cascade: un trabajo con partes no se borra
  fecha             date not null,
  estado            estado_parte not null default 'en_curso',
  id_empleado_jefe  int  not null references empleados,           -- quien carga y firma el parte
  id_imputacion     int  not null references imputaciones,        -- copiados del trabajo al iniciar el parte:
  id_centro_costo   int  not null references centros_costos,      -- si se edita el trabajo,
  id_instalacion    int  references instalaciones,                -- lo certificado no cambia
  ubicacion_texto   text,
  llegada           time,                           -- llegada a la instalación
  clima_hora        time,                           -- hora en que se tomó el clima
  clima_temp        numeric check (clima_temp between -30 and 50),
  clima_viento      numeric check (clima_viento between 0 and 150),    -- km/h
  clima_rafagas     numeric check (clima_rafagas between 0 and 150),   -- km/h
  clima_direccion   text,
  clima_condicion   text,
  clima_fuente      text,                           -- manual u Open-Meteo
  charla_seguridad  boolean not null default false,
  epp_verificado    boolean not null default false,
  permiso_numero    text,
  permiso_firmo     text,                           -- se propone el supervisor del cliente que firma permisos
  permiso_hora      time,
  observaciones     text,                           -- una sola por parte (incluye la del cierre)
  fin_dia           fin_dia not null default 'continua',
  firma_jefe        text,                           -- ruta del archivo de firma
  iniciado_en       timestamptz not null default now(),
  enviado_en        timestamptz,
  actualizado_en    timestamptz not null default now(),
  cargado_sin_senal boolean not null default false,
  unique (id_trabajo, fecha)                        -- un parte por trabajo y por día
);

create table parte_empleado (
  id_parte     uuid references parte on delete cascade,
  id_empleado  int  references empleados,
  funcion      text,                                -- lo que hizo ese día: jefe, chofer, operario…
  presente     boolean not null default true,
  hora_inicio  time,                                -- vacío = automático: llegada a la instalación
  hora_fin     time,                                -- vacío = automático: fin del último tramo en la locación
  es_reemplazo boolean not null default false,      -- se sumó en el parte
  primary key (id_parte, id_empleado)
);

create table parte_equipo (
  id_parte         uuid references parte on delete cascade,
  id_equipo        int  references equipos,
  km_actual        numeric check (km_actual between 0 and 9999999),         -- el recorrido se calcula
  horometro_actual numeric check (horometro_actual between 0 and 9999999),  -- horas de motor o de bomba
  observacion      text,                            -- obligatoria si el km es menor al último (cambio de tablero)
  primary key (id_parte, id_equipo)
);

create table parte_tramo (                          -- tareas y tiempos del día
  id_parte_tramo uuid primary key default gen_random_uuid(),
  id_parte       uuid not null references parte on delete cascade,
  categoria      categoria_tramo not null,
  desde          time not null,
  hasta          time not null,
  id_tarea       int  references tarea,             -- tramos operativos del catálogo
  descripcion    text,                              -- tarea fuera de catálogo o recorrido del traslado
  detalle        text,                              -- aclaración del tramo
  motivo_espera  motivo_espera,
  cantidad       numeric check (cantidad between 0 and 999999),
  unidad         text,
  rafaga_kmh     numeric check (rafaga_kmh between 0 and 150),  -- paradas por viento
  check (hasta > desde),
  check (categoria <> 'espera' or motivo_espera is not null),
  check (categoria <> 'operativo' or id_tarea is not null or descripcion is not null)
);

create table parte_foto (
  id_parte_foto uuid primary key default gen_random_uuid(),
  id_parte      uuid not null references parte on delete cascade,
  ruta          text not null,                      -- archivo en el almacenamiento de archivos
  descripcion   text,                               -- Foto 3 · 10:42
  tomada_en     timestamptz not null default now()
);

create table pedido_extension (                     -- el jefe pide más días desde el parte
  id_pedido_extension   uuid primary key default gen_random_uuid(),
  id_parte              uuid not null unique references parte,
  id_trabajo            int  not null references trabajo,
  dias                  smallint not null check (dias between 1 and 10),
  motivo                text not null,
  estado                estado_pedido not null default 'pendiente',
  pedido_en             timestamptz not null default now(),
  id_usuario_resolucion int references usuario,
  resuelto_en           timestamptz
);

-- 4. Novedades de liquidación (NLS). Internas: no salen en el PDF ni las ve el cliente.

create table novedad (                              -- catálogo del sistema de sueldos (CSV id;tabla_id;codigo;tipo)
  id_novedad int primary key,                       -- el id del sistema de sueldos, tal cual: no lo genera esta base
  codigo     text not null unique,                  -- escrito igual que en sueldos: MJO, VIANDA ADIC., VAC - AUS…
  tipo       tipo_novedad not null,                 -- tabla_id 8 = liquidación, 10 = ausencia
                                                    -- el archivo trae FALTA COMEDOR dos veces y LIB - AUS en las dos
                                                    -- tablas: queda una fila de cada una (LIB - AUS como ausencia)
  valor      numeric check (valor between 0 and 999999999)  -- $ de referencia para los tableros de NLS:
                                                    -- sin historial; cambiarlo recalcula los períodos anteriores
);

create table parte_empleado_novedad (               -- lo que carga planificación al aprobar, por persona
  id_parte          uuid,
  id_empleado       int,
  id_novedad        int  references novedad,
  id_usuario_carga  int  references usuario,
  cargada_en        timestamptz not null default now(),
  primary key (id_parte, id_empleado, id_novedad),
  foreign key (id_parte, id_empleado) references parte_empleado on delete cascade  -- la persona tiene que estar en el parte
);

-- 5. Control

create table revision (                             -- aprobación de VDS y certificación del cliente
  id_revision uuid primary key default gen_random_uuid(),
  id_parte    uuid not null references parte on delete cascade,
  etapa       etapa_revision not null,
  resultado   resultado_revision not null,
  id_usuario  int  not null references usuario,
  comentario  text,
  firma       text,                                 -- ruta del archivo de firma
  fecha       timestamptz not null default now(),
  check (resultado = 'aprobado' or comentario is not null),        -- devolver u observar pide comentario
  check (etapa <> 'certificacion_cliente' or resultado <> 'aprobado' or firma is not null)  -- certificar pide firma
);

create table registro_actividad (                   -- solo se inserta: no se edita ni se borra
  id_registro_actividad bigserial primary key,
  fecha                 timestamptz not null default now(),
  id_usuario            int references usuario,     -- vacío en ingresos fallidos
  rol                   rol_usuario,                -- el rol que tenía en ese momento
  usuario_texto         text,                       -- lo que se escribió al intentar ingresar
  tipo                  text not null,              -- ingreso, parte, trabajo, config, exportacion
  accion                text not null,              -- también trabajos eliminados y novedades cargadas o quitadas
  entidad               text,                       -- parte, trabajo, cuadrilla, usuario…
  id_entidad            text,
  detalle               text,
  motivo                text                        -- obligatorio en cambios de administración y al eliminar
);

-- Índices para las consultas de todos los días
create index on trabajo (id_cuadrilla, fecha_inicio);
create index on trabajo (id_contrato);
create index on trabajo (id_instalacion);
create index on parte (estado);
create index on parte (fecha);
create index on parte_empleado (id_empleado);
create index on parte_equipo (id_equipo);
create index on parte_tramo (id_parte);
create index on parte_foto (id_parte);
create index on parte_empleado_novedad (id_novedad);
create index on revision (id_parte);
create index on registro_actividad (fecha desc);
create unique index on pedido_extension (id_trabajo) where estado = 'pendiente';  -- un pedido abierto por trabajo

-- Reglas que controla la app y no estas tablas (dependen de varias filas o de quién mira)
--   · Si dos trabajos de la cuadrilla comparten día y tienen orden y hora, el de orden mayor
--     empieza más tarde.
--   · Un trabajo solo se elimina si no tiene partes (lo asegura id_trabajo sin cascade) y con motivo.
--   · El operador puede corregir un parte enviado hoy; uno aprobado o certificado no se edita.
--   · El km de un equipo no puede ser menor al último registrado salvo con observación.
--   · Una habilitación vencida o sin dato es un aviso interno: no bloquea el parte ni sale en el PDF.
--   · Las novedades, las habilitaciones y los avisos internos no los ve el cliente (permisos por rol).

-- 6. Ajustes sugeridos en la base común
--    A acordar con quien la administra. Están comentados: este archivo no los ejecuta.
--
-- a) Números que no entran en int (máximo 2.147.483.647): los números de contrato de las
--    operadoras tienen 10 dígitos y CUIT y CUIL tienen 11. Como texto, además, se admiten
--    números provisorios y no se pierde el formato. El CUIL tiene que ser único.
--      alter table contratos alter column nro_contrato type text;
--      alter table socios    alter column cuit         type text;
--      alter table personas  alter column cuil         type text;   -- y unique
--
-- b) Un contrato puede tener más de un centro de costo; al planificar se elige cuál usar.
--    La columna del contrato puede quedar como el principal, y los demás en una tabla de relación:
--      create table contratos_centros_costos (
--        id_contrato     int references contratos on delete cascade,
--        id_centro_costo int references centros_costos,
--        principal       boolean not null default false,
--        primary key (id_contrato, id_centro_costo));
--
-- c) Las imputaciones son de cada contrato, no solo del cliente. Vacío = sirve para todos
--    los contratos del cliente:
--      alter table imputaciones add column id_contrato int references contratos;
--
-- d) Las habilitaciones de ingreso las da cada operadora y vencen por separado. En el
--    control documental hace falta saber de qué cliente es cada una:
--      alter table dc_personal  add column id_socio int references socios;  -- vacío = documento general
--      alter table dc_vehiculos add column id_socio int references socios;
--    (otra opción: un tipo de documento por cliente, 'habilitacion cliente A', 'habilitacion cliente B')
--
-- e) Una tabla madre para todos los equipos. Vehículos, maquinaria, acoplados y vehículos
--    especializados comparten la clave; el parte, los contratos y el control documental
--    apuntan a "un equipo" sin importar la clase. La maquinaria puede no tener patente:
--    el control documental se engancha por id_equipo. Con la misma idea que
--    personal_x_contratos, contrato_equipo puede pasar a la base común.
--      create table equipos (
--        id_equipo   serial primary key,
--        nro_interno text not null unique,
--        clase       text not null,               -- vehiculo, maquinaria, acoplado, especializado
--        tipo        text,                        -- el tipo_vehiculo de hoy: camión cisterna, hidrogrúa…
--        patente     text unique);
--      vehiculos.id_equipo, maquinaria.id_equipo, acoplados.id_equipo… references equipos
--
-- f) Una tabla de instalaciones con tipo, en lugar de una tabla por tipo. El trabajo apunta
--    a "dónde se trabajó" sin importar si es un pozo o una batería, y un tipo nuevo es un
--    valor nuevo, no una tabla nueva. Hoy la app las toma de los listados de pozos e
--    instalaciones de la Secretaría de Energía, con coordenadas para abrirlas en el mapa.
--      create table instalaciones (
--        id_instalacion       serial primary key,
--        codigo_origen        text unique,        -- id del listado de origen
--        tipo                 text not null,      -- pozo, satélite, colector, colector auxiliar, batería,
--                                                 -- planta, planta inyectora, planta de polímeros…
--        nombre               text not null,      -- sigla del pozo o nombre de la instalación
--        estado               text,               -- pozos: activo, inactivo, abandonado
--        id_area              int references areas,          -- área → yacimiento → cuenca
--        id_socio_operadora   int references socios,         -- con qué cliente se busca al planificar
--        id_instalacion_padre int references instalaciones,  -- opcional: a qué satélite, colector o batería va
--        lat                  numeric not null,   -- para el mapa, el "Cómo llegar" y el clima del parte
--        lon                  numeric not null,
--        unique (id_area, tipo, nombre));
--
-- g) El mismo criterio de nombres en la base común. Hoy las claves primarias se llaman id y
--    varias foráneas no dicen a qué tabla apuntan:
--      socios.id → id_socio            contratos.id → id_contrato       personas.id → id_persona
--      empleados.id → id_empleado      imputaciones.id → id_imputacion  gremios.id → id_gremio
--      centros_costos.id → id_centro_costo
--      contratos.cliente          → id_socio_cliente
--      contratos.centro_de_costos → id_centro_costo
--      contratos.personal         → id_empleado_responsable
--      imputaciones.cliente       → id_socio_cliente
--      empleados.persona          → id_persona
--      empleados.gremio           → id_gremio
--      empleados.manager          → id_empleado_manager
--      dc_personal.cuil           → id_persona   (el CUIL queda como dato para cruzar con la plataforma)
--      dc_vehiculos.patente       → id_equipo    (ver e)
--
-- h) Datos del contrato y del cliente que la app ya usa:
--      alter table contratos add column codigo text unique;   -- ID de VDS: CT-PAE-001, no cambia
--      -- nro_contrato es el nº del cliente (sale en partes y certificaciones) y puede faltar;
--      -- fecha_fin es la vigencia; personal es el responsable VDS del contrato.
--      create table contrato_servicio (
--        id_contrato int references contratos on delete cascade,
--        servicio    text not null,
--        primary key (id_contrato, servicio));
--      alter table socios add column supervisor_permisos text;  -- quién firma los permisos de trabajo
