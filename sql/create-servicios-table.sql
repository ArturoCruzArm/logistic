-- Crear tabla de servicios
CREATE TABLE IF NOT EXISTS servicios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    proveedor_id UUID NOT NULL,
    nombre_servicio VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(100) NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL,
    unidad_precio VARCHAR(50) DEFAULT 'evento',
    ubicaciones_disponibles TEXT[] DEFAULT '{}',
    tiempo_preparacion_dias INTEGER DEFAULT 7,
    incluye TEXT[] DEFAULT '{}',
    no_incluye TEXT[] DEFAULT '{}',
    terminos_condiciones TEXT,
    imagenes_urls TEXT[] DEFAULT '{}',
    disponibilidad_especial TEXT,
    estatus VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_servicios_proveedor 
        FOREIGN KEY (proveedor_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE,
    
    -- Check constraints
    CONSTRAINT check_precio_base 
        CHECK (precio_base >= 0),
    CONSTRAINT check_tiempo_preparacion 
        CHECK (tiempo_preparacion_dias >= 0),
    CONSTRAINT check_estatus_servicio
        CHECK (estatus IN ('activo', 'inactivo', 'pausado')),
    CONSTRAINT check_unidad_precio
        CHECK (unidad_precio IN ('evento', 'hora', 'dia', 'persona', 'pieza', 'metro', 'paquete'))
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_servicios_proveedor_id ON servicios(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON servicios(categoria);
CREATE INDEX IF NOT EXISTS idx_servicios_estatus ON servicios(estatus);
CREATE INDEX IF NOT EXISTS idx_servicios_precio_base ON servicios(precio_base);
CREATE INDEX IF NOT EXISTS idx_servicios_ubicaciones ON servicios USING GIN(ubicaciones_disponibles);

-- Habilitar Row Level Security (RLS)
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Policy: Cualquier usuario puede ver servicios activos
CREATE POLICY "Anyone can view active servicios" ON servicios
    FOR SELECT USING (estatus = 'activo');

-- Policy: Solo proveedores pueden insertar servicios
CREATE POLICY "Providers can insert servicios" ON servicios
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text::uuid 
            AND tipo_usuario = 'proveedor'
        )
    );

-- Policy: Los proveedores solo pueden actualizar/eliminar sus propios servicios
CREATE POLICY "Providers can update own servicios" ON servicios
    FOR UPDATE USING (proveedor_id::text = auth.uid()::text);

CREATE POLICY "Providers can delete own servicios" ON servicios
    FOR DELETE USING (proveedor_id::text = auth.uid()::text);

-- Crear función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar automáticamente fecha_actualizacion
CREATE TRIGGER update_servicios_updated_at 
    BEFORE UPDATE ON servicios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE servicios IS 'Catálogo de servicios ofrecidos por proveedores';
COMMENT ON COLUMN servicios.proveedor_id IS 'ID del proveedor que ofrece el servicio';
COMMENT ON COLUMN servicios.precio_base IS 'Precio base del servicio en la moneda local';
COMMENT ON COLUMN servicios.unidad_precio IS 'Unidad de medida para el precio (evento, hora, día, etc.)';
COMMENT ON COLUMN servicios.ubicaciones_disponibles IS 'Array de ubicaciones donde se puede prestar el servicio';
COMMENT ON COLUMN servicios.incluye IS 'Array de elementos/servicios incluidos en el precio base';
COMMENT ON COLUMN servicios.no_incluye IS 'Array de elementos/servicios NO incluidos en el precio base';
COMMENT ON COLUMN servicios.estatus IS 'Estado del servicio: activo, inactivo, pausado';

-- Insertar algunas categorías comunes como referencia
INSERT INTO servicios (proveedor_id, nombre_servicio, descripcion, categoria, precio_base, unidad_precio, incluye, no_incluye) 
VALUES 
    -- Estos serán ejemplos, en realidad los proveedores crearán sus propios servicios
    (gen_random_uuid(), 'Ejemplo - Catering Básico', 'Servicio de catering para eventos medianos', 'catering', 15000.00, 'evento', 
     ARRAY['Menú de 3 tiempos', 'Servicio de meseros', 'Vajilla básica'], 
     ARRAY['Bebidas alcohólicas', 'Decoración', 'Mobiliario']),
    (gen_random_uuid(), 'Ejemplo - Fotografía Profesional', 'Cobertura fotográfica completa del evento', 'fotografia', 8000.00, 'evento',
     ARRAY['300+ fotos editadas', 'Álbum digital', 'Sesión de 8 horas'],
     ARRAY['Video', 'Impresiones físicas', 'Drone'])
ON CONFLICT DO NOTHING;