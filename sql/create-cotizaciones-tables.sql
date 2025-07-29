-- Crear tabla principal de cotizaciones
CREATE TABLE IF NOT EXISTS cotizaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    evento_id UUID,
    fecha_evento DATE,
    ubicacion_evento VARCHAR(500),
    numero_invitados INTEGER,
    presupuesto_maximo DECIMAL(12,2),
    requisitos_especiales TEXT,
    fecha_limite_respuesta TIMESTAMP WITH TIME ZONE NOT NULL,
    estatus VARCHAR(50) DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_aceptacion TIMESTAMP WITH TIME ZONE,
    
    -- Foreign key constraints
    CONSTRAINT fk_cotizaciones_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_cotizaciones_evento 
        FOREIGN KEY (evento_id) 
        REFERENCES eventos(id) 
        ON DELETE SET NULL,
    
    -- Check constraints
    CONSTRAINT check_numero_invitados_cotizacion 
        CHECK (numero_invitados > 0),
    CONSTRAINT check_presupuesto_maximo 
        CHECK (presupuesto_maximo >= 0),
    CONSTRAINT check_estatus_cotizacion
        CHECK (estatus IN ('pendiente', 'aceptada', 'cancelada', 'expirada')),
    CONSTRAINT check_fecha_limite
        CHECK (fecha_limite_respuesta > fecha_creacion)
);

-- Crear tabla de detalles de cotización (servicios solicitados)
CREATE TABLE IF NOT EXISTS cotizacion_detalles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cotizacion_id UUID NOT NULL,
    servicio_id UUID NOT NULL,
    cantidad INTEGER DEFAULT 1,
    notas_especiales TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_cotizacion_detalles_cotizacion 
        FOREIGN KEY (cotizacion_id) 
        REFERENCES cotizaciones(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_cotizacion_detalles_servicio 
        FOREIGN KEY (servicio_id) 
        REFERENCES servicios(id) 
        ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_cantidad_detalle 
        CHECK (cantidad > 0),
    
    -- Unique constraint: un servicio por cotización
    CONSTRAINT unique_servicio_por_cotizacion 
        UNIQUE (cotizacion_id, servicio_id)
);

