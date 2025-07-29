# ESPECIFICACIÓN TÉCNICA: PLATAFORMA DE GESTIÓN DE EVENTOS SOCIALES

## 1. VISIÓN DEL PRODUCTO

### Objetivo Principal
Crear una plataforma de tecnología de punta para la gestión integral de eventos sociales, basada en microservicios, con transparencia económica total y experiencia de usuario excepcional.

### Principios Fundamentales
- **Transparencia Económica**: Cada costo debe ser justificado y visible
- **Arquitectura de Microservicios**: Servicios independientes y escalables
- **Multi-plataforma**: Web, móvil (Android/iOS), escritorio
- **UI/UX Excepcional**: Interfaces intuitivas y atractivas
- **Solo Servicios Reales**: No simulaciones ni ejemplos

## 2. ARQUITECTURA GENERAL DEL SISTEMA

### 2.1 Microservicios Identificados

```mermaid
graph TB
    subgraph "Cliente Frontend"
        WEB[Web App - Clientes]
        MOBILE[Mobile App - iOS/Android]
        DESKTOP[Desktop App - Proveedores]
    end
    
    subgraph "API Gateway"
        GATEWAY[API Gateway + Load Balancer]
    end
    
    subgraph "Microservicios Core"
        AUTH[Servicio de Autenticación]
        USER[Gestión de Usuarios]
        EVENT[Gestión de Eventos]
        PROVIDER[Gestión de Proveedores]
        CATALOG[Catálogo de Servicios]
        QUOTE[Sistema de Cotizaciones]
        PAYMENT[Procesamiento de Pagos]
        NOTIFICATION[Notificaciones]
        MESSAGING[Mensajería]
        REVIEW[Reseñas y Calificaciones]
        GUEST[Gestión de Invitados]
        ITINERARY[Itinerarios y Horarios]
    end
    
    subgraph "Servicios de Apoyo"
        COST[Cálculo de Costos]
        ANALYTICS[Analytics y Reportes]
        FILE[Gestión de Archivos]
        LOCATION[Geolocalización y Mapas]
        LOGISTICS[Cálculo Logístico]
        GENEALOGY[Árbol Genealógico]
    end
    
    subgraph "Bases de Datos Aisladas"
        DB_AUTH[(DB Autenticación)]
        DB_USER[(DB Usuarios)]
        DB_EVENT[(DB Eventos)]
        DB_PROVIDER[(DB Proveedores)]
        DB_CATALOG[(DB Catálogo)]
        DB_FINANCIAL[(DB Financiero)]
        DB_GUEST[(DB Invitados)]
        DB_LOGISTICS[(DB Logística)]
    end
    
    WEB --> GATEWAY
    MOBILE --> GATEWAY
    DESKTOP --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> USER
    GATEWAY --> EVENT
    GATEWAY --> PROVIDER
    GATEWAY --> CATALOG
    GATEWAY --> QUOTE
    GATEWAY --> PAYMENT
    GATEWAY --> NOTIFICATION
    GATEWAY --> MESSAGING
    GATEWAY --> REVIEW
    GATEWAY --> GUEST
    GATEWAY --> ITINERARY
    
    AUTH --> DB_AUTH
    USER --> DB_USER
    EVENT --> DB_EVENT
    PROVIDER --> DB_PROVIDER
    CATALOG --> DB_CATALOG
    QUOTE --> DB_FINANCIAL
    PAYMENT --> DB_FINANCIAL
    GUEST --> DB_GUEST
    ITINERARY --> DB_LOGISTICS
    LOCATION --> DB_LOGISTICS
    LOGISTICS --> DB_LOGISTICS
```

### 2.2 Stack Tecnológico Propuesto

**Backend Microservicios:**
- Node.js con TypeScript / .NET Core / Go
- Framework: Express.js / FastAPI / Gin
- Base de datos: PostgreSQL por microservicio
- Cache: Redis
- Message Queue: RabbitMQ / Apache Kafka

**Frontend:**
- Web: React.js / Vue.js con TypeScript
- Mobile: React Native / Flutter con SQLite local
- Desktop: Electron / Tauri
- Offline-First: Redux Persist / Zustand con sincronización

**Infraestructura:**
- Contenedores: Docker + Kubernetes
- API Gateway: Kong / Nginx
- Monitoreo: Prometheus + Grafana
- Logs: ELK Stack
- Sincronización: WebSockets + Queue de eventos
- Cache Local: SQLite + IndexedDB

## 3. ENTIDADES PRINCIPALES Y RELACIONES

### 3.1 Diagrama de Entidades

