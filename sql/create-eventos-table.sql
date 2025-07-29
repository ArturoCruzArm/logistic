-- Crear tabla de eventos
CREATE TABLE IF NOT EXISTS eventos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL,
    nombre_evento VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_evento DATE NOT NULL,
    hora_evento TIME,
    ubicacion VARCHAR(500) NOT NULL,
    numero_invitados INTEGER NOT NULL,
    presupuesto_estimado DECIMAL(10,2),
    tipo_evento VARCHAR(100),
    servicios_requeridos TEXT[] DEFAULT '{}',
    estatus VARCHAR(50) DEFAULT 'planificacion',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_eventos_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_numero_invitados 
        CHECK (numero_invitados > 0),
    CONSTRAINT check_presupuesto 
        CHECK (presupuesto_estimado >= 0),
    CONSTRAINT check_estatus 
        CHECK (estatus IN ('planificacion', 'confirmado', 'en_progreso', 'completado', 'cancelado'))
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_eventos_usuario_id ON eventos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_fecha_evento ON eventos(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_estatus ON eventos(estatus);
CREATE INDEX IF NOT EXISTS idx_eventos_tipo ON eventos(tipo_evento);

-- Habilitar Row Level Security (RLS)
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios solo pueden ver sus propios eventos
CREATE POLICY "Users can view own eventos" ON eventos
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

-- Policy: Los usuarios solo pueden insertar eventos para sí mismos
CREATE POLICY "Users can insert own eventos" ON eventos
    FOR INSERT WITH CHECK (auth.uid()::text = usuario_id::text);

-- Policy: Los usuarios solo pueden actualizar sus propios eventos
CREATE POLICY "Users can update own eventos" ON eventos
    FOR UPDATE USING (auth.uid()::text = usuario_id::text);

-- Policy: Los usuarios solo pueden eliminar sus propios eventos
CREATE POLICY "Users can delete own eventos" ON eventos
    FOR DELETE USING (auth.uid()::text = usuario_id::text);

-- Comentarios para documentación
COMMENT ON TABLE eventos IS 'Tabla para almacenar eventos creados por los clientes';
COMMENT ON COLUMN eventos.usuario_id IS 'ID del usuario que creó el evento (debe ser tipo cliente)';
COMMENT ON COLUMN eventos.servicios_requeridos IS 'Array de servicios requeridos para el evento';
COMMENT ON COLUMN eventos.estatus IS 'Estado actual del evento: planificacion, confirmado, en_progreso, completado, cancelado';