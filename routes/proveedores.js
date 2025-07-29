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

// Middleware para verificar que el usuario es proveedor o accede a sus propios datos
const verifyProviderAccess = (req, res, next) => {
  const { id: proveedorId } = req.params;
  
  if (req.user.userId !== proveedorId && req.user.tipo_usuario !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado' });
  }
  next();
};

// GET /api/proveedores/:id/inversiones - Inversiones del proveedor
router.get('/:id/inversiones', verifyToken, verifyProviderAccess, async (req, res) => {
  try {
    const { id: proveedorId } = req.params;
    
    const result = await executeQuery(
      () => supabase
        .from('inversiones_proveedor')
        .select('*')
        .eq('proveedor_id', proveedorId)
        .order('fecha_inversion', { ascending: false }),
      'Error al obtener inversiones del proveedor'
    );
    
    // Calcular depreciación actual para cada inversión
    const inversionesConDepreciacion = (result.data || []).map(inversion => {
      const datosDepreciacion = costCalculations.calculateDepreciation(inversion);
      return {
        ...inversion,
        ...datosDepreciacion
      };
    });
    
    res.json({
      inversiones: inversionesConDepreciacion,
      proveedor_id: proveedorId
    });
    
  } catch (error) {
    console.error('Error al obtener inversiones:', error);
    res.status(500).json({ error: 'Error al obtener inversiones' });
  }
});

// POST /api/proveedores/:id/inversiones - Registrar inversión
router.post('/:id/inversiones', verifyToken, verifyProviderAccess, async (req, res) => {
  try {
    const { id: proveedorId } = req.params;
    const {
      nombre_inversion,
      monto_total,
      fecha_inversion,
      vida_util_meses,
      valor_residual = 0,
      porcentaje_uso_eventos = 100,
      descripcion
    } = req.body;
    
    // Validaciones básicas
    if (!nombre_inversion || !monto_total || !fecha_inversion || !vida_util_meses) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre_inversion, monto_total, fecha_inversion, vida_util_meses' 
      });
    }
    
    if (parseFloat(monto_total) <= 0 || parseInt(vida_util_meses) <= 0) {
      return res.status(400).json({ 
        error: 'El monto total y vida útil deben ser mayores a 0' 
      });
    }
    
    if (parseFloat(porcentaje_uso_eventos) < 0 || parseFloat(porcentaje_uso_eventos) > 100) {
      return res.status(400).json({ 
        error: 'El porcentaje de uso debe estar entre 0 y 100' 
      });
    }
    
    const inversionData = {
      proveedor_id: proveedorId,
      nombre_inversion,
      monto_total: parseFloat(monto_total),
      fecha_inversion,
      vida_util_meses: parseInt(vida_util_meses),
      valor_residual: parseFloat(valor_residual) || 0,
      porcentaje_uso_eventos: parseFloat(porcentaje_uso_eventos),
      descripcion,
      fecha_creacion: new Date().toISOString()
    };
    
    const result = await executeQuery(
      () => supabase.from('inversiones_proveedor').insert([inversionData]).select().single(),
      'Error al registrar inversión'
    );
    
    // Calcular datos de depreciación inmediatamente
    const datosDepreciacion = costCalculations.calculateDepreciation(result.data);
    
    res.status(201).json({
      message: 'Inversión registrada exitosamente',
      inversion: {
        ...result.data,
        ...datosDepreciacion
      }
    });
    
  } catch (error) {
    console.error('Error al registrar inversión:', error);
    res.status(500).json({ error: 'Error al registrar inversión' });
  }
});