```mermaid
erDiagram
    USUARIO {
        uuid id PK
        string correo_electronico UK
        string hash_contrasena
        string primer_nombre
        string apellido_paterno
        string telefono
        string imagen_perfil
        enum tipo_usuario
        json autenticacion_social
        timestamp fecha_creacion
        timestamp fecha_actualizacion
        boolean esta_activo
    }
    
    CLIENTE {
        uuid id PK
        uuid usuario_id FK
        string nombre_empresa
        json preferencias
        json informacion_facturacion
    }
    
    PROVEEDOR {
        uuid id PK
        uuid usuario_id FK
        string nombre_negocio
        string licencia_comercial
        string numero_fiscal
        json informacion_negocio
        decimal calificacion
        int total_resenas
        enum estatus_verificacion
        json portafolio
        json ubicacion_negocio
        boolean es_multiservicios
        json tipos_costo_persona
    }
    
    EVENTO {
        uuid id PK
        uuid cliente_id FK
        string nombre
        text descripcion
        datetime fecha_inicio
        datetime fecha_fin
        int invitados_estimados
        decimal presupuesto_minimo
        decimal presupuesto_maximo
        enum tipo_evento
        enum estatus
        json requerimientos
        json festejados_principales
        json configuracion_privacidad
        timestamp fecha_creacion
    }
    
    ETAPA_EVENTO {
        uuid id PK
        uuid evento_id FK
        string nombre
        text descripcion
        enum tipo_etapa
        int orden_secuencia
        boolean esta_activa
    }
    
    UBICACION_EVENTO {
        uuid id PK
        uuid etapa_evento_id FK
        string nombre
        string direccion
        decimal latitud
        decimal longitud
        json datos_mapa
        datetime hora_inicio
        datetime hora_fin
        json instalaciones
        json instrucciones_acceso
        json diseno_salon
        int capacidad_maxima
    }
    
    CATEGORIA_SERVICIO {
        uuid id PK
        string nombre
        string descripcion
        string icono
        int orden_clasificacion
        boolean esta_activa
    }
    
    SERVICIO {
        uuid id PK
        uuid proveedor_id FK
        uuid categoria_id FK
        uuid cliente_creador_id FK
        string nombre
        text descripcion
        json modelo_precios
        json disponibilidad
        json imagenes_portafolio
        json especificaciones
        boolean esta_activo
        boolean tiene_productos
        boolean es_personalizado
        enum tipo_costo
    }
    
    PRODUCTO {
        uuid id PK
        uuid servicio_id FK
        uuid proveedor_suministro_id FK
        string nombre
        text descripcion
        decimal costo_base
        decimal porcentaje_ganancia
        json especificaciones
        string unidad_medida
        int cantidad_inventario
        boolean esta_activo
        json escala_costo_persona
    }
    
    PROVEEDOR_SUMINISTRO {
        uuid id PK
        uuid proveedor_id FK
        string nombre
        string informacion_contacto
        json direccion
        json terminos_condiciones
        decimal calificacion
    }
    
    ITINERARIO {
        uuid id PK
        uuid ubicacion_evento_id FK
        uuid servicio_id FK
        string nombre_actividad
        text descripcion
        datetime hora_inicio
        datetime hora_fin
        json participantes
        json requerimientos
        enum estatus
        int orden_prioridad
    }
    
    INVITADO {
        uuid id PK
        uuid evento_id FK
        string primer_nombre
        string apellido_paterno
        string correo_electronico
        string telefono
        json direccion
        enum estatus_invitacion
        enum estatus_asistencia
        json restricciones_dieteticas
        json necesidades_especiales
        json perfil_social
        enum tipo_mencion_honor
        uuid mesa_asignada_id FK
        int puntuacion_proximidad_social
        timestamp fecha_invitacion
        timestamp fecha_respuesta
    }
    
    COLABORADOR_EVENTO {
        uuid id PK
        uuid evento_id FK
        uuid usuario_id FK
        enum tipo_rol
        json permisos
        enum estatus_colaboracion
        timestamp fecha_invitacion
        timestamp fecha_aceptacion
        boolean es_propietario
    }
    
    ASIGNACION_MESA {
        uuid id PK
        uuid ubicacion_evento_id FK
        string nombre_mesa
        int capacidad
        json posicion_mesa
        json invitados_asignados
        decimal puntuacion_cohesion_social
        enum tipo_mesa
        json configuracion_visual
    }
    
    PLANTILLA_COTIZACION {
        uuid id PK
        uuid proveedor_id FK
        string nombre_plantilla
        enum tipo_evento
        int minimo_invitados
        int maximo_invitados
        json conceptos_preconfigurados
        json estructura_precios
        boolean esta_activa
        timestamp fecha_creacion
    }
    
    COLA_SINCRONIZACION {
        uuid id PK
        uuid usuario_id FK
        string tipo_entidad
        uuid entidad_id
        enum tipo_accion
        json datos_carga
        enum estatus_sincronizacion
        timestamp fecha_creacion
        timestamp fecha_sincronizacion
        int contador_reintentos
    }
    
    PARENTESCO_FAMILIAR {
        uuid id PK
        uuid invitado_id FK
        uuid festejado_id FK
        enum tipo_parentesco
        string descripcion_parentesco
        string relacion_detallada
        int nivel_generacional
        enum lado_familia
        json arbol_genealogico_posicion
        boolean es_visible_proveedor
    }
    
    INVITACION_DIGITAL {
        uuid id PK
        uuid evento_id FK
        string titulo
        text mensaje_personalizado
        json diseno_plantilla
        json informacion_publica
        json informacion_privada
        string enlace_web
        string ruta_pdf
        json configuracion_privacidad
        timestamp fecha_creacion
    }
    
    HISTORIAL_PAGOS {
        uuid id PK
        uuid contrato_id FK
        decimal monto
        enum metodo_pago
        enum estatus_pago
        string referencia_transaccion
        timestamp fecha_pago
        json comprobante_pago
    }
    
    EVIDENCIA_ETAPA {
        uuid id PK
        uuid contrato_id FK
        uuid etapa_evento_id FK
        string titulo
        text descripcion
        json archivos_multimedia
        enum tipo_evidencia
        timestamp fecha_subida
        uuid usuario_subida_id FK
    }
    
    FICHA_TECNICA_PROVEEDOR {
        uuid id PK
        uuid proveedor_id FK
        json experiencia_anos
        json certificaciones
        json trabajos_anteriores
        json galeria_proyectos
        json especialidades
        json areas_cobertura
        timestamp fecha_actualizacion
    }
    
    REPORTE_PERSONALIZADO {
        uuid id PK
        uuid evento_id FK
        uuid usuario_generador_id FK
        string nombre_reporte
        json configuracion_datos
        json filtros_aplicados
        enum formato_exportacion
        timestamp fecha_generacion
        string ruta_archivo
    }
    
    AYUDA_ECONOMICA {
        uuid id PK
        uuid evento_id FK
        uuid donante_id FK
        uuid beneficiario_id FK
        string nombre_donante
        string email_donante
        decimal monto_ayuda
        string concepto_ayuda
        json servicios_asignados
        enum tipo_donante
        enum estatus_pago
        timestamp fecha_donacion
        boolean es_anonimo
    }
    
    ACCESO_PUBLICO {
        uuid id PK
        uuid evento_id FK
        string token_acceso
        json configuracion_privacidad
        json secciones_visibles
        enum nivel_acceso
        int visitas_contador
        timestamp fecha_creacion
        timestamp fecha_expiracion
    }
    
    AUTOCOTIZACION {
        uuid id PK
        uuid servicio_id FK
        uuid cliente_id FK
        json configuracion_paquete
        json parametros_personalizados
        decimal precio_calculado
        json desglose_automatico
        datetime fecha_evento
        int numero_invitados
        enum estatus_cotizacion
        timestamp fecha_generacion
    }
    
    DISPONIBILIDAD_TIEMPO_REAL {
        uuid id PK
        uuid proveedor_id FK
        datetime fecha_hora_inicio
        datetime fecha_hora_fin
        enum estatus_disponibilidad
        uuid evento_reservado_id FK
        json ubicacion_compromiso
        decimal distancia_evento_anterior
        int tiempo_traslado_minutos
        decimal costo_traslado
    }
    
    MATRIZ_SERVICIOS_EVENTO {
        uuid id PK
        enum tipo_evento
        uuid categoria_servicio_id FK
        string nombre_servicio
        enum prioridad_servicio
        boolean es_obligatorio
        boolean es_opcional
        json alternativas_sugeridas
        int orden_recomendado
    }
    
    ESTADO_PREPARATIVO {
        uuid id PK
        uuid evento_id FK
        uuid matriz_servicio_id FK
        enum estatus_servicio
        string notas_estado
        uuid responsable_id FK
        timestamp fecha_confirmacion
        json detalles_cumplimiento
        boolean requiere_seguimiento
    }
    
    CALIFICACION_BIDIRECCIONAL {
        uuid id PK
        uuid contrato_id FK
        uuid calificador_id FK
        uuid calificado_id FK
        enum tipo_calificador
        int puntuacion
        text comentario
        json criterios_evaluacion
        timestamp fecha_calificacion
        boolean es_publica
    }
    
    CONVERSACION {
        uuid id PK
        uuid evento_id FK
        uuid iniciador_id FK
        uuid destinatario_id FK
        string asunto
        enum tipo_conversacion
        enum estatus_conversacion
        timestamp fecha_inicio
        timestamp ultima_actividad
    }
    
    MENSAJE {
        uuid id PK
        uuid conversacion_id FK
        uuid remitente_id FK
        text contenido_mensaje
        json archivos_adjuntos
        enum tipo_mensaje
        timestamp fecha_envio
        timestamp fecha_lectura
        boolean es_sistema
    }
    
    NOTIFICACION_PERSONALIZADA {
        uuid id PK
        uuid evento_id FK
        uuid remitente_id FK
        json destinatarios_lista
        string titulo_notificacion
        text mensaje_contenido
        json configuracion_envio
        enum tipo_notificacion
        enum canal_envio
        timestamp fecha_programada
        timestamp fecha_enviada
        json estadisticas_entrega
    }
    
    PAGINA_PUBLICA_PROVEEDOR {
        uuid id PK
        uuid proveedor_id FK
        string url_personalizada
        json configuracion_diseno
        json servicios_destacados
        json galeria_trabajos
        json informacion_contacto
        json testimonios_clientes
        boolean esta_activa
        int visitas_totales
        timestamp fecha_actualizacion
    }
    
    SESION_CHATBOT {
        uuid id PK
        uuid usuario_id FK
        string sesion_token
        json historial_conversacion
        json contexto_actual
        enum idioma_preferido
        timestamp fecha_inicio
        timestamp ultima_interaccion
        boolean sesion_activa
    }
    
    FORMULARIO_DINAMICO {
        uuid id PK
        uuid proveedor_id FK
        uuid servicio_id FK
        string nombre_formulario
        json estructura_campos
        json reglas_validacion
        enum momento_aplicacion
        boolean es_obligatorio
        timestamp fecha_creacion
        boolean esta_activo
    }
    
    RESPUESTA_FORMULARIO {
        uuid id PK
        uuid formulario_dinamico_id FK
        uuid evento_id FK
        uuid usuario_respuesta_id FK
        json respuestas_datos
        enum estatus_completado
        timestamp fecha_respuesta
        timestamp fecha_actualizacion
    }
    
    SOLICITUD_INFORMACION {
        uuid id PK
        uuid proveedor_id FK
        uuid evento_id FK
        string tipo_informacion_solicitada
        text descripcion_solicitud
        json campos_especificos
        enum prioridad_solicitud
        enum estatus_respuesta
        timestamp fecha_solicitud
        timestamp fecha_limite
        uuid colaborador_asignado_id FK
    }
    
    PREFERENCIAS_PERSONALIZADAS {
        uuid id PK
        uuid evento_id FK
        uuid servicio_id FK
        uuid usuario_id FK
        json preferencias_datos
        json restricciones_datos
        json sugerencias_especiales
        timestamp fecha_captura
        boolean aplicado_automaticamente
    }
    
    CALCULADORA_CONSUMO_DIY {
        uuid id PK
        uuid evento_id FK
        enum tipo_consumo
        int total_invitados
        int invitados_adultos
        int invitados_ninos
        int invitados_adolescentes
        decimal duracion_evento_horas
        json factores_consumo
        json recomendaciones_calculadas
        decimal costo_estimado
        timestamp fecha_calculo
    }
    
    INVITACION_FAMILIAR {
        uuid id PK
        uuid evento_id FK
        string nombre_familia
        json miembros_familia
        string direccion_principal
        string telefono_principal
        string email_principal
        int total_invitados
        json informacion_especial
        string codigo_invitacion
        timestamp fecha_generacion
    }
    
    GENERADOR_PRESUPUESTO {
        uuid id PK
        uuid evento_id FK
        decimal presupuesto_total
        json distribucion_prioridades
        json servicios_seleccionados
        json servicios_alternativos
        decimal presupuesto_usado
        decimal presupuesto_restante
        enum criterio_seleccion
        timestamp fecha_generacion
    }
    
    REQUERIMIENTOS_ESPACIALES {
        uuid id PK
        uuid servicio_id FK
        decimal ancho_minimo_metros
        decimal largo_minimo_metros
        decimal altura_minima_metros
        decimal area_total_metros2
        json equipos_adicionales
        json restricciones_ubicacion
        boolean requiere_corriente
        int potencia_electrica_watts
        json notas_instalacion
    }
    
    COMPATIBILIDAD_SERVICIO {
        uuid id PK
        uuid servicio_id FK
        int capacidad_minima_invitados
        int capacidad_maxima_invitados
        int capacidad_optima_invitados
        json tipos_evento_compatibles
        json restricciones_edad
        decimal factor_calidad_por_capacidad
        enum nivel_especializacion
    }
    
    INVITACION_INDIVIDUAL {
        uuid id PK
        uuid invitado_id FK
        uuid invitacion_familiar_id FK
        string nombre_completo
        string codigo_personal
        json contexto_familiar
        json otros_familiares_invitados
        json preferencias_personales
        enum tipo_invitacion
        boolean requiere_confirmacion
        timestamp fecha_envio
    }
    
    PAGINA_INVITACION_WEB {
        uuid id PK
        uuid evento_id FK
        string url_personalizada
        json diseno_personalizado
        json informacion_evento
        json lista_invitados_publica
        json configuracion_privacidad
        json galeria_imagenes
        boolean incluye_mapa_regalos
        int visitas_totales
    }
    
    DETECCION_CONFLICTOS {
        uuid id PK
        uuid evento_id FK
        enum tipo_conflicto
        string descripcion_conflicto
        json partes_involucradas
        json soluciones_sugeridas
        enum nivel_prioridad
        enum estatus_resolucion
        timestamp fecha_deteccion
        uuid usuario_asignado_id FK
    }
    
    RANKING_SATISFACCION {
        uuid id PK
        uuid proveedor_id FK
        decimal puntuacion_promedio
        int total_calificaciones
        decimal indice_satisfaccion
        json metricas_detalladas
        int posicion_ranking
        timestamp fecha_actualizacion
    }
    
    SISTEMA_PAGOS_SIMPLE {
        uuid id PK
        uuid contrato_id FK
        decimal monto_total
        json metodos_pago_disponibles
        enum estatus_general
        timestamp fecha_creacion
    }
    
    PAGO_PROGRAMADO {
        uuid id PK
        uuid sistema_pagos_id FK
        decimal monto_pago
        datetime fecha_programada
        string concepto_pago
        enum metodo_pago
        enum estatus_pago
        json comprobante_pago
        string referencia_externa
        timestamp fecha_confirmacion
        boolean confirmado_manualmente
        string notas_pago
    }
    
    COMPROBANTE_PAGO {
        uuid id PK
        uuid pago_programado_id FK
        enum tipo_comprobante
        string numero_referencia
        json datos_comprobante
        string ruta_archivo
        timestamp fecha_subida
        uuid usuario_subida_id FK
        boolean validado
    }
    
    ACUERDO_PAGO {
        uuid id PK
        uuid sistema_pagos_id FK
        json terminos_acordados
        json participantes_acuerdo
        json modificaciones_permitidas
        timestamp fecha_acuerdo
        boolean activo
    }
    
    SOLICITUD_COTIZACION {
        uuid id PK
        uuid evento_id FK
        uuid servicio_id FK
        uuid ubicacion_evento_id FK
        json requerimientos_personalizados
        json productos_seleccionados
        enum estatus
        timestamp fecha_solicitud
    }
    
    COTIZACION {
        uuid id PK
        uuid solicitud_cotizacion_id FK
        uuid proveedor_id FK
        decimal precio_base
        json desglose_costos
        json costos_logisticos
        json terminos_condiciones
        datetime valida_hasta
        enum estatus
        timestamp fecha_creacion
    }
    
    CONTRATO {
        uuid id PK
        uuid cotizacion_id FK
        uuid evento_id FK
        json terminos
        decimal monto_total
        json cronograma_pagos
        enum estatus
        timestamp fecha_firma
        json evidencias_cumplimiento
    }
    
    CONCEPTO_COSTO {
        uuid id PK
        uuid cotizacion_id FK
        uuid producto_id FK
        string descripcion
        decimal costo_unitario
        int cantidad
        decimal costo_transporte
        decimal costo_almacenamiento
        decimal costo_mano_obra
        decimal costo_total
        string justificacion
        enum tipo_costo
    }
    
    CALCULO_LOGISTICO {
        uuid id PK
        uuid cotizacion_id FK
        decimal distancia_km
        decimal costo_combustible
        decimal costo_tiempo
        decimal costo_vehiculo
        json datos_ruta
        timestamp fecha_calculo
    }
    
    RESENA {
        uuid id PK
        uuid contrato_id FK
        uuid cliente_id FK
        uuid proveedor_id FK
        int calificacion
        text comentario
        json fotos
        timestamp fecha_creacion
    }
    
    USUARIO ||--o{ CLIENTE : "puede ser"
    USUARIO ||--o{ PROVEEDOR : "puede ser"
    CLIENTE ||--o{ EVENTO : "crea"
    
    EVENTO ||--o{ ETAPA_EVENTO : "tiene"
    ETAPA_EVENTO ||--o{ UBICACION_EVENTO : "se realiza en"
    
    EVENTO ||--o{ INVITADO : "invita"
    INVITADO ||--o{ PARENTESCO_FAMILIAR : "tiene parentesco"
    
    UBICACION_EVENTO ||--o{ ITINERARIO : "programa"
    SERVICIO ||--o{ ITINERARIO : "participa en"
    
    PROVEEDOR ||--o{ SERVICIO : "ofrece"
    CLIENTE ||--o{ SERVICIO : "personaliza"
    PROVEEDOR ||--o{ PROVEEDOR_SUMINISTRO : "trabaja con"
    SERVICIO ||--o{ PRODUCTO : "incluye"
    PROVEEDOR_SUMINISTRO ||--o{ PRODUCTO : "suministra"
    
    CATEGORIA_SERVICIO ||--o{ SERVICIO : "categoriza"
    
    EVENTO ||--o{ SOLICITUD_COTIZACION : "genera"
    SERVICIO ||--o{ SOLICITUD_COTIZACION : "recibe"
    UBICACION_EVENTO ||--o{ SOLICITUD_COTIZACION : "especifica lugar"
    
    SOLICITUD_COTIZACION ||--o{ COTIZACION : "genera"
    COTIZACION ||--o{ CONTRATO : "se convierte en"
    
    COTIZACION ||--o{ CONCEPTO_COSTO : "detalla"
    PRODUCTO ||--o{ CONCEPTO_COSTO : "incluido en"
    
    COTIZACION ||--o{ CALCULO_LOGISTICO : "calcula"
    
    CONTRATO ||--o{ RESENA : "puede tener"
    CONTRATO ||--o{ HISTORIAL_PAGOS : "registra pagos"
    CONTRATO ||--o{ EVIDENCIA_ETAPA : "documenta progreso"
    
    EVENTO ||--o{ COLABORADOR_EVENTO : "tiene colaboradores"
    USUARIO ||--o{ COLABORADOR_EVENTO : "colabora en"
    
    UBICACION_EVENTO ||--o{ ASIGNACION_MESA : "organiza mesas"
    INVITADO ||--o{ ASIGNACION_MESA : "asignado a"
    
    PROVEEDOR ||--o{ PLANTILLA_COTIZACION : "crea plantillas"
    PLANTILLA_COTIZACION ||--o{ COTIZACION : "genera desde"
    
    USUARIO ||--o{ COLA_SINCRONIZACION : "genera cambios offline"
    
    EVENTO ||--o{ INVITACION_DIGITAL : "tiene invitación"
    PROVEEDOR ||--o{ FICHA_TECNICA_PROVEEDOR : "tiene ficha"
    EVENTO ||--o{ REPORTE_PERSONALIZADO : "genera reportes"
    USUARIO ||--o{ REPORTE_PERSONALIZADO : "crea reportes"
    
    EVENTO ||--o{ AYUDA_ECONOMICA : "recibe ayuda"
    USUARIO ||--o{ AYUDA_ECONOMICA : "dona para"
    
    EVENTO ||--o{ ACCESO_PUBLICO : "permite acceso"
    
    SERVICIO ||--o{ AUTOCOTIZACION : "permite autocotizar"
    CLIENTE ||--o{ AUTOCOTIZACION : "genera cotización"
    
    PROVEEDOR ||--o{ DISPONIBILIDAD_TIEMPO_REAL : "tiene disponibilidad"
    
    CATEGORIA_SERVICIO ||--o{ MATRIZ_SERVICIOS_EVENTO : "incluye en matriz"
    EVENTO ||--o{ ESTADO_PREPARATIVO : "tiene preparativos"
    MATRIZ_SERVICIOS_EVENTO ||--o{ ESTADO_PREPARATIVO : "se cumple en"
    
    CONTRATO ||--o{ CALIFICACION_BIDIRECCIONAL : "genera calificaciones"
    
    EVENTO ||--o{ CONVERSACION : "tiene conversaciones"
    CONVERSACION ||--o{ MENSAJE : "contiene mensajes"
    
    EVENTO ||--o{ NOTIFICACION_PERSONALIZADA : "envía notificaciones"
    
    PROVEEDOR ||--o{ PAGINA_PUBLICA_PROVEEDOR : "tiene página"
    
    USUARIO ||--o{ SESION_CHATBOT : "usa chatbot"
    
    PROVEEDOR ||--o{ FORMULARIO_DINAMICO : "crea formularios"
    SERVICIO ||--o{ FORMULARIO_DINAMICO : "requiere formulario"
    FORMULARIO_DINAMICO ||--o{ RESPUESTA_FORMULARIO : "recibe respuestas"
    
    PROVEEDOR ||--o{ SOLICITUD_INFORMACION : "solicita datos"
    EVENTO ||--o{ SOLICITUD_INFORMACION : "proporciona info"
    
    EVENTO ||--o{ PREFERENCIAS_PERSONALIZADAS : "captura preferencias"
    SERVICIO ||--o{ PREFERENCIAS_PERSONALIZADAS : "personaliza con"
    
    EVENTO ||--o{ CALCULADORA_CONSUMO_DIY : "calcula consumo"
    
    EVENTO ||--o{ INVITACION_FAMILIAR : "agrupa por familia"
    
    EVENTO ||--o{ GENERADOR_PRESUPUESTO : "genera con presupuesto"
    
    SERVICIO ||--o{ REQUERIMIENTOS_ESPACIALES : "requiere espacio"
    
    SERVICIO ||--o{ COMPATIBILIDAD_SERVICIO : "define compatibilidad"
    
    INVITADO ||--o{ INVITACION_INDIVIDUAL : "recibe invitación"
    INVITACION_FAMILIAR ||--o{ INVITACION_INDIVIDUAL : "incluye miembro"
    
    EVENTO ||--o{ PAGINA_INVITACION_WEB : "tiene página web"
    
    EVENTO ||--o{ DETECCION_CONFLICTOS : "puede tener conflictos"
    
    PROVEEDOR ||--o{ RANKING_SATISFACCION : "tiene ranking"
    
    CONTRATO ||--o{ SISTEMA_PAGOS_SIMPLE : "gestiona pagos"
    SISTEMA_PAGOS_SIMPLE ||--o{ PAGO_PROGRAMADO : "programa pagos"
    PAGO_PROGRAMADO ||--o{ COMPROBANTE_PAGO : "tiene comprobante"
    SISTEMA_PAGOS_SIMPLE ||--o{ ACUERDO_PAGO : "define acuerdo"
```

