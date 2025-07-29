// Simple authentication test directly using Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function testDirectAuth() {
  console.log('🔐 Testing direct authentication with Supabase...\n');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations
    );
    
    console.log('✅ Supabase connected');
    
    // Test 1: Check usuarios table structure
    console.log('\n1️⃣ Checking usuarios table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table error:', tableError);
      return;
    }
    
    console.log('✅ usuarios table accessible');
    
    // Test 2: Try to insert a user manually
    console.log('\n2️⃣ Testing manual user insertion...');
    
    const email = `test${Date.now()}@example.com`;
    const password = 'testpass123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const userData = {
      email: email,
      password_hash: hashedPassword,
      nombre: 'Test User Direct',
      tipo_usuario: 'cliente',
      estatus: 'activo',
      fecha_registro: new Date().toISOString()
    };
    
    const { data: newUser, error: insertError } = await supabase
      .from('usuarios')
      .insert([userData])
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return;
    }
    
    console.log('✅ User created successfully:', newUser.email);
    
    // Test 3: Try to login (verify password)
    console.log('\n3️⃣ Testing password verification...');
    
    const { data: loginUser, error: loginError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();
    
    if (loginError) {
      console.error('❌ Login error:', loginError);
      return;
    }
    
    const isValidPassword = await bcrypt.compare(password, loginUser.password_hash);
    
    if (isValidPassword) {
      console.log('✅ Password verification successful');
    } else {
      console.error('❌ Password verification failed');
    }
    
    // Test 4: Generate JWT
    console.log('\n4️⃣ Testing JWT generation...');
    const jwt = require('jsonwebtoken');
    
    const token = jwt.sign(
      { 
        userId: loginUser.id, 
        email: loginUser.email,
        tipo_usuario: loginUser.tipo_usuario
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT generated:', token.substring(0, 30) + '...');
    
    // Test 5: Verify JWT
    console.log('\n5️⃣ Testing JWT verification...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ JWT verified for user:', decoded.email);
    
    console.log('\n🎉 ALL AUTHENTICATION COMPONENTS WORK!');
    console.log('The issue is likely with route loading in production.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectAuth();