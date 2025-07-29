const express = require('express');
const { supabase, executeQuery } = require('../config/database');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar que el usuario es proveedor
const isProvider = (req, res, next) => {
  if (req.user.tipo_usuario !== 'proveedor') {
    return res.status(403).json({ error: 'Acceso restringido a proveedores' });
  }
  next();
};

// GET /api/servicios - Listar todos los servicios (público para clientes)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      categoria_id, 
      tipo_evento, 
      precio_min, 
      precio_max, 
      ubicacion,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('servicios')
      .select(`
        *,
        proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa, telefono),
        categoria:categorias_servicio(id, nombre, descripcion)
      `)
      .eq('estatus', 'activo')
      .order('calificacion_promedio', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (categoria_id) {
      query = query.eq('categoria_id', categoria_id);
    }
    
    if (tipo_evento) {
      query = query.contains('tipos_evento_compatibles', [tipo_evento]);
    }
    
    if (precio_min) {
      query = query.gte('precio_base', parseFloat(precio_min));
    }
    
    if (precio_max) {
      query = query.lte('precio_base', parseFloat(precio_max));
    }
    
    const result = await executeQuery(
      () => query,
      'Error al obtener servicios'
    );
    
    res.json({
      servicios: result.data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.data?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// POST /api/servicios - Crear nuevo servicio (solo proveedores)
router.post('/', verifyToken, isProvider, async (req, res) => {
  try {
    const {
      categoria_id,
      nombre,
      descripcion,
      precio_base,
      tipos_evento_compatibles,
      capacidad_minima,
      capacidad_maxima,
      tiempo_preparacion_horas,
      requiere_cita_previa,
      ubicaciones_cobertura,
      conceptos_costo_incluidos
    } = req.body;
    
    // Validaciones básicas
    if (!categoria_id || !nombre || !descripcion || !precio_base) {
      return res.status(400).json({ 
        error: 'Campos requeridos: categoria_id, nombre, descripcion, precio_base' 
      });
    }
    
    // Verificar que la categoría existe
    const { data: categoria } = await supabase
      .from('categorias_servicio')
      .select('id')
      .eq('id', categoria_id)
      .single();
    
    if (!categoria) {
      return res.status(400).json({ error: 'Categoría de servicio no encontrada' });
    }
    
    const servicioData = {
      proveedor_id: req.user.userId,
      categoria_id,
      nombre,
      descripcion,
      precio_base: parseFloat(precio_base),
      tipos_evento_compatibles: tipos_evento_compatibles || [],
      capacidad_minima: capacidad_minima ? parseInt(capacidad_minima) : null,
      capacidad_maxima: capacidad_maxima ? parseInt(capacidad_maxima) : null,
      tiempo_preparacion_horas: tiempo_preparacion_horas ? parseInt(tiempo_preparacion_horas) : 0,
      requiere_cita_previa: requiere_cita_previa || false,
      ubicaciones_cobertura: ubicaciones_cobertura || [],
      estatus: 'activo',
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await executeQuery(
      () => supabase.from('servicios').insert([servicioData]).select(`
        *,
        proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa),
        categoria:categorias_servicio(id, nombre, descripcion)
      `).single(),
      'Error al crear servicio'
    );
    
    // Si hay conceptos de costo incluidos, crearlos
    if (conceptos_costo_incluidos && conceptos_costo_incluidos.length > 0) {
      const conceptosData = conceptos_costo_incluidos.map(concepto => ({
        servicio_id: result.data.id,
        nombre: concepto.nombre,
        descripcion: concepto.descripcion,
        precio_unitario: parseFloat(concepto.precio_unitario),
        unidad_medida: concepto.unidad_medida || 'unidad',
        es_obligatorio: concepto.es_obligatorio || false,
        justificacion: concepto.justificacion || ''
      }));
      
      await executeQuery(
        () => supabase.from('conceptos_costo').insert(conceptosData),
        'Error al crear conceptos de costo'
      );
    }
    
    res.status(201).json({
      message: 'Servicio creado exitosamente',
      servicio: result.data
    });
    
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ error: 'Error al crear servicio' });
  }
});

// GET /api/servicios/:id - Obtener servicio específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      () => supabase
        .from('servicios')
        .select(`
          *,
          proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa, telefono, descripcion_servicios),
          categoria:categorias_servicio(id, nombre, descripcion),
          conceptos_costo(*),
          citas_proceso(*)
        `)
        .eq('id', id)
        .single(),
      'Error al obtener servicio'
    );
    
    if (!result.data) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    res.json({
      servicio: result.data
    });
    
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ error: 'Error al obtener servicio' });
  }
});

// GET /api/servicios/categoria/:categoriaId - Servicios por categoría
router.get('/categoria/:categoriaId', verifyToken, async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const { limit = 10 } = req.query;
    
    const result = await executeQuery(
      () => supabase
        .from('servicios')
        .select(`
          *,
          proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa),
          categoria:categorias_servicio(id, nombre, descripcion)
        `)
        .eq('categoria_id', categoriaId)
        .eq('estatus', 'activo')
        .order('calificacion_promedio', { ascending: false })
        .limit(parseInt(limit)),
      'Error al obtener servicios por categoría'
    );
    
    res.json({
      servicios: result.data || [],
      categoria_id: categoriaId
    });
    
  } catch (error) {
    console.error('Error al obtener servicios por categoría:', error);
    res.status(500).json({ error: 'Error al obtener servicios por categoría' });
  }
});

module.exports = router;