## 4. MODELO ECONÓMICO Y SISTEMA DE COSTOS

### 4.1 Estructura de Costos Transparente

```mermaid
graph TD
    subgraph "Desglose de Costos por Servicio"
        BASE[Costo Base del Servicio]
        MATERIALS[Materiales/Insumos]
        LABOR[Mano de Obra]
        TRANSPORT[Transporte/Logística]
        OVERHEAD[Gastos Generales]
        MARGIN[Margen de Ganancia]
        PLATFORM[Comisión Plataforma]
        TAXES[Impuestos]
    end
    
    BASE --> TOTAL[Costo Total]
    MATERIALS --> TOTAL
    LABOR --> TOTAL
    TRANSPORT --> TOTAL
    OVERHEAD --> TOTAL
    MARGIN --> TOTAL
    PLATFORM --> TOTAL
    TAXES --> TOTAL
    
    TOTAL --> CLIENT_VIEW[Vista Cliente]
    TOTAL --> PROVIDER_VIEW[Vista Proveedor]
    
    CLIENT_VIEW --> DETAILED[Desglose Detallado]
    CLIENT_VIEW --> SUMMARY[Resumen Ejecutivo]
```

### 4.2 Modelo de Ingresos de la Plataforma

- **Comisión por Transacción**: 3-8% sobre el valor del contrato
- **Suscripciones Premium**: Funcionalidades avanzadas para proveedores
- **Servicios Adicionales**: Verificación de proveedores, seguros, etc.
- **Publicidad Dirigida**: Promoción de servicios específicos

