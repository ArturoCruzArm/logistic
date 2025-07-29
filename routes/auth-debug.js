const express = require('express');
const { supabase } = require('../config/database');

const router = express.Router();

// Debug registration endpoint
router.post('/debug-register', async (req, res) => {
  try {
    console.log('📋 Registration attempt:', req.body);
    
    const { email, password, nombre, tipo_usuario } = req.body;
    
    // Check required fields
    if (!email || !password || !nombre || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Campos requeridos: email, password, nombre, tipo_usuario',
        received: { email: !!email, password: !!password, nombre: !!nombre, tipo_usuario: !!tipo_usuario }
      });
    }
    
    // Check if user exists
    console.log('🔍 Checking if user exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking user:', checkError);
      return res.status(500).json({ error: 'Error checking user', details: checkError.message });
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    
    // Try to hash password
    console.log('🔐 Hashing password...');
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Password hashed successfully');
    
    // Prepare user data
    const userData = {
      email,
      password_hash: hashedPassword,
      nombre,
      tipo_usuario,
      estatus: 'activo',
      fecha_registro: new Date().toISOString()
    };
    
    console.log('💾 Inserting user data:', { ...userData, password_hash: '[HIDDEN]' });
    
    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return res.status(500).json({ error: 'Error inserting user', details: insertError.message });
    }
    
    console.log('✅ User created successfully:', newUser.id);
    
    // Generate JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        tipo_usuario: newUser.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    const { password_hash, ...userResponse } = newUser;
    
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: userResponse,
      token: token.substring(0, 20) + '...' // Truncate for security
    });
    
  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ 
      error: 'Error interno', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;