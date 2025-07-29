const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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

// Test de conexión con Supabase
app.get('/api/test-db', async (req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      return res.status(500).json({ 
        error: 'Variables de Supabase no configuradas',
        required: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
      });
    }
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
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

// ============================================
// RUTAS DE AUTENTICACIÓN (INTEGRADAS)
// ============================================

// POST /api/auth/register - Registro de usuarios
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nombre, telefono, tipo_usuario, datos_proveedor } = req.body;
    
    // Validaciones básicas
    if (!email || !password || !nombre || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Campos requeridos: email, password, nombre, tipo_usuario' 
      });
    }
    
    if (!['cliente', 'proveedor'].includes(tipo_usuario)) {
      return res.status(400).json({ 
        error: 'tipo_usuario debe ser "cliente" o "proveedor"' 
      });
    }
    
    // Verificar si el email ya existe
    const { data: existingUser } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Crear usuario en Supabase
    const userData = {
      email,
      password_hash: hashedPassword,
      nombre,
      telefono,
      tipo_usuario,
      estatus: 'activo',
      fecha_registro: new Date().toISOString()
    };
    
    // Si es proveedor, agregar datos adicionales
    if (tipo_usuario === 'proveedor' && datos_proveedor) {
      userData.nombre_empresa = datos_proveedor.nombre_empresa;
      userData.descripcion_servicios = datos_proveedor.descripcion_servicios;
      userData.experiencia_anos = datos_proveedor.experiencia_anos;
    }
    
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('usuarios')
      .insert([userData])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error inserting user:', insertError);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        tipo_usuario: newUser.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Respuesta sin contraseña
    const { password_hash, ...userResponse } = newUser;
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// POST /api/auth/login - Login de usuarios
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // Buscar usuario por email
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .eq('estatus', 'activo')
      .single();
    
    if (userError || !user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        tipo_usuario: user.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Actualizar último login
    await supabaseAdmin
      .from('usuarios')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', user.id);
    
    // Respuesta sin contraseña
    const { password_hash, ...userResponse } = user;
    
    res.json({
      message: 'Login exitoso',
      user: userResponse,
      token
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// GET /api/auth/profile - Obtener perfil del usuario
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('*')
      .eq('id', req.user.userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Respuesta sin contraseña
    const { password_hash, ...userProfile } = user;
    
    res.json({
      user: userProfile
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// ============================================
// RUTAS DE EVENTOS (INTEGRADAS)
// ============================================

// GET /api/eventos - Listar eventos del usuario
app.get('/api/eventos', verifyToken, async (req, res) => {
  try {
    const { data: eventos, error } = await supabaseAdmin
      .from('eventos')
      .select(`
        *,
        usuario:usuarios(nombre, email)
      `)
      .eq('usuario_id', req.user.userId)
      .order('fecha_evento', { ascending: true });
    
    if (error) {
      console.error('Error fetching eventos:', error);
      return res.status(500).json({ error: 'Error al obtener eventos' });
    }
    
    res.json({
      eventos: eventos || [],
      total: eventos?.length || 0
    });
    
  } catch (error) {
    console.error('Error en listado de eventos:', error);
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
});

// POST /api/eventos - Crear nuevo evento
app.post('/api/eventos', verifyToken, async (req, res) => {
  try {
    const { 
      nombre_evento, 
      descripcion, 
      fecha_evento, 
      hora_evento,
      ubicacion, 
      numero_invitados, 
      presupuesto_estimado,
      tipo_evento,
      servicios_requeridos 
    } = req.body;
    
    // Validaciones básicas
    if (!nombre_evento || !fecha_evento || !ubicacion || !numero_invitados) {
      return res.status(400).json({ 
        error: 'Campos requeridos: nombre_evento, fecha_evento, ubicacion, numero_invitados' 
      });
    }
    
    // Verificar que el usuario sea cliente
    if (req.user.tipo_usuario !== 'cliente') {
      return res.status(403).json({ 
        error: 'Solo los clientes pueden crear eventos' 
      });
    }
    
    const eventoData = {
      usuario_id: req.user.userId,
      nombre_evento,
      descripcion,
      fecha_evento,
      hora_evento,
      ubicacion,
      numero_invitados: parseInt(numero_invitados),
      presupuesto_estimado: parseFloat(presupuesto_estimado) || null,
      tipo_evento,
      servicios_requeridos: servicios_requeridos || [],
      estatus: 'planificacion',
      fecha_creacion: new Date().toISOString()
    };
    
    const { data: nuevoEvento, error: insertError } = await supabaseAdmin
      .from('eventos')
      .insert([eventoData])
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating evento:', insertError);
      return res.status(500).json({ error: 'Error al crear evento' });
    }
    
    res.status(201).json({
      message: 'Evento creado exitosamente',
      evento: nuevoEvento
    });
    
  } catch (error) {
    console.error('Error en creación de evento:', error);
    res.status(500).json({ error: 'Error al crear evento' });
  }
});

// GET /api/eventos/:id - Obtener evento específico
app.get('/api/eventos/:id', verifyToken, async (req, res) => {
  try {
    const eventoId = req.params.id;
    
    const { data: evento, error } = await supabaseAdmin
      .from('eventos')
      .select(`
        *,
        usuario:usuarios(nombre, email, telefono)
      `)
      .eq('id', eventoId)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (error || !evento) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    res.json({ evento });
    
  } catch (error) {
    console.error('Error al obtener evento:', error);
    res.status(500).json({ error: 'Error al obtener evento' });
  }
});

// PUT /api/eventos/:id - Actualizar evento
app.put('/api/eventos/:id', verifyToken, async (req, res) => {
  try {
    const eventoId = req.params.id;
    const { 
      nombre_evento, 
      descripcion, 
      fecha_evento, 
      hora_evento,
      ubicacion, 
      numero_invitados, 
      presupuesto_estimado,
      tipo_evento,
      servicios_requeridos,
      estatus
    } = req.body;
    
    // Verificar que el evento pertenece al usuario
    const { data: eventoExistente, error: checkError } = await supabaseAdmin
      .from('eventos')
      .select('id, usuario_id')
      .eq('id', eventoId)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (checkError || !eventoExistente) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    const updateData = {
      nombre_evento,
      descripcion,
      fecha_evento,
      hora_evento,
      ubicacion,
      numero_invitados: numero_invitados ? parseInt(numero_invitados) : undefined,
      presupuesto_estimado: presupuesto_estimado ? parseFloat(presupuesto_estimado) : undefined,
      tipo_evento,
      servicios_requeridos,
      estatus,
      fecha_actualizacion: new Date().toISOString()
    };
    
    // Remover campos undefined
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const { data: eventoActualizado, error: updateError } = await supabaseAdmin
      .from('eventos')
      .update(updateData)
      .eq('id', eventoId)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating evento:', updateError);
      return res.status(500).json({ error: 'Error al actualizar evento' });
    }
    
    res.json({
      message: 'Evento actualizado exitosamente',
      evento: eventoActualizado
    });
    
  } catch (error) {
    console.error('Error en actualización de evento:', error);
    res.status(500).json({ error: 'Error al actualizar evento' });
  }
});

// DELETE /api/eventos/:id - Eliminar evento
app.delete('/api/eventos/:id', verifyToken, async (req, res) => {
  try {
    const eventoId = req.params.id;
    
    // Verificar que el evento pertenece al usuario
    const { data: eventoExistente, error: checkError } = await supabaseAdmin
      .from('eventos')
      .select('id, usuario_id, nombre_evento')
      .eq('id', eventoId)
      .eq('usuario_id', req.user.userId)
      .single();
    
    if (checkError || !eventoExistente) {
      return res.status(404).json({ error: 'Evento no encontrado' });
    }
    
    const { error: deleteError } = await supabaseAdmin
      .from('eventos')
      .delete()
      .eq('id', eventoId);
    
    if (deleteError) {
      console.error('Error deleting evento:', deleteError);
      return res.status(500).json({ error: 'Error al eliminar evento' });
    }
    
    res.json({
      message: 'Evento eliminado exitosamente',
      evento_eliminado: eventoExistente.nombre_evento
    });
    
  } catch (error) {
    console.error('Error en eliminación de evento:', error);
    res.status(500).json({ error: 'Error al eliminar evento' });
  }
});

// Status endpoint actualizado
app.get('/api/status', (req, res) => {
  res.json({
    message: 'Sistema de autenticación y eventos integrado y funcionando',
    endpoints_disponibles: [
      'GET /',
      'GET /health',
      'GET /api/test-db',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile',
      'GET /api/eventos',
      'POST /api/eventos',
      'GET /api/eventos/:id',
      'PUT /api/eventos/:id',
      'DELETE /api/eventos/:id'
    ],
    proximos: [
      'GET /api/servicios',
      'POST /api/servicios',
      'GET /api/cotizaciones',
      'POST /api/cotizaciones'
    ],
    sistema: 'Autenticación y CRUD de eventos completamente funcional'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    available: [
      'GET /',
      'GET /health',
      'GET /api/test-db',
      'GET /api/status',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile'
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
  console.log(`🔐 Auth system: INTEGRATED AND READY`);
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