## 5. INTERFACES DE USUARIO POR TIPO DE CLIENTE

### 5.1 App Móvil Cliente (iOS/Android - Offline First)
- **Modo Offline Completo**: Todas las funciones disponibles sin internet
- **Dashboard Principal**: Eventos activos, pasados y próximos
- **Creador de Eventos Multi-etapa**: 
  - Definición de etapas (ceremonia, recepción, etc.)
  - Asignación de ubicaciones con mapas integrados
  - Configuración de horarios por ubicación
- **Gestión Avanzada de Invitados**:
  - Árbol genealógico interactivo
  - Invitaciones digitales personalizadas
  - Asignación inteligente de mesas por proximidad social
  - Menciones de honor (padrinos, familia cercana)
  - Control de asistencia y restricciones dietéticas
- **Sistema de Colaboradores**:
  - Invitar organizadores, familiares, proveedores
  - Roles personalizables con permisos específicos
  - Colaboración en tiempo real
- **Itinerario Completo**:
  - Vista cronológica del evento
  - Servicios por ubicación y horario
  - Actividades simultáneas (banda + banquete)
- **Explorador de Servicios** con filtros geográficos
- **Comparador de Cotizaciones** con plantillas pre-estructuradas
- **Sistema de Pagos** y facturación detallada
- **Sincronización Automática** cuando recupera conexión

### 5.2 App Móvil Proveedor (iOS/Android - Offline First)
- **Modo Offline Completo**: Cotizaciones y gestión sin internet
- **Panel de Gestión de Servicios** y productos
- **Rol Dual**: Proveedor de servicios + Organizador de eventos
- **Plantillas de Cotización Pre-estructuradas**:
  - Por tipo de evento (boda, XV años, cumpleaños)
  - Por cantidad de invitados (50, 100, 200+)
  - Paquetes completos con logística incluida
- **Gestión de Suppliers**: Proveedores y costos
- **Calculadora de Costos Inteligente**:
  - Cálculo automático de distancias
  - Costos de transporte y logística
  - Markup por almacenamiento y procesamiento
- **Modo Organizador de Eventos**:
  - Crear eventos para clientes
  - Gestionar todos los aspectos técnicos
  - Invitar al cliente como colaborador/auditor
- **Gestión de Cotizaciones** multi-ubicación
- **Calendario de Disponibilidad** por servicio
- **Análisis Financiero** con métricas de rentabilidad
- **Sincronización Inteligente** con cola de prioridades

### 5.3 Plataforma Web Escritorio (Todos los Roles)
- **Sistema de Roles Flexibles**:
  - Cliente → puede ser Organizador
  - Proveedor → puede ser Organizador de eventos
  - Organizador → puede gestionar múltiples eventos
  - Colaborador → permisos específicos por evento
- **Administración de Plataforma**:
  - Monitoreo de transacciones
  - Gestión de usuarios y proveedores
  - Análisis de métricas del negocio
  - Moderación de contenido
  - Configuración de comisiones
- **Algoritmos Inteligentes**:
  - Asignación óptima de mesas
  - Recomendaciones de servicios
  - Optimización de rutas logísticas

## 6. SISTEMA DE AUTENTICACIÓN Y PERMISOS

### 6.1 Autenticación
- Login social con Google OAuth 2.0
- Registro tradicional con email/password
- Autenticación de dos factores (2FA)
- JWT para manejo de sesiones
- Refresh tokens para seguridad

### 6.2 Autorización (RBAC)
- **Cliente**: Crear eventos, ver cotizaciones, hacer pagos
- **Proveedor**: Gestionar servicios, enviar cotizaciones, ver contratos
- **Admin**: Acceso completo al sistema
- **Moderador**: Gestión de contenido y disputas

## 7. FLUJO PRINCIPAL DE LA APLICACIÓN

```mermaid
sequenceDiagram
    participant C as Cliente
    participant P as Plataforma
    participant PR as Proveedor
    participant PAY as Sistema Pago
    
    C->>P: 1. Registra/Login
    C->>P: 2. Crea evento
    C->>P: 3. Explora servicios
    C->>P: 4. Solicita cotizaciones
    P->>PR: 5. Notifica solicitud
    PR->>P: 6. Envía cotización detallada
    P->>C: 7. Muestra cotizaciones
    C->>P: 8. Compara y selecciona
    C->>P: 9. Acepta cotización
    P->>PR: 10. Crea contrato
    C->>PAY: 11. Realiza pago
    PAY->>P: 12. Confirma pago
    P->>PR: 13. Libera información
    PR->>P: 14. Ejecuta servicio
    C->>P: 15. Califica servicio
```

## 8. REQUISITOS NO FUNCIONALES

### 8.1 Rendimiento
- Tiempo de respuesta < 200ms para consultas simples
- Tiempo de respuesta < 1s para consultas complejas
- Disponibilidad 99.9%
- Soporte para 10,000 usuarios concurrentes

### 8.2 Seguridad
- Encriptación HTTPS/TLS 1.3
- Datos sensibles encriptados en BD
- Auditoría completa de transacciones
- Cumplimiento PCI DSS para pagos
- Respaldo de datos cada 24 horas

### 8.3 Escalabilidad
- Arquitectura cloud-native
- Auto-scaling horizontal
- CDN para contenido estático
- Cache distribuido
- Base de datos sharding

## 9. FUNCIONALIDADES AVANZADAS

### 9.1 Sistema de Eventos Multi-etapa
- Eventos con múltiples ubicaciones (iglesia, salón, casa)
- Itinerarios detallados por ubicación
- Integración con Google Maps para rutas
- Horarios superpuestos y actividades simultáneas

### 9.2 Servicios Personalizados por Cliente
- **Cliente puede agregar servicios no existentes** en la plataforma
- **Servicios sin proveedor asignado** - cliente define especificaciones
- **Servicios independientes** para eventos personalizados
- **Cada servicio genera sus propias cotizaciones** y contratos
- **Invitación de usuarios externos** para asumir roles
- **Gestión independiente** por servicio

### 9.3 Aplicaciones Móviles Offline-First
- **Funcionalidad completa sin internet**
- **Base de datos local**: SQLite en móvil
- **Sincronización inteligente**: 
  - Cola de cambios pendientes
  - Resolución automática de conflictos
  - Prioridad por tipo de datos
- **Cache local**: Imágenes, mapas, cotizaciones
- **Notificaciones push** cuando se recupera conexión

### 9.4 Sistema de Colaboradores Multi-Rol
- **Roles flexibles**:
  - Cliente → Organizador de eventos
  - Proveedor → Organizador profesional
  - Colaborador → Familiar/Amigo con permisos
  - Auditor → Solo lectura y comentarios
- **Permisos granulares** por sección del evento
- **Colaboración en tiempo real** con conflictos resueltos
- **Historial de cambios** por colaborador

### 9.5 Diseñador de Salones y Asignación de Mesas
- **Editor visual de salones** con herramientas de diseño
- **Biblioteca de tipos de mesa** (redonda, rectangular, alta)
- **Configuración de capacidad** por tipo de mesa
- **Vista previa 3D** del salón con realidad aumentada
- **Guardado de plantillas** de diseño por salón

### 9.6 Asignación Inteligente de Mesas
- **Algoritmo de proximidad social**:
  - Relación genealógica (familia cercana junta)
  - Afinidad sentimental (parejas, amigos íntimos)
  - Edad y intereses comunes
  - Restricciones dietéticas compatibles
- **Menciones de honor**: Padrinos, familia especial
- **Optimización automática** con machine learning
- **Vista previa 3D** del salón con disposición

### 9.7 Proveedores Multiservicios
- **Proveedores que incluyen todo** (mobiliario + banquete + decoración)
- **Costos por persona escalonados**:
  - 1-50 personas: $100 c/u
  - 51-100 personas: $90 c/u  
  - 101+ personas: $80 c/u
- **Paquetes all-inclusive** con precio fijo
- **Negociación por volumen** automática

### 9.8 Cotizaciones Pre-estructuradas
- **Plantillas por tipo de evento**:
  - Boda (50-500 invitados)
  - XV Años (30-300 invitados)
  - Cumpleaños corporativo (20-200 invitados)
- **Paquetes all-inclusive** con logística completa
- **Escalamiento automático** según cantidad de invitados
- **Personalización rápida** desde plantilla base

### 9.9 Invitaciones Digitales Inteligentes
- **Invitaciones web responsivas** con enlace personalizado
- **Generación automática de PDFs** con diseño personalizado
- **Información pública del evento**:
  - Itinerario general
  - Ubicaciones con mapas
  - Mesa de regalos
  - Galería de fotos
  - Código de vestimenta
- **Información privada de logística** (solo organizadores)
- **Configuración de privacidad** por sección

### 9.10 Gestión Avanzada de Invitados
- Árbol genealógico con múltiples celebrantes
- Invitaciones digitales personalizadas
- Información de mesa de regalos
- Galería compartida de fotos/videos
- Programa de platillos y menús

### 9.11 Sistema de Productos y Proveedores Anidados
- Proveedores pueden tener sub-proveedores
- Productos con costos base + markup
- Cálculo automático de costos logísticos
- Gestión de inventario por producto

### 9.12 Historial de Pagos y Calificaciones
- **Registro detallado de pagos** por contrato
- **Múltiples métodos de pago** integrados
- **Calificación por servicio** después de completar
- **Historial de calificaciones** por proveedor
- **Sistema de reputación** basado en desempeño

