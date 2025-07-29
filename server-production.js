const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware básico
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://*.onrender.com'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'Plataforma de Eventos API - MVP',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version
  });
});

// Endpoint para verificar configuración (solo desarrollo)
app.get('/api/config-check', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const config = {
    supabase_configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    jwt_secret_configured: !!process.env.JWT_SECRET,
    port: process.env.PORT || 3002,
    node_env: process.env.NODE_ENV,
    cors_origins: process.env.ALLOWED_ORIGINS
  };
  
  res.json(config);
});

// Test de conexión con Supabase
app.get('/api/test-db', async (req, res) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Variables de Supabase no configuradas',
        required: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
      });
    }
    
    const supabase = createClient(
      process.env.SUPABASE_URL, 
      process.env.SUPABASE_ANON_KEY
    );
    
    // Test básico de conexión
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = tabla no existe (esperado en setup inicial)
      return res.status(500).json({ 
        error: 'Error connecting to Supabase', 
        details: error.message 
      });
    }
    
    res.json({
      message: 'Conexión a Supabase exitosa',
      database: 'Connected',
      tables_ready: !error
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: 'Error testing database connection', 
      details: error.message 
    });
  }
});

// Rutas de la API
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/eventos', require('./routes/eventos'));
  app.use('/api/servicios', require('./routes/servicios'));
  app.use('/api/cotizaciones', require('./routes/cotizaciones'));
  app.use('/api/proveedores', require('./routes/proveedores'));

  // Status endpoint actualizado
  app.get('/api/status', (req, res) => {
    res.json({
      message: 'APIs de autenticación activas',
      endpoints_disponibles: [
        'GET /',
        'GET /health',
        'GET /api/test-db',
        'GET /api/status',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile'
      ],
      proximos: [
        'GET /api/eventos',
        'POST /api/eventos',
        'GET /api/servicios',
        'POST /api/cotizaciones'
      ]
    });
  });
} catch (error) {
  console.error('Error loading routes:', error.message);
  
  // Fallback status
  app.get('/api/status', (req, res) => {
    res.json({
      message: 'API en desarrollo - algunas rutas pueden no estar disponibles',
      error: error.message,
      endpoints_disponibles: [
        'GET /',
        'GET /health',
        'GET /api/test-db',
        'GET /api/status'
      ]
    });
  });
}

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    available: [
      'GET /',
      'GET /health',
      'GET /api/test-db',
      'GET /api/status'
    ]
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Test DB: http://localhost:${PORT}/api/test-db`);
  console.log(`📋 API Status: http://localhost:${PORT}/api/status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recibido, cerrando servidor gracefully...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
  });
});

module.exports = app;