-- Crear tabla de respuestas de proveedores
CREATE TABLE IF NOT EXISTS cotizacion_respuestas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cotizacion_id UUID NOT NULL,
    detalle_id UUID NOT NULL,
    proveedor_id UUID NOT NULL,
    precio_propuesto DECIMAL(12,2) NOT NULL,
    descripcion_propuesta TEXT NOT NULL,
    tiempo_entrega VARCHAR(100),
    condiciones TEXT,
    desglose_costos JSONB DEFAULT '[]',
    validez_propuesta TIMESTAMP WITH TIME ZONE,
    estatus VARCHAR(50) DEFAULT 'enviada',
    fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints
    CONSTRAINT fk_cotizacion_respuestas_cotizacion 
        FOREIGN KEY (cotizacion_id) 
        REFERENCES cotizaciones(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_cotizacion_respuestas_detalle 
        FOREIGN KEY (detalle_id) 
        REFERENCES cotizacion_detalles(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_cotizacion_respuestas_proveedor 
        FOREIGN KEY (proveedor_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_precio_propuesto 
        CHECK (precio_propuesto >= 0),
    CONSTRAINT check_estatus_respuesta
        CHECK (estatus IN ('enviada', 'aceptada', 'rechazada', 'retirada')),
    
    -- Unique constraint: una respuesta por proveedor por detalle
    CONSTRAINT unique_respuesta_proveedor_detalle 
        UNIQUE (detalle_id, proveedor_id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_cotizaciones_cliente_id ON cotizaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_evento_id ON cotizaciones(evento_id);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_estatus ON cotizaciones(estatus);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha_evento ON cotizaciones(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_fecha_limite ON cotizaciones(fecha_limite_respuesta);

CREATE INDEX IF NOT EXISTS idx_cotizacion_detalles_cotizacion_id ON cotizacion_detalles(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_detalles_servicio_id ON cotizacion_detalles(servicio_id);

CREATE INDEX IF NOT EXISTS idx_cotizacion_respuestas_cotizacion_id ON cotizacion_respuestas(cotizacion_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_respuestas_detalle_id ON cotizacion_respuestas(detalle_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_respuestas_proveedor_id ON cotizacion_respuestas(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_respuestas_estatus ON cotizacion_respuestas(estatus);

-- Habilitar Row Level Security (RLS)
ALTER TABLE cotizaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_respuestas ENABLE ROW LEVEL SECURITY;

-- Policies para cotizaciones
CREATE POLICY "Clients can view own cotizaciones" ON cotizaciones
    FOR SELECT USING (cliente_id::text = auth.uid()::text);

CREATE POLICY "Clients can insert own cotizaciones" ON cotizaciones
    FOR INSERT WITH CHECK (cliente_id::text = auth.uid()::text);

CREATE POLICY "Clients can update own cotizaciones" ON cotizaciones
    FOR UPDATE USING (cliente_id::text = auth.uid()::text);

-- Policies para detalles de cotización
CREATE POLICY "Users can view cotizacion_detalles if they own cotizacion" ON cotizacion_detalles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cotizaciones 
            WHERE id = cotizacion_id 
            AND cliente_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Clients can insert cotizacion_detalles for own cotizaciones" ON cotizacion_detalles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM cotizaciones 
            WHERE id = cotizacion_id 
            AND cliente_id::text = auth.uid()::text
        )
    );

-- Policies para respuestas de cotización
CREATE POLICY "Providers can view respuestas for their services" ON cotizacion_respuestas
    FOR SELECT USING (proveedor_id::text = auth.uid()::text);

CREATE POLICY "Clients can view respuestas for their cotizaciones" ON cotizacion_respuestas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cotizaciones 
            WHERE id = cotizacion_id 
            AND cliente_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Providers can insert respuestas for their services" ON cotizacion_respuestas
    FOR INSERT WITH CHECK (proveedor_id::text = auth.uid()::text);

CREATE POLICY "Providers can update own respuestas" ON cotizacion_respuestas
    FOR UPDATE USING (proveedor_id::text = auth.uid()::text);

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_cotizacion_respuestas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente fecha_actualizacion
CREATE TRIGGER update_cotizacion_respuestas_updated_at 
    BEFORE UPDATE ON cotizacion_respuestas
    FOR EACH ROW EXECUTE FUNCTION update_cotizacion_respuestas_updated_at();

-- Función para verificar que un proveedor solo responda a servicios suyos
CREATE OR REPLACE FUNCTION check_proveedor_owns_service()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM cotizacion_detalles cd
        JOIN servicios s ON s.id = cd.servicio_id
        WHERE cd.id = NEW.detalle_id 
        AND s.proveedor_id = NEW.proveedor_id
    ) THEN
        RAISE EXCEPTION 'El proveedor no puede responder a servicios que no son suyos';
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar que proveedor responda solo a sus servicios
CREATE TRIGGER check_proveedor_service_ownership
    BEFORE INSERT OR UPDATE ON cotizacion_respuestas
    FOR EACH ROW EXECUTE FUNCTION check_proveedor_owns_service();

-- Comentarios para documentación
COMMENT ON TABLE cotizaciones IS 'Tabla principal de cotizaciones solicitadas por clientes';
COMMENT ON TABLE cotizacion_detalles IS 'Detalles de servicios solicitados en cada cotización';
COMMENT ON TABLE cotizacion_respuestas IS 'Respuestas de proveedores a las cotizaciones';

COMMENT ON COLUMN cotizaciones.fecha_limite_respuesta IS 'Fecha límite para que proveedores respondan';
COMMENT ON COLUMN cotizacion_respuestas.desglose_costos IS 'JSON con desglose detallado de costos para transparencia';
COMMENT ON COLUMN cotizacion_respuestas.estatus IS 'Estado de la respuesta: enviada, aceptada, rechazada, retirada';