### 9.13 Fichas Técnicas de Proveedores
- **Perfil profesional completo** con experiencia
- **Portafolio de trabajos anteriores** con galerías
- **Certificaciones y reconocimientos**
- **Áreas de cobertura geográfica**
- **Especialidades y servicios destacados**

### 9.14 Sistema de Evidencia Fotográfica
- **Documentación por etapas** del evento
- **Subida de evidencias** por cliente y proveedor
- **Seguimiento del cumplimiento** de contratos
- **Galería de progreso** en tiempo real
- **Validación de entregas** con timestaps

### 9.15 Reportes Personalizados
- **Generación por rol** (cliente, proveedor, organizador)
- **Exportación múltiple**: PDF, Excel, CSV
- **Envío automático** por email
- **Reportes financieros** detallados
- **Análisis de rentabilidad** por servicio

### 9.16 Sistema de Ayuda Económica
- **Donaciones de usuarios registrados** para eventos
- **Donaciones anónimas** de usuarios no registrados
- **Asignación específica** a servicios o monto total
- **Facturación directa** al donante por servicio
- **Seguimiento financiero** integrado en reportes
- **Notificaciones automáticas** a beneficiarios

### 9.17 Acceso Público Configurable
- **Usuarios no registrados** pueden ver información del evento
- **Configuración de privacidad** por colaborador:
  - Solo organizador puede ver
  - Solo invitados registrados
  - Solo usuarios registrados
  - Público general
- **Confirmación de asistencia** sin registro
- **Integración con mesas de regalos** (Liverpool, Amazon)
- **Enlaces compartibles** por redes sociales

### 9.18 Auto-cotización Inteligente
- **Paquetes predefinidos** por proveedor
- **Cálculo automático** con parámetros personalizados:
  - Número de invitados
  - Fecha y horario del evento
  - Ubicación y distancia
  - Disponibilidad de inventario
- **Tarifas dinámicas** por día de la semana
- **Descuentos automáticos** por volumen

### 9.19 Disponibilidad en Tiempo Real
- **Cálculo de disponibilidad** para proveedores con múltiples eventos
- **Optimización de rutas** entre eventos del mismo día:
  - Evento 1: Boda 4-8 PM
  - Traslado: 30 min + setup
  - Evento 2: Cumpleaños 9 PM-1 AM
- **Costos de traslado** incluidos automáticamente
- **Alertas de conflictos** de horario

### 9.20 Matriz de Servicios por Evento
- **Plantillas por tipo de evento**:
  - Boda: Fotografía, Música, Banquete, Decoración, etc.
  - XV Años: Vals, Chambelanes, DJ, etc.
  - Cumpleaños: Animación, Pastel, etc.
- **Estado de preparativos**:
  - ✅ Confirmado
  - ⏳ Pendiente
  - ❌ Descartado (ej: tío lleva en su carro)
  - 📝 Requiere seguimiento
- **Información detallada** por servicio
- **Modificación dinámica** de la matriz

### 9.21 Calificación Bidireccional
- **Cliente califica a proveedor** (tradicional)
- **Proveedor califica a cliente**:
  - Puntualidad en pagos
  - Claridad en requerimientos
  - Cooperación durante el evento
  - Respeto a acuerdos
- **Sistema de reputación** para ambos lados

### 9.22 Chatbot Inteligente
- **Guía paso a paso** para nuevos usuarios
- **Respuestas frecuentes** contextuales
- **Navegación asistida** por la aplicación
- **Soporte multiidioma** (español/inglés)
- **Escalación a soporte humano** cuando sea necesario

### 9.23 Sistema de Mensajería Integrado
- **Chat directo** cliente-proveedor
- **Conversaciones por evento** organizadas
- **Archivos adjuntos** (imágenes, documentos)
- **Notificaciones en tiempo real**
- **Historial de conversaciones** por contrato

### 9.24 Notificaciones Personalizables
- **Envío masivo** a invitados seleccionados
- **Programación de envío**:
  - 1 semana antes del evento
  - 1 día antes del evento
  - Durante el evento (cambios de horario)
  - Después del evento (agradecimientos)
- **Múltiples canales**: Email, SMS, Push, WhatsApp
- **Plantillas personalizables** por tipo de mensaje

### 9.25 Páginas Públicas de Proveedores
- **URL personalizada** (ej: /proveedor/flores-maria)
- **Portafolio visual** con galerías
- **Servicios destacados** con precios base
- **Testimonios** de clientes anteriores
- **Formulario de contacto** directo
- **Integración con redes sociales**
- **SEO optimizado** para búsquedas

### 9.26 Sistema de Parentesco Avanzado
- **Relaciones complejas**: "El nieto de mi abuelita", "La cuñada de mi hermana"
- **Descripción detallada**: Campo libre para relaciones únicas
- **Lados de familia**: Familia materna/paterna claramente identificados
- **Posición en árbol**: Coordenadas visuales en el árbol genealógico
- **Visibilidad para proveedores**: Control de qué relaciones ven los proveedores
- **Menciones especiales**: Identificación automática de padrinos, abuelos, etc.

### 9.27 Formularios Dinámicos por Proveedor
- **Creación personalizada** por cada proveedor:
  - Músico: Canciones favoritas, géneros prohibidos, momentos especiales
  - Fotógrafo: Poses deseadas, momentos clave, familiares importantes
  - Decorador: Colores preferidos, estilos, elementos personales
  - Banquete: Restricciones dietéticas, platillos favoritos, alergias
- **Momentos de aplicación**:
  - Al contratar servicio
  - Durante planificación
  - Semana antes del evento
  - Día del evento
- **Validación inteligente** con reglas personalizadas
- **Integración con itinerario** automática

### 9.28 Solicitud Inteligente de Información
- **Proveedores pueden solicitar datos específicos**:
  - Lista de padrinos y madrinas
  - Información de familiares VIP
  - Preferencias musicales detalladas
  - Restricciones y prohibiciones
- **Asignación de responsables** para recopilar info
- **Fechas límite** para entrega de información
- **Seguimiento automático** con recordatorios

### 9.29 Calculadora de Consumo DIY (Hágalo Usted Mismo)
- **Cálculo inteligente por demografía**:
  - Adultos: 2-3 bebidas/hora, 350g comida principal
  - Niños: 1 bebida/hora, 200g comida + menú infantil
  - Adolescentes: 1.5 bebidas/hora, 300g comida
- **Calculadora por tipo de producto**:
  - Bebidas alcohólicas (vino, cerveza, licores)
  - Bebidas no alcohólicas (refrescos, agua, jugos)
  - Comida principal y entradas
  - Postres y dulces
  - Hielo y complementos
- **Factores de ajuste**:
  - Duración del evento
  - Temporada del año (calor = más bebidas)
  - Tipo de celebración (formal vs casual)
  - Horario (mañana, tarde, noche)
- **Recomendaciones automáticas** con cantidades exactas
- **Cálculo de costos** con sugerencias de compra

### 9.30 Invitaciones Familiares Agrupadas
- **Agrupación automática** por núcleo familiar:
  - Familia González: Papa, Mama, 2 hijos
  - Familia Martínez: Pareja sin hijos
  - Solteros: Invitaciones individuales
- **Generación inteligente**:
  - "La Familia González está invitada..."
  - Información específica por miembro
  - Datos de contacto principal
- **Código de invitación familiar** único
- **Confirmación grupal** con detalles individuales
- **Envío a dirección principal** de la familia

### 9.31 Generador de Eventos por Presupuesto
- **Presupuesto fijo inicial**: "Mi fiesta con $100,000"
- **Distribución inteligente por prioridades**:
  1. Lugar (salón): 30-40% del presupuesto
  2. Banquete: 25-35% del presupuesto  
  3. Música: 10-15% del presupuesto
  4. Decoración: 10-15% del presupuesto
  5. Fotografía: 5-10% del presupuesto
  6. Otros: 5-10% del presupuesto
- **Modos de selección**:
  - Por calidad: Mejores proveedores que ajusten
  - Por cantidad: Más servicios con presupuesto
  - Por invitado: Costo fijo por persona
  - Personalizado: Prioridades manuales
- **Ajuste dinámico**: Si un servicio cuesta menos, redistribuir presupuesto
- **Alternativas automáticas** cuando se agota presupuesto

### 9.32 Sistema de Requerimientos Espaciales
- **Especificaciones por servicio**:
  - Banda musical: 4m x 2m, altura 3m
  - DJ: 2m x 1.5m, altura normal
  - Mesa de regalos: 1.5m x 1m
  - Barra de bebidas: 3m x 1m + espacio de trabajo
  - Pista de baile: 20m² para 50 personas
- **Equipos adicionales**:
  - Escenario requiere +2m x 3m
  - Iluminación requiere altura +2m
  - Sistema de sonido requiere conectores
- **Generación automática** del mapa 3D del salón
- **Validación de compatibilidad** espacial
- **Sugerencias de optimización** de espacio

### 9.33 Filtros de Compatibilidad por Capacidad
- **Rangos de especialización por proveedor**:
  - Banda sinfónica: 100-500 invitados (no apta para 10 personas)
  - Mariachi íntimo: 10-50 invitados (se pierde en eventos grandes)
  - DJ versátil: 20-300 invitados
  - Fotógrafo bodas: 50-200 invitados (especialista)
- **Filtros automáticos**:
  - Ocultar proveedores no compatibles
  - Mostrar advertencias de incompatibilidad
  - Sugerir proveedores óptimos
- **Factor de calidad por capacidad**:
  - Zona óptima: 100% calidad
  - Fuera de zona: Calidad reducida
  - Zona incompatible: No mostrar
- **Recomendaciones inteligentes** basadas en capacidad del evento

### 9.34 Sistema de Invitaciones Completo
- **Invitaciones individuales** con contexto familiar:
  - "Estimado Juan, tú y tu familia están invitados..."
  - Lista de otros familiares invitados
  - Código personal para confirmación
  - Preferencias individuales capturadas
- **Página web completa** del evento:
  - URL personalizada: /evento/boda-maria-jose
  - Lista pública de invitados (configurable)
  - Galería de fotos y videos
  - Mapa de regalos integrado
  - Configuración de privacidad granular
