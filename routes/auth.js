const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase, executeQuery } = require('../config/database');

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

// POST /api/auth/register - Registro de usuarios
router.post('/register', async (req, res) => {
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
    const { data: existingUser } = await supabase
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
    
    const result = await executeQuery(
      () => supabase.from('usuarios').insert([userData]).select().single(),
      'Error al registrar usuario'
    );
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: result.data.id, 
        email: result.data.email,
        tipo_usuario: result.data.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Respuesta sin contraseña
    const { password_hash, ...userResponse } = result.data;
    
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
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }
    
    // Buscar usuario por email
    const result = await executeQuery(
      () => supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('estatus', 'activo')
        .single(),
      'Error al buscar usuario'
    );
    
    if (!result.data) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, result.data.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Generar JWT
    const token = jwt.sign(
      { 
        userId: result.data.id, 
        email: result.data.email,
        tipo_usuario: result.data.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Actualizar último login
    await supabase
      .from('usuarios')
      .update({ ultimo_login: new Date().toISOString() })
      .eq('id', result.data.id);
    
    // Respuesta sin contraseña
    const { password_hash, ...userResponse } = result.data;
    
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
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const result = await executeQuery(
      () => supabase
        .from('usuarios')
        .select('*')
        .eq('id', req.user.userId)
        .single(),
      'Error al obtener perfil'
    );
    
    if (!result.data) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Respuesta sin contraseña
    const { password_hash, ...userProfile } = result.data;
    
    res.json({
      user: userProfile
    });
    
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;