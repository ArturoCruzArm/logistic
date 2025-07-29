const express = require('express');
const { supabase, executeQuery, costCalculations } = require('../config/database');
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

// POST /api/cotizaciones - Crear cotización
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      evento_id,
      servicio_id,
      conceptos_solicitados,
      fecha_solicitud,
      notas_cliente
    } = req.body;
    
    // Validaciones básicas
    if (!evento_id || !servicio_id) {
      return res.status(400).json({ 
        error: 'Campos requeridos: evento_id, servicio_id' 
      });
    }
    
    // Verificar que el evento pertenece al usuario
    const { data: evento } = await supabase
      .from('eventos')
      .select('id, usuario_id, numero_invitados, fecha_evento')
      .eq('id', evento_id)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    // Obtener información del servicio y proveedor
    const { data: servicio } = await supabase
      .from('servicios')
      .select(`
        *,
        proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa),
        conceptos_costo(*)
      `)
      .eq('id', servicio_id)
      .single();
    
    if (!servicio) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
    
    // Obtener inversiones del proveedor para cálculo de costos
    const { data: inversiones } = await supabase
      .from('inversiones_proveedor')
      .select('*')
      .eq('proveedor_id', servicio.proveedor_id);
    
    // Calcular costo base con transparencia
    const costoDepreciacion = costCalculations.calculateEventCost(inversiones || [], 100);
    const precioBase = parseFloat(servicio.precio_base);
    
    // Calcular conceptos adicionales solicitados
    let conceptosDetalle = [];
    let totalConceptos = 0;
    
    if (conceptos_solicitados && conceptos_solicitados.length > 0) {
      for (const conceptoSolicitado of conceptos_solicitados) {
        const concepto = servicio.conceptos_costo.find(c => c.id === conceptoSolicitado.concepto_id);
        if (concepto) {
          const cantidad = parseFloat(conceptoSolicitado.cantidad) || 1;
          const subtotal = concepto.precio_unitario * cantidad;
          
          conceptosDetalle.push({
            concepto_id: concepto.id,
            nombre: concepto.nombre,
            descripcion: concepto.descripcion,
            precio_unitario: concepto.precio_unitario,
            cantidad: cantidad,
            subtotal: subtotal,
            justificacion: concepto.justificacion
          });
          
          totalConceptos += subtotal;
        }
      }
    }
    
    // Calcular total transparente
    const subtotal = precioBase + totalConceptos;
    const costoDepreciacionTotal = costoDepreciacion;
    const margenGanancia = subtotal * 0.15; // 15% margen ejemplo
    const total = subtotal + costoDepreciacionTotal + margenGanancia;
    
    // Crear cotización
    const cotizacionData = {
      evento_id,
      servicio_id,
      proveedor_id: servicio.proveedor_id,
      cliente_id: req.user.userId,
      precio_base: precioBase,
      costo_depreciacion: costoDepreciacionTotal,
      total_conceptos: totalConceptos,
      margen_ganancia: margenGanancia,
      total_cotizacion: total,
      conceptos_detalle: conceptosDetalle,
      estatus: 'pendiente',
      fecha_solicitud: fecha_solicitud || new Date().toISOString(),
      notas_cliente,
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await executeQuery(
      () => supabase.from('cotizaciones').insert([cotizacionData]).select(`
        *,
        evento:eventos(id, nombre, fecha_evento, numero_invitados),
        servicio:servicios(id, nombre, descripcion),
        proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa, telefono),
        cliente:usuarios!cliente_id(id, nombre, email)
      `).single(),
      'Error al crear cotización'
    );
    
    // Crear análisis de rentabilidad automáticamente
    const analisisData = {
      cotizacion_id: result.data.id,
      proveedor_id: servicio.proveedor_id,
      ingresos_totales: total,
      costos_directos: totalConceptos,
      costos_depreciacion: costoDepreciacionTotal,
      costos_proceso: 0, // Se calculará con citas de proceso
      margen_bruto: total - totalConceptos - costoDepreciacionTotal,
      porcentaje_rentabilidad: ((total - totalConceptos - costoDepreciacionTotal) / total) * 100,
      punto_equilibrio: totalConceptos + costoDepreciacionTotal,
      fecha_analisis: new Date().toISOString()
    };
    
    await executeQuery(
      () => supabase.from('analisis_rentabilidad').insert([analisisData]),
      'Error al crear análisis de rentabilidad'
    );
    
    res.status(201).json({
      message: 'Cotización creada exitosamente',
      cotizacion: result.data,
      desglose_transparente: {
        precio_base: precioBase,
        conceptos_adicionales: totalConceptos,
        costo_depreciacion: costoDepreciacionTotal,
        margen_ganancia: margenGanancia,
        total: total
      }
    });
    
  } catch (error) {
    console.error('Error al crear cotización:', error);
    res.status(500).json({ error: 'Error al crear cotización' });
  }
});