- **Información contextual**:
  - "Tu prima Ana y su familia también están invitados"
  - Relaciones familiares visibles
  - Sugerencias de coordinación entre familiares

### 9.35 Sistema de Prevención de Conflictos
- **Detección automática** de posibles conflictos:
  - Familiares con problemas conocidos en la misma mesa
  - Proveedores con horarios superpuestos
  - Presupuesto insuficiente para servicios requeridos
  - Restricciones espaciales no cumplidas
- **Soluciones sugeridas**:
  - Reasignación de mesas inteligente
  - Alternativas de proveedores
  - Ajustes de presupuesto
  - Modificaciones de itinerario
- **Niveles de prioridad**:
  - Crítico: Detiene la planificación
  - Alto: Requiere atención inmediata
  - Medio: Recomendación de cambio
  - Bajo: Sugerencia opcional

### 9.36 Ranking por Satisfacción del Cliente
- **Organización automática** de servicios por satisfacción:
  - Puntuación promedio de calificaciones
  - Índice de satisfacción ponderado
  - Posición en ranking por categoría
- **Métricas detalladas**:
  - Puntualidad en entregas
  - Calidad del servicio
  - Comunicación con cliente
  - Cumplimiento de acuerdos
  - Flexibilidad ante cambios
- **Filtros inteligentes**:
  - Solo mostrar proveedores top 10
  - Ocultar proveedores con satisfacción < 80%
  - Priorizar por mejor calificación en búsquedas

### 9.37 Sistema de Pagos Simplificado
- **Métodos de pago sin complicaciones fiscales**:
  - **Transferencias bancarias**: SPEI, CLABE
  - **Tiendas de autocobro**: Oxxo, 7-Eleven, Soriana
  - **Efectivo el día del evento**: Confirmación manual
  - **Depósitos bancarios**: Con comprobante fotográfico
- **Calendario de pagos personalizado**:
  - 50% al contratar servicio
  - 30% una semana antes del evento
  - 20% el día del evento
  - Fechas modificables por acuerdo mutuo
- **Confirmación manual** de pagos:
  - Cliente marca "Ya pagué" en la app
  - Proveedor confirma "Pago recibido"
  - Sistema actualiza estatus automáticamente
  - Notificaciones a ambas partes
- **Evidencia de pagos**:
  - Subida de vouchers y comprobantes
  - Fotos de tickets de tiendas de autocobro
  - Referencias de transferencias
  - Validación cruzada entre partes
- **Flexibilidad en acuerdos**:
  - Posposición de pagos con consentimiento
  - Modificación de montos por cambios
  - Acuerdos especiales documentados
  - Historial completo de modificaciones

### 9.38 Integraciones con Aplicaciones Existentes

**Herramientas de Planificación de Eventos:**
- **Eventbrite**: Importación de eventos existentes, sincronización de invitados
- **Trello**: Integración de tableros de planificación como tareas de preparativos
- **Asana**: Importación de cronogramas y asignación de responsabilidades
- **Monday.com**: Sincronización de timelines y status de tareas

**Herramientas de Comunicación:**
- **WhatsApp Business API**: Notificaciones automáticas y confirmaciones
- **Telegram Bot**: Canal de comunicación alternativo
- **Slack**: Integración para equipos organizadores profesionales
- **Microsoft Teams**: Colaboración empresarial para eventos corporativos

**Herramientas Financieras:**
- **QuickBooks**: Exportación de facturas y control de gastos
- **Excel/Google Sheets**: Exportación de reportes financieros
- **Stripe**: Procesamiento de pagos online (cuando sea necesario)
- **PayPal**: Alternativa de pagos internacionales

**Herramientas de Diseño:**
- **Canva**: Plantillas para invitaciones y materiales gráficos
- **Adobe Creative Suite**: Integración para diseñadores profesionales
- **Figma**: Colaboración en diseños de eventos

**Calendarios y Programación:**
- **Google Calendar**: Sincronización automática de eventos y recordatorios
- **Outlook Calendar**: Integración empresarial
- **Apple Calendar**: Sincronización para usuarios iOS
- **Calendly**: Programación de reuniones con proveedores

**Redes Sociales y Marketing:**
- **Instagram**: Compartir galerías de eventos completados
- **Facebook Events**: Creación y promoción de eventos públicos
- **TikTok**: Contenido viral de eventos
- **Pinterest**: Inspiración y boards de ideas

**Herramientas de Productividad:**
- **Notion**: Importación de bases de datos de planificación
- **Airtable**: Sincronización de bases de datos de contactos
- **Zapier**: Automatización de workflows entre aplicaciones
- **IFTTT**: Integraciones simples y automatizaciones

### 9.39 Cálculos Logísticos Inteligentes
- Distancias automáticas entre proveedor y evento
- Costos de transporte por km
- Tiempo de traslado y costos de combustible
- Optimización de rutas para múltiples entregas

## PRÓXIMOS PASOS

1. ✅ Validar arquitectura propuesta
2. ✅ Definir modelo de datos extendido
3. 🔄 Crear MVP con funcionalidades core
4. ⏳ Definir APIs entre microservicios
5. ⏳ Configurar ambiente de desarrollo
6. ⏳ Implementar autenticación y gestión de usuarios

---
## 10. RECOMENDACIONES PARA MEJORAR EL FLUJO

### 10.1 Funcionalidades Faltantes Críticas

**📊 Dashboard Analítico Inteligente:**
- **Predicciones de costos** basadas en eventos similares
- **Alertas tempranas** de posibles problemas (clima, disponibilidad)
- **Recomendaciones proactivas** de servicios complementarios
- **Análisis de tendencias** por región y temporada

**🔄 Sistema de Workflow Automatizado:**
- **Flujos predefinidos** por tipo de evento con checkpoints
- **Automatización de tareas rutinarias** (recordatorios, seguimientos)
- **Escalación automática** cuando hay retrasos
- **Integración con calendarios** externos (Google, Outlook)

**📱 App de Campo para Proveedores:**
- **Modo offline** para trabajar durante eventos
- **Cámara integrada** para evidencias en tiempo real
- **GPS tracking** para confirmación de llegada
- **Comunicación directa** con organizador del evento

**💳 Sistema Financiero Avanzado:**
- **Facturación automática** por hitos cumplidos
- **Pagos programados** con recordatorios
- **Control de flujo de caja** para proveedores
- **Integración con sistemas contables** (SAT, facturación electrónica)

**🔍 Sistema de Auditoría y Cumplimiento:**
- **Tracking completo** de cada cambio en el evento
- **Verificación de cumplimiento** de contratos
- **Documentación legal** automática
- **Respaldo en la nube** de toda la información

### 10.2 Mejoras de Experiencia de Usuario

**🎨 Personalización Visual Avanzada:**
- **Temas visuales** por tipo de evento
- **Branding personalizado** para organizadores profesionales
- **Modo oscuro/claro** automático
- **Accesibilidad completa** (lectores de pantalla, alto contraste)

**🤖 IA y Machine Learning:**
- **Predicción de preferencias** basada en eventos anteriores
- **Optimización automática** de itinerarios
- **Detección de patrones** para mejorar recomendaciones
- **Chatbot con procesamiento de lenguaje natural**

**📊 Analytics y Business Intelligence:**
- **Dashboards ejecutivos** para toma de decisiones
- **Reportes predictivos** de rentabilidad
- **Análisis de satisfacción** del cliente
- **Benchmarking** contra la competencia

### 10.3 Integraciones Estratégicas

**🌍 Ecosistema de Partners:**
- **API abierta** para integraciones de terceros
- **Marketplace de plugins** para funcionalidades adicionales
- **Integración con ERPs** empresariales
- **Conectores con redes sociales** para marketing

**📦 Logística y Supply Chain:**
- **Integración con servicios de courier** (DHL, FedEx)
- **Tracking de productos** en tiempo real
- **Gestión de inventario** compartido entre proveedores
- **Optimización de rutas** con IA

### 10.4 Escalabilidad y Crecimiento

**🌐 Expansión Geográfica:**
- **Localización por país** (monedas, idiomas, cultura)
- **Adaptación legal** por jurisdicción
- **Red de proveedores** interconectada
- **Programa de afiliados** para crecimiento orgánico

**💰 Modelos de Negocio Adicionales:**
- **Suscripciones premium** con funcionalidades avanzadas
- **Servicios de consultoría** personalizada
- **Seguros de eventos** integrados
- **Financiamiento** para eventos grandes

### 9.39 Diagrama de Sistema de Pagos Simplificado

```mermaid
flowchart TD
    subgraph "Métodos de Pago"
        TRANS[Transferencias SPEI]
        TIENDA[Tiendas Autocobro]
        EFECT[Efectivo en Evento]
        DEPOS[Depósitos Bancarios]
    end
    
    subgraph "Calendario de Pagos"
        P1[50% al Contratar]
        P2[30% Semana Antes]
        P3[20% Día del Evento]
    end
    
    subgraph "Confirmación Manual"
        CLI[Cliente: "Ya Pagué"]
        PROV[Proveedor: "Recibido"]
        SIS[Sistema Actualiza]
    end
    
    subgraph "Evidencia"
        VOUCH[Vouchers]
        FOTOS[Fotos Tickets]
        REF[Referencias]
        VALID[Validación Cruzada]
    end
    
    TRANS --> P1
    TIENDA --> P2
    EFECT --> P3
    
    P1 --> CLI
    P2 --> CLI
    P3 --> CLI
    
    CLI --> PROV
    PROV --> SIS
    
    SIS --> VOUCH
    SIS --> FOTOS
    SIS --> REF
    
    VOUCH --> VALID
    FOTOS --> VALID
    REF --> VALID
```

## 11. PLAN DE IMPLEMENTACIÓN MVP - ESTRUCTURA DE COSTOS TRANSPARENTE

### 11.1 Stack Tecnológico Gratuito Permanente

