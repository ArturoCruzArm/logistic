-- ESQUEMA DE BASE DE DATOS PARA MVP - PLATAFORMA DE EVENTOS
-- Versión: 1.0
-- Compatible con: PostgreSQL (Supabase)

-- ============================================
-- 1. TABLA DE USUARIOS (CORE)
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('cliente', 'proveedor')),
  
  -- Campos específicos para proveedores
  nombre_empresa VARCHAR(255),
  descripcion_servicios TEXT,
  experiencia_anos INTEGER,
  
  -- Campos de control
  estatus VARCHAR(20) DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo', 'suspendido')),
  fecha_registro TIMESTAMP DEFAULT NOW(),
  ultimo_login TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_estatus ON usuarios(estatus);

-- ============================================
-- 2. TABLA DE EVENTOS (CORE)
-- ============================================

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  tipo_evento VARCHAR(100) NOT NULL,
  fecha_evento DATE NOT NULL,
  hora_inicio TIME,
  numero_invitados INTEGER NOT NULL CHECK (numero_invitados > 0),
  presupuesto_estimado DECIMAL(10,2),
  descripcion TEXT,
  requerimientos_especiales TEXT,
  
  -- Control de estado
  estatus VARCHAR(30) DEFAULT 'planificacion' CHECK (estatus IN ('planificacion', 'cotizando', 'confirmado', 'realizado', 'cancelado')),
  
  -- Timestamps
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Índices para eventos
CREATE INDEX idx_eventos_usuario ON eventos(usuario_id);
CREATE INDEX idx_eventos_fecha ON eventos(fecha_evento);
CREATE INDEX idx_eventos_tipo ON eventos(tipo_evento);
CREATE INDEX idx_eventos_estatus ON eventos(estatus);

-- ============================================
-- 3. CATEGORIAS DE SERVICIO (CORE)
-- ============================================

CREATE TABLE categorias_servicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(50),
  orden_display INTEGER DEFAULT 0,
  estatus VARCHAR(20) DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar categorías básicas
INSERT INTO categorias_servicio (nombre, descripcion, orden_display) VALUES
('Catering', 'Servicios de alimentación y bebidas', 1),
('Decoración', 'Decoración y ambientación de espacios', 2),
('Música y Entretenimiento', 'DJs, bandas y espectáculos', 3),
('Fotografía', 'Servicios fotográficos y videografía', 4),
('Transporte', 'Servicios de transporte para invitados', 5),
('Florería', 'Arreglos florales y centros de mesa', 6),
('Pastelería', 'Pasteles y postres especializados', 7),
('Mobiliario', 'Renta de mesas, sillas y mobiliario', 8);

-- ============================================
-- 4. TABLA DE SERVICIOS (CORE)
-- ============================================

CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias_servicio(id),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  precio_base DECIMAL(10,2) NOT NULL CHECK (precio_base >= 0),
  
  -- Compatibilidad con eventos
  tipos_evento_compatibles TEXT[] DEFAULT '{}',
  capacidad_minima INTEGER,
  capacidad_maxima INTEGER,
  tiempo_preparacion_horas INTEGER DEFAULT 0,
  requiere_cita_previa BOOLEAN DEFAULT false,
  ubicaciones_cobertura TEXT[] DEFAULT '{}',
  
  -- Métricas de calidad
  calificacion_promedio DECIMAL(3,2) DEFAULT 0.00,
  total_eventos_realizados INTEGER DEFAULT 0,
  
  -- Control
  estatus VARCHAR(20) DEFAULT 'activo' CHECK (estatus IN ('activo', 'inactivo', 'suspendido')),
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Índices para servicios
CREATE INDEX idx_servicios_proveedor ON servicios(proveedor_id);
CREATE INDEX idx_servicios_categoria ON servicios(categoria_id);
CREATE INDEX idx_servicios_precio ON servicios(precio_base);
CREATE INDEX idx_servicios_calificacion ON servicios(calificacion_promedio);

-- ============================================
-- 5. CITAS DE PROCESO (TRANSPARENCIA)
-- ============================================

CREATE TABLE citas_proceso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
  nombre_cita VARCHAR(255) NOT NULL,
  descripcion TEXT,
  duracion_estimada_horas DECIMAL(4,2) NOT NULL,
  es_obligatoria BOOLEAN DEFAULT true,
  costo_por_hora DECIMAL(8,2) NOT NULL,
  incluye_traslado BOOLEAN DEFAULT false,
  distancia_maxima_km INTEGER,
  justificacion TEXT NOT NULL, -- OBLIGATORIO para transparencia
  
  -- Orden y control
  orden_secuencia INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para citas de proceso
CREATE INDEX idx_citas_servicio ON citas_proceso(servicio_id);

-- ============================================
-- 6. INVERSIONES DEL PROVEEDOR (TRANSPARENCIA)
-- ============================================

CREATE TABLE inversiones_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  nombre_inversion VARCHAR(255) NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL CHECK (monto_total > 0),
  fecha_inversion DATE NOT NULL,
  vida_util_meses INTEGER NOT NULL CHECK (vida_util_meses > 0),
  valor_residual DECIMAL(10,2) DEFAULT 0,
  porcentaje_uso_eventos DECIMAL(5,2) DEFAULT 100 CHECK (porcentaje_uso_eventos BETWEEN 0 AND 100),
  descripcion TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para inversiones
