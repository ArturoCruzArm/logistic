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

// GET /api/eventos - Listar eventos del usuario
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, estatus } = req.query;
    const offset = (page - 1) * limit;
    
    let query = supabase
      .from('eventos')
      .select(`
        *,
        usuario:usuarios(id, nombre, email)
      `)
      .eq('usuario_id', req.user.userId)
      .order('fecha_evento', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (estatus) {
      query = query.eq('estatus', estatus);
    }
    
    const result = await executeQuery(
      () => query,
      'Error al obtener eventos'
    );
    
    res.json({
      eventos: result.data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: result.data?.length || 0
      }
    });
    
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// POST /api/eventos - Crear nuevo evento
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      nombre,
      tipo_evento,
      fecha_evento,
      hora_inicio,
      numero_invitados,
      presupuesto_estimado,
      descripcion,
      ubicaciones,
      requerimientos_especiales
    } = req.body;
    
    // Validaciones básicas
    if (!nombre || !tipo_evento || !fecha_evento || !numero_invitados) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre, tipo_evento, fecha_evento, numero_invitados' 
      });
    }
    
    // Validar fecha no sea en el pasado
    const fechaEvento = new Date(fecha_evento);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaEvento < hoy) {
      return res.status(400).json({ 
        error: 'La fecha del evento no puede ser en el pasado' 
      });
    }
    
    const eventoData = {
      usuario_id: req.user.userId,
      nombre,
      tipo_evento,
      fecha_evento,
      hora_inicio,
      numero_invitados: parseInt(numero_invitados),
      presupuesto_estimado: presupuesto_estimado ? parseFloat(presupuesto_estimado) : null,
      descripcion,
      requerimientos_especiales,
      estatus: 'planificacion',
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await executeQuery(
      () => supabase.from('eventos').insert([eventoData]).select(`
        *,
        usuario:usuarios(id, nombre, email)
      `).single(),
      'Error al crear evento'
    );
    
    // Si hay ubicaciones, crearlas
    if (ubicaciones && ubicaciones.length > 0) {
      const ubicacionesData = ubicaciones.map((ubicacion, index) => ({
        evento_id: result.data.id,
        nombre: ubicacion.nombre,
        direccion: ubicacion.direccion,
        tipo_ubicacion: ubicacion.tipo_ubicacion || 'principal',
        capacidad_maxima: ubicacion.capacidad_maxima,
        orden_secuencia: index + 1,
        coordenadas_lat: ubicacion.coordenadas_lat,
        coordenadas_lng: ubicacion.coordenadas_lng
      }));
      
      await executeQuery(
        () => supabase.from('ubicaciones_evento').insert(ubicacionesData),
        'Error al crear ubicaciones del evento'
      );
    }
    
    res.status(201).json({
      message: 'Evento creado exitosamente',
      evento: result.data
    });
    
  } catch (error) {
    console.error('Error al crear evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// GET /api/eventos/:id - Obtener evento específico
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      () => supabase
        .from('eventos')
        .select(`
          *,
          usuario:usuarios(id, nombre, email),
          ubicaciones:ubicaciones_evento(*),
          etapas:etapas_evento(*),
          invitados:invitados_evento(*)
        `)
        .eq('id', id)
        .eq('usuario_id', req.user.userId)
        .single(),
      'Error al obtener evento'
    );
    
    if (!result.data) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({
      evento: result.data
    });
    
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

// PUT /api/eventos/:id - Actualizar evento
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Remover campos que no se deben actualizar directamente
    delete updateData.id;
    delete updateData.usuario_id;
    delete updateData.fecha_creacion;
    
    // Validar que el evento pertenece al usuario
    const { data: existingEvent } = await supabase
      .from('eventos')
      .select('id')
      .eq('id', id)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (!existingEvent) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Validar fecha si se está actualizando
    if (updateData.fecha_evento) {
      const fechaEvento = new Date(updateData.fecha_evento);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fechaEvento < hoy) {
        return res.status(400).json({ 
          error: 'La fecha del evento no puede ser en el pasado' 
        });
      }
    }
    
    updateData.fecha_actualizacion = new Date().toISOString();
    
    const result = await executeQuery(
      () => supabase
        .from('eventos')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          usuario:usuarios(id, nombre, email)
        `)
        .single(),
      'Error al actualizar evento'
    );
    
    res.json({
      message: 'Evento actualizado exitosamente',
      evento: result.data
    });
    
  } catch (error) {
    console.error('Error al actualizar evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

module.exports = router;