**Backend (Render - Plan Gratuito):**
- **Runtime**: Node.js 18+ con TypeScript
- **Framework**: Express.js con Helmet para seguridad
- **Base de Datos**: Supabase PostgreSQL (500MB gratis)
- **Autenticación**: Supabase Auth (50,000 usuarios gratis)
- **Storage**: Supabase Storage (1GB gratis)
- **Real-time**: Supabase Realtime incluido

**Frontend (Vercel/Netlify - Gratis):**
- **Framework**: Next.js 14 con TypeScript
- **UI**: Tailwind CSS + Shadcn/ui
- **Estado**: Zustand (más ligero que Redux)
- **Forms**: React Hook Form + Zod validation

**Servicios Externos Gratuitos:**
- **Maps**: Google Maps (200 USD/mes gratis)
- **Email**: Resend (3,000 emails/mes gratis)
- **Monitoring**: Sentry (5,000 errores/mes gratis)
- **Analytics**: Umami (self-hosted gratuito)

### 11.2 MVP Fase 1: Calculadora de Costos Transparente

**Entidades Mínimas para MVP:**
```sql
-- Supabase Schema
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre_completo VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(50) NOT NULL, -- 'cliente', 'proveedor'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES usuarios(id),
  nombre VARCHAR(255) NOT NULL,
  fecha_evento DATE NOT NULL,
  invitados_estimados INTEGER NOT NULL,
  presupuesto_total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categorias_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(100)
);

CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES usuarios(id),
  categoria_id UUID REFERENCES categorias_servicio(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_base DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE citas_proceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id),
  servicio_id UUID REFERENCES servicios(id),
  nombre_cita VARCHAR(255) NOT NULL, -- 'sesion_previa', 'firma_contrato', 'entrega_domicilio'
  descripcion TEXT,
  fecha_programada TIMESTAMP,
  duracion_estimada_minutos INTEGER NOT NULL,
  ubicacion_cita VARCHAR(255),
  distancia_km DECIMAL(8,2),
  tiempo_viaje_minutos INTEGER,
  es_obligatoria BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE inversiones_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES usuarios(id),
  nombre_inversion VARCHAR(255) NOT NULL, -- 'Equipo fotografico', 'Vehiculo', 'Capacitacion'
  monto_total DECIMAL(10,2) NOT NULL,
  fecha_inversion DATE NOT NULL,
  vida_util_meses INTEGER NOT NULL, -- Para depreciar
  valor_residual DECIMAL(10,2) DEFAULT 0,
  porcentaje_uso_eventos DECIMAL(5,2) DEFAULT 100, -- Qué % se usa para eventos
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analisis_rentabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  costos_directos DECIMAL(10,2) NOT NULL,
  costos_indirectos DECIMAL(10,2) NOT NULL,
  depreciacion_equipo DECIMAL(10,2) NOT NULL,
  retorno_inversiones DECIMAL(10,2) NOT NULL,
  utilidad_neta DECIMAL(10,2) NOT NULL,
  margen_neto_porcentaje DECIMAL(5,2) NOT NULL,
  punto_equilibrio_eventos INTEGER,
  es_rentable BOOLEAN NOT NULL,
  recomendacion_precio DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE conceptos_costo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID REFERENCES servicios(id),
  cita_proceso_id UUID REFERENCES citas_proceso(id),
  inversion_id UUID REFERENCES inversiones_proveedor(id), -- Nuevo: costos por inversión
  descripcion VARCHAR(255) NOT NULL,
  costo_unitario DECIMAL(10,2) NOT NULL,
  cantidad INTEGER DEFAULT 1,
  tipo_costo VARCHAR(50) NOT NULL, -- 'materiales', 'mano_obra', 'transporte', 'ganancia', 'proceso', 'viaje', 'espera', 'depreciacion', 'retorno_inversion'
  justificacion TEXT NOT NULL,
  aplica_por_hora BOOLEAN DEFAULT FALSE,
  incluye_tiempo_viaje BOOLEAN DEFAULT FALSE,
  es_costo_fijo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id),
  servicio_id UUID REFERENCES servicios(id),
  precio_total DECIMAL(10,2) NOT NULL,
  desglose_costos JSONB NOT NULL,
  estatus VARCHAR(50) DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 11.3 Funcionalidades MVP Mínimas

**Para Clientes:**
1. **Registro/Login** con Supabase Auth
2. **Crear evento básico** (nombre, fecha, # invitados, presupuesto)
3. **Explorar servicios** por categoría
4. **Ver desglose de costos** transparente por servicio
5. **Solicitar cotización** con requerimientos específicos
6. **Comparar cotizaciones** lado a lado

**Para Proveedores:**
1. **Registro/Login** con perfil de negocio
2. **Crear servicios** con descripción y precio base
3. **Definir conceptos de costo** detallados:
   - Materiales: $X (Flores, decoración, etc.)
   - Mano de obra: $X (2 personas x 4 horas)
   - Transporte: $X (Gasolina + tiempo traslado)
   - Ganancia: $X (Margen 20%)
   - **Justificación obligatoria** para cada concepto
4. **Generar cotizaciones** automáticas
5. **Dashboard básico** de cotizaciones enviadas

### 11.4 Ejemplo de Análisis de Rentabilidad Completo

**Servicio: Fotografía de Boda - Análisis Empresarial**

```
💰 INVERSIONES DEL PROVEEDOR:
├── Cámaras profesionales: $45,000 (depreciación 5 años)
├── Lentes especializados: $25,000 (depreciación 5 años)
├── Equipo de iluminación: $15,000 (depreciación 3 años)
├── Vehículo de trabajo: $180,000 (depreciación 8 años)
├── Software de edición: $12,000/año (licencias)
└── Capacitación profesional: $20,000 (depreciación 2 años)
   TOTAL INVERSIONES: $297,000

📊 COSTOS POR EVENTO:

1. COSTOS DIRECTOS:
   ├── Fotógrafo principal: $1,200 (8 horas x $150/hora)
   ├── Asistente: $640 (8 horas x $80/hora)
   ├── Combustible: $300 (traslados múltiples)
   ├── Edición: $600 (20 horas x $30/hora)
   └── Subtotal: $2,740

2. COSTOS INDIRECTOS:
   ├── Seguros equipo: $200 (prorrateo mensual)
   ├── Mantenimiento equipo: $150
   ├── Almacenamiento: $100 (estudio/bodega)
   ├── Marketing: $300 (publicidad/redes)
   └── Subtotal: $750

3. DEPRECIACIÓN DE INVERSIONES:
   ├── Equipo fotográfico: $350 (uso por evento)
   ├── Vehículo: $180 (uso por evento)
   ├── Software: $100 (licencias/evento)
   └── Subtotal: $630

4. RETORNO DE INVERSIONES:
   ├── ROI esperado: 20% anual
   ├── Inversión total: $297,000
   ├── Retorno anual: $59,400
   ├── Eventos/año: 50
   └── Retorno por evento: $1,188

💵 ANÁLISIS FINANCIERO:
├── Costos directos: $2,740
├── Costos indirectos: $750
├── Depreciación: $630
├── Retorno inversiones: $1,188
├── COSTO TOTAL: $5,308
├── Precio propuesto: $6,500
├── UTILIDAD NETA: $1,192
└── MARGEN NETO: 18.3%

📈 ANÁLISIS DE VIABILIDAD:
✅ Rentable: SÍ (margen > 15%)
✅ Punto equilibrio: 35 eventos/año
✅ Capacidad crecimiento: ALTA
⚠️  Riesgo: Depende de 50 eventos/año

🎯 RECOMENDACIONES:
- Precio mínimo viable: $5,800
- Precio óptimo: $6,500
- Para crecer: Aumentar a 65 eventos/año
- Siguiente inversión: Drone ($30,000)

TIEMPO REAL INVERTIDO: 38 horas
COSTO REAL POR HORA: $139.68
UTILIDAD POR HORA: $31.37
```

### 11.5 API Endpoints Mínimos

```javascript
// Render + Express.js
// /api/auth/* - Manejado por Supabase

// Eventos
GET    /api/eventos
POST   /api/eventos
GET    /api/eventos/:id
PUT    /api/eventos/:id

// Servicios
GET    /api/servicios
POST   /api/servicios
GET    /api/servicios/:id
GET    /api/servicios/categoria/:categoriaId

// Citas de Proceso
GET    /api/eventos/:id/citas-proceso
POST   /api/eventos/:id/citas-proceso
PUT    /api/citas-proceso/:id
DELETE /api/citas-proceso/:id

// Conceptos de Costo (Servicio + Proceso)
GET    /api/servicios/:id/conceptos-costo
POST   /api/servicios/:id/conceptos-costo
GET    /api/citas-proceso/:id/conceptos-costo
POST   /api/citas-proceso/:id/conceptos-costo
PUT    /api/conceptos-costo/:id
DELETE /api/conceptos-costo/:id

// Inversiones
GET    /api/proveedores/:id/inversiones
POST   /api/proveedores/:id/inversiones
PUT    /api/inversiones/:id
DELETE /api/inversiones/:id

// Análisis de Rentabilidad
GET    /api/cotizaciones/:id/analisis-rentabilidad
POST   /api/cotizaciones/:id/analizar-rentabilidad
GET    /api/proveedores/:id/rentabilidad-historica

// Cotizaciones
POST   /api/cotizaciones
GET    /api/cotizaciones/evento/:eventoId
GET    /api/cotizaciones/proveedor/:proveedorId
PUT    /api/cotizaciones/:id/estatus
```

### 11.6 Componentes Frontend Clave

```typescript
// Next.js + TypeScript + Tailwind

// Para Clientes
- EventCreationForm: Crear evento con presupuesto
- ServiceExplorer: Explorar servicios por categoría
- CostBreakdownViewer: Ver desglose transparente
- QuoteComparison: Comparar cotizaciones lado a lado

// Para Proveedores
- ServiceCreationForm: Crear servicio con conceptos
- InvestmentManager: Gestionar inversiones y depreciaciones
- ProcessAppointmentManager: Gestionar citas de proceso
- CostItemManager: Gestionar conceptos por servicio y proceso
- ProfitabilityAnalyzer: Análisis de rentabilidad en tiempo real
- TravelTimeCalculator: Calcular costos de viaje y tiempo
- BusinessViabilityDashboard: Panel de sostenibilidad del negocio
- JustificationEditor: Explicar cada costo detalladamente
- QuoteGenerator: Cotizaciones con análisis financiero completo
- ROICalculator: Cálculo de retorno de inversiones