CREATE INDEX idx_inversiones_proveedor ON inversiones_proveedor(proveedor_id);
CREATE INDEX idx_inversiones_fecha ON inversiones_proveedor(fecha_inversion);

-- ============================================
-- 7. CONCEPTOS DE COSTO (TRANSPARENCIA)
-- ============================================

CREATE TABLE conceptos_costo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
  cita_proceso_id UUID REFERENCES citas_proceso(id), -- NULL si es concepto general
  
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_unitario DECIMAL(8,2) NOT NULL CHECK (precio_unitario >= 0),
  unidad_medida VARCHAR(50) DEFAULT 'unidad',
  es_obligatorio BOOLEAN DEFAULT false,
  justificacion TEXT NOT NULL, -- OBLIGATORIO para transparencia
  
  -- Control
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para conceptos de costo
CREATE INDEX idx_conceptos_servicio ON conceptos_costo(servicio_id);
CREATE INDEX idx_conceptos_cita ON conceptos_costo(cita_proceso_id);

-- ============================================
-- 8. COTIZACIONES (CORE)
-- ============================================

CREATE TABLE cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES eventos(id) ON DELETE CASCADE,
  servicio_id UUID REFERENCES servicios(id),
  proveedor_id UUID REFERENCES usuarios(id),
  cliente_id UUID REFERENCES usuarios(id),
  
  -- Desglose transparente de costos
  precio_base DECIMAL(10,2) NOT NULL,
  costo_depreciacion DECIMAL(10,2) DEFAULT 0,
  total_conceptos DECIMAL(10,2) DEFAULT 0,
  costo_citas_proceso DECIMAL(10,2) DEFAULT 0,
  margen_ganancia DECIMAL(10,2) DEFAULT 0,
  total_cotizacion DECIMAL(10,2) NOT NULL,
  
  -- Detalle de conceptos (JSON)
  conceptos_detalle JSONB DEFAULT '[]',
  
  -- Control de estado
  estatus VARCHAR(30) DEFAULT 'pendiente' CHECK (estatus IN ('pendiente', 'aceptada', 'rechazada', 'finalizada')),
  
  -- Fechas y notas
  fecha_solicitud TIMESTAMP DEFAULT NOW(),
  fecha_respuesta TIMESTAMP,
  notas_cliente TEXT,
  notas_proveedor TEXT,
  
  -- Timestamps
  fecha_creacion TIMESTAMP DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP DEFAULT NOW()
);

-- Índices para cotizaciones
CREATE INDEX idx_cotizaciones_evento ON cotizaciones(evento_id);
CREATE INDEX idx_cotizaciones_proveedor ON cotizaciones(proveedor_id);
CREATE INDEX idx_cotizaciones_cliente ON cotizaciones(cliente_id);
CREATE INDEX idx_cotizaciones_estatus ON cotizaciones(estatus);

-- ============================================
-- 9. ANÁLISIS DE RENTABILIDAD (CORE MVP)
-- ============================================

CREATE TABLE analisis_rentabilidad (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID REFERENCES cotizaciones(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES usuarios(id),
  
  -- Análisis financiero
  ingresos_totales DECIMAL(10,2) NOT NULL,
  costos_directos DECIMAL(10,2) NOT NULL,
  costos_depreciacion DECIMAL(10,2) DEFAULT 0,
  costos_proceso DECIMAL(10,2) DEFAULT 0, -- Citas, traslados, etc.
  margen_bruto DECIMAL(10,2) NOT NULL,
  porcentaje_rentabilidad DECIMAL(5,2) NOT NULL,
  punto_equilibrio DECIMAL(10,2) NOT NULL,
  
  -- Recomendaciones del sistema
  precio_minimo_sugerido DECIMAL(10,2),
  es_rentable BOOLEAN GENERATED ALWAYS AS (porcentaje_rentabilidad > 0) STORED,
  
  -- Timestamps
  fecha_analisis TIMESTAMP DEFAULT NOW()
);

-- Índices para análisis de rentabilidad
CREATE INDEX idx_analisis_cotizacion ON analisis_rentabilidad(cotizacion_id);
CREATE INDEX idx_analisis_proveedor ON analisis_rentabilidad(proveedor_id);
CREATE INDEX idx_analisis_rentable ON analisis_rentabilidad(es_rentable);

-- ============================================
-- TRIGGERS PARA TIMESTAMPS AUTOMÁTICOS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a las tablas que lo necesitan
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_servicios_updated_at BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inversiones_updated_at BEFORE UPDATE ON inversiones_proveedor
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cotizaciones_updated_at BEFORE UPDATE ON cotizaciones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON SCHEMA public IS 'Esquema MVP para Plataforma de Eventos con Transparencia de Costos';
COMMENT ON TABLE usuarios IS 'Usuarios del sistema: clientes y proveedores';
COMMENT ON TABLE eventos IS 'Eventos sociales a organizar';
COMMENT ON TABLE servicios IS 'Servicios ofrecidos por proveedores';
COMMENT ON TABLE inversiones_proveedor IS 'Inversiones de proveedores para cálculo de depreciación';
COMMENT ON TABLE conceptos_costo IS 'Conceptos detallados de costo con justificación obligatoria';
COMMENT ON TABLE cotizaciones IS 'Cotizaciones con desglose transparente completo';
COMMENT ON TABLE analisis_rentabilidad IS 'Análisis automático de rentabilidad para proveedores';