// PUT /api/inversiones/:id - Actualizar inversión
router.put('/inversiones/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Verificar que la inversión pertenece al proveedor
    const { data: inversion } = await supabase
      .from('inversiones_proveedor')
      .select('proveedor_id')
      .eq('id', id)
      .single();
    
    if (!inversion) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }
    
    if (req.user.userId !== inversion.proveedor_id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    // Remover campos que no se deben actualizar
    delete updateData.id;
    delete updateData.proveedor_id;
    delete updateData.fecha_creacion;
    
    updateData.fecha_actualizacion = new Date().toISOString();
    
    const result = await executeQuery(
      () => supabase
        .from('inversiones_proveedor')
        .update(updateData)
        .eq('id', id)
        .select()
        .single(),
      'Error al actualizar inversión'
    );
    
    // Calcular datos de depreciación actualizados
    const datosDepreciacion = costCalculations.calculateDepreciation(result.data);
    
    res.json({
      message: 'Inversión actualizada exitosamente',
      inversion: {
        ...result.data,
        ...datosDepreciacion
      }
    });
    
  } catch (error) {
    console.error('Error al actualizar inversión:', error);
    res.status(500).json({ error: 'Error al actualizar inversión' });
  }
});

// DELETE /api/inversiones/:id - Eliminar inversión
router.delete('/inversiones/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la inversión pertenece al proveedor
    const { data: inversion } = await supabase
      .from('inversiones_proveedor')
      .select('proveedor_id, nombre_inversion')
      .eq('id', id)
      .single();
    
    if (!inversion) {
      return res.status(404).json({ error: 'Inversión no encontrada' });
    }
    
    if (req.user.userId !== inversion.proveedor_id && req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    
    await executeQuery(
      () => supabase.from('inversiones_proveedor').delete().eq('id', id),
      'Error al eliminar inversión'
    );
    
    res.json({
      message: `Inversión "${inversion.nombre_inversion}" eliminada exitosamente`
    });
    
  } catch (error) {
    console.error('Error al eliminar inversión:', error);
    res.status(500).json({ error: 'Error al eliminar inversión' });
  }
});

// GET /api/proveedores/:id/rentabilidad-historica - Histórico de rentabilidad
router.get('/:id/rentabilidad-historica', verifyToken, verifyProviderAccess, async (req, res) => {
  try {
    const { id: proveedorId } = req.params;
    const { fecha_inicio, fecha_fin, limit = 50 } = req.query;
    
    let query = supabase
      .from('analisis_rentabilidad')
      .select(`
        *,
        cotizacion:cotizaciones!cotizacion_id(
          id,
          total_cotizacion,
          estatus,
          evento:eventos(id, nombre, fecha_evento)
        )
      `)
      .eq('proveedor_id', proveedorId)
      .order('fecha_analisis', { ascending: false })
      .limit(parseInt(limit));
    
    if (fecha_inicio) {
      query = query.gte('fecha_analisis', fecha_inicio);
    }
    
    if (fecha_fin) {
      query = query.lte('fecha_analisis', fecha_fin);
    }
    
    const result = await executeQuery(
      () => query,
      'Error al obtener histórico de rentabilidad'
    );
    
    // Calcular métricas agregadas
    const analisis = result.data || [];
    const metricas = {
      total_eventos: analisis.length,
      ingresos_totales: analisis.reduce((sum, a) => sum + parseFloat(a.ingresos_totales || 0), 0),
      costos_totales: analisis.reduce((sum, a) => sum + parseFloat(a.costos_directos || 0) + parseFloat(a.costos_depreciacion || 0), 0),
      margen_promedio: analisis.length > 0 ? analisis.reduce((sum, a) => sum + parseFloat(a.porcentaje_rentabilidad || 0), 0) / analisis.length : 0,
      eventos_rentables: analisis.filter(a => parseFloat(a.porcentaje_rentabilidad || 0) > 0).length
    };
    
    res.json({
      analisis_historico: analisis,
      metricas_agregadas: metricas,
      proveedor_id: proveedorId
    });
    
  } catch (error) {
    console.error('Error al obtener histórico de rentabilidad:', error);
    res.status(500).json({ error: 'Error al obtener histórico de rentabilidad' });
  }
});

module.exports = router;