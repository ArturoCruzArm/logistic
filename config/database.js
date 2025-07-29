const { createClient } = require('@supabase/supabase-js');

// Configuración de conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables SUPABASE_URL y SUPABASE_ANON_KEY son requeridas');
}

// Cliente para operaciones públicas (autenticación, consultas básicas)
const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente con privilegios administrativos (para operaciones sensibles)
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Función helper para ejecutar consultas con manejo de errores
const executeQuery = async (queryFn, errorMessage = 'Error en consulta a base de datos') => {
  try {
    const result = await queryFn();
    if (result.error) {
      console.error(`${errorMessage}:`, result.error);
      throw new Error(result.error.message);
    }
    return result;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
};

// Funciones de utilidad para transparencia de costos
const costCalculations = {
  // Calcular depreciación de inversión
  calculateDepreciation: (inversion) => {
    const { monto_total, valor_residual = 0, vida_util_meses, fecha_inversion } = inversion;
    const depreciacionMensual = (monto_total - valor_residual) / vida_util_meses;
    
    const fechaActual = new Date();
    const fechaInv = new Date(fecha_inversion);
    const mesesTranscurridos = (fechaActual.getFullYear() - fechaInv.getFullYear()) * 12 + 
                               (fechaActual.getMonth() - fechaInv.getMonth());
    
    const valorActual = Math.max(
      monto_total - (depreciacionMensual * mesesTranscurridos),
      valor_residual
    );
    
    return {
      depreciacion_mensual: depreciacionMensual,
      valor_actual: valorActual,
      meses_transcurridos: mesesTranscurridos,
      depreciacion_acumulada: depreciacionMensual * mesesTranscurridos
    };
  },

  // Calcular costo por evento basado en inversiones
  calculateEventCost: (inversiones, porcentajeUso = 100) => {
    let costoTotalDepreciacion = 0;
    
    inversiones.forEach(inversion => {
      const depreciacion = costCalculations.calculateDepreciation(inversion);
      const costoProporcionado = (depreciacion.depreciacion_mensual * porcentajeUso) / 100;
      costoTotalDepreciacion += costoProporcionado;
    });
    
    return costoTotalDepreciacion;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  executeQuery,
  costCalculations
};