// Compartidos
- TransparentCostDisplay: Mostrar costos justificados
- Dashboard: Panel principal por tipo de usuario
- AuthForms: Login/Register con Supabase
```

### 11.7 Roadmap de Desarrollo (8 semanas)

**Semana 1-2: Setup e Infraestructura**
- Configurar Render + Supabase
- Setup Next.js + TypeScript
- Implementar autenticación básica
- Crear esquema de base de datos

**Semana 3-4: Core de Costos y Rentabilidad**
- Crear/gestionar servicios
- Sistema de inversiones y depreciaciones
- Sistema de citas/procesos
- Conceptos de costo por servicio y proceso
- Análisis de rentabilidad en tiempo real
- Cálculo de tiempo de viaje y costos
- Justificaciones obligatorias
- Calculadora de precios con ROI

**Semana 5-6: Cotizaciones**
- Solicitar cotizaciones
- Generar cotizaciones automáticas
- Comparador de cotizaciones
- Dashboard básico

**Semana 7-8: Pulimiento y Deploy**
- UI/UX refinement
- Testing básico
- Deploy en Render/Vercel
- Documentación

### 9.44 Diagrama de Funcionalidades DIY y Presupuesto

```mermaid
flowchart TD
    subgraph "Cliente DIY"
        CDY[Cliente que hace cosas por sí mismo]
        CALC[Calculadora de Consumo]
        PRES[Generador por Presupuesto]
    end
    
    subgraph "Cálculos Inteligentes"
        DEMO[Análisis Demográfico]
        EDAD[Adultos/Niños/Adolescentes]
        FACT[Factores de Ajuste]
    end
    
    subgraph "Distribución de Presupuesto"
        LUGAR[Lugar: 30-40%]
        COMIDA[Banquete: 25-35%]
        MUSICA[Música: 10-15%]
        DECO[Decoración: 10-15%]
        FOTO[Fotografía: 5-10%]
    end
    
    subgraph "Compatibilidad Espacial"
        REQ[Requerimientos Espaciales]
        COMP[Filtros de Compatibilidad]
        MAPA[Generación Mapa 3D]
    end
    
    CDY --> CALC
    CDY --> PRES
    
    CALC --> DEMO
    DEMO --> EDAD
    EDAD --> FACT
    
    PRES --> LUGAR
    PRES --> COMIDA
    PRES --> MUSICA
    PRES --> DECO
    PRES --> FOTO
    
    LUGAR --> REQ
    REQ --> COMP
    COMP --> MAPA
```

### 11.8 Estimación de Costos Permanentemente Gratis

**Render (Free Tier - $0/mes):**
- 750 horas de ejecución/mes (suficiente para MVP)
- 512MB RAM, compartido vCPU
- Deploy automático desde GitHub
- SSL gratuito incluido

**Supabase (Free Tier - $0/mes):**
- 500MB base de datos PostgreSQL
- 50,000 usuarios autenticados
- 1GB storage para archivos
- 2GB transferencia/mes
- Real-time subscriptions incluidas

**Servicios Adicionales Gratuitos:**
- Vercel/Netlify: Frontend hosting gratis
- Google Maps: $200 crédito mensual
- Resend: 3,000 emails/mes
- GitHub: Repositorios ilimitados

**Total MVP: $0/mes permanentemente**

### 11.9 Escalabilidad cuando sea Necesario

**Cuando superes los límites gratuitos:**
- Render Starter: $7/mes (más recursos)
- Supabase Pro: $25/mes (más DB y usuarios)
- Pero solo cuando tengas ingresos reales

### 9.45 Diagrama de MVP - Análisis de Rentabilidad Empresarial

```mermaid
flowchart TD
    subgraph "Inversiones del Proveedor"
        CAM[Cámaras: $45,000]
        LEN[Lentes: $25,000]
        ILU[Iluminación: $15,000]
        VEH[Vehículo: $180,000]
        SOF[Software: $12,000/año]
        CAP[Capacitación: $20,000]
        TINV[TOTAL: $297,000]
    end
    
    subgraph "Costos por Evento"
        subgraph "Directos"
            CD1[Fotógrafo: $1,200]
            CD2[Asistente: $640]
            CD3[Combustible: $300]
            CD4[Edición: $600]
            TCD[Total: $2,740]
        end
        
        subgraph "Indirectos"
            CI1[Seguros: $200]
            CI2[Mantenimiento: $150]
            CI3[Almacenamiento: $100]
            CI4[Marketing: $300]
            TCI[Total: $750]
        end
        
        subgraph "Depreciación"
            DEP1[Equipo: $350]
            DEP2[Vehículo: $180]
            DEP3[Software: $100]
            TDEP[Total: $630]
        end
        
        subgraph "ROI"
            ROI1[20% anual esperado]
            ROI2[50 eventos/año]
            ROI3[Por evento: $1,188]
        end
    end
    
    subgraph "Análisis Final"
        CT[Costo Total: $5,308]
        PP[Precio Propuesto: $6,500]
        UN[Utilidad Neta: $1,192]
        MN[Margen: 18.3%]
        RENT[Rentable: SÍ]
        PE[Punto Equilibrio: 35 eventos]
    end
    
    subgraph "Decisiones Empresariales"
        MIN[Precio Mínimo: $5,800]
        OPT[Precio Óptimo: $6,500]
        CREC[Crecimiento: 65 eventos/año]
        NINV[Nueva Inversión: Drone $30K]
    end
    
    CAM --> TINV
    LEN --> TINV
    ILU --> TINV
    VEH --> TINV
    SOF --> TINV
    CAP --> TINV
    
    TCD --> CT
    TCI --> CT
    TDEP --> CT
    ROI3 --> CT
    
    CT --> PP
    PP --> UN
    UN --> MN
    MN --> RENT
    
    RENT --> MIN
    RENT --> OPT
    RENT --> CREC
    RENT --> NINV
```

### 9.46 Diagrama de Ecosistema Completo

```mermaid
flowchart TD
    subgraph "Usuarios del Sistema"
        UR[Usuario Registrado]
        UN[Usuario No Registrado]
        CL[Cliente]
        PR[Proveedor]
        CO[Colaborador]
    end
    
    subgraph "Funcionalidades Principales"
        EV[Gestión de Eventos]
        SE[Servicios Personalizados]
        CT[Auto-cotización]
        DS[Diseñador de Salones]
        IT[Itinerarios Inteligentes]
    end
    
    subgraph "Sistemas de Apoyo"
        AE[Ayuda Económica]
        AP[Acceso Público]
        MS[Matriz de Servicios]
        CB[Chatbot]
        NT[Notificaciones]
    end
    
    subgraph "Integraciones Externas"
        MP[Google Maps]
        PG[Pasarelas de Pago]
        MR[Mesas de Regalos]
        RS[Redes Sociales]
        WA[WhatsApp Business]
    end
    
    UR --> EV
    UN --> AP
    CL --> SE
    PR --> CT
    CO --> DS
    
    EV --> AE
    SE --> MS
    CT --> IT
    
    CB --> UR
    CB --> UN
    NT --> MR
    
    AP --> RS
    AE --> PG
    IT --> MP
    NT --> WA
```

### 9.47 Diagrama de Arquitectura Offline-First

```mermaid
flowchart TD
    subgraph "App Móvil Cliente"
        AC[App Cliente]
        SQLITE_C[SQLite Local]
        SYNC_C[Módulo Sync]
    end
    
    subgraph "App Móvil Proveedor"
        AP[App Proveedor]
        SQLITE_P[SQLite Local]
        SYNC_P[Módulo Sync]
    end
    
    subgraph "Servidor Central"
        API[API Gateway]
        DB[Base Datos Principal]
        QUEUE[Cola de Sincronización]
        WS[WebSocket Server]
    end
    
    AC --> SQLITE_C
    AP --> SQLITE_P
    
    SYNC_C -->|Cuando hay internet| API
    SYNC_P -->|Cuando hay internet| API
    
    API --> DB
    API --> QUEUE
    API --> WS
    
    WS -->|Push notifications| SYNC_C
    WS -->|Push notifications| SYNC_P
    
    QUEUE -->|Procesa cambios| DB
```

### 9.48 Diagrama de Flujo de Evento Multi-etapa

```mermaid
flowchart TD
    A[Cliente Crea Evento] --> B[Define Etapas del Evento]
    B --> C[Etapa 1: Ceremonia Religiosa]
    B --> D[Etapa 2: Sesión de Fotos]
    B --> E[Etapa 3: Recepción]
    
    C --> C1[Ubicación: Iglesia]
    C --> C2[Horario: 4:00-5:00 PM]
    C --> C3[Servicios: Decoración, Música]
    
    D --> D1[Ubicación: Jardín/Estudio]
    D --> D2[Horario: 5:30-7:00 PM]
    D --> D3[Servicios: Fotografía, Video]
    
    E --> E1[Ubicación: Salón de Eventos]
    E --> E2[Horario: 8:00 PM-2:00 AM]
    E --> E3[Servicios Simultáneos]
    
    E3 --> E3A[Música: 8:00-11:00 Banda]
    E3 --> E3B[Música: 11:00-2:00 DJ]
    E3 --> E3C[Banquete: 9:00-12:00]
    E3 --> E3D[Vals: 10:30-11:00]
    
    C1 --> F[Cálculo de Distancias]
    D1 --> F
    E1 --> F
    
    F --> G[Optimización Logística]
    G --> H[Cotizaciones por Etapa]
    H --> I[Itinerario Completo]
```

---
**Fecha de creación**: 29 de Julio, 2025
**Estado**: Especificación extendida con funcionalidades avanzadas
**Última actualización**: Sistema completo de invitaciones, pagos simplificados, prevención de conflictos
**Próxima revisión**: Definición de MVP y APIs