// GET /api/cotizaciones/evento/:eventoId - Cotizaciones del evento
router.get('/evento/:eventoId', verifyToken, async (req, res) => {
  try {
    const { eventoId } = req.params;
    
    // Verificar que el evento pertenece al usuario
    const { data: evento } = await supabase
      .from('eventos')
      .select('id')
      .eq('id', eventoId)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (!evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    const result = await executeQuery(
      () => supabase
        .from('cotizaciones')
        .select(`
          *,
          servicio:servicios(id, nombre, descripcion),
          proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa, telefono),
          analisis:analisis_rentabilidad(*)
        `)
        .eq('evento_id', eventoId)
        .order('fecha_creacion', { ascending: false }),
      'Error al obtener cotizaciones del evento'
    );
    
    res.json({
      cotizaciones: result.data || [],
      evento_id: eventoId
    });
    
  } catch (error) {
    console.error('Error al obtener cotizaciones del evento:', error);
    res.status(500).json({ error: 'Error al obtener cotizaciones del evento' });
  }
});

// GET /api/cotizaciones/proveedor/:proveedorId - Cotizaciones del proveedor
router.get('/proveedor/:proveedorId', verifyToken, async (req, res) => {
  try {
    const { proveedorId } = req.params;
    const { estatus, limit = 20 } = req.query;
    
    // Solo el proveedor puede ver sus propias cotizaciones
    if (req.user.userId !== proveedorId && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    let query = supabase
      .from('cotizaciones')
      .select(`
        *,
        evento:eventos(id, nombre, fecha_evento, numero_invitados),
        servicio:servicios(id, nombre),
        cliente:usuarios!cliente_id(id, nombre, email),
        analisis:analisis_rentabilidad(*)
      `)
      .eq('proveedor_id', proveedorId)
      .order('fecha_creacion', { ascending: false })
      .limit(parseInt(limit));
    
    if (estatus) {
      query = query.eq('estatus', estatus);
    }
    
    const result = await executeQuery(
      () => query,
      'Error al obtener cotizaciones del proveedor'
    );
    
    res.json({
      cotizaciones: result.data || [],
      proveedor_id: proveedorId
    });
    
  } catch (error) {
    console.error('Error al obtener cotizaciones del proveedor:', error);
    res.status(500).json({ error: 'Error al obtener cotizaciones del proveedor' });
  }
});

// PUT /api/cotizaciones/:id/estatus - Actualizar estatus de cotización
router.put('/:id/estatus', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estatus, notas_proveedor } = req.body;
    
    if (!['pendiente', 'aceptada', 'rechazada', 'finalizada'].includes(estatus)) {
      return res.status(400).json({ 
        error: 'Estatus debe ser: pendiente, aceptada, rechazada, finalizada' 
      });
    }
    
    // Verificar permisos (cliente o proveedor de la cotización)
    const { data: cotizacion } = await supabase
      .from('cotizaciones')
      .select('id, cliente_id, proveedor_id, estatus')
      .eq('id', id)
      .single();
    
    if (!cotizacion) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    if (req.user.userId !== cotizacion.cliente_id && req.user.userId !== cotizacion.proveedor_id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    const updateData = {
      estatus,
      fecha_actualizacion: new Date().toISOString()
    };
    
    if (notas_proveedor) {
      updateData.notas_proveedor = notas_proveedor;
    }
    
    const result = await executeQuery(
      () => supabase
        .from('cotizaciones')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          evento:eventos(id, nombre),
          servicio:servicios(id, nombre),
          proveedor:usuarios!proveedor_id(id, nombre, nombre_empresa),
          cliente:usuarios!cliente_id(id, nombre)
        `)
        .single(),
      'Error al actualizar estatus de cotización'
    );
    
    res.json({
      message: 'Estatus de cotización actualizado',
      cotizacion: result.data
    });
    
  } catch (error) {
    console.error('Error al actualizar estatus:', error);
    res.status(500).json({ error: 'Error al actualizar estatus' });
  }
});